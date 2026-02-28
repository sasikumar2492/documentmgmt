import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  DocumentEditorContainerComponent,
  Toolbar as DocEditorToolbar,
} from '@syncfusion/ej2-react-documenteditor';
import { 
  FileText, 
  Download, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  ArrowLeft,
  Calendar,
  User,
  Building2,
  Clock,
  Shield,
  FileCheck,
  Send,
  Save,
  RotateCcw,
  MessageSquare,
  History,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ReportData, FormData, ViewType, FormSection } from '../types';
import { getStatusColor, getStatusLabel } from '../utils/statusUtils';
import { FormPages } from './FormPages';
import { DynamicFormViewer } from './DynamicFormViewer';
import { DocumentSmartScroll } from './DocumentSmartScroll';
import { PageRemarksModal } from './PageRemarksModal';
import { motion, AnimatePresence } from 'motion/react';
import { getTemplateFileBlob, importDocxToSfdt } from '../api/templates';
import { apiClient } from '../api/client';

DocumentEditorContainerComponent.Inject(DocEditorToolbar);

interface DocumentEditScreenProps {
  documentTitle: string;
  requestId: string;
  department: string;
  status: string;
  userRole?: string;
  onBack: () => void;
  onSave: (data?: any) => void | Promise<void>;
  onSubmit: (data?: any) => void;
  onReset: () => void;
  onViewActivity?: () => void;
  
  // For Syncfusion Editor
  useSyncfusionEditor?: boolean;
  templateId?: string;
  fileName?: string;
  initialSfdt?: string | null;
  
  // For FormPages (Fixed 6-page form)
  isFixedForm?: boolean;
  currentFormData?: FormData;
  updateFormData?: (field: keyof FormData, value: any) => void;
  username?: string;
  
  // For DynamicForm (Converted from Template)
  isDynamicForm?: boolean;
  sections?: FormSection[];
  onDynamicSave?: (formData: Record<string, any>) => void;
  initialData?: Record<string, any>;
}

