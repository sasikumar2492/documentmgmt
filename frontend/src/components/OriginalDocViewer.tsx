import React, { useState, useEffect, useRef } from 'react';
import { getTemplateFileBlob, importDocxToSfdt } from '../api/templates';
import { apiClient } from '../api/client';
import { renderAsync } from 'docx-preview';
import {
  DocumentEditorContainerComponent,
  Toolbar as DocEditorToolbar,
} from '@syncfusion/ej2-react-documenteditor';
import {
  PdfViewerComponent,
  Toolbar,
  Magnification,
  Navigation,
  LinkAnnotation,
  BookmarkView,
  ThumbnailView,
  Print,
  TextSelection,
  Inject,
} from '@syncfusion/ej2-react-pdfviewer';
import { FileText, Download, Loader2 } from 'lucide-react';

DocumentEditorContainerComponent.Inject(DocEditorToolbar);

const DOCX_PAGE_CLASS = 'docx-preview-document';
/** A4-like page height in px for estimating page count and splitting (match original doc layout) */
const ESTIMATED_PAGE_HEIGHT_PX = 1200;
const VISUAL_PAGE_CLASS = 'docx-visual-page';

/**
 * Parse CSS length to px (for docx-preview's pt/in units).
 */
function cssLengthToPx(length: string, defaultPx: number): number {
  if (!length) return defaultPx;
  const n = parseFloat(length);
  if (Number.isNaN(n)) return defaultPx;
  if (length.endsWith('pt')) return (n * 96) / 72;
  if (length.endsWith('in')) return n * 96;
  if (length.endsWith('px')) return n;
  return n;
}

/** Get leading text from a block (first line or first 80 chars) for section detection. */
function getBlockLeadingText(el: Element): string {
  const text = (el as HTMLElement).innerText || el.textContent || '';
  const firstLine = text.split(/\r?\n/)[0] || '';
  return (firstLine || text).slice(0, 80).trim();
}

/** True if block starts a major section like "7.0 PROCEDURE" or "8.0 ENCLOSURES" (break before these). */
function isMajorSectionStart(leadingText: string): boolean {
  const m = leadingText.match(/^\s*(\d+)\.0\s/);
  return m ? parseInt(m[1], 10) >= 7 : false;
}

/**
 * Split a single section into multiple visual pages.
 * Prefer content-aware split (break before 7.0, 8.0, ...) so page 1 ends at 6.1.5 like the original.
 * Fall back to height-based split if no such headings are found.
 * @param onActualPageCount - called with the real page count (e.g. 3 when content-aware) so sidebar can update
 */
