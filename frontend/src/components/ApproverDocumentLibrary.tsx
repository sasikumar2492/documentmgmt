import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Building2,
  Clock,
  ScrollText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ReportData, ViewType } from '../types';
import { getStatusColor, getStatusLabel } from '../utils/statusUtils';

interface ApproverDocumentLibraryProps {
  reports: ReportData[];
  onViewForm: (reportId: string) => void;
  onPreviewDocument: (reportId: string) => void;
  onDownloadDocument: (reportId: string, fileName: string) => void;
  onNavigate?: (view: ViewType, options?: { requestId?: string }) => void;
  currentUsername?: string;
}

export const ApproverDocumentLibrary: React.FC<ApproverDocumentLibraryProps> = ({
  reports = [],
  onViewForm,
  onPreviewDocument,
  onDownloadDocument,
  onNavigate,
  currentUsername = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'pending' | 'closed'>('pending');

  const formatFileSize = (fileSize: string | undefined): string => {
    if (!fileSize || fileSize === 'N/A') return 'N/A';
    const num = parseFloat(String(fileSize).replace(/[^0-9.]/g, ''));
    if (Number.isNaN(num)) return fileSize;
    if (num >= 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(2)} MB`;
    if (num >= 1024) return `${(num / 1024).toFixed(2)} KB`;
    return `${num} B`;
  };

  const canUserEdit = (doc: ReportData) => {
    // Approvers can only edit if the status is "reviewed" or "approved"
    return ['reviewed', 'approved'].includes(doc.status?.toLowerCase() || '');
  };

  const handlePreview = (report: ReportData) => {
    onPreviewDocument(report.id);
  };

  // Filter approver pending - Documents awaiting approver action
  // Includes: submitted, review-process, reviewed (awaiting approval from approver), needs-revision
  const approverPending = reports.filter(report => 
    ['submitted', 'review-process', 'reviewed', 'needs-revision'].includes(report.status)
  ).sort((a, b) => {
    const timeA = new Date(a.lastModified || a.uploadDate || 0).getTime();
    const timeB = new Date(b.lastModified || b.uploadDate || 0).getTime();
    return timeB - timeA;
  }); // Most recent first

  // Filter closed - Documents that have been approved or rejected by approver
  // Includes: approved, rejected
  const closedApprovals = reports.filter(report => 
    ['approved', 'rejected'].includes(report.status)
  ).sort((a, b) => {
    const timeA = new Date(a.lastModified || a.uploadDate || 0).getTime();
    const timeB = new Date(b.lastModified || b.uploadDate || 0).getTime();
    return timeB - timeA;
  }); // Most recent first

  // Get unique departments
  const departments = Array.from(new Set(reports.map(r => r.department || 'Unknown')));

  // Apply search and department filters
  const filterReports = (reportsToFilter: ReportData[]) => {
    return reportsToFilter.filter(report => {
      const matchesSearch =
        report.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.department?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || report.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  };

  const filteredApproverPending = filterReports(approverPending);
  const filteredClosedApprovals = filterReports(closedApprovals);

  const getStatusBadge = (status: string) => {
    const colors = getStatusColor(status);
    const label = getStatusLabel(status);

    return (
      <Badge className={`${colors} text-white font-medium`}>
        {label}
      </Badge>
    );
  };

  const renderReportsTable = (reportsData: ReportData[], emptyMessage: string) => {
    if (reportsData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <FileText className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No reports found
          </h3>
          <p className="text-slate-500 text-center max-w-md">
            {emptyMessage}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Request ID</TableHead>
              <TableHead className="font-semibold text-slate-700">Document Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Department</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700">File Size</TableHead>
              <TableHead className="font-semibold text-slate-700">Upload Date</TableHead>
              <TableHead className="font-semibold text-slate-700">Assigned To</TableHead>
              <TableHead className="font-semibold text-slate-700">Last Modified</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportsData.map((report) => (
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

                    {/* View/Approve Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!canUserEdit(report) && activeTab === 'pending'}
                      onClick={() => onViewForm(report.id)}
                      className={`h-8 w-8 p-0 ${!canUserEdit(report) && activeTab === 'pending' ? 'text-slate-300' : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'}`}
                      title={!canUserEdit(report) && activeTab === 'pending' ? "Not your turn in workflow" : "Open in Form Editor"}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>

                    {/* Download Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownloadDocument(report.id, report.fileName)}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
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
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Document Library
            </h1>
            <p className="text-slate-600 mt-1">
              Manage and approve requests
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Approver Pending Card */}
        <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Approver Pending
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Documents awaiting your approval
                </CardDescription>
              </div>
              <div className="text-3xl font-bold text-blue-700">
                {approverPending.length}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Closed Card */}
        <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-700 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Closed
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Approved or rejected documents
                </CardDescription>
              </div>
              <div className="text-3xl font-bold text-slate-700">
                {closedApprovals.length}
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs for Pending and Closed Approvals */}
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pending' | 'closed')}>
            <div className="border-b border-slate-200 px-6 pt-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger 
                  value="pending" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Approver Pending ({filteredApproverPending.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="closed"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-700 data-[state=active]:text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Closed ({filteredClosedApprovals.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Approver Pending Tab Content */}
            <TabsContent value="pending" className="mt-0 p-6">
              {renderReportsTable(
                filteredApproverPending,
                searchTerm || departmentFilter !== 'all'
                  ? 'No documents match your search criteria. Try adjusting your filters.'
                  : 'No documents awaiting your approval at this time. Documents will appear here after reviewer approval.'
              )}
            </TabsContent>

            {/* Closed Tab Content */}
            <TabsContent value="closed" className="mt-0 p-6">
              {renderReportsTable(
                filteredClosedApprovals,
                searchTerm || departmentFilter !== 'all'
                  ? 'No documents match your search criteria. Try adjusting your filters.'
                  : 'No closed documents yet. Approved or rejected documents will appear here.'
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};