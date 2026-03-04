import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Building2, 
  Sparkles, 
  Zap, 
  Brain, 
  Wand2, 
  CheckCircle, 
  Clock, 
  Library, 
  Eye, 
  FilePlus, 
  FolderOpen, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TemplateData, ViewType } from '../types';

interface UploadTemplatesProps {
  templates: TemplateData[];
  selectedFiles: FileList | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadSubmit: () => void;
  onClearSelection: () => void;
  onNavigate?: (view: ViewType) => void;
}

const DEPARTMENTS = [
  { id: 'engineering', name: 'Engineering' },
  { id: 'manufacturing', name: 'Manufacturing' },
  { id: 'quality', name: 'Quality Assurance' },
  { id: 'procurement', name: 'Procurement' },
  { id: 'operations', name: 'Operations' },
  { id: 'research', name: 'Research & Development' }
];

export const UploadTemplates: React.FC<UploadTemplatesProps> = ({
  templates = [],
  selectedFiles,
  onFileUpload,
  onUploadSubmit,
  onClearSelection,
  onNavigate
}) => {
  const safeTemplates = Array.isArray(templates) ? templates : [];
  
  // Statistics for the cards
  const stats = {
    total: 21, // Mock value as seen in Image 1
    templates: safeTemplates.length || 1,
    approved: 9,
    pending: 4
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1">
            AI Conversion
          </h1>
          <p className="text-slate-500">
            Upload and convert SOP documents with intelligent AI processing
          </p>
        </div>
        
        <Button
          onClick={() => alert('Create SOP Document functionality coming soon')}
          className="flex items-center gap-2 px-6 py-6 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <FilePlus className="h-5 w-5" />
          <span className="font-semibold">Create SOP</span>
          <Sparkles className="h-4 w-4 animate-pulse" />
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Documents */}
        <Card className="bg-blue-50 border-blue-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm text-slate-700 mb-1 font-medium text-slate-500">Total Documents</CardTitle>
                <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center border border-blue-100">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Templates */}
        <Card className="bg-purple-50 border-purple-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm text-slate-700 mb-1 font-medium text-slate-500">Templates</CardTitle>
                <div className="text-3xl font-bold text-slate-900">{stats.templates}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center border border-purple-100">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Approved */}
        <Card className="bg-green-50 border-green-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm text-slate-700 mb-1 font-medium text-slate-500">Approved</CardTitle>
                <div className="text-3xl font-bold text-slate-900">{stats.approved}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center border border-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Pending */}
        <Card className="bg-yellow-50 border-yellow-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm text-slate-700 mb-1 font-medium text-slate-500">Pending</CardTitle>
                <div className="text-3xl font-bold text-slate-900">{stats.pending}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center border border-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Upload Templates Section */}
      <Card className="mb-6 bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-50 px-8 py-6">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Smart AI Conversions
          </CardTitle>
          <CardDescription className="text-slate-500">
            Upload documents and AI will automatically detect departments, analyze sections, and generate workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* File Upload Area */}
          <div>
            <label className="text-sm text-slate-700 font-bold mb-3 flex items-center gap-2 uppercase tracking-tight">
              <FileText className="h-4 w-4 text-slate-500" />
              Template Files
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <label className="cursor-pointer">
                  <span className="text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    Click to upload
                  </span>
                  <span className="text-slate-500 text-lg"> or drag and drop</span>
                  <input
                    id="template-upload"
                    type="file"
                    multiple
                    accept=".xlsx,.xls,.docx,.doc,.pdf"
                    onChange={onFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-slate-400 mt-2 font-medium">
                  XLSX, XLS, DOCX, DOC, PDF files only
                </p>
              </div>
            </div>

            {/* Selected Files Display */}
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
                <p className="text-sm text-blue-700 font-bold uppercase tracking-wider">Selected Files:</p>
                {Array.from(selectedFiles).map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded text-blue-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-900 font-bold">{file.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Selection Field */}
          <div className="max-w-md">
            <label className="text-sm text-slate-700 font-bold mb-3 flex items-center gap-2 uppercase tracking-tight">
              <Building2 className="h-4 w-4 text-slate-500" />
              Select Department <span className="text-red-500">*</span>
            </label>
            <Select>
              <SelectTrigger className="w-full h-12 bg-white border-slate-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-base rounded-xl font-medium">
                <SelectValue placeholder="Choose department..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-slate-100">
                {DEPARTMENTS.map(dept => (
                  <SelectItem key={dept.id} value={dept.id} className="py-3 focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 opacity-50" />
                      <span>{dept.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-400 mt-2 font-medium italic">
              Required: Select the department for this template
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={onUploadSubmit}
              disabled={!selectedFiles || selectedFiles.length === 0}
              className="px-8 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl active:scale-95"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Templates
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
  );
};
