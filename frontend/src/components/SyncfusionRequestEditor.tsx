import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  DocumentEditorContainerComponent,
  Toolbar as DocEditorToolbar,
} from '@syncfusion/ej2-react-documenteditor';
import {
  ArrowLeft,
  FileText,
  Save,
  Send,
  RotateCcw,
  History,
  ZoomIn,
  ZoomOut,
  Loader2,
  Download,
} from 'lucide-react';
import { Button } from './ui/button';
import { apiClient } from '../api/client';
import { DocumentSmartScroll } from './DocumentSmartScroll';
import { applyHeaderFooterToDocument, DEFAULT_HEADER_FOOTER_DATA, mergeWithDefaults, insertHeaderFooterAsContent } from '../utils/headerFooterFormatter';
import { updateHeaderFieldsInSFDT, updateFooterFieldsInSFDT, type FooterFieldValues, type SignatoryValues } from '../utils/sfdtModifier';
import { updateTableFields } from '../utils/tableFieldUpdater';
import { APP_VERSION } from '../constants';
import type { FormSection } from '../types';

DocumentEditorContainerComponent.Inject(DocEditorToolbar);

/** Minimal blank SFDT when backend does not return _sfdt in form-data (e.g. new request after upload). */
const BLANK_SFDT = JSON.stringify({
  sections: [
    {
      sectionFormat: { pageWidth: 612, pageHeight: 792 },
      blocks: [
        {
          paragraphFormat: { listFormat: {} },
          inlines: [{ text: '', characterFormat: { fontSize: 11, fontFamily: 'Calibri' } }],
        },
      ],
    },
  ],
});

export interface SyncfusionRequestEditorProps {
  templateId: string;
  requestId: string;
  documentTitle: string;
  fileName: string;
  department: string;
  status: string;
   /** Current user's display name (for footer signatory) */
  currentUserName: string;
  /** Current user's role string (admin, preparator, reviewer, approver, etc.) */
  currentUserRole: string;
  onBack: () => void;
  onSave: (sfdt: string) => void | Promise<void>;
  /** Called after saving draft; pass latest SFDT so submit can persist it */
  onSubmit: (latestSfdt?: string) => void;
  onReset: () => void;
  onViewActivity?: () => void;
  /** Previously saved SFDT (draft); if set, opens this instead of template */
  initialSfdt?: string | null;
  /** Download current document as Word; called with current SFDT so parent can export and trigger download */
  onDownload?: (sfdt: string) => void | Promise<void>;
  /** Called when the user edits content; receives the 0-based page index that was updated (Syncfusion contentChange + getCurrentPageNumber) */
  onPageUpdated?: (pageIndex: number) => void;
}

/**
 * Helper function to update footer fields based on current user from /auth/me and document status.
 * Footer: Name = fullName, Designation = role, Signature = fullName.
 * Populates:
 * - Prepared By: when admin/preparator is saving at pending/draft stage
 * - Reviewed By: when reviewer is saving at submitted/under-review stage, or admin/preparator doing revision
 * - Approved By: when approver is saving at reviewed/approved stage
 */
