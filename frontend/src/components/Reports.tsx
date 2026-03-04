import React, { useState } from 'react';
import { FileText, Download, Eye, Trash2, Filter, Search, Calendar, User, Building2, CheckCircle, XCircle, Clock, FileCheck, Sparkles, BarChart3, TrendingUp, Users, GitBranch, ScrollText } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ReportData, ViewType } from '../types';
import { getStatusColor, getStatusLabel } from '../utils/statusUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Breadcrumbs } from './Breadcrumbs';
import { CircularProgress } from './CircularProgress';
import { StatusPieChart } from './StatusPieChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { WorkflowDialog } from './WorkflowDialog';

interface ReportsProps {
  reports: ReportData[];
  filterStatus: string;
  searchTerm: string;
  onFilterStatusChange: (status: string) => void;
  onSearchTermChange: (term: string) => void;
  onViewForm: (reportId: string) => void;
  onPreviewDocument: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
  onDownloadDocument: (reportId: string, fileName: string) => void;
  onNavigate?: (view: ViewType, options?: { requestId?: string }) => void;
}

export const Reports: React.FC<ReportsProps> = ({
  reports = [],
  filterStatus = 'all',
  searchTerm = '',
  onFilterStatusChange,
  onSearchTermChange,
  onViewForm,
  onPreviewDocument,
  onDeleteReport,
  onDownloadDocument,
  onNavigate
}) => {
  const safeReports = Array.isArray(reports) ? reports : [];
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  
  // Workflow Dialog State
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  const handlePreview = (reportId: string) => {
    onPreviewDocument(reportId);
  };

  const handleOpenWorkflow = (report: ReportData) => {
    setSelectedReport(report);
    setWorkflowDialogOpen(true);
  };

  const handleCloseWorkflow = () => {
    setWorkflowDialogOpen(false);
    setSelectedReport(null);
  };

  // Department options
  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'supply-chain', name: 'Supply Chain' },
    { id: 'finance', name: 'Finance' },
    { id: 'operations', name: 'Operations' },
    { id: 'quality-assurance', name: 'Quality Assurance' },
    { id: 'procurement', name: 'Procurement' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'manufacturing', name: 'Manufacturing' }
  ];

  /** Format file size: raw bytes → MB/KB; already-formatted strings shown as-is */
  const formatFileSize = (fileSize: string | undefined): string => {
    if (!fileSize || fileSize === 'N/A') return 'N/A';
    const num = parseFloat(String(fileSize).replace(/[^0-9.]/g, ''));
    if (Number.isNaN(num)) return fileSize;
    if (num >= 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(2)} MB`;
    if (num >= 1024) return `${(num / 1024).toFixed(2)} KB`;
    return `${num} B`;
  };

  // Calculate statistics
  const totalReports = safeReports.length;
  const completedReports = safeReports.filter(report => report?.status === 'approved').length;
  const pendingReports = safeReports.filter(report => 
    report?.status && ['pending', 'submitted', 'initial-review', 'review-process', 'final-review', 'supplier-sample'].includes(report.status)
  ).length;
  
  // Department-wise count
  const departmentCounts = safeReports.reduce((acc, report) => {
    if (report?.assignedTo) {
      acc[report.assignedTo] = (acc[report.assignedTo] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Filter and sort reports (newest first)
  const filteredReports = safeReports
    .filter(report => {
      if (!report) return false;
      
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      const matchesSearch = (report.fileName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                           (report.requestId || '').toLowerCase().includes((searchTerm || '').toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || report.department === selectedDepartment;
      return matchesStatus && matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      // Sort by lastModified date (newest first)
      const dateA = new Date(a.lastModified || a.uploadDate || 0).getTime();
      const dateB = new Date(b.lastModified || b.uploadDate || 0).getTime();
      return dateB - dateA;
    });

  // Calculate percentages for circular progress
  const completionRate = totalReports > 0 ? (completedReports / totalReports) * 100 : 0;
  const pendingRate = totalReports > 0 ? (pendingReports / totalReports) * 100 : 0;
  const departmentProgress = Math.min((Object.keys(departmentCounts).length / 5) * 100, 100);

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 relative overflow-hidden">
        {/* AI Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
          <div className="absolute top-20 right-20 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
          <div className="absolute top-40 left-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '4.5s' }}></div>
          <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-teal-400 rounded-full animate-ping" style={{ animationDelay: '1.5s', animationDuration: '5s' }}></div>
          <div className="absolute top-60 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '2.5s', animationDuration: '4.5s' }}></div>
        </div>

      <div className="mb-6 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Reports</h1>
          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-full border border-indigo-500/30">
            <BarChart3 className="h-4 w-4 text-indigo-600 animate-pulse" />
            <span className="text-sm text-indigo-600">AI Analytics</span>
            <TrendingUp className="h-3 w-3 text-blue-500 animate-pulse" style={{ animationDuration: '1.5s' }} />
          </div>
        </div>
        <p className="text-slate-600">
          View, manage, and analyze all submitted requests and their current status.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white border-light-blue shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-col">
              <CardTitle className="text-sm font-bold text-slate-600">Total Reports</CardTitle>
              <div className="text-2xl font-bold text-slate-800 mt-2">{totalReports}</div>
              <p className="text-xs text-slate-500">All submitted requests</p>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-4 w-4 text-blue-600" />
              <CircularProgress 
                percentage={Math.min((totalReports / 20) * 100, 100)} 
                size={50}
                color="#3b82f6"
              />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white border-light-blue shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-col">
              <CardTitle className="text-sm font-bold text-slate-600">Completed Reports</CardTitle>
              <div className="text-2xl font-bold text-slate-800 mt-2">{completedReports}</div>
              <p className="text-xs text-slate-500">Approved requests</p>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <CircularProgress 
                percentage={completionRate} 
                size={50}
                color="#10b981"
              />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white border-light-blue shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-col">
              <CardTitle className="text-sm font-bold text-slate-600">Pending Reports</CardTitle>
              <div className="text-2xl font-bold text-slate-800 mt-2">{pendingReports}</div>
              <p className="text-xs text-slate-500">In progress</p>
            </div>
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <CircularProgress 
                percentage={pendingRate} 
                size={50}
                color="#f59e0b"
              />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white border-light-blue shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-col">
              <CardTitle className="text-sm font-bold text-slate-600">Departments Active</CardTitle>
              <div className="text-2xl font-bold text-slate-800 mt-2">{Object.keys(departmentCounts).length}</div>
              <p className="text-xs text-slate-500">With submitted requests</p>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-4 w-4 text-purple-600" />
              <CircularProgress 
                percentage={departmentProgress} 
                size={50}
                color="#9333ea"
              />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pie Chart Card */}
        <Card className="bg-white border-light-blue shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-800 font-bold">Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart reports={safeReports} />
          </CardContent>
        </Card>

        {/* Department Statistics */}
        <Card className="lg:col-span-2 bg-white border-light-blue shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-800 font-bold">Department Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(departmentCounts).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(departmentCounts).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between p-3 bg-light-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-light-blue" />
                      <span className="font-medium text-slate-800">{dept}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-light-blue text-light-blue">
                        {count} requests
                      </Badge>
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-light-blue h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((count / Math.max(...Object.values(departmentCounts))) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                <p className="text-slate-500">No department activity yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card className="bg-white border-light-blue shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-800 font-bold">All Reports</CardTitle>
          <CardDescription className="text-slate-600">
            {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
          </CardDescription>
          
          {/* Filters */}
          <div className="mt-4 p-4 bg-light-blue-50 rounded-lg border border-light-blue-light">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-light-blue" />
                  <span className="text-sm text-slate-700 font-medium">Filters:</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => onSearchTermChange(e.target.value)}
                      className="pl-10 bg-white border-slate-300 text-slate-900 focus:border-light-blue"
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={onFilterStatusChange}>
                    <SelectTrigger className="w-40 bg-white border-slate-300 text-slate-900">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-300">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="initial-review">Initial Review</SelectItem>
                      <SelectItem value="review-process">Review Process</SelectItem>
                      <SelectItem value="final-review">Final Review</SelectItem>
                      <SelectItem value="supplier-sample">Supplier Sample</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-48 bg-white border-slate-300 text-slate-900">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-300">
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id} className="text-slate-900">
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-700 font-bold">Request ID</TableHead>
                <TableHead className="text-slate-700 font-bold">Document Name</TableHead>
                <TableHead className="text-slate-700 font-bold">Department</TableHead>
                <TableHead className="text-slate-700 font-bold">Status</TableHead>
                <TableHead className="text-slate-700 font-bold">Workflow</TableHead>
                <TableHead className="text-slate-700 font-bold">File Size</TableHead>
                <TableHead className="text-slate-700 font-bold">Upload Date</TableHead>
                <TableHead className="text-slate-700 font-bold">Assigned To</TableHead>
                <TableHead className="text-slate-700 font-bold">Last Modified</TableHead>
                <TableHead className="text-slate-700 font-bold">Audit Logs</TableHead>
                <TableHead className="text-right text-slate-700 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <TableRow key={report.id} className="border-slate-200 hover:bg-light-blue-50">
                    <TableCell className="font-medium text-light-blue">{report.requestId || 'N/A'}</TableCell>
                    <TableCell className="text-slate-700">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span>{report.fileName || 'Unnamed File'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      <Badge variant="outline" className="border-light-blue-light text-light-blue">
                        {report.department || 'Supply Chain'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(report.status || 'unknown')}>
                        {getStatusLabel(report.status || 'unknown')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenWorkflow(report)}
                        title="View Workflow"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <GitBranch className="h-5 w-5" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      <Badge variant="outline" className="border-light-blue-light text-light-blue">{formatFileSize(report.fileSize)}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">{report.uploadDate || 'N/A'}</TableCell>
                    <TableCell className="text-slate-700">{report.assignedToName || report.assignedTo || 'Unassigned'}</TableCell>
                    <TableCell className="text-slate-700">{report.lastModified || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate?.('activity-log-detail', { requestId: report.id })}
                        title="View Activity Timeline"
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                      >
                        <ScrollText className="h-5 w-5" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Preview Icon - Replacing View */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(report.id)}
                          title="Preview Document"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Open in Editor Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewForm(report.id)}
                          title="Open in Form Editor"
                          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-md"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownloadDocument(report.id, report.fileName || 'document')}
                          title="Download Document"
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteReport(report.id)}
                          title="Delete Document"
                          className="border-red-600 bg-red-600 text-white hover:bg-white hover:text-red-600 hover:border-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                    No reports found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
      {selectedReport && (
        <WorkflowDialog
          open={workflowDialogOpen}
          onClose={handleCloseWorkflow}
          department={selectedReport.department || 'engineering'}
          currentStatus={selectedReport.status}
          requestId={selectedReport.requestId}
          aiWorkflow={selectedReport.aiWorkflow}
        />
      )}
    </>
  );
};