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
  /** Called when user edits content in Syncfusion editor; receives 0-based page index */
  onPageUpdated?: (pageIndex: number) => void;
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
  initialData,
  onPageUpdated,
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
  
  // Use Syncfusion editor only when explicitly enabled by props
  const isSyncfusionMode = !!useSyncfusionEditor;
  const normalizedStatus = (status || '').toLowerCase();
  const isPublished = normalizedStatus === 'published';
  const effectiveTemplateId = templateId;
  const totalPages = pageCount;

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

  // Apply zoom to Syncfusion document editor when zoom state changes
  useEffect(() => {
    if (!isSyncfusionMode) return;
    const editor = containerRef.current?.documentEditor;
    if (!editor) return;
    const factor = Math.max(0.1, Math.min(5, zoom / 100));
    if (typeof editor.zoomFactor !== 'undefined') {
      editor.zoomFactor = factor;
    } else if (typeof editor.setZoomFactor === 'function') {
      editor.setZoomFactor(factor);
    }
  }, [zoom, isSyncfusionMode]);

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
              {/* Reset button commented out for now
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onReset}
                className="border-none shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold hidden sm:flex gap-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-slate-300"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              */}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={isPublished ? undefined : handleSyncfusionSave}
                disabled={isPublished}
                className={`border-none shadow-lg transform active:translate-y-0 transition-all font-bold hidden sm:flex gap-2 ${
                  isPublished
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200 hover:-translate-y-0.5'
                }`}
              >
                <Save className="h-4 w-4" />
                {isPublished ? 'Read Only' : 'Save Draft'}
              </Button>
            </>
          )}
          
          <Button 
            size="sm" 
            onClick={isPublished ? undefined : handleSyncfusionSubmit}
            disabled={isPublished}
            className={`border-none shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold gap-2 ${
              isPublished
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : isReviewerRole
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-300 px-8'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-300'
            }`}
          >
            <Send className="h-4 w-4" />
            {isPublished ? 'Published' : 'Submit'}
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
                documentEditorSettings={{ optimizeSfdt: false }}
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

                    // Make the document strictly read-only when published
                    if (isPublished) {
                      try {
                        editor.isReadOnly = true;
                        if (typeof editor.enableReadOnlyMode === 'function') {
                          editor.enableReadOnlyMode(true);
                        }
                      } catch {
                        // Ignore errors; read-only is a UX safeguard, main guard is disabled actions
                      }
                    }

                    // Log which page was updated whenever content changes
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
                      console.log(
                        '[DocumentEditScreen] content updated on page',
                        pageIndex + 1
                      );
                      if (onPageUpdated) {
                        onPageUpdated(pageIndex);
                      }
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