function updateFooterFieldsBeforeSave(sfdt: string, currentUserName: string, currentUserRole: string, documentStatus: string): string {
  try {
    const normalizedRole = (currentUserRole || '').toLowerCase();
    const normalizedStatus = (documentStatus || '').toLowerCase();
    const displayName = currentUserName;

    console.log('=== Footer Update ===');
    console.log('User:', displayName, 'Role:', normalizedRole);
    console.log('Document Status:', normalizedStatus);

    const designationFromRole = () => {
      if (normalizedRole.includes('admin')) return 'Admin';
      if (normalizedRole.includes('preparator')) return 'Preparator';
      if (normalizedRole.includes('manager_reviewer')) return 'Manager Reviewer';
      if (normalizedRole.includes('manager_approver')) return 'Manager Approver';
      if (normalizedRole.includes('reviewer')) return 'Reviewer';
      if (normalizedRole.includes('approver')) return 'Approver';
      return normalizedRole || 'User';
    };

    const baseSignatory: SignatoryValues = {
      name: displayName,
      designation: designationFromRole(),
      signature: displayName,
      date: new Date().toLocaleDateString(),
    };

    const footerValues: FooterFieldValues = {};

    // 1) Prepared By – when admin/preparator saves during pending/draft only (not when doing revision)
    const isRevisionStage = normalizedStatus === 'rejected' || normalizedStatus === 'needs-revision' || normalizedStatus === 'needs_revision';
    const isPreparedStage =
      !isRevisionStage &&
      (normalizedStatus === '' ||
        normalizedStatus === 'pending' ||
        normalizedStatus === 'draft');
    if (isPreparedStage && (normalizedRole.includes('admin') || normalizedRole.includes('preparator'))) {
      footerValues.preparedBy = baseSignatory;
      console.log('✓ Setting Prepared By for:', displayName);
    }

    // 2) Reviewed By – when reviewer saves during submitted/review stage, OR when admin/preparator is doing revision (rejected/needs-revision)
    const isReviewStage =
      normalizedStatus === 'submitted' ||
      normalizedStatus === 'review-process' ||
      normalizedStatus === 'initial-review' ||
      normalizedStatus === 'resubmitted';
    if (isReviewStage && normalizedRole.includes('reviewer')) {
      footerValues.reviewedBy = baseSignatory;
      console.log('✓ Setting Reviewed By for:', displayName);
    } else if (isRevisionStage && (normalizedRole.includes('admin') || normalizedRole.includes('preparator'))) {
      // Override Reviewed by to who is doing the revision when document was rejected or sent back for revision
      footerValues.reviewedBy = baseSignatory;
      console.log('✓ Setting Reviewed By (revision) for:', displayName);
    }

    // 3) Approved By – when approver saves after document has been reviewed
    const isApproveStage =
      normalizedStatus === 'reviewed' ||
      normalizedStatus === 'approved';
    if (isApproveStage && normalizedRole.includes('approver')) {
      footerValues.approvedBy = baseSignatory;
      console.log('✓ Setting Approved By for:', displayName);
    }

    if (!footerValues.preparedBy && !footerValues.reviewedBy && !footerValues.approvedBy) {
      console.log('⚠ No footer fields to update (status or role mismatch)');
      return sfdt;
    }

    // Only update if we have footer values to set
    console.log('Calling updateFooterFieldsInSFDT with:', footerValues);
    const result = updateFooterFieldsInSFDT(sfdt, footerValues);
    console.log('=== Footer Update Complete ===');
    return result;
  } catch (error) {
    // If modification fails, return the original SFDT
    console.error('Error in updateFooterFieldsBeforeSave:', error);
    return sfdt;
  }
}

/**
 * Helper to update header fields (Version No. and Revision Date) only for specific
 * workflow states at the SFDT level.
 * Business rule:
 * - When status is "pending" (draft-like), "draft", or "approved", set:
 *   - Version No. → "01"
 *   - Revision Date → today's date
 * - For all other statuses, header must remain unchanged.
 */
function updateHeaderFieldsForStatus(sfdt: string, documentStatus: string): string {
  try {
    console.log('=== Header Update ===');
    const normalizedStatus = (documentStatus || '').toLowerCase();
    const isDraftLike = normalizedStatus === 'draft' || normalizedStatus === 'pending';
    const isApproved = normalizedStatus === 'approved';
    console.log('Status (normalized):', normalizedStatus, 'isDraftLike:', isDraftLike, 'isApproved:', isApproved);
    if (!isDraftLike && !isApproved) {
      console.log('HeaderUpdate: skipping, status not draft/pending/approved');
      return sfdt;
    }

    const headerValues = {
      versionNo: APP_VERSION,
      revisionDate: new Date().toLocaleDateString(),
    };
    console.log('HeaderUpdate: applying headerValues:', headerValues);

    const updated = updateHeaderFieldsInSFDT(sfdt, headerValues);
    if (updated === sfdt) {
      console.log('HeaderUpdate: SFDT unchanged after updateHeaderFieldsInSFDT');
    } else {
      console.log('HeaderUpdate: SFDT modified, new length:', updated.length);
    }
    return updated;
  } catch (err) {
    console.error('HeaderUpdate: error while updating header:', err);
    return sfdt;
  }
}

