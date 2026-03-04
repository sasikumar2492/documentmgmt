import React, { useState, useEffect } from 'react';
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
  FileCheck
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ReportData, ViewType } from '../types';
import { getStatusColor, getStatusLabel } from '../utils/statusUtils';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { OriginalDocViewer } from './OriginalDocViewer';

interface DocumentPreviewScreenProps {
  document: ReportData;
  onBack: () => void;
  onDownload: () => void;
}

export const DocumentPreviewScreen: React.FC<DocumentPreviewScreenProps> = ({
  document,
  onBack,
  onDownload
}) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Helper to group formData into pages for the formal preview
  const generatePagesFromData = (data: any): any[] => {
    const pages = [];
    
    // Page 1: Request Information
    pages.push({
      pageNumber: 1,
      title: 'Request for Approval Part/Manufacturer',
      header: 'SECTION 1: GENERAL REQUEST INFORMATION',
      footer: 'Form Ref: RFAP-P1 | Quality Management System',
      fields: [
        { label: 'Material Code', value: data.materialCode },
        { label: 'Part/Material Name', value: data.partMaterial },
        { label: 'Supplier Name', value: data.supplierName },
        { label: 'Quantity', value: data.quantity },
        { label: 'Site Location', value: data.site },
        { label: 'Requester Name', value: data.requesterName },
        { label: 'Product Name', value: data.productName },
        { label: 'Drawing No', value: data.drawingNo }
      ].map((f, i) => ({ ...f, id: `p1-f${i}`, type: 'text' as const }))
    });

    // Page 2: Initial Review
    pages.push({
      pageNumber: 2,
      title: 'Initial Review & Acceptance',
      header: 'SECTION 2: PRELIMINARY QUALITY ASSESSMENT',
      footer: 'Form Ref: RFAP-P2 | Quality Management System',
      fields: [
        { label: 'Request Acceptable', value: data.requestAcceptable ? 'YES' : 'NO' },
        { label: 'QA Signature 1', value: data.qaName1 },
        { label: 'QA Position', value: data.qaPosition1 },
        { label: 'Date', value: data.qaDateSignature1 },
        { label: 'No Test Report', value: data.noTestReport ? 'YES' : 'NO' },
        { label: 'No ECR', value: data.noECR ? 'YES' : 'NO' }
      ].map((f, i) => ({ ...f, id: `p2-f${i}`, type: 'text' as const }))
    });

    // Page 3: Review Process
    pages.push({
      pageNumber: 3,
      title: 'Technical Review Process',
      header: 'SECTION 3: DIMENSIONAL & PERFORMANCE EVALUATION',
      footer: 'Form Ref: RFAP-P3 | Quality Management System',
      fields: [
        { label: 'Dimensional Status', value: data.dimensionalOK ? 'OK' : 'NOT OK' },
        { label: 'Material Status', value: data.materialOK ? 'OK' : 'NOT OK' },
        { label: 'Performance Status', value: data.performanceOK ? 'OK' : 'NOT OK' },
        { label: 'Expert Name', value: data.expertName1 },
        { label: 'Evidence Ref', value: data.dimensionalEvidence }
      ].map((f, i) => ({ ...f, id: `p3-f${i}`, type: 'text' as const }))
    });

    // Page 4: Assembly & Durability
    pages.push({
      pageNumber: 4,
      title: 'Assembly & Long-term Durability',
      header: 'SECTION 4: SUPPLEMENTARY TECHNICAL DATA',
      footer: 'Form Ref: RFAP-P4 | Quality Management System',
      fields: [
        { label: 'Assembly Status', value: data.assemblyOKP4 ? 'OK' : 'NOT OK' },
        { label: 'Durability Status', value: data.durabilityOKP4 ? 'OK' : 'NOT OK' },
        { label: 'Expert Name', value: data.expertName2 },
        { label: 'Manager Name', value: data.managerName2 }
      ].map((f, i) => ({ ...f, id: `p4-f${i}`, type: 'text' as const }))
    });

    // Page 5: Final Decision
    pages.push({
      pageNumber: 5,
      title: 'QA Final Management Decision',
      header: 'SECTION 5: APPROVAL STATUS & LIMITATIONS',
      footer: 'Form Ref: RFAP-P5 | Quality Management System',
      fields: [
        { label: 'Approval Status', value: data.isApproved ? 'APPROVED' : (data.isRejected ? 'REJECTED' : 'PENDING') },
        { label: 'QA Manager', value: data.qaManagerName },
        { label: 'Approval Description', value: data.approvalDescription },
        { label: 'Approval Until', value: data.approvalUntilDate }
      ].map((f, i) => ({ ...f, id: `p5-f${i}`, type: 'text' as const }))
    });

    // Page 6: Archive
    pages.push({
      pageNumber: 6,
      title: 'Document Archive & Registration',
      header: 'SECTION 6: FINAL REGISTRATION & EVIDENCE TRACKING',
      footer: 'Form Ref: RFAP-P6 | Quality Management System',
      fields: [
        { label: 'Archive Date', value: data.archiveDate },
        { label: 'Evidence Index', value: data.evidence },
        { label: 'Final Sign-off', value: data.finalName },
        { label: 'Document Code', value: data.documentCodeP6 }
      ].map((f, i) => ({ ...f, id: `p6-f${i}`, type: 'text' as const }))
    });

    return pages;
  };

  // Create default formal pages if none exist
  const effectivePages = document.formPages && document.formPages.length > 0 
    ? document.formPages 
    : (document.formData && document.formData.partMaterial !== undefined 
        ? generatePagesFromData(document.formData)
        : [
        {
          pageNumber: 1,
          title: document.fileName?.split('.')[0]?.replace(/_/g, ' ') || 'Official Document',
          header: `CONFIDENTIAL - INTERNAL USE ONLY\nDepartment: ${document.department || 'General'}\nGenerated Date: ${new Date().toLocaleDateString()}`,
          footer: `Standard Operating Procedure Document Control\nCompliance Reference: ISO-9001:2015\nUncontrolled Copy if Printed`,
          fields: document.formData 
            ? Object.entries(document.formData)
                .filter(([_, value]) => value !== undefined && value !== null && value !== '')
                .slice(0, 10) // Show first 10 meaningful fields in preview if no pages defined
                .map(([key, value], idx) => ({
                  id: `f-${idx}`,
                  label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                  value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value),
                  type: 'text' as const
                }))
            : [
                { id: 'f1', label: 'Document Title', value: document.fileName, type: 'text' as const },
                { id: 'f2', label: 'Request ID', value: document.requestId || 'TPL-REF', type: 'text' as const },
                { id: 'f3', label: 'Department', value: document.department, type: 'text' as const },
                { id: 'f4', label: 'Document Type', value: document.documentType || 'Official Record', type: 'text' as const },
                { id: 'f5', label: 'Status', value: getStatusLabel(document.status), type: 'text' as const },
                { id: 'f6', label: 'Assigned To', value: document.assignedTo, type: 'text' as const },
                { id: 'f7', label: 'Last Modified', value: document.lastModified || document.uploadDate, type: 'text' as const },
                { id: 'f8', label: 'Site Location', value: document.site || 'Main Facility', type: 'text' as const },
                { id: 'f9', label: 'Product Group', value: document.product || 'General Manufacturing', type: 'text' as const },
                { id: 'f10', label: 'Electronic Signature', value: `Digitally Signed by ${document.fromUser || 'Authorized Personnel'}`, type: 'text' as const }
              ],
          content: ''
        }
      ]);

  const totalPages = effectivePages.length;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handlePrint = () => window.print();

  const verificationStatusLabel =
    document.status === 'approved' || document.status === 'published'
      ? 'LEGALLY VERIFIED'
      : document.status === 'rejected' || document.status === 'needs-revision'
        ? 'RETURNED WITH REMARKS'
        : 'PENDING VERIFICATION';

  const verificationTimestamp =
    document.publishedDate ||
    document.returnedDate ||
    document.lastModified ||
    document.uploadDate ||
    new Date().toISOString();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header Toolbar */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50 px-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Button>
          <div className="h-6 w-px bg-slate-800"></div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold truncate max-w-[200px] md:max-w-md">
                {document.fileName}
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                {document.requestId} • {document.department}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1 mr-4 hidden md:flex">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-mono w-12 text-center text-slate-400">{zoom}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hidden sm:flex gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            size="sm" 
            onClick={onDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-900/20"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Document Information Sidebar */}
        <div className="w-80 border-r border-slate-800 p-6 overflow-y-auto hidden lg:block bg-slate-900/50">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <Shield className="h-3 w-3" />
            Document Compliance
          </h2>

          <div className="space-y-6">
            <section>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Current Status</label>
              <Badge className={`${getStatusColor(document.status)} text-white w-full justify-center py-1.5`}>
                {getStatusLabel(document.status)}
              </Badge>
            </section>

            <section className="grid grid-cols-1 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Prepared By</label>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-3.5 w-3.5 text-blue-400" />
                  {document.fromUser || document.uploadedBy || 'System Generated'}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Site Facility</label>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Building2 className="h-3.5 w-3.5 text-blue-400" />
                  {document.site || 'Corporate HQ'}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Last Modified</label>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  {document.lastModified || document.uploadDate}
                </div>
              </div>
            </section>

            <section className="pt-6 border-t border-slate-800">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-4">Verification Signature</h3>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <FileCheck className="h-4 w-4" />
                  <span className="text-xs font-bold">{verificationStatusLabel}</span>
                </div>
                <div className="font-mono text-[10px] text-slate-400 break-all leading-tight">
                  CONTROL: {document.requestId || document.id}
                  <br />
                  TIMESTAMP: {verificationTimestamp}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Main Document Viewer Container */}
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col bg-slate-950/50 custom-scrollbar">
          {document.templateId ? (
            /* Original uploaded / submitted document via Syncfusion (Word) */
            <div className="flex-1 min-h-0 flex flex-col p-4">
              <OriginalDocViewer
                key={document.id || document.requestId}
                templateId={document.templateId}
                fileName={document.fileName}
                // If formData contains saved SFDT (_sfdt), show the submitted version instead of raw template
                initialSfdt={
                  document.formData && typeof (document.formData as unknown as Record<string, unknown>)._sfdt === 'string'
                    ? ((document.formData as unknown as Record<string, unknown>)._sfdt as string)
                    : undefined
                }
                readOnly={true}
              />
            </div>
          ) : (
          <>
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          {/* Document Content (form-based when no template) */}
          <div 
            className="bg-white text-slate-900 shadow-2xl transition-all duration-300 origin-top mb-12"
            style={{ 
              width: '210mm', 
              minHeight: '297mm',
              transform: `scale(${zoom / 100})`,
              marginBottom: `${(zoom / 100) * 20}px`
            }}
          >
            {/* Pages rendered sequentially */}
            {effectivePages.map((page, pIdx) => (
              <div key={pIdx} className={`p-20 flex flex-col min-h-[297mm] ${pIdx !== 0 ? 'border-t-[20px] border-slate-950/20 relative' : ''}`}>
                {/* Page Break Indicator for display */}
                {pIdx !== 0 && (
                  <div className="absolute -top-12 left-0 right-0 h-10 flex items-center justify-center text-slate-400 text-[10px] uppercase font-black tracking-[0.5em] pointer-events-none">
                    PAGE {pIdx + 1} BREAK
                  </div>
                )}

                {/* Formal Page Header */}
                <div className="border-b-2 border-slate-800 pb-8 mb-12 flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Document Classification</div>
                    <div className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      {document.documentType || 'OFFICIAL CORPORATE RECORD'}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Control Number</div>
                    <div className="text-sm font-bold text-slate-900">
                      {document.requestId?.toUpperCase() || 'REF-X001'}
                    </div>
                  </div>
                </div>

                {/* Original Document Header Section */}
                {page.header && (
                  <div className="bg-slate-50 border-l-4 border-l-blue-600 rounded-r-lg p-8 mb-12 italic text-slate-700 text-sm leading-relaxed shadow-sm">
                    <div className="flex items-center gap-2 mb-3 not-italic">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-black uppercase text-blue-600 tracking-wider">Document Narrative / Instructions</span>
                    </div>
                    {page.header}
                  </div>
                )}

                {/* Page Title & Main Content */}
                <div className="mb-16 text-center">
                  <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4 leading-none">
                    {page.title}
                  </h2>
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>
                </div>

                {/* Form Grid Details */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-10 flex-1">
                  {page.fields.map((field, index) => (
                    <div
                      key={index}
                      className={`${field.type === 'textarea' ? 'col-span-2' : 'col-span-1'} space-y-3`}
                    >
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <div className={`border-b border-slate-100 pb-2 min-h-[40px] transition-colors`}>
                        {field.value ? (
                          <span className="text-lg font-semibold text-slate-800 tracking-tight">{field.value}</span>
                        ) : (
                          <span className="text-base text-slate-300 italic font-normal">
                            Data Not Captured
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formal Page Footer */}
                <div className="mt-20 pt-10 border-t-2 border-slate-800">
                  {page.footer && (
                    <div className="text-xs text-slate-400 mb-8 whitespace-pre-wrap text-center italic leading-relaxed">
                      {page.footer}
                    </div>
                  )}
                  <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      GENERATED: {new Date().toLocaleDateString()}
                    </div>
                    <div className="text-center bg-slate-50 px-4 py-1 rounded-full text-slate-400 border border-slate-100">
                      OFFICIAL SYSTEM RECORD - VALID WITHOUT STAMP
                    </div>
                    <div>
                      PAGE {pIdx + 1} OF {totalPages}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  );
};