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
import { apiClient } from '../api/client';
import { applyHeaderFooterToDocument, mergeWithDefaults, insertHeaderFooterAsContent } from '../utils/headerFooterFormatter';
import { updateHeaderFieldsInSFDT, updateFooterFieldsInSFDT, type FooterFieldValues, type SignatoryValues } from '../utils/sfdtModifier';
import { updateTableFields } from '../utils/tableFieldUpdater';

DocumentEditorContainerComponent.Inject(DocEditorToolbar);

/** Minimal blank SFDT when form-data has no _sfdt (e.g. new request). */
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
  /** Full name from /auth/me (for footer: Name and Signature) */
  fullName?: string;

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
  fullName,
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
  const [showHistory, setShowHistory] = useState(false);
  
  // Use Syncfusion editor only when explicitly enabled by props
  const isSyncfusionMode = !!useSyncfusionEditor;
  const effectiveTemplateId = templateId;
  const totalPages = pageCount;

  // Prevent any page scroll when in Syncfusion mode: fix body and html so only editor/panes scroll
  useEffect(() => {
    if (!isSyncfusionMode) return;
    const scrollY = window.scrollY;
    const prevBody = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    document.documentElement.classList.add('document-editor-active');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.classList.remove('document-editor-active');
      document.body.style.position = prevBody.position;
      document.body.style.top = prevBody.top;
      document.body.style.left = prevBody.left;
      document.body.style.right = prevBody.right;
      document.body.style.width = prevBody.width;
      document.body.style.overflow = prevBody.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isSyncfusionMode]);

  // Load Syncfusion document from form-data _sfdt, or blank document when none (e.g. new request after upload)
  useEffect(() => {
    if (!isSyncfusionMode) return;
    if (initialSfdt && initialSfdt.length > 0) {
      setSfdt(initialSfdt);
      setSyncError(null);
    } else if (!effectiveTemplateId) {
      setSyncError('No template or document ID provided for Word document');
    } else {
      setSfdt(BLANK_SFDT);
      setSyncError(null);
    }
    setSyncLoading(false);
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
      /* Track changes sidebar container */
      #edit-screen-syncfusion-editor .e-de-tc-pane {
        display: flex !important;
        flex-direction: column !important;
        height: 100% !important;
        max-height: 100vh !important;
        background: #f9fafb !important; /* slate-50 */
        border-left: 1px solid #e5e7eb !important; /* slate-200 */
      }
      /* Track changes toolbar */
      #edit-screen-syncfusion-editor .e-de-tc-pane .e-de-track-toolbar {
        flex: 0 0 auto !important;
        border-bottom: 1px solid #e5e7eb !important;
        background: #f9fafb !important;
        padding-inline: 8px !important;
      }
      /* Scrollable list area */
      #edit-screen-syncfusion-editor .e-de-tc-pane .e-de-tc-hide-para-mark#e-de-tc-pane-revision {
        flex: 1 1 auto !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        padding: 12px 8px 12px 12px !important;
        background: transparent !important;
      }
      #edit-screen-syncfusion-editor .e-de-tc-pane .e-de-tc-hide-para-mark#e-de-tc-pane-revision::-webkit-scrollbar {
        width: 6px;
      }
      #edit-screen-syncfusion-editor .e-de-tc-pane .e-de-tc-hide-para-mark#e-de-tc-pane-revision::-webkit-scrollbar-track {
        background: rgba(241, 245, 249, 0.9); /* slate-100 */
      }
      #edit-screen-syncfusion-editor .e-de-tc-pane .e-de-tc-hide-para-mark#e-de-tc-pane-revision::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.7); /* slate-400 */
        border-radius: 9999px;
      }
      #edit-screen-syncfusion-editor .e-de-tc-pane .e-de-tc-hide-para-mark#e-de-tc-pane-revision::-webkit-scrollbar-thumb:hover {
        background: rgba(100, 116, 139, 0.9); /* slate-500 */
      }
      /* Revision "card" */
      #edit-screen-syncfusion-editor .e-de-tc-outer {
        border-radius: 12px !important;
        border: 1px solid #e5e7eb !important;
        background: #ffffff !important;
        margin-bottom: 8px !important;
        padding: 8px 12px !important;
        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.04) !important;
        transition: box-shadow 0.15s ease, transform 0.15s ease,
          border-color 0.15s ease, background-color 0.15s ease;
      }
      #edit-screen-syncfusion-editor .e-de-tc-outer:hover {
        border-color: #bfdbfe !important; /* blue-200 */
        background: #f9fafb !important;
        box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06) !important;
        transform: translateY(-1px);
      }
      /* Header row: user + page badge */
      #edit-screen-syncfusion-editor .e-de-track-usernme-div {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 8px !important;
        margin-bottom: 4px !important;
      }
      #edit-screen-syncfusion-editor .e-de-track-usernme-div span {
        font-size: 11px !important;
        font-weight: 600 !important;
        color: #0f172a !important; /* slate-900 */
      }
      /* Our injected page badge */
      #edit-screen-syncfusion-editor .fed-page-badge {
        margin-left: 8px;
        padding: 2px 8px;
        border-radius: 9999px;
        background: rgba(59, 130, 246, 0.12); /* blue-500/10 */
        color: #1d4ed8; /* blue-700 */
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      /* Change summary / body text */
      #edit-screen-syncfusion-editor .e-de-track-chng-row,
      #edit-screen-syncfusion-editor .e-de-track-chngs-text {
        font-size: 11px !important;
        line-height: 1.5 !important;
        color: #4b5563 !important; /* slate-600 */
      }
      /* Time / metadata row */
      #edit-screen-syncfusion-editor .e-de-track-date,
      #edit-screen-syncfusion-editor .e-de-track-chng-time {
        font-size: 10px !important;
        color: #9ca3af !important; /* slate-400 */
        margin-top: 2px !important;
      }
      /* Hide Accept / Reject buttons in the CHANGES list */
      #edit-screen-syncfusion-editor .e-de-track-accept-button,
      #edit-screen-syncfusion-editor .e-de-track-reject-button {
        display: none !important;
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
  
  const handleToggleHistory = () => {
    setShowHistory((prev) => {
      const next = !prev;
      const editor = (containerRef.current as any)?.documentEditor as any;
      if (editor) {
        editor.showRevisions = next;
        if (next) {
          // When user explicitly opens history, (re)compute page numbers for revisions
          setTimeout(() => {
            recomputeRevisionPages(editor, 'edit-screen-syncfusion-editor');
          }, 300);
        }
      }
      return next;
    });
  };
  
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

  /**
   * Update the CHANGES list so the current (latest) item shows the page
   * next to the user name while typing.
   */
  const labelLastRevisionWithPage = (rootId: string, pageIndex: number) => {
    try {
      const container = document.getElementById(rootId);
      if (!container) return;

      const reviewPane = container.querySelector('.e-de-tc-pane');
      if (!reviewPane) return;

      const selectedInner = reviewPane.querySelector(
        '.e-de-trckchanges-inner-select'
      ) as HTMLElement | null;
      const card = (selectedInner?.closest('.e-de-tc-outer') ||
        reviewPane.querySelector('.e-de-tc-outer:last-of-type')) as
        | HTMLElement
        | null;
      if (!card) return;

      const header = card.querySelector(
        '.e-de-track-usernme-div'
      ) as HTMLElement | null;
      if (!header) return;

      let badge = header.querySelector('.fed-page-badge') as HTMLElement | null;
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'fed-page-badge';
        header.appendChild(badge);
      }
      badge.textContent = `Page ${pageIndex + 1}`;
    } catch {
      // Non-blocking UI enhancement; ignore failures
    }
  };

  /**
   * After a document is opened, walk all revisions, capture their page index,
   * and then annotate each CHANGES card with "Page N". This runs on load so
   * page numbers are restored when reopening drafts.
   */
  const annotateChangesPaneWithPages = (
    rootId: string,
    pageMap: Map<number, number>
  ) => {
    const container = document.getElementById(rootId);
    if (!container) return;

    const reviewPane = container.querySelector('.e-de-tc-pane');
    if (!reviewPane) return;

    const cards = reviewPane.querySelectorAll('.e-de-tc-outer');
    cards.forEach((card, idx) => {
      const header = (card as HTMLElement).querySelector(
        '.e-de-track-usernme-div'
      ) as HTMLElement | null;
      if (!header) return;

      let badge = header.querySelector('.fed-page-badge') as HTMLElement | null;
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'fed-page-badge';
        header.appendChild(badge);
      }

      const pageIndex = pageMap.get(idx);
      if (pageIndex != null) {
        badge.textContent = `Page ${pageIndex + 1}`;
      }
    });
  };

  const recomputeRevisionPages = (editor: any, rootId: string) => {
    try {
      const revisions = editor?.revisions;
      if (!revisions || typeof revisions.get !== 'function') return;

      // Remember the current page so we can restore it after
      const originalPageNum =
        editor.selection?.startPage ?? editor.selection?.endPage ?? 1;

      const count =
        typeof revisions.length === 'number'
          ? revisions.length
          : typeof revisions.getCount === 'function'
          ? revisions.getCount()
          : 0;
      if (!count || count <= 0) return;

      const pageMap = new Map<number, number>();

      for (let i = 0; i < count; i++) {
        const rev = revisions.get(i);
        if (!rev || typeof rev.select !== 'function') continue;

        try {
          // Select this revision so selection.startPage reflects it
          rev.select();
          const pageNum =
            editor.selection?.startPage ?? editor.selection?.endPage ?? 1;
          const pageIndex = Math.max(
            0,
            (typeof pageNum === 'number' ? pageNum : 1) - 1
          );
          pageMap.set(i, pageIndex);
        } catch {
          // Skip problematic revision; continue others
        }
      }

      annotateChangesPaneWithPages(rootId, pageMap);

      // Restore the original page so initial load stays where the user expects
      if (
        typeof originalPageNum === 'number' &&
        originalPageNum > 0 &&
        typeof editor.scrollToPage === 'function'
      ) {
        editor.scrollToPage(originalPageNum);
      }
    } catch {
      // Best-effort only; ignore failures
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
    <div className="h-full min-h-0 bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Remarks Modal */}
      <PageRemarksModal 
        isOpen={isRemarksModalOpen}
        onClose={() => setIsRemarksModalOpen(false)}
        onSave={handleSaveRemark}
        pageNumber={activeRemarkPage || 0}
        existingRemark={activeRemarkPage ? pageRemarks[activeRemarkPage] : ""}
      />
      
      {/* Top Toolbar */}
      <div className="h-16 flex-shrink-0 border-b border-slate-200 bg-white backdrop-blur z-50 px-6 flex items-center justify-between shadow-sm">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleHistory}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 font-bold hidden md:flex gap-2 mr-2"
          >
            <History className="h-4 w-4" />
            {showHistory ? 'Hide History' : 'View History'}
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

      <div className="flex-1 min-h-0 flex relative overflow-hidden">
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

        {/* Main Editor Area - overflow-hidden so only Syncfusion panes (document + changes list) scroll */}
        <main 
          id="edit-screen-main"
          className="flex-1 min-h-0 overflow-hidden bg-white flex flex-col"
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
            <div className="flex-1 min-h-0 w-full flex flex-col bg-white overflow-hidden">
              <DocumentEditorContainerComponent
                ref={containerRef}
                id="edit-screen-syncfusion-editor"
                style={{ height: '100%', minHeight: '100%' }}
                serviceUrl={`${apiClient.defaults.baseURL}/document-editor/`}
                enableToolbar={true}
                showPropertiesPane={false}
                enableTrackChanges={true}
                documentEditorSettings={{ optimizeSfdt: false }}
                documentChange={() => {
                  const ed = containerRef.current?.documentEditor as any;
                  if (ed) {
                    ed.enableTrackChanges = true;
                    ed.currentUser =
                      (fullName || username || 'User').trim() || 'User';
                    ed.showRevisions = showHistory;
                  }
                }}
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
                    // Open the document
                    c.documentEditor.open(sfdt);
                    const editor = c.documentEditor as any;
                    editor.zoomFactor = 1.0;
                    editor.enableTrackChanges = true;
                    editor.currentUser =
                      (fullName || username || 'User').trim() || 'User';
                    editor.showRevisions = false;

                    // Wire contentChange so we can record which page was edited and annotate CHANGES list.
                    const prevContentChange = editor.contentChange;
                    editor.contentChange = (args: any) => {
                      if (typeof prevContentChange === 'function') {
                        prevContentChange(args);
                      }
                      const pageNum =
                        editor.selection?.startPage ??
                        editor.selection?.endPage ??
                        1;
                      const pageIndex = Math.max(
                        0,
                        (typeof pageNum === 'number' ? pageNum : 1) - 1
                      );

                      // When a new revision is created, just update the badge
                      // on the latest CHANGES card with the correct page number.
                      setTimeout(() => {
                        labelLastRevisionWithPage(
                          'edit-screen-syncfusion-editor',
                          pageIndex
                        );
                      }, 0);
                    };

                    
                    // Update header table and dynamic footer signatories after document is loaded
                    setTimeout(() => {
                      const editor = c.documentEditor as any;
                      // updateTableFields(editor, {
                      //   sopNo: 'RSD-SOP-010',
                      //   versionNo: 'Yash',
                      //   effectiveDate: '10/04/2026',
                      //   revisionDate: '',
                      // });

                      // Build footer values based on workflow step (status) and current user role
                      try {
                        const rawRole = userRole || '';
                        const normalizedRole = rawRole.toLowerCase();
                        const normalizedStatus = (status || '').toLowerCase();
                        // Prefer a human-friendly label for the signatory name:
                        // 1) use the role label from login (e.g. "Reviewer 1")
                        // 2) fall back to username (e.g. "reviewer1")
                        // 3) finally, a generic "User"
                        const displayName = rawRole || username || 'User';

                        const designationFromRole = () => {
                          if (normalizedRole.includes('admin')) return 'Admin';
                          if (normalizedRole.includes('preparator')) return 'Preparator';
                          if (normalizedRole.includes('manager_reviewer')) return 'Manager Reviewer';
                          if (normalizedRole.includes('manager_approver')) return 'Manager Approver';
                          if (normalizedRole.includes('reviewer')) return 'Reviewer';
                          if (normalizedRole.includes('approver')) return 'Approver';
                          return normalizedRole || 'User';
                        };

                        const designation = designationFromRole();

                        // Footer from /auth/me: Name = fullName, Designation = role, Signature = fullName
                        const nameValue = (fullName || username || displayName || 'User').trim() || 'User';
                        const signatureValue = (fullName || nameValue).trim() || nameValue;

                        const baseSignatory: SignatoryValues = {
                          name: nameValue,
                          designation,
                          signature: signatureValue,
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
                        }

                        // 2) Reviewed By – when reviewer saves during submitted/review stage, OR when admin/preparator is doing revision (rejected/needs-revision)
                        const isReviewStage =
                          normalizedStatus === 'submitted' ||
                          normalizedStatus === 'review-process' ||
                          normalizedStatus === 'initial-review' ||
                          normalizedStatus === 'resubmitted';
                        if (isReviewStage && normalizedRole.includes('reviewer')) {
                          footerValues.reviewedBy = baseSignatory;
                        } else if (isRevisionStage && (normalizedRole.includes('admin') || normalizedRole.includes('preparator'))) {
                          footerValues.reviewedBy = baseSignatory;
                        }

                        // 3) Approved By – when approver saves after document has been reviewed
                        const isApproveStage =
                          normalizedStatus === 'reviewed' ||
                          normalizedStatus === 'approved';
                        if (isApproveStage && normalizedRole.includes('approver')) {
                          footerValues.approvedBy = baseSignatory;
                        }

                        if (footerValues.preparedBy || footerValues.reviewedBy || footerValues.approvedBy) {
                          const serialized = editor.serialize();
                          if (serialized && typeof serialized === 'string') {
                            const modified = updateFooterFieldsInSFDT(serialized, footerValues);
                            if (modified !== serialized) {
                              editor.open(modified);
                            }
                          }
                        }
                      } catch (error) {
                        // Silently ignore footer update errors to avoid blocking editor load
                      }
                      
                      // Read page count for navigator
                      const count = editor?.pageCount || 1;
                      setPageCount(typeof count === 'number' && count > 0 ? count : 1);
                    }, 1500);
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