export const SyncfusionRequestEditor: React.FC<SyncfusionRequestEditorProps> = ({
  templateId,
  requestId,
  documentTitle,
  fileName,
  department,
  status,
  currentUserName,
  currentUserRole,
  onBack,
  onSave,
  onSubmit,
  onReset,
  onViewActivity,
  initialSfdt,
  onDownload,
  onPageUpdated,
}) => {
  const [sfdt, setSfdt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [pageCount, setPageCount] = useState(1);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const containerRef = useRef<DocumentEditorContainerComponent>(null);
  const sfdtRef = useRef<string | null>(null);
  const onPageUpdatedRef = useRef(onPageUpdated);
  onPageUpdatedRef.current = onPageUpdated;

  useEffect(() => {
    if (initialSfdt && initialSfdt.length > 0) {
      setSfdt(initialSfdt);
      setError(null);
    } else {
      setSfdt(BLANK_SFDT);
      setError(null);
    }
    setLoading(false);
  }, [templateId, fileName, initialSfdt]);

  sfdtRef.current = sfdt;

  // When editor becomes ready and sfdt is set, open the document (backup if "created" fires early or fails)
  useEffect(() => {
    if (!sfdt) return;
    const content = sfdtRef.current || sfdt;
    const tryOpen = () => {
      const editor = containerRef.current?.documentEditor;
      if (editor && content && typeof editor.open === 'function') {
        try {
          editor.open(content);
          (editor as any).zoomFactor = 1.0;
          const count = (editor as any)?.pageCount ?? 1;
          setPageCount(typeof count === 'number' && count > 0 ? count : 1);
        } catch (_) {}
      }
    };
    const t1 = setTimeout(tryOpen, 150);
    const t2 = setTimeout(tryOpen, 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [sfdt]);

  // Apply zoom to Syncfusion document editor when zoom state changes
  useEffect(() => {
    const editor = containerRef.current?.documentEditor as any;
    if (!editor) return;
    const factor = Math.max(0.1, Math.min(5, zoom / 100));
    if (typeof editor.zoomFactor !== 'undefined') {
      editor.zoomFactor = factor;
    } else if (typeof editor.setZoomFactor === 'function') {
      editor.setZoomFactor(factor);
    }
  }, [zoom]);

  // Inject CSS to ensure proper layout and prevent overflow
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'syncfusion-request-editor-styles';
    style.textContent = `
      #request-syncfusion-editor.e-control.e-documenteditorcontainer {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        overflow: hidden !important;
      }
      #request-syncfusion-editor .e-de-container {
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
      }
      #request-syncfusion-editor .e-de-pane {
        display: none !important;
        width: 0 !important;
      }
      #request-syncfusion-editor .e-de-properties-pane {
        display: none !important;
        width: 0 !important;
      }
      #request-syncfusion-editor .e-de-splitter.e-de-splitter-horizontal {
        gap: 0 !important;
      }
      #request-syncfusion-editor .e-de-splitter-pane {
        border: none !important;
        padding: 0 !important;
      }
      #request-syncfusion-editor .e-de-statusbar-zoom.e-control.e-dropdown-btn.e-lib.e-btn {
        font-size: 12px !important;
        min-width: 60px !important;
      }
      #request-syncfusion-editor .e-de-statusbar-zoom .e-btn-content::before {
        content: '100%' !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existingStyle = document.getElementById('syncfusion-request-editor-styles');
      if (existingStyle) document.head.removeChild(existingStyle);
    };
  }, []);

  const handleSaveDraft = () => {
    const editor = containerRef.current?.documentEditor;
    if (!editor) return;
    try {
      let serialized = editor.serialize();
      // Conditionally update header + footer fields before saving
      serialized = updateHeaderFieldsForStatus(serialized, status);
      serialized = updateFooterFieldsBeforeSave(serialized, currentUserName, currentUserRole, status);
      // If header changed, reflect it in the live editor so the user sees it
      if (serialized && typeof serialized === 'string') {
        editor.open(serialized);
      }
      void Promise.resolve(onSave(serialized));
    } catch (_) {
      const doc = (editor as any).documentHelper?.serialize?.();
      if (doc) {
        let modified = updateHeaderFieldsForStatus(doc, status);
        modified = updateFooterFieldsBeforeSave(modified, currentUserName, currentUserRole, status);
        editor.open(modified);
        void Promise.resolve(onSave(modified));
      }
    }
  };

  const handleDownload = () => {
    const editor = containerRef.current?.documentEditor;
    if (!editor || !onDownload) return;
    try {
      let serialized = editor.serialize();
      // Conditionally update header + footer fields before downloading
      serialized = updateHeaderFieldsForStatus(serialized, status);
      serialized = updateFooterFieldsBeforeSave(serialized, currentUserName, currentUserRole, status);
      if (serialized) void Promise.resolve(onDownload(serialized));
    } catch (_) {
      const doc = (editor as any).documentHelper?.serialize?.();
      if (doc) {
        let modified = updateHeaderFieldsForStatus(doc, status);
        modified = updateFooterFieldsBeforeSave(modified, currentUserName, currentUserRole, status);
        void Promise.resolve(onDownload(modified));
      }
    }
  };

  const handleSubmitClick = async () => {
    const editor = containerRef.current?.documentEditor;
    let latestSfdt: string | undefined;
    if (editor) {
      try {
        let serialized = editor.serialize();
        // Conditionally update header + footer fields before saving
        serialized = updateHeaderFieldsForStatus(serialized, status);
        serialized = updateFooterFieldsBeforeSave(serialized, currentUserName, currentUserRole, status);
        latestSfdt = serialized;
        await Promise.resolve(onSave(serialized));
      } catch (_) {
        const doc = (editor as any).documentHelper?.serialize?.();
        if (doc) {
          let modified = updateHeaderFieldsForStatus(doc, status);
          modified = updateFooterFieldsBeforeSave(modified, currentUserName, currentUserRole, status);
          latestSfdt = modified;
          await Promise.resolve(onSave(modified));
        }
      }
    }
    onSubmit(latestSfdt);
  };

  const handleZoomIn = () => setZoom((p) => Math.min(p + 10, 200));
  const handleZoomOut = () => setZoom((p) => Math.max(p - 10, 50));

  const sections: FormSection[] = useMemo(
    () =>
      Array.from({ length: Math.max(pageCount, 1) }, (_, idx) => ({
        id: `page_${idx + 1}`,
        title: `Page ${idx + 1}`,
        fields: [],
      })),
    [pageCount]
  );

  const handleSelectPage = (index: number) => {
    setActivePageIndex(index);
    const editor = containerRef.current?.documentEditor as any;
    if (editor && typeof editor.scrollToPage === 'function') {
      editor.scrollToPage(index + 1);
    }
  };

  // Toolbar configuration must be declared before any early returns,
  // so that the hook order stays consistent across renders.
  const toolbarItems = useMemo(
    () =>
      [
        'Undo',
        'Redo',
        'Separator',
        'Image',
        'Table',
        'Hyperlink',
        'Bookmark',
        'TableOfContents',
        'Separator',
        'Header',
        'Footer',
        'PageSetup',
        'PageNumber',
        'Break',
        'InsertFootnote',
        'InsertEndnote',
        'Separator',
        'Find',
        'Separator',
        'Comments',
        'TrackChanges',
        'LocalClipboard',
        'RestrictEditing',
        'Separator',
        'FormFields',
        'UpdateFields',
        'ContentControl',
        'XML Mapping',
      ] as any,
    []
  );

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading document editor…</p>
      </div>
    );
  }

  if (error || !sfdt) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-8">
        <p className="text-red-600 font-medium mb-2">Could not load document</p>
        <p className="text-slate-600 text-sm mb-4">{error || 'No content available.'}</p>
        <Button variant="outline" onClick={onBack}>Back to Library</Button>
      </div>
    );
  }

  const documentEditorServiceUrl = `${apiClient.defaults.baseURL}/document-editor/`;
  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Top Toolbar - match DocumentEditScreen */}
      <div className="h-16 border-b border-slate-200 bg-white backdrop-blur sticky top-0 z-50 px-6 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-2 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold truncate max-w-[200px] md:max-w-md text-slate-900">
                {documentTitle}
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                {requestId} • {department}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onViewActivity && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewActivity}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 font-bold hidden md:flex gap-2 mr-2"
            >
              <History className="h-4 w-4" />
              View Activity
            </Button>
          )}

          <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-4 hidden md:flex border border-slate-200">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-mono w-12 text-center text-slate-600 font-bold">{zoom}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Reset button commented out for now
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="border-none shadow-lg font-bold hidden sm:flex gap-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          */}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            className="border-none shadow-lg font-bold hidden sm:flex gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>

          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-slate-300 font-bold hidden sm:flex gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleSubmitClick}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-300 font-bold gap-2"
          >
            <Send className="h-4 w-4" />
            Submit
          </Button>
        </div>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        {/* Smart Navigator - left side, same style as DocumentEditScreen */}
        <div className="h-full border-r border-slate-200 bg-white overflow-hidden relative w-80 shrink-0">
          <div className="h-full w-80">
            <DocumentSmartScroll
              sections={sections}
              activeSectionIndex={activePageIndex}
              onSectionSelect={handleSelectPage}
              formValues={{}}
              isCollapsed={false}
            />
          </div>
        </div>

        {/* Main editor area on the right */}
        <div
          className="flex-1 min-h-0 w-full flex flex-col bg-white overflow-hidden"
          style={{ height: 'calc(100vh - 64px)' }}
        >
          <DocumentEditorContainerComponent
            ref={containerRef}
            id="request-syncfusion-editor"
            style={{ height: '100%', minHeight: '100%' }}
            serviceUrl={documentEditorServiceUrl}
            enableToolbar={true}
            showPropertiesPane={false}
            toolbarItems={toolbarItems}
            documentEditorSettings={{ optimizeSfdt: false }}
            created={() => {
              const c = containerRef.current;
              const content = sfdtRef.current || sfdt;
              if (c?.documentEditor && content) {
                const editor = c.documentEditor as any;
                try {
                  c.documentEditor.open(content);
                  editor.zoomFactor = 1.0;
                } catch (_) {}

                // Wire contentChange so parent can know which page was updated (Syncfusion callback)
                if (onPageUpdatedRef.current) {
                  const prevContentChange = editor.contentChange;
                  editor.contentChange = (args: any) => {
                    // Preserve any existing handler from Syncfusion
                    if (typeof prevContentChange === 'function') {
                      prevContentChange(args);
                    }
                    const cb = onPageUpdatedRef.current;
                    if (!cb) return;
                  const pageNum =
                    editor.selection?.startPage ??
                    editor.selection?.endPage ??
                    1;
                    const pageIndex = Math.max(
                      0,
                      (typeof pageNum === 'number' ? pageNum : 1) - 1
                    );
                    cb(pageIndex);
                  };
                }

                setTimeout(() => {
                  try {
                    // 1) Ensure header is visually updated when editor first opens
                    //    (in case SFDT-based update missed any layout-specific cases).
                    updateTableFields(editor, {
                      versionNo: APP_VERSION,
                      revisionDate: new Date().toLocaleDateString(),
                    });

                    // 2) Apply footer preview based on current user role and document status
                    const serialized = editor.serialize();
                    if (serialized && typeof serialized === 'string') {
                      const modified = updateFooterFieldsBeforeSave(
                        serialized,
                        currentUserName,
                        currentUserRole,
                        status
                      );
                      if (modified !== serialized) {
                        editor.open(modified);
                      }
                    }
                  } catch (_) {
                    // Ignore header/footer preview errors; best-effort only.
                  }

                  const count = editor?.pageCount || 1;
                  setPageCount(typeof count === 'number' && count > 0 ? count : 1);
                }, 1200);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
