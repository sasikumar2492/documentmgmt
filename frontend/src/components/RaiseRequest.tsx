import React, { useState } from 'react';
import { Upload, FileText, Sparkles, FileCheck, FilePlus, Cloud, FileUp, Download, Send, Eye, Calendar, Building2, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TemplateData, ViewType, DepartmentData, ReportData } from '../types';
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
import { getStatusColor, getStatusLabel } from '../utils/statusUtils';

interface RaiseRequestProps {
  /** When listMode is 'templates', show templates and "Raise Request" per row. When 'requests', show requests from GET /api/requests?view=raise and "Open" + "Create / Start Request". */
  listMode?: 'templates' | 'requests';
  templates?: TemplateData[];
  /** When listMode is 'requests', this is the list from GET /api/requests?view=raise. */
  reports?: ReportData[];
  onFormSelect: (id: string) => void;
  onNavigate?: (view: ViewType) => void;
  /** Optional list of departments so we can show department names instead of raw IDs. */
  departments?: DepartmentData[];
  /** Download document file (served via /api/requests/:id/file). When provided, the Download button uses this. */
  onDownloadTemplate?: (templateId: string, fileName: string) => void | Promise<void>;
  /** Current user role; when 'admin', delete button is shown. */
  userRole?: string;
  /** Called when admin deletes a template; only used when userRole is admin and listMode is 'templates'. */
  onDeleteTemplate?: (templateId: string) => void | Promise<void>;
}

export const RaiseRequest: React.FC<RaiseRequestProps> = ({
  listMode = 'templates',
  templates = [],
  reports = [],
  onFormSelect,
  onNavigate,
  departments = [],
  onDownloadTemplate,
  userRole,
  onDeleteTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const isAdmin = (userRole || '').toLowerCase().includes('admin');

  const handleOpenOrRaise = (id: string) => {
    if (typeof onFormSelect === 'function') {
      onFormSelect(id);
    } else {
      console.error('onFormSelect is not provided or not a function');
    }
  };

  const handleDownload = (item: TemplateData | ReportData) => {
    const id = item.id;
    const name = 'fileName' in item ? item.fileName : (item as ReportData).fileName;
    if (onDownloadTemplate) {
      void Promise.resolve(onDownloadTemplate(id, name || 'document'));
    } else {
      alert(`Downloading: ${name}`);
    }
  };

  const handleDelete = (template: TemplateData) => {
    if (!onDeleteTemplate) return;
    if (!window.confirm(`Delete "${template.fileName}"? This cannot be undone.`)) return;
    void Promise.resolve(onDeleteTemplate(template.id));
  };

  // Map department ID -> human-readable name
  const departmentNameById: Record<string, string> = Array.isArray(departments)
    ? departments.reduce<Record<string, string>>((acc, d) => {
        if (d && d.id && d.name) acc[d.id] = d.name;
        return acc;
      }, {})
    : {};

  const getDepartmentLabel = (departmentId: string | undefined) => {
    if (!departmentId) return 'Unassigned';
    return departmentNameById[departmentId] || departmentId;
  };

  const isRequestsMode = listMode === 'requests';

  // For requests mode: filter by requestId, title/fileName, department
  const filteredReports: ReportData[] = isRequestsMode
    ? reports.filter((r) => {
        const term = searchTerm.toLowerCase();
        const reqId = (r.requestId || '').toLowerCase();
        const title = (r.fileName || r.requestId || '').toLowerCase();
        const dept = (r.department || '').toLowerCase();
        const deptLabel = getDepartmentLabel(r.department).toLowerCase();
        return reqId.includes(term) || title.includes(term) || dept.includes(term) || deptLabel.includes(term);
      })
    : [];

  // For templates mode: filter templates
  const filteredTemplates = isRequestsMode
    ? []
    : templates.filter((template) => {
        const docName = template.fileName?.toLowerCase() || '';
        const deptId = template.department?.toLowerCase() || '';
        const deptName = getDepartmentLabel(template.department).toLowerCase();
        const term = searchTerm.toLowerCase();
        return docName.includes(term) || deptId.includes(term) || deptName.includes(term);
      });

  const itemsCount = isRequestsMode ? filteredReports.length : filteredTemplates.length;

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
                  {isRequestsMode
                    ? 'Your requests and drafts. Open to edit or create a new request.'
                    : 'Select an uploaded document to create a new request'}
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
              {itemsCount} {isRequestsMode ? 'request' : 'document'}{itemsCount !== 1 ? 's' : ''} available
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {itemsCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <FileText className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  {isRequestsMode ? 'No requests found' : 'No documents found'}
                </h3>
                <p className="text-slate-500 text-center max-w-md">
                  {searchTerm
                    ? 'No items match your search criteria. Try adjusting your search.'
                    : isRequestsMode
                      ? 'Click "Create / Start Request" to create a new request.'
                      : 'No uploaded documents available. Please add documents via Document Upload first.'}
                </p>
              </div>
            ) : isRequestsMode ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">Document / Title</TableHead>
                      <TableHead className="font-semibold text-slate-700">Department</TableHead>
                      <TableHead className="font-semibold text-slate-700">Uploaded Date</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-12 rounded-lg border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
                              <ImageWithFallback
                                src={getThumbnail(report.templateId || report.id)}
                                alt={report.fileName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="font-medium text-slate-800">{report.fileName || report.requestId || 'Document'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-500" />
                            <span className="text-slate-700">{getDepartmentLabel(report.department) || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <span className="text-slate-700">
                              {typeof report.uploadDate === 'string'
                                ? report.uploadDate.split('T')[0]
                                : report.uploadDate || '—'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => handleOpenOrRaise(report.id)}
                              size="sm"
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white rounded-lg shadow-md"
                              title="Raise Request"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="font-medium">Raise Request</span>
                            </Button>
                            {onDownloadTemplate && (
                              <Button
                                onClick={() => handleDownload(report)}
                                size="sm"
                                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg shadow-sm"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                          <Badge className={getStatusColor((template.status as any) || 'pending')}>
                            <FileCheck className="h-3 w-3 mr-1" />
                            {getStatusLabel((template.status as any) || 'pending')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => handleOpenOrRaise(template.id)}
                              size="sm"
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                              title="Raise Request"
                            >
                              <Send className="h-4 w-4" />
                              <span className="font-medium">Raise Request</span>
                            </Button>
                            <Button
                              onClick={() => handleDownload(template)}
                              size="sm"
                              className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 rounded-lg shadow-sm hover:shadow-md transition-all"
                              title="Download Document"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {isAdmin && onDeleteTemplate && (
                              <Button
                                onClick={() => handleDelete(template)}
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2 px-3 py-2 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg shadow-sm hover:shadow-md transition-all"
                                title="Delete Document"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
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