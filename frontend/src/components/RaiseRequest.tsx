import React, { useState } from 'react';
import { Upload, FileText, Sparkles, FileCheck, FilePlus, Cloud, FileUp, Plus, Download, Send, Eye, Calendar, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TemplateData, ViewType, DepartmentData } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Breadcrumbs } from './Breadcrumbs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

import { ImageWithFallback } from './figma/ImageWithFallback';

interface RaiseRequestProps {
  templates: TemplateData[];
  onFormSelect: (templateId: string) => void;
  onNavigate?: (view: ViewType) => void;
  /** Optional list of departments so we can show department names instead of raw IDs. */
  departments?: DepartmentData[];
}

export const RaiseRequest: React.FC<RaiseRequestProps> = ({
  templates = [],
  onFormSelect,
  onNavigate,
  departments = [],
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleRaiseRequest = (templateId: string) => {
    if (typeof onFormSelect === 'function') {
      onFormSelect(templateId);
    } else {
      console.error('onFormSelect is not provided or not a function');
    }
  };

  const handleDownload = (template: TemplateData) => {
    // Create a mock download
    alert(`Downloading: ${template.fileName}`);
  };

  // Map department ID -> human-readable name
  const departmentNameById: Record<string, string> = Array.isArray(departments)
    ? departments.reduce<Record<string, string>>((acc, d) => {
        if (d && d.id && d.name) acc[d.id] = d.name;
        return acc;
      }, {})
    : {};

  const getDepartmentLabel = (departmentId: string) => {
    if (!departmentId) return 'Unassigned';
    return departmentNameById[departmentId] || departmentId;
  };

  // Filter templates based on search (by document name, department id, or department name)
  const filteredTemplates = templates.filter((template) => {
    const docName = template.fileName?.toLowerCase() || '';
    const deptId = template.department?.toLowerCase() || '';
    const deptName = getDepartmentLabel(template.department).toLowerCase();
    const term = searchTerm.toLowerCase();
    return docName.includes(term) || deptId.includes(term) || deptName.includes(term);
  });

  const documentThumbnails: Record<string, string> = {
    'sample-template-1': 'https://images.unsplash.com/photo-1693045181254-08462917f681?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'sample-template-2': 'https://images.unsplash.com/photo-1727522974631-c8779e7de5d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'sample-template-3': 'https://images.unsplash.com/photo-1600531597946-f9b1d7b0f486?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
  };

  const getThumbnail = (id: string) => documentThumbnails[id] || 'https://images.unsplash.com/photo-1583737077813-bc3945c54a4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400';
  

  return (
    <>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 shadow-lg flex items-center justify-center">
                <FilePlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Raise Request
                </h1>
                <p className="text-slate-600 mt-1">
                  Select an uploaded document to create a new request
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documents by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <FileText className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Documents Table */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
            <CardTitle className="text-slate-800 font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Uploaded Documents
            </CardTitle>
            <CardDescription className="text-slate-600">
              {filteredTemplates.length} document{filteredTemplates.length !== 1 ? 's' : ''} available
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <FileText className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No documents found
                </h3>
                <p className="text-slate-500 text-center max-w-md">
                  {searchTerm 
                    ? 'No documents match your search criteria. Try adjusting your search.'
                    : 'No uploaded documents available. Please upload documents in AI Conversion first.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">Document Name</TableHead>
                      <TableHead className="font-semibold text-slate-700">Department</TableHead>
                      <TableHead className="font-semibold text-slate-700">Upload Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow key={template.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-12 rounded-lg border border-slate-200 overflow-hidden shadow-sm flex-shrink-0 group-hover:shadow-md transition-all">
                              <ImageWithFallback 
                                src={getThumbnail(template.id)} 
                                alt={template.fileName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{template.fileName}</p>
                              <p className="text-xs text-slate-500">
                                {template.fileSize || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-500" />
                            <span className="text-slate-700">
                              {getDepartmentLabel(template.department)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <span className="text-slate-700">{template.uploadDate}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                            <FileCheck className="h-3 w-3 mr-1" />
                            Ready
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {/* Raise Request Button */}
                            <Button
                              onClick={() => handleRaiseRequest(template.id)}
                              size="sm"
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                              title="Raise Request"
                            >
                              <Send className="h-4 w-4" />
                              <span className="font-medium">Raise Request</span>
                            </Button>
                            
                            {/* Download Button */}
                            <Button
                              onClick={() => handleDownload(template)}
                              size="sm"
                              className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 rounded-lg shadow-sm hover:shadow-md transition-all"
                              title="Download Document"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};