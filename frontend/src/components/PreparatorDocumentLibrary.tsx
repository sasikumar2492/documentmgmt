import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Edit2,
  Calendar,
  User,
  Building2,
  Clock,
  GitBranch,
  ScrollText,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  UploadCloud
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ReportData, ViewType } from '../types';
import { getStatusColor, getStatusLabel } from '../utils/statusUtils';

interface PreparatorDocumentLibraryProps {
  reports: ReportData[];
  onViewForm: (reportId: string) => void;
  onPreviewDocument: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
  onDownloadDocument: (reportId: string, fileName: string) => void;
  onNavigate?: (view: ViewType, options?: { requestId?: string }) => void;
  userRole?: string;
  currentUsername?: string;
  onAddTrainingRecords?: (documentId: string, documentName: string, departments: string[]) => void;
  onPublishDocument?: (reportId: string) => void;
}

export const PreparatorDocumentLibrary: React.FC<PreparatorDocumentLibraryProps> = ({
  reports = [],
  onViewForm,
  onPreviewDocument,
  onDeleteReport,
  onDownloadDocument,
  onNavigate,
  userRole = 'preparator',
  currentUsername = '',
  onAddTrainingRecords,
  onPublishDocument
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'requestId' | 'fileName' | 'department' | 'status' | 'fileSize' | 'uploadDate' | 'assignedTo' | 'lastModified'>('uploadDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  /** Format file size: raw bytes → MB/KB; already-formatted strings shown as-is */
  const formatFileSize = (fileSize: string | undefined): string => {
    if (!fileSize || fileSize === 'N/A') return 'N/A';
    const num = parseFloat(String(fileSize).replace(/[^0-9.]/g, ''));
    if (Number.isNaN(num)) return fileSize;
    if (num >= 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(2)} MB`;
    if (num >= 1024) return `${(num / 1024).toFixed(2)} KB`;
    return `${num} B`;
  };

  // Helper to determine if the document can be edited by current user
  const canUserEdit = (doc: ReportData) => {
    const role = userRole?.toLowerCase() || '';
    const status = (doc.status || '').toLowerCase();
    
    // Admin and Manager roles have full access
    if (role === 'admin' || role === 'manager') return true;
    
    // Identify user role groups
    const isReviewer = role.includes('reviewer') || role === 'reviewer';
    const isApprover = role.includes('approver') || role === 'approver';
    
    // 1. Reviewers - Only enable edit when status is "submitted", "resubmitted", "reviewed", or "rejected"
    if (isReviewer) {
      return ['submitted', 'resubmitted', 'reviewed', 'rejected'].includes(status);
    }
    
    // 2. Approvers - Only enable edit when status is "reviewed" or "approved"
    if (isApprover) {
      return ['reviewed', 'approved'].includes(status);
    }
    
    // 2. Preparator can edit drafts or documents sent back for revision
    if (role === 'preparator' || role === 'requestor') {
      return ['pending', 'needs-revision'].includes(status);
    }
    
    const isAssignedToMe = doc.assignedTo === currentUsername || 
                          doc.assignedTo?.toLowerCase() === role ||
                          (isReviewer && (doc.assignedTo === 'Reviewer' || doc.assignedTo === 'Manager Reviewer')) ||
                          (isApprover && (doc.assignedTo === 'Approver' || doc.assignedTo === 'Manager Approver'));
    
    // If it's in review process, allow assigned person to edit
    if (['submitted', 'resubmitted', 'review-process', 'initial-review'].includes(status)) {
      return isAssignedToMe;
    }
    
    return true;
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique departments
  const departments = Array.from(new Set(reports.map(r => r.department || 'Unknown')));

  // Filter and sort reports
  const filteredReports = reports
    .filter(report => {
      const matchesSearch =
        report.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.department?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || report.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'requestId':
          comparison = (a.requestId || '').localeCompare(b.requestId || '');
          break;
        case 'fileName':
          comparison = (a.fileName || '').localeCompare(b.fileName || '');
          break;
        case 'department':
          comparison = (a.department || '').localeCompare(b.department || '');
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'fileSize':
          const sizeA = parseFloat((a.fileSize || '0').replace(/[^0-9.]/g, ''));
          const sizeB = parseFloat((b.fileSize || '0').replace(/[^0-9.]/g, ''));
          comparison = sizeA - sizeB;
          break;
        case 'uploadDate':
          const timeA = new Date(a.uploadDate || 0).getTime();
          const timeB = new Date(b.uploadDate || 0).getTime();
          comparison = timeA - timeB;
          break;
        case 'assignedTo':
          comparison = (a.assignedTo || '').localeCompare(b.assignedTo || '');
          break;
        case 'lastModified':
          const modA = new Date(a.lastModified || a.uploadDate || 0).getTime();
          const modB = new Date(b.lastModified || b.uploadDate || 0).getTime();
          comparison = modA - modB;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleEdit = (reportId: string) => {
    onViewForm(reportId);
  };

  const handleDownload = (reportId: string, fileName: string) => {
    onDownloadDocument(reportId, fileName);
  };

  const handleDelete = (reportId: string) => {
    if (confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      onDeleteReport(reportId);
    }
  };

  const handleViewAuditLogs = (requestId: string) => {
    if (onNavigate) {
      onNavigate('activity-log-detail', { requestId });
    }
  };

  const handlePreview = (report: ReportData) => {
    onPreviewDocument(report.id);
  };

  const handlePublish = (report: ReportData) => {
    if (report.status !== 'approved') {
      toast.error('Only approved documents can be published');
      return;
    }
    
    // Directly publish the document without dialog
    if (onPublishDocument) {
      onPublishDocument(report.id);
    }
    
    toast.success(`Document "${report.fileName}" has been published!`, {
      description: 'The document is now available in Training Management > Published Documents',
      duration: 4000,
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = getStatusColor(status);
    const label = getStatusLabel(status);

    return (
      <Badge className={`${colors} text-white font-medium`}>
        {label}
      </Badge>
    );
  };

  const toggleSort = (field: 'requestId' | 'fileName' | 'department' | 'status' | 'fileSize' | 'uploadDate' | 'assignedTo' | 'lastModified') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              All Reports
            </h1>
            <p className="text-slate-600 mt-1">
              {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="mb-6 border-slate-200 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Filters Label */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Filters:</span>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => handleFilterChange(() => setSearchTerm(e.target.value))}
                  className="pl-10 h-10 border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-10 border-slate-300">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="resubmitted">Resubmitted</SelectItem>
                <SelectItem value="initial-review">Initial Review</SelectItem>
                <SelectItem value="review-process">Review Process</SelectItem>
                <SelectItem value="final-review">Final Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="needs-revision">Needs Revision</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            {/* Department Filter */}
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[200px] h-10 border-slate-300">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="p-0">
          {filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No reports found
              </h3>
              <p className="text-slate-500 text-center max-w-md">
                {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                  ? 'No reports match your search criteria. Try adjusting your filters.'
                  : 'No requests have been raised yet. Go to "Raise Request" to create your first request.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('requestId')}
                    >
                      <div className="flex items-center gap-1">
                        Request ID
                        {sortField === 'requestId' ? (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('fileName')}
                    >
                      <div className="flex items-center gap-1">
                        Document Name
                        {sortField === 'fileName' ? (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('department')}
                    >
                      <div className="flex items-center gap-1">
                        Department
                        {sortField === 'department' ? (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {sortField === 'status' ? (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Workflow</TableHead>
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('fileSize')}
                    >
                      <div className="flex items-center gap-1">
                        File Size
                        {sortField === 'fileSize' ? (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('uploadDate')}
                    >
                      <div className="flex items-center gap-1">
                        Upload Date
                        {sortField === 'uploadDate' ? (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('assignedTo')}
                    >
                      <div className="flex items-center gap-1">
                        Assigned To
                        {sortField === 'assignedTo' ? (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('lastModified')}
                    >
                      <div className="flex items-center gap-1">
                        Last Modified
                        {sortField === 'lastModified' ? (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Audit Logs</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-slate-50 transition-colors">
                      {/* Request ID */}
                      <TableCell>
                        <span className="font-mono text-sm text-blue-600 font-medium">
                          {report.requestId || 'N/A'}
                        </span>
                      </TableCell>

                      {/* Document Name */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate" title={report.fileName}>
                              {report.fileName}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Department */}
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="bg-cyan-50 text-cyan-700 border-cyan-300 font-medium"
                        >
                          {report.department || 'N/A'}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>

                      {/* Workflow */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="View Workflow"
                        >
                          <GitBranch className="h-4 w-4" />
                        </Button>
                      </TableCell>

                      {/* File Size */}
                      <TableCell>
                        <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-300 font-mono text-xs">
                          {formatFileSize(report.fileSize)}
                        </Badge>
                      </TableCell>

                      {/* Upload Date */}
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{report.uploadDate}</span>
                        </div>
                      </TableCell>

                      {/* Assigned To */}
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-700">
                          <User className="h-3.5 w-3.5 text-slate-500" />
                          <span>{report.assignedToName || report.assignedTo || 'Unassigned'}</span>
                        </div>
                      </TableCell>

                      {/* Last Modified */}
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {report.lastModified || report.uploadDate}
                          </span>
                        </div>
                      </TableCell>

                      {/* Audit Logs */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAuditLogs(report.requestId || report.id)}
                          className="h-8 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          title="View Audit Logs"
                        >
                          <ScrollText className="h-4 w-4" />
                        </Button>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {/* Preview Button - Replacing generic icon */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(report)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Preview Document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Open in Editor Button - Using Edit2 icon as requested */}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!canUserEdit(report)}
                            onClick={() => handleEdit(report.id)}
                            className={`h-8 w-8 p-0 ${!canUserEdit(report) ? 'text-slate-300' : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'}`}
                            title={!canUserEdit(report) ? "Document currently in workflow" : "Open in Form Editor"}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          {/* Document Publishing Icon - Admin and Manager roles */}
                          {(userRole === 'admin' || userRole === 'manager') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => report.status === 'approved' && handlePublish(report)}
                              className={`h-8 w-8 p-0 ${
                                report.status === 'approved'
                                  ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50 cursor-pointer'
                                  : 'text-gray-300 cursor-not-allowed'
                              }`}
                              title={report.status === 'approved' ? 'Publish' : 'Only approved documents can be published'}
                              disabled={report.status !== 'approved'}
                            >
                              <UploadCloud className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Download Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(report.id, report.fileName)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Download Document"
                          >
                            <Download className="h-4 w-4" />
                          </Button>

                          {/* Delete Button - Hidden for Manager role */}
                          {userRole !== 'manager' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(report.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Request"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="mt-6 border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* Results Info */}
              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span> to{' '}
                <span className="font-semibold text-slate-800">{Math.min(endIndex, filteredReports.length)}</span> of{' '}
                <span className="font-semibold text-slate-800">{filteredReports.length}</span> reports
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-9 px-3 gap-1 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
                    ) : (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                        className={`h-9 w-9 p-0 ${
                          page === currentPage
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md'
                            : 'border-slate-300 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {page}
                      </Button>
                    )
                  ))}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-9 px-3 gap-1 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};