function splitSingleSectionIntoVisualPages(
  container: HTMLElement,
  pageCount: number,
  fallbackPageHeightPx: number,
  onActualPageCount?: (n: number) => void
): void {
  const wrapper = container.querySelector<HTMLElement>(`.${DOCX_PAGE_CLASS}-wrapper`);
  const section = container.querySelector<HTMLElement>(`section.${DOCX_PAGE_CLASS}`);
  if (!wrapper || !section || pageCount <= 1) return;

  const headerEl = section.querySelector('header');
  const footerEl = section.querySelector('footer');
  const articleEl = section.querySelector('article');
  let allContent: Element[] = [];
  if (articleEl && articleEl.children.length > 0) {
    allContent = Array.from(articleEl.children);
  } else {
    allContent = Array.from(section.children).filter(
      (c) => c.tagName !== 'HEADER' && c.tagName !== 'FOOTER'
    );
  }
  if (allContent.length === 0) return;

  const computed = window.getComputedStyle(section);
  const sectionWidth = section.style.width || computed.width;
  const sectionMinHeightRaw = section.style.minHeight || computed.minHeight || '';
  const pageHeightPx = sectionMinHeightRaw ? cssLengthToPx(sectionMinHeightRaw, fallbackPageHeightPx) : fallbackPageHeightPx;
  const bodyHeightPerPage = Math.max(800, Math.round(pageHeightPx * 1.2));

  const pages: Element[][] = [];
  let currentPage = 0;
  let actualPageCount = pageCount;

  // Content-aware: break before "7.0", "8.0", "9.0", ... so page 1 = 1.0 through 6.x (e.g. 6.1.5)
  const majorBreaks = allContent.map((node) => isMajorSectionStart(getBlockLeadingText(node)));
  const useContentAware = majorBreaks.some(Boolean);
  if (useContentAware) {
    actualPageCount = 1 + majorBreaks.filter(Boolean).length;
    for (let i = 0; i < actualPageCount; i++) pages.push([]);
    for (let i = 0; i < allContent.length; i++) {
      if (i > 0 && majorBreaks[i] && currentPage < actualPageCount - 1) currentPage++;
      pages[currentPage].push(allContent[i]);
    }
  } else {
    for (let i = 0; i < pageCount; i++) pages.push([]);
    let currentHeight = 0;
    for (const node of allContent) {
      const el = node as HTMLElement;
      const h = el.offsetHeight || 24;
      if (currentHeight + h > bodyHeightPerPage && currentPage < pageCount - 1) {
        currentPage++;
        currentHeight = 0;
      }
      pages[currentPage].push(node);
      currentHeight += h;
    }
  }

  for (let i = 0; i < actualPageCount; i++) {
    const pageDiv = document.createElement('div');
    pageDiv.className = VISUAL_PAGE_CLASS;
    pageDiv.setAttribute('data-page-index', String(i));
    pageDiv.style.minHeight = sectionMinHeightRaw || `${pageHeightPx}px`;
    pageDiv.style.height = 'auto';
    pageDiv.style.background = '#fff';
    pageDiv.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)';
    pageDiv.style.marginBottom = '32px';
    pageDiv.style.borderRadius = '2px';
    pageDiv.style.border = '1px solid #e5e7eb';
    pageDiv.style.boxSizing = 'border-box';
    pageDiv.style.display = 'flex';
    pageDiv.style.flexDirection = 'column';
    pageDiv.style.overflow = 'hidden';
    pageDiv.style.width = sectionWidth || '100%';
    pageDiv.style.maxWidth = '100%';
    if (section.style.paddingLeft) pageDiv.style.paddingLeft = section.style.paddingLeft;
    if (section.style.paddingRight) pageDiv.style.paddingRight = section.style.paddingRight;
    if (section.style.paddingTop) pageDiv.style.paddingTop = section.style.paddingTop;
    if (section.style.paddingBottom) pageDiv.style.paddingBottom = section.style.paddingBottom;

    if (headerEl) {
      const headerClone = headerEl.cloneNode(true) as HTMLElement;
      headerClone.style.flexShrink = '0';
      pageDiv.appendChild(headerClone);
    }
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'docx-visual-page-content';
    contentWrapper.style.flex = '1';
    contentWrapper.style.minHeight = '0';
    for (const node of pages[i]) contentWrapper.appendChild(node);
    pageDiv.appendChild(contentWrapper);
    if (footerEl) {
      const footerClone = footerEl.cloneNode(true) as HTMLElement;
      footerClone.style.flexShrink = '0';
      const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
          let t = node.textContent;
          t = t.replace(/Page\s*\d+\s*of\s*\d+/gi, `Page ${i + 1} of ${actualPageCount}`);
          t = t.replace(/\d+\s*of\s*\d+/gi, `${i + 1} of ${actualPageCount}`);
          node.textContent = t;
          return;
        }
        node.childNodes?.forEach(walk);
      };
      walk(footerClone);
      pageDiv.appendChild(footerClone);
    }
    wrapper.appendChild(pageDiv);
  }
  onActualPageCount?.(actualPageCount);
  section.remove();
}

interface OriginalDocViewerProps {
  templateId: string;
  fileName: string;
  /** Optional SFDT content; when provided, viewer will open this instead of converting the original DOCX. */
  initialSfdt?: string | null;
  /** Current page index (0-based) for Original Doc; when changed, viewer scrolls to that page. */
  currentDocPage?: number;
  /** Called with document page count after Word/PDF is rendered. */
  onDocPagesReady?: (count: number) => void;
  /** When the visible page changes (e.g. user scrolls), called with 0-based page index so parent can sync sidebar. */
  onDocPageChange?: (pageIndex: number) => void;
  /** When true, show document in read-only mode (no toolbar, no editing). Use for AI Conversion Preview. */
  readOnly?: boolean;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const OriginalDocViewer: React.FC<OriginalDocViewerProps> = ({
  templateId,
  fileName,
  initialSfdt,
  currentDocPage = 0,
  onDocPagesReady,
  onDocPageChange,
  readOnly = false,
}) => {
  const [documentPath, setDocumentPath] = useState<string | null>(null);
  const [wordBlob, setWordBlob] = useState<Blob | null>(null);
  /** When Word: 'trying-syncfusion' | 'syncfusion' | 'docx-preview'. Syncfusion used when Docker Import succeeds. */
  const [wordViewMode, setWordViewMode] = useState<'trying-syncfusion' | 'syncfusion' | 'docx-preview'>('trying-syncfusion');
  const [sfdt, setSfdt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'word' | 'other'>(() => {
    const ext = (fileName || '').toLowerCase().split('.').pop() || '';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    return 'other';
  });
  const viewerRef = useRef<PdfViewerComponent>(null);
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const documentEditorContainerRef = useRef<DocumentEditorContainerComponent>(null);
  const sfdtRef = useRef<string | null>(null);
  sfdtRef.current = sfdt;
  /** When true, page count came from content height (no Word page breaks); scroll by offset */
  const docxPageByHeightRef = useRef(false);
  const [docxPagesByHeight, setDocxPagesByHeight] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setWordBlob(null);
      try {
        const blob = await getTemplateFileBlob(templateId);
        if (cancelled) return;
        const ext = (fileName || '').toLowerCase().split('.').pop() || '';
        if (ext === 'pdf') {
          const base64 = await blobToBase64(blob);
          if (cancelled) return;
          setDocumentPath(`data:application/pdf;base64,${base64}`);
        } else if (['doc', 'docx'].includes(ext)) {
          setFileType('word');
          setWordBlob(blob);
          setDocumentPath(null);
        } else {
          setFileType('other');
          setDocumentPath(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load document');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [templateId, fileName]);

  // Try Syncfusion Docker Import for Word; on failure fall back to docx-preview
  useEffect(() => {
    if (fileType !== 'word' || !wordBlob) return;
    let cancelled = false;
    setWordViewMode('trying-syncfusion');
    setSfdt(null);
    // If caller provided SFDT (e.g. submitted request), prefer that over converting the template
    if (initialSfdt && initialSfdt.length > 0) {
      setSfdt(initialSfdt);
      setWordViewMode('syncfusion');
      return () => {
        cancelled = true;
      };
    }
    importDocxToSfdt(wordBlob, fileName || 'document.docx')
      .then((result) => {
        if (!cancelled) {
          setSfdt(result);
          setWordViewMode('syncfusion');
        }
      })
      .catch(() => {
        if (!cancelled) setWordViewMode('docx-preview');
      });
    return () => { cancelled = true; };
  }, [fileType, wordBlob, fileName, initialSfdt]);
  // Hide right properties panel and maximize editor for this page only
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'original-doc-viewer-styles';
    style.textContent = `
      #original-doc-word-editor.e-control.e-documenteditorcontainer {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        overflow: hidden !important;
      }
      #original-doc-word-editor .e-de-container {
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
      }
      #original-doc-word-editor .e-de-pane {
        display: none !important;
        width: 0 !important;
      }
      #original-doc-word-editor .e-de-properties-pane {
        display: none !important;
        width: 0 !important;
      }
      #original-doc-word-editor .e-de-toolbar {
        display: none !important;
      }
      #original-doc-word-editor .e-de-splitter.e-de-splitter-horizontal {
        gap: 0 !important;
      }
      #original-doc-word-editor .e-de-splitter-pane {
        border: none !important;
        padding: 0 !important;
      }
      #original-doc-word-editor .e-de-statusbar-zoom.e-control.e-dropdown-btn.e-lib.e-btn {
        font-size: 12px !important;
        min-width: 60px !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existingStyle = document.getElementById('original-doc-viewer-styles');
      if (existingStyle) document.head.removeChild(existingStyle);
    };
  }, []);
  // Render Word document with docx-preview (only when Syncfusion not used)
  useEffect(() => {
    if (fileType !== 'word' || wordViewMode !== 'docx-preview' || !wordBlob || !docxContainerRef.current) return;
    const container = docxContainerRef.current;
    container.innerHTML = '';
    docxPageByHeightRef.current = false;
    setDocxPagesByHeight(false);
    let cancelled = false;
    renderAsync(wordBlob, container, undefined, {
      className: DOCX_PAGE_CLASS,
      breakPages: true,
      inWrapper: true,
      renderHeaders: true,
      renderFooters: true,
    })
      .then(() => {
        if (cancelled) {
          container.innerHTML = '';
          return;
        }
        const sections = container.querySelectorAll(`section.${DOCX_PAGE_CLASS}`);
        let count: number;
        if (sections.length >= 2) {
          count = sections.length;
          docxPageByHeightRef.current = false;
          setDocxPagesByHeight(false);
        } else {
          const wrapper = container.querySelector<HTMLElement>(`.${DOCX_PAGE_CLASS}-wrapper`) || container;
          const totalHeight = wrapper.scrollHeight || wrapper.offsetHeight || 0;
          count = Math.max(1, Math.ceil(totalHeight / ESTIMATED_PAGE_HEIGHT_PX));
          const byHeight = count > 1;
          docxPageByHeightRef.current = byHeight;
          setDocxPagesByHeight(byHeight);
          if (byHeight && sections.length === 1) {
            const runSplit = () => {
              if (cancelled) return;
              const sec = container.querySelector(`section.${DOCX_PAGE_CLASS}`);
              if (sec) {
                splitSingleSectionIntoVisualPages(
                  container,
                  count,
                  ESTIMATED_PAGE_HEIGHT_PX,
                  (actualCount) => onDocPagesReady?.(actualCount)
                );
                return;
              }
              onDocPagesReady?.(count);
            };
            requestAnimationFrame(() => requestAnimationFrame(runSplit));
          } else {
            onDocPagesReady?.(count);
          }
        }
        // When 2+ sections or single page, count already reported above or in runSplit
        if (sections.length >= 2) onDocPagesReady?.(count);
      })
      .catch(() => {
        if (!cancelled) {
          container.innerHTML = '<p class="text-red-600 p-4">Failed to render document.</p>';
          setDocxPagesByHeight(false);
        }
        onDocPagesReady?.(1);
      });
    return () => {
      cancelled = true;
      container.innerHTML = '';
    };
  }, [fileType, wordBlob, wordViewMode, onDocPagesReady]);

  // Scroll to the selected document page (Word: Syncfusion or docx-preview)
  useEffect(() => {
    if (fileType !== 'word') return;
    if (wordViewMode === 'syncfusion') {
      const docEditor = documentEditorContainerRef.current?.documentEditor;
      // Syncfusion scrollToPage expects 1-based page number
      if (docEditor?.scrollToPage) docEditor.scrollToPage(currentDocPage + 1);
      return;
    }
    if (!docxContainerRef.current) return;
    const container = docxContainerRef.current;
    const visualPages = container.querySelectorAll<HTMLElement>(`.${VISUAL_PAGE_CLASS}`);
    const sections = container.querySelectorAll<HTMLElement>(`section.${DOCX_PAGE_CLASS}`);
    if (visualPages.length >= 2 && visualPages[currentDocPage]) {
      visualPages[currentDocPage].scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (sections.length >= 2 && sections[currentDocPage]) {
      sections[currentDocPage].scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (docxPageByHeightRef.current) {
      const top = currentDocPage * ESTIMATED_PAGE_HEIGHT_PX;
      container.scrollTo({ top, behavior: 'smooth' });
    }
  }, [fileType, wordViewMode, currentDocPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-slate-100 rounded-lg">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading original document…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-100 rounded-lg p-8">
        <p className="text-red-600 font-medium mb-2">Could not load document</p>
        <p className="text-slate-600 text-sm">{error}</p>
      </div>
    );
  }

  if (fileType === 'word') {
    const handleDownload = () => {
      if (!wordBlob) return;
      const url = URL.createObjectURL(wordBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'document.docx';
      a.click();
      URL.revokeObjectURL(url);
    };
    const documentEditorServiceUrl = `${apiClient.defaults.baseURL}/document-editor/`;

    if (wordViewMode === 'trying-syncfusion') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[600px] bg-slate-100 rounded-lg">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Opening document…</p>
        </div>
      );
    }

    if (wordViewMode === 'syncfusion' && sfdt) {
      return (
        <div className="flex flex-col flex-1 min-h-0 min-w-0 w-full bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 shrink-0">
            <span className="text-sm font-medium text-slate-700 truncate min-w-0">{fileName}</span>
            {!readOnly && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 shrink-0"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            )}
          </div>
          <div className="flex-1 min-h-0 w-full min-w-0">
            <DocumentEditorContainerComponent
              ref={documentEditorContainerRef}
              id="original-doc-word-editor"
              style={{ height: '100%', minHeight: '100%' }}
              serviceUrl={documentEditorServiceUrl}
              enableToolbar={!readOnly}
              showPropertiesPane={!readOnly}
              documentEditorSettings={readOnly ? { isReadOnly: true } : undefined}
              created={() => {
                const c = documentEditorContainerRef.current;
                const data = sfdtRef.current;
                if (c?.documentEditor && data) {
                  c.documentEditor.open(data);
                  (c.documentEditor as any).zoomFactor = 1.0;
                  if (readOnly) {
                    (c.documentEditor as any).isReadOnly = true;
                  }
                  // Report page count after layout (Syncfusion may compute it asynchronously)
                  const reportPages = () => {
                    const count = c?.documentEditor?.pageCount ?? 1;
                    onDocPagesReady?.(count);
                  };
                  reportPages();
                  setTimeout(reportPages, 500);
                  // Sync visible page to parent so left sidebar highlights correct page
                  if (onDocPageChange && c?.documentEditor) {
                    const editor = c.documentEditor as any;
                    const existingViewChange = editor.viewChange;
                    editor.viewChange = (args: { startPage: number }) => {
                      if (existingViewChange) existingViewChange(args);
                      if (args && typeof args.startPage === 'number') {
                        onDocPageChange(Math.max(0, args.startPage - 1));
                      }
                    };
                  }
                }
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col flex-1 min-h-0 min-w-0 w-full bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 shrink-0">
          <span className="text-sm font-medium text-slate-700 truncate min-w-0">{fileName}</span>
          {!readOnly && (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 shrink-0"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          )}
        </div>
        <div
          ref={docxContainerRef}
          className={`original-doc-docx-container flex-1 overflow-auto p-4 bg-slate-100 min-h-[600px] w-full min-w-0 ${docxPagesByHeight ? 'docx-pages-by-height' : ''}`}
        />
      </div>
    );
  }

  if (fileType === 'other' || !documentPath) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-100 rounded-lg p-8">
        <FileText className="h-16 w-16 text-slate-400 mb-4" />
        <p className="text-slate-600">Preview not available for this file type.</p>
      </div>
    );
  }

  const resourceUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/ej2-pdfviewer-lib`
    : '/ej2-pdfviewer-lib';

  return (
    <div className="flex-1 bg-slate-100 rounded-lg overflow-hidden flex flex-col min-h-[700px]">
      <PdfViewerComponent
        ref={viewerRef}
        id="original-doc-pdfviewer"
        documentPath={documentPath}
        resourceUrl={resourceUrl}
        serviceUrl=""
        style={{ height: '100%', minHeight: '700px' }}
        toolbarSettings={{
          showTooltip: true,
          toolbarItems: ['Magnification', 'Navigation', 'Print', 'Download'],
        }}
        enableToolbar={true}
        enableNavigation={true}
        enablePrint={true}
        enableDownload={true}
        enableThumbnail={false}
        enableBookmark={false}
        enableAnnotation={false}
        enableFormFields={false}
      >
        <Inject
          services={[
            Toolbar,
            Magnification,
            Navigation,
            LinkAnnotation,
            BookmarkView,
            ThumbnailView,
            Print,
            TextSelection,
          ]}
        />
      </PdfViewerComponent>
    </div>
  );
};
