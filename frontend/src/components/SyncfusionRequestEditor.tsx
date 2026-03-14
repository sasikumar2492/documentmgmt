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
      // versionNo: APP_VERSION,
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
}) => {
  const [sfdt, setSfdt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [pageCount, setPageCount] = useState(1);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const containerRef = useRef<DocumentEditorContainerComponent>(null);
  const sfdtRef = useRef<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const initialScrollDoneRef = useRef(false);
  const scrollLockUntilRef = useRef(0);

  // Prevent any page scroll: fix body and html so only the editor/panes scroll
  useEffect(() => {
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
  }, []);

  // Reset any scroll that Syncfusion triggers; lock is extended on each contentChange
  useEffect(() => {
    scrollLockUntilRef.current = Date.now() + 5000;
    const onScroll = () => {
      if (Date.now() > scrollLockUntilRef.current) return;
      if (window.scrollY === 0 && document.documentElement.scrollTop === 0 && document.body.scrollTop === 0) return;
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, []);

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
      const editor = containerRef.current?.documentEditor as any;
      if (editor && content && typeof editor.open === 'function') {
        try {
          editor.open(content);
          editor.zoomFactor = 1.0;
          editor.enableTrackChanges = true;
          editor.currentUser = (currentUserName || 'User').trim() || 'User';
          const count = editor?.pageCount ?? 1;
          setPageCount(typeof count === 'number' && count > 0 ? count : 1);
          // New document load: we will re-apply an initial scroll-to-top later
          initialScrollDoneRef.current = false;
          // After a short delay, force the view to the very top once
          setTimeout(() => {
            if (!initialScrollDoneRef.current) {
              scrollMainEditorToTop(editor);
              initialScrollDoneRef.current = true;
            }
          }, 400);
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
      #request-syncfusion-editor .e-de-splitter.e-de-splitter-horizontal {
        gap: 0 !important;
      }
      #request-syncfusion-editor .e-de-splitter-pane {
        border: none !important;
        padding: 0 !important;
      }
      /* When history is closed, completely hide the review / track-changes pane */
      #request-syncfusion-editor.fed-history-closed .e-de-review-pane,
      #request-syncfusion-editor.fed-history-closed .e-de-tc-pane {
        display: none !important;
        width: 0 !important;
        max-width: 0 !important;
      }
      /* When history is open, allow the review pane to be visible and styled */
      #request-syncfusion-editor.fed-history-open .e-de-review-pane,
      #request-syncfusion-editor.fed-history-open .e-de-tc-pane {
        display: flex !important;
      }
      /* Hide Accept / Reject buttons in the CHANGES list */
      #request-syncfusion-editor .e-de-track-accept-button,
      #request-syncfusion-editor .e-de-track-reject-button {
        display: none !important;
      }
      #request-syncfusion-editor .e-de-statusbar-zoom.e-control.e-dropdown-btn.e-lib.e-btn {
        font-size: 12px !important;
        min-width: 60px !important;
      }
      #request-syncfusion-editor .e-de-statusbar-zoom .e-btn-content::before {
        content: '100%' !important;
      }
      /* Track changes sidebar container */
      #request-syncfusion-editor .e-de-tc-pane {
        display: flex !important;
        flex-direction: column !important;
        height: 100% !important;
        max-height: 100vh !important;
        background: #f9fafb !important; /* slate-50 */
        border-left: 1px solid #e5e7eb !important; /* slate-200 */
      }
      /* Track changes toolbar */
      #request-syncfusion-editor .e-de-tc-pane .e-de-track-toolbar {
        flex: 0 0 auto !important;
        border-bottom: 1px solid #e5e7eb !important;
        background: #f9fafb !important;
        padding-inline: 8px !important;
      }
      /* Scrollable list area */
      #request-syncfusion-editor .e-de-tc-pane .e-de-tc-hide-para-mark#e-de-tc-pane-revision {
        flex: 1 1 auto !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        /* Extra bottom padding so the last change card is fully visible when scrolled */
        padding: 12px 8px 32px 12px !important;
        background: transparent !important;
      }
      #request-syncfusion-editor .e-de-tc-pane .e-de-tc-hide-para-mark#e-de-tc-pane-revision::-webkit-scrollbar {
        width: 6px;
      }
      #request-syncfusion-editor .e-de-tc-pane .e-de-tc-hide-para-mark#e-de-tc-pane-revision::-webkit-scrollbar-track {
        background: rgba(241, 245, 249, 0.9); /* slate-100 */
      }
      #request-syncfusion-editor .e-de-tc-pane .e-de-tc-hide-para-mark#e-de-tc-pane-revision::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.7); /* slate-400 */
        border-radius: 9999px;
      }
      #request-syncfusion-editor .e-de-tc-pane .e-de-tc-hide-para-mark#e-de-tc-pane-revision::-webkit-scrollbar-thumb:hover {
        background: rgba(100, 116, 139, 0.9); /* slate-500 */
      }
      /* Revision "card" */
      #request-syncfusion-editor .e-de-tc-outer {
        border-radius: 12px !important;
        border: 1px solid #e5e7eb !important;
        background: #ffffff !important;
        margin-bottom: 8px !important;
        padding: 8px 12px !important;
        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.04) !important;
        transition: box-shadow 0.15s ease, transform 0.15s ease,
          border-color 0.15s ease, background-color 0.15s ease;
      }
      #request-syncfusion-editor .e-de-tc-outer:hover {
        border-color: #bfdbfe !important; /* blue-200 */
        background: #f9fafb !important;
        box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06) !important;
        transform: translateY(-1px);
      }
      /* Header row: user + page badge */
      #request-syncfusion-editor .e-de-track-usernme-div {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 8px !important;
        margin-bottom: 4px !important;
      }
      #request-syncfusion-editor .e-de-track-usernme-div span {
        font-size: 11px !important;
        font-weight: 600 !important;
        color: #0f172a !important; /* slate-900 */
      }
      /* Our injected page badge */
      #request-syncfusion-editor .fed-page-badge {
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
      #request-syncfusion-editor .e-de-track-chng-row,
      #request-syncfusion-editor .e-de-track-chngs-text {
        font-size: 11px !important;
        line-height: 1.5 !important;
        color: #4b5563 !important; /* slate-600 */
      }
      /* Time / metadata row */
      #request-syncfusion-editor .e-de-track-date,
      #request-syncfusion-editor .e-de-track-chng-time {
        font-size: 10px !important;
        color: #9ca3af !important; /* slate-400 */
        margin-top: 2px !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existingStyle = document.getElementById('syncfusion-request-editor-styles');
      if (existingStyle) document.head.removeChild(existingStyle);
    };
  }, []);

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
      // Non-blocking UI enhancement
    }
  };

  /**
   * Keep the track-changes list scrolled to the TOP on initial load.
   * We call this once when history is opened or the document first finishes
   * laying out, but we do NOT keep forcing it while the user scrolls.
   */
  const resetChangesPaneScrollTop = (rootId: string) => {
    try {
      const container = document.getElementById(rootId);
      if (!container) return;
      const pane = container.querySelector(
        '.e-de-tc-pane .e-de-tc-hide-para-mark#e-de-tc-pane-revision'
      ) as HTMLElement | null;
      if (!pane) return;
      pane.scrollTop = 0;
    } catch {
      // Visual-only helper; ignore failures
    }
  };

  /**
   * Ensure the main document view is scrolled to the very top (header visible).
   * Uses selection APIs so Syncfusion scrolls the start of the document into view.
   */
  const scrollMainEditorToTop = (editor: any) => {
    try {
      if (editor?.selection && typeof editor.selection.moveToDocumentStart === 'function') {
        editor.selection.moveToDocumentStart();
      }
      if (typeof editor.scrollToPage === 'function') {
        editor.scrollToPage(1);
      }
    } catch {
      // Visual helper only; ignore failures
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
    const editor = containerRef.current?.documentEditor as any;
    if (!editor || !onDownload) return;

    try {
      // Preserve current document with revisions so UI and save behaviour stay the same
      const originalSfdt = editor.serialize();

      // Apply header + footer updates on a working copy
      let workingSfdt = updateHeaderFieldsForStatus(originalSfdt, status);
      workingSfdt = updateFooterFieldsBeforeSave(
        workingSfdt,
        currentUserName,
        currentUserRole,
        status
      );

      let sfdtForDownload = workingSfdt;

      try {
        // Temporarily load working copy, accept all revisions, then serialize clean document
        editor.open(workingSfdt);
        if (editor.revisions && typeof editor.revisions.acceptAll === 'function') {
          editor.revisions.acceptAll();
        }
        sfdtForDownload = editor.serialize();
      } catch {
        // If anything fails, fall back to working copy (may still contain revisions)
        sfdtForDownload = workingSfdt;
      } finally {
        // Restore original document so user still sees tracked changes in the app
        try {
          editor.open(originalSfdt);
        } catch {
          // If restore fails, user will simply see the accepted version; data is still safe
        }
      }

      void Promise.resolve(onDownload(sfdtForDownload));
    } catch (_) {
      const doc = (editor as any).documentHelper?.serialize?.();
      if (doc) {
        let modified = updateHeaderFieldsForStatus(doc, status);
        modified = updateFooterFieldsBeforeSave(
          modified,
          currentUserName,
          currentUserRole,
          status
        );
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

  const handleToggleHistory = () => {
    setShowHistory((prev) => {
      const next = !prev;
      const editor = containerRef.current?.documentEditor as any;
      if (editor) {
        editor.showRevisions = next;
        if (next) {
          // When user explicitly opens history, (re)compute page numbers for revisions
          setTimeout(() => {
            recomputeRevisionPages(editor, 'request-syncfusion-editor');
            resetChangesPaneScrollTop('request-syncfusion-editor');
          }, 300);
        }
      }
      return next;
    });
  };

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
    <div className="h-full min-h-0 bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Top Toolbar - match DocumentEditScreen */}
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleHistory}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 font-bold hidden md:flex gap-2 mr-2"
          >
            <History className="h-4 w-4" />
            {showHistory ? 'Hide History' : 'View History'}
          </Button>

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

      <div className="flex-1 min-h-0 flex relative overflow-hidden">
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
        <div className="flex-1 min-h-0 w-full flex flex-col bg-white overflow-hidden">
          <DocumentEditorContainerComponent
            ref={containerRef}
            id="request-syncfusion-editor"
            cssClass={showHistory ? 'fed-history-open' : 'fed-history-closed'}
            style={{ height: '100%', minHeight: '100%' }}
            serviceUrl={documentEditorServiceUrl}
            enableToolbar={true}
            showPropertiesPane={false}
            enableTrackChanges={true}
            toolbarItems={toolbarItems}
            documentEditorSettings={{ optimizeSfdt: false }}
            documentChange={() => {
              const ed = containerRef.current?.documentEditor as any;
              if (ed) {
                ed.enableTrackChanges = true;
                ed.currentUser = (currentUserName || 'User').trim() || 'User';
                ed.showRevisions = showHistory;
              }
            }}
            created={() => {
              const c = containerRef.current;
              const content = sfdtRef.current || sfdt;
              if (c?.documentEditor && content) {
                try {
                  c.documentEditor.open(content);
                  const editor = c.documentEditor as any;
                  editor.zoomFactor = 1.0;
                  editor.enableTrackChanges = true;
                  editor.currentUser = (currentUserName || 'User').trim() || 'User';
                  editor.showRevisions = false;

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

                    setTimeout(() => {
                      labelLastRevisionWithPage(
                        'request-syncfusion-editor',
                        pageIndex
                      );
                    }, 0);
                  };
                } catch (_) {}

                setTimeout(() => {
                  const editor = c.documentEditor as any;
                  try {
                    // 1) Ensure header is visually updated when editor first opens
                    //    (in case SFDT-based update missed any layout-specific cases).
                    updateTableFields(editor, {
                      // versionNo: APP_VERSION,
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

                  // Ensure the track-changes pane (if rendered) starts at the very top
                  resetChangesPaneScrollTop('request-syncfusion-editor');

                  // After initial layout, force the main document back to the very top exactly once.
                  if (!initialScrollDoneRef.current) {
                    scrollMainEditorToTop(editor);
                    initialScrollDoneRef.current = true;
                  }
                }, 1200);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
