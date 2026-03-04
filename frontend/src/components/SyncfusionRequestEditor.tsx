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
} from 'lucide-react';
import { Button } from './ui/button';
import { getTemplateFileBlob, importDocxToSfdt } from '../api/templates';
import { apiClient } from '../api/client';
import { DocumentSmartScroll } from './DocumentSmartScroll';
import type { FormSection } from '../types';

DocumentEditorContainerComponent.Inject(DocEditorToolbar);

export interface SyncfusionRequestEditorProps {
  templateId: string;
  requestId: string;
  documentTitle: string;
  fileName: string;
  department: string;
  status: string;
  onBack: () => void;
  onSave: (sfdt: string) => void | Promise<void>;
  /** Called after saving draft; pass latest SFDT so submit can persist it */
  onSubmit: (latestSfdt?: string) => void;
  onReset: () => void;
  onViewActivity?: () => void;
  /** Previously saved SFDT (draft); if set, opens this instead of template */
  initialSfdt?: string | null;
}

export const SyncfusionRequestEditor: React.FC<SyncfusionRequestEditorProps> = ({
  templateId,
  requestId,
  documentTitle,
  fileName,
  department,
  status,
  onBack,
  onSave,
  onSubmit,
  onReset,
  onViewActivity,
  initialSfdt,
}) => {
  const [sfdt, setSfdt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [pageCount, setPageCount] = useState(1);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const containerRef = useRef<DocumentEditorContainerComponent>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (initialSfdt && initialSfdt.length > 0) {
        setSfdt(initialSfdt);
        setLoading(false);
        return;
      }
      try {
        const blob = await getTemplateFileBlob(templateId);
        if (cancelled) return;
        const ext = (fileName || '').toLowerCase().split('.').pop() || '';
        if (!['doc', 'docx'].includes(ext)) {
          setError('Only Word documents (.doc/.docx) are supported in the editor.');
          setLoading(false);
          return;
        }
        const result = await importDocxToSfdt(blob, fileName || 'document.docx');
        if (!cancelled) {
          setSfdt(result);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load document');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [templateId, fileName, initialSfdt]);

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
      const serialized = editor.serialize();
      void Promise.resolve(onSave(serialized));
    } catch (_) {
      const doc = (editor as any).documentHelper?.serialize?.();
      if (doc) void Promise.resolve(onSave(doc));
    }
  };

  const handleSubmitClick = async () => {
    const editor = containerRef.current?.documentEditor;
    let latestSfdt: string | undefined;
    if (editor) {
      try {
        const serialized = editor.serialize();
        latestSfdt = serialized;
        await Promise.resolve(onSave(serialized));
      } catch (_) {
        const doc = (editor as any).documentHelper?.serialize?.();
        if (doc) {
          latestSfdt = doc;
          await Promise.resolve(onSave(doc));
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

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="border-none shadow-lg font-bold hidden sm:flex gap-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            className="border-none shadow-lg font-bold hidden sm:flex gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>

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
            created={() => {
              const c = containerRef.current;
              if (c?.documentEditor && sfdt) {
                c.documentEditor.open(sfdt);
                (c.documentEditor as any).zoomFactor = 1.0;
                // After layout, read page count for navigator
                setTimeout(() => {
                  const editor = c.documentEditor as any;
                  const count = editor?.pageCount || 1;
                  setPageCount(typeof count === 'number' && count > 0 ? count : 1);
                }, 500);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