export const DocumentEditScreen = ({
  documentTitle,
  requestId,
  department,
  status,
  userRole,
  onBack,
  onSave,
  onSubmit,
  onReset,
  onViewActivity,
  useSyncfusionEditor = false,
  templateId,
  fileName,
  initialSfdt,
  isFixedForm,
  currentFormData,
  updateFormData,
  username,
  isDynamicForm,
  sections,
  onDynamicSave,
  initialData
}: DocumentEditScreenProps) => {
  // Syncfusion editor state
  const [sfdt, setSfdt] = useState(null);
  const [syncLoading, setSyncLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);
  const containerRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePageIndex, setActivePageIndex] = useState(0);
  
  // Regular form editor state
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSmartScrollCollapsed, setIsSmartScrollCollapsed] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [activeRemarkPage, setActiveRemarkPage] = useState(null);
  const [pageRemarks, setPageRemarks] = useState({});
  
  // Always use Syncfusion editor mode for document editing
  const isSyncfusionMode = true;
  const effectiveTemplateId = templateId;
  const totalPages = pageCount;

  // Load Syncfusion document
  useEffect(() => {
    if (!isSyncfusionMode) return;
    
    let cancelled = false;

    const load = async () => {
      if (initialSfdt && initialSfdt.length > 0) {
        setSfdt(initialSfdt);
        setSyncLoading(false);
        return;
      }
      
      if (!effectiveTemplateId) {
        setSyncError('No template or document ID provided for Word document');
        setSyncLoading(false);
        return;
      }

      try {
        setSyncLoading(true);
        const blob = await getTemplateFileBlob(effectiveTemplateId);
        if (cancelled) return;
        
        const ext = (fileName || '').toLowerCase().split('.').pop() || '';
        if (!['doc', 'docx'].includes(ext)) {
          setSyncError('Only Word documents (.doc/.docx) are supported in the editor.');
          setSyncLoading(false);
          return;
        }
        
        const result = await importDocxToSfdt(blob, fileName || 'document.docx');
        if (!cancelled) {
          setSfdt(result);
        }
      } catch (e) {
        if (!cancelled) {
          setSyncError(e instanceof Error ? e.message : 'Failed to load document');
        }
      } finally {
        if (!cancelled) setSyncLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [effectiveTemplateId, fileName, initialSfdt, isSyncfusionMode]);

  // Syncfusion editor styles
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'syncfusion-editor-in-screen-styles';
    style.textContent = `
      #edit-screen-syncfusion-editor.e-control.e-documenteditorcontainer {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        overflow: hidden !important;
      }
      #edit-screen-syncfusion-editor .e-de-container {
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
      }
      #edit-screen-syncfusion-editor .e-de-pane {
        display: none !important;
        width: 0 !important;
      }
      #edit-screen-syncfusion-editor .e-de-properties-pane {
        display: none !important;
        width: 0 !important;
      }
      #edit-screen-syncfusion-editor .e-de-splitter.e-de-splitter-horizontal {
        gap: 0 !important;
      }
      #edit-screen-syncfusion-editor .e-de-splitter-pane {
        border: none !important;
        padding: 0 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existingStyle = document.getElementById('syncfusion-editor-in-screen-styles');
      if (existingStyle) document.head.removeChild(existingStyle);
    };
  }, []);

  // Map sections for Smart Navigator
  const navigatorSections = Array.from({ length: Math.max(pageCount, 1) }, (_, i) => ({
    id: `page_${i + 1}`,
    title: `Page ${i + 1}`,
    fields: []
  }));

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handlePrint = () => window.print();
  
  // Syncfusion handlers
  const handleSyncfusionSave = () => {
    const editor = containerRef.current?.documentEditor;
    if (!editor) return;
    try {
      const serialized = editor.serialize();
      void Promise.resolve(onSave(serialized));
    } catch (_) {
      const doc = (editor).documentHelper?.serialize?.();
      if (doc) void Promise.resolve(onSave(doc));
    }
  };

  const handleSyncfusionSubmit = async () => {
    const editor = containerRef.current?.documentEditor;
    let latestSfdt;
    if (editor) {
      try {
        const serialized = editor.serialize();
        latestSfdt = serialized;
        await Promise.resolve(onSave(serialized));
      } catch (_) {
        const doc = (editor).documentHelper?.serialize?.();
        if (doc) {
          latestSfdt = doc;
          await Promise.resolve(onSave(doc));
        }
      }
    }
    onSubmit(latestSfdt);
  };

  const handleSelectPage = (index) => {
    setActivePageIndex(index);
    const editor = containerRef.current?.documentEditor;
    if (editor && typeof editor.scrollToPage === 'function') {
      editor.scrollToPage(index + 1);
    }
  };

  // Scroll to top when page changes
  useEffect(() => {
    const mainContent = document.getElementById('edit-screen-main');
    if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePageIndex]);

  const handleOpenRemarks = (e, pageIdx) => {
    e.stopPropagation();
    setActiveRemarkPage(pageIdx + 1);
    setIsRemarksModalOpen(true);
  };

  const handleSaveRemark = (remark) => {
    if (activeRemarkPage !== null) {
      setPageRemarks(prev => ({
        ...prev,
        [activeRemarkPage]: remark
      }));
    }
  };

  const isReviewerRole = (userRole || '').toLowerCase().includes('reviewer') || 
                         (userRole || '').toLowerCase().includes('approver') ||
                         username === 'robert.manager';

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Remarks Modal */}
      <PageRemarksModal 
        isOpen={isRemarksModalOpen}
        onClose={() => setIsRemarksModalOpen(false)}
        onSave={handleSaveRemark}
        pageNumber={activeRemarkPage || 0}
        existingRemark={activeRemarkPage ? pageRemarks[activeRemarkPage] : ""}
      />
      
      {/* Top Toolbar */}
      <div className="h-16 border-b border-slate-200 bg-white backdrop-blur sticky top-0 z-50 px-6 flex items-center justify-between shadow-sm">
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
          <div className="h-6 w-px bg-slate-200"></div>
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewActivity}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 font-bold hidden md:flex gap-2 mr-2"
          >
            <History className="h-4 w-4" />
            View Activity
          </Button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-4 hidden md:flex border border-slate-200">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-mono w-12 text-center text-slate-600 font-bold">{zoom}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {!isReviewerRole && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onReset}
                className="border-none shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold hidden sm:flex gap-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-slate-300"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSyncfusionSave}
                className="border-none shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold hidden sm:flex gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
            </>
          )}
          
          <Button 
            size="sm" 
            onClick={handleSyncfusionSubmit}
            className={`border-none shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold gap-2 ${
              isReviewerRole
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-300 px-8'
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-300'
            }`}
          >
            <Send className="h-4 w-4" />
            Submit
          </Button>
        </div>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        {/* Smart Navigator - Integrated into main screen area with transition */}
        <div 
          className={`h-full border-r border-slate-200 bg-white transition-all duration-500 overflow-hidden relative ${isSmartScrollCollapsed ? 'w-16' : 'w-80'}`}
        >
          <div className="h-full w-80">
            <DocumentSmartScroll
              sections={navigatorSections}
              activeSectionIndex={activePageIndex}
              onSectionSelect={handleSelectPage}
              formValues={{}}
              isCollapsed={isSmartScrollCollapsed}
              onOpenRemarks={handleOpenRemarks}
              pageRemarks={pageRemarks}
            />
          </div>
          
          {/* Collapse Toggle Handle */}
          <button 
            onClick={() => setIsSmartScrollCollapsed(!isSmartScrollCollapsed)}
            className="absolute top-1/2 -right-3 -translate-y-1/2 z-50 w-7 h-7 bg-blue-600 border border-blue-400 rounded-full flex items-center justify-center shadow-xl hover:bg-blue-500 text-white transition-all active:scale-95"
          >
            {isSmartScrollCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        </div>

        {/* Main Editor Area */}
        <main 
          id="edit-screen-main"
          className="flex-1 overflow-y-auto bg-white"
        >
          {syncLoading && (
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Loading document editor…</p>
            </div>
          )}

          {!syncLoading && (syncError || !sfdt) && (
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 p-8">
              <p className="text-red-600 font-medium mb-2">Could not load document</p>
              <p className="text-slate-600 text-sm mb-4">{syncError || 'No content available.'}</p>
              <Button variant="outline" onClick={onBack}>Back to Library</Button>
            </div>
          )}

          {!syncLoading && sfdt && (
            <div className="w-full h-full flex flex-col bg-white overflow-hidden">
              <DocumentEditorContainerComponent
                ref={containerRef}
                id="edit-screen-syncfusion-editor"
                style={{ height: '100%', minHeight: '100%' }}
                serviceUrl={`${apiClient.defaults.baseURL}/document-editor/`}
                enableToolbar={true}
                showPropertiesPane={false}
                toolbarItems={[
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
                ]}
                created={() => {
                  const c = containerRef.current;
                  if (c?.documentEditor && sfdt) {
                    c.documentEditor.open(sfdt);
                    (c.documentEditor).zoomFactor = 1.0;
                    // After layout, read page count for navigator
                    setTimeout(() => {
                      const editor = c.documentEditor;
                      const count = editor?.pageCount || 1;
                      setPageCount(typeof count === 'number' && count > 0 ? count : 1);
                    }, 500);
                  }
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};