import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  FolderOpen,
  FileText,
  Clock,
  CheckCircle2,
  Upload,
  Building2,
  X,
  Sparkles,
  FilePlus,
  Wand2
} from 'lucide-react';
import { ViewType, ReportData, TemplateData } from '../types';
import { DynamicFormViewer } from './DynamicFormViewer';
import { FormPages } from './FormPages';
import { TemplateFilePreview } from './TemplateFilePreview';

interface DocumentManagementProps {
  reports: ReportData[];
  templates: TemplateData[];
  onNavigate: (view: ViewType) => void;
  onViewDocument?: (documentId: string) => void;
  selectedFiles?: FileList | null;
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadSubmit?: () => void;
  onClearSelection?: () => void;
  uploadInProgress?: boolean;
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({
  reports = [],
  templates = [],
  onNavigate,
  onViewDocument,
  selectedFiles,
  onFileUpload,
  onUploadSubmit,
  onClearSelection,
  uploadInProgress = false
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const safeReports = Array.isArray(reports) ? reports : [];
  const safeTemplates = Array.isArray(templates) ? templates : [];

  const handleDelete = (docId: string, docName: string) => {
    // Show confirmation and handle delete
    if (window.confirm(`Are you sure you want to delete "${docName}"?`)) {
      console.log('Deleting document:', docId);
      // Add your delete logic here
    }
  };

  const handleArchive = (docId: string, docName: string) => {
    // Handle archive
    console.log('Archiving document:', docId);
    // Add your archive logic here
  };

  const handleViewTemplate = (templateId: string) => {
    // Remove the 'template-' prefix to get the actual template ID
    const actualTemplateId = templateId.replace('template-', '');
    const template = safeTemplates.find(t => t.id === actualTemplateId);
    
    if (template && template.parsedSections && template.parsedSections.length > 0) {
      setSelectedTemplate(template);
    } else {
      alert('This template has not been converted yet or does not have editable form data.');
    }
  };

  const handleViewReport = (reportId: string) => {
    const actualReportId = reportId.replace('report-', '');
    const report = safeReports.find(r => r.id === actualReportId);
    
    if (report) {
      setSelectedReport(report);
      setCurrentPage(1); // Start from page 1
    }
  };

  const handleCloseForm = () => {
    setSelectedTemplate(null);
  };

  const handleCloseReportView = () => {
    setSelectedReport(null);
    setCurrentPage(1);
  };

  const handleSaveFormData = (formData: Record<string, any>) => {
    console.log('Saving form data:', formData);
    // Update the template with the new form data
    // In a real app, this would be saved to a database
    alert('✅ Form data saved successfully!\n\nThe form has been updated with your changes.');
    setSelectedTemplate(null);
  };

  // If a template is selected, show the dynamic form viewer
  if (selectedTemplate && selectedTemplate.parsedSections) {
    return (
      <DynamicFormViewer
        sections={selectedTemplate.parsedSections}
        fileName={selectedTemplate.fileName}
        department={selectedTemplate.department}
        onSave={handleSaveFormData}
        onClose={handleCloseForm}
      />
    );
  }

  // If a report is selected, show the form pages
  if (selectedReport) {
    return (
      <FormPages
        report={selectedReport}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onClose={handleCloseReportView}
      />
    );
  }

  // Statistics
  const stats = {
    total: safeTemplates.length + safeReports.length,
    templates: safeTemplates.length,
    requests: safeReports.length,
    approved: safeReports.filter(r => r.status === 'approved').length,
    pending: safeReports.filter(r => r.status === 'pending' || r.status === 'submitted').length,
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">AI Conversion</h1>
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30">
                <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                <span className="text-sm text-blue-600 font-medium">AI Powered</span>
                <Wand2 className="h-3 w-3 text-purple-500 animate-pulse" style={{ animationDuration: '1.5s' }} />
              </div>
            </div>
            <p className="text-slate-500 font-medium">Upload and convert SOP documents with intelligent AI processing</p>
          </div>
          
          {/* Create SOP Button */}
          <Button
            onClick={() => alert('Create SOP Document - Opens form builder or document creation wizard')}
            className="flex items-center gap-2 px-6 py-6 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <FilePlus className="h-5 w-5" />
            <span className="font-semibold">Create SOP</span>
            <Sparkles className="h-4 w-4 animate-pulse" />
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-100 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-slate-700 mb-1 font-medium">Total Documents</CardTitle>
                  <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center">
                  <FolderOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-purple-50 border-purple-100 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-slate-700 mb-1 font-medium">Templates</CardTitle>
                  <div className="text-3xl font-bold text-slate-900">{stats.templates}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-green-50 border-green-100 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-slate-700 mb-1 font-medium">Approved</CardTitle>
                  <div className="text-3xl font-bold text-slate-900">{stats.approved}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-yellow-50 border-yellow-100 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-slate-700 mb-1 font-medium">Pending</CardTitle>
                  <div className="text-3xl font-bold text-slate-900">{stats.pending}</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Upload Templates Section */}
        <Card className="mb-6 bg-white border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Smart AI Conversions
            </CardTitle>
            <CardDescription className="text-slate-500">
              Upload documents and AI will automatically detect departments, analyze sections, and generate workflows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="text-sm text-slate-600 font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600" />
                Template Files
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload
                    </span>
                    <span className="text-slate-600"> or drag and drop</span>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".xlsx,.xls,.docx,.doc,.pdf"
                      onChange={onFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-slate-500 mt-1">
                    XLSX, XLS, DOCX, DOC, PDF files only
                  </p>
                </div>
              </div>

              {/* Selected Files Display */}
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-slate-600 font-medium">Selected Files:</p>
                  {Array.from(selectedFiles).map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-slate-800 font-medium">{file.name}</p>
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Preview: show first selected file */}
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-2">Preview</p>
                    <TemplateFilePreview file={selectedFiles[0]} className="max-w-2xl" />
                  </div>
                </div>
              )}
            </div>

            {/* Department Selection Field */}
            <div>
              <label className="text-sm text-slate-600 font-medium mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-600" />
                Select Department <span className="text-red-500">*</span>
              </label>
              <Select>
                <SelectTrigger className="w-full h-12 bg-white border-slate-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-base rounded-xl font-medium transition-all">
                  <SelectValue placeholder="Choose department..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-slate-100">
                  <SelectItem value="engineering">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span>Engineering</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="manufacturing">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span>Manufacturing</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="quality">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span>Quality Assurance</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="procurement">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span>Procurement</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="operations">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span>Operations</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="research">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span>Research & Development</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Required: Select the department for this template
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={onUploadSubmit}
                disabled={!selectedFiles || selectedFiles.length === 0 || uploadInProgress}
                className="px-8 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl active:scale-95"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadInProgress ? 'Uploading...' : 'Upload Templates'}
              </Button>
              <Button
                onClick={onClearSelection}
                disabled={!selectedFiles || selectedFiles.length === 0}
                className="px-8 h-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl active:scale-95"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};