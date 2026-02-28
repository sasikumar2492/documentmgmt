import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ActivityLogTable } from './ActivityLogTable';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  Sparkles,
  Bot,
  Plus,
  Trash2,
  MessageSquare,
  Send,
  BarChart3,
  FolderOpen,
  Edit,
  RefreshCw,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Activity,
  FileSignature,
  User,
} from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  department: string;
  details: string;
  esign?: string;
  status: 'completed' | 'pending' | 'in-progress';
}

interface Request {
  id: string;
  fileName: string;
  documentType: string;
  department: string;
  status: 'pending' | 'in-review' | 'approved' | 'rejected' | 'returned';
  submittedDate: string;
  lastUpdated: string;
  reviewer?: string;
  approver?: string;
  priority: 'high' | 'medium' | 'low';
  activities?: ActivityLogEntry[];
}

interface RemarkedDocument {
  id: string;
  fileName: string;
  documentType: string;
  returnedBy: 'reviewer' | 'approver';
  returnedByName: string;
  returnedDate: string;
  remarks: string;
  status: 'needs-revision' | 'rejected';
  originalSubmissionDate: string;
}

interface PreparatorDashboardProps {
  onNavigate: (view: string) => void;
  onViewForm?: (requestId: string) => void;
  userRole?: string;
  reports?: ReportData[];
}

export function PreparatorDashboard({ onNavigate, onViewForm, userRole = 'preparator', reports = [] }: PreparatorDashboardProps) {
  const [activeModule, setActiveModule] = useState<'dashboard' | 'ai-conversion' | 'raise-request' | 'document-library' | 'activity-log' | 'remarks-inbox'>('dashboard');
  const [documentLibraryTab, setDocumentLibraryTab] = useState<'all-reports'>('all-reports');
  const [searchQuery, setSearchQuery] = useState('');

  // Use real data from reports
  const myRequests: Request[] = reports.map(r => ({
    id: r.requestId || r.id,
    fileName: r.fileName,
    documentType: r.documentType || 'Request',
    department: r.department,
    status: (r.status === 'submitted' || r.status === 'resubmitted') ? 'in-review' : 
            (r.status === 'pending') ? 'pending' :
            (r.status === 'approved') ? 'approved' :
            (r.status === 'rejected') ? 'rejected' :
            (r.status === 'needs-revision') ? 'returned' : 'pending',
    submittedDate: r.uploadDate,
    lastUpdated: r.lastModified || r.uploadDate,
    priority: (r.priority as any) || 'medium'
  })).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  const remarkedDocuments: RemarkedDocument[] = reports
    .filter(r => r.status === 'needs-revision' || r.status === 'rejected')
    .map(r => ({
      id: r.id,
      fileName: r.fileName,
      documentType: r.documentType || 'Request',
      returnedBy: 'reviewer',
      returnedByName: 'Reviewer',
      returnedDate: r.lastModified || r.uploadDate,
      remarks: r.submissionComments || 'Please review the comments in the document editor.',
      status: r.status === 'needs-revision' ? 'needs-revision' : 'rejected',
      originalSubmissionDate: r.uploadDate
    }));

  const getStatusBadge = (status: Request['status']) => {
    const styles = {
      pending: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md',
      'in-review': 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md',
      approved: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md',
      rejected: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md',
      returned: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md',
    };
    return <Badge className={styles[status]}>{status.replace('-', ' ').toUpperCase()}</Badge>;
  };

  const getPriorityBadge = (priority: Request['priority']) => {
    const styles = {
      high: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md',
      medium: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md',
      low: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md',
    };
    return <Badge className={styles[priority]}>{priority.toUpperCase()}</Badge>;
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome, Preparator!</h2>
              <p className="text-slate-600">Manage your document requests and leverage AI for smart conversions</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
              <Users className="h-12 w-12 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-blue-200 shadow-md hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {myRequests.length}
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">All time submissions</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 shadow-md hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {myRequests.filter(r => r.status === 'pending' || r.status === 'in-review').length}
              </div>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 shadow-md hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {myRequests.filter(r => r.status === 'approved').length}
              </div>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Successfully completed</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 shadow-md hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              Needs Revision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                {remarkedDocuments.length}
              </div>
              <AlertCircle className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Returned with remarks</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => setActiveModule('ai-conversion')}
              className="h-auto py-6 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg flex flex-col gap-2"
            >
              <Bot className="h-8 w-8" />
              <span className="font-semibold">AI Conversion</span>
              <span className="text-xs opacity-90">Smart document conversion</span>
            </Button>

            <Button
              onClick={() => setActiveModule('raise-request')}
              className="h-auto py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg flex flex-col gap-2"
            >
              <Plus className="h-8 w-8" />
              <span className="font-semibold">Raise Request</span>
              <span className="text-xs opacity-90">Submit new approval request</span>
            </Button>

            <Button
              onClick={() => setActiveModule('document-library')}
              className="h-auto py-6 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0 shadow-lg flex flex-col gap-2"
            >
              <FolderOpen className="h-8 w-8" />
              <span className="font-semibold">Document Library</span>
              <span className="text-xs opacity-90">View all reports & remarks</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-lg border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{request.fileName}</p>
                    <p className="text-xs text-slate-500">{request.department} • {request.lastUpdated}</p>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAIConversion = () => (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Bot className="h-7 w-7 text-blue-600" />
                AI Smart Conversion
              </h2>
              <p className="text-slate-600">Convert Excel templates to interactive forms using AI technology</p>
            </div>
            <Button
              onClick={() => onNavigate('create-sop')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create SOP
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Conversion Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200 shadow-md hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Smart Template Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">Upload your Excel templates and let AI convert them into interactive forms automatically.</p>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
              <Upload className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700 mb-2">Drag & drop Excel files here</p>
              <p className="text-xs text-slate-500 mb-4">or click to browse</p>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg">
                <Upload className="h-4 w-4 mr-2" />
                Upload Template
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 shadow-md hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <BookOpen className="h-5 w-5 text-purple-500" />
              AI Processing Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800 text-sm">Intelligent Field Detection</p>
                  <p className="text-xs text-slate-600">Automatically identifies form fields and data types</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800 text-sm">Validation Rules</p>
                  <p className="text-xs text-slate-600">Smart validation based on field context</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800 text-sm">Department Classification</p>
                  <p className="text-xs text-slate-600">Auto-assigns to appropriate departments</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800 text-sm">Workflow Automation</p>
                  <p className="text-xs text-slate-600">Creates approval workflow automatically</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversions */}
      <Card className="shadow-lg border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <RefreshCw className="h-5 w-5 text-blue-500" />
            Recent AI Conversions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Template Name</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Conversion Date</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-sm text-slate-700">Part_Approval_Template_v2.xlsx</td>
                  <td className="p-3 text-sm text-slate-600">2026-01-24</td>
                  <td className="p-3">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md">Completed</Badge>
                  </td>
                  <td className="p-3">
                    <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-md">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-sm text-slate-700">Manufacturer_Form_v3.xlsx</td>
                  <td className="p-3 text-sm text-slate-600">2026-01-23</td>
                  <td className="p-3">
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md">Processing</Badge>
                  </td>
                  <td className="p-3">
                    <Button size="sm" variant="outline" disabled>
                      <Clock className="h-3 w-3 mr-1" />
                      Processing
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRaiseRequest = () => (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <FileText className="h-7 w-7 text-green-600" />
                Raise Request
              </h2>
              <p className="text-slate-600">View and manage all your submitted approval requests</p>
            </div>
            <Button
              onClick={() => onNavigate('template-upload')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="shadow-md border-2 border-slate-200">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by file name, document type, or request ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="border-slate-300 hover:bg-slate-100">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Documents Table */}
      <Card className="shadow-lg border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <FileSpreadsheet className="h-5 w-5 text-green-500" />
            All Submitted Requests ({myRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Request ID</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">File Name</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Document Type</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Department</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Priority</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Submitted</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map((request) => (
                  <tr key={request.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-mono text-sm text-blue-600 font-semibold">{request.id}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-slate-700">{request.fileName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-slate-600">{request.documentType}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="border-slate-300 text-slate-700">
                        {request.department}
                      </Badge>
                    </td>
                    <td className="p-3">{getPriorityBadge(request.priority)}</td>
                    <td className="p-3">{getStatusBadge(request.status)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Calendar className="h-3 w-3" />
                        {request.submittedDate}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => onViewForm?.(request.id)}
                          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-md"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDocumentLibrary = () => (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <FolderOpen className="h-7 w-7 text-purple-600" />
                Document Library
              </h2>
              <p className="text-slate-600">Access all reports and review feedback from reviewers and approvers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card className="shadow-md border-2 border-slate-200">
        <CardContent className="p-0">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setDocumentLibraryTab('all-reports')}
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
                documentLibraryTab === 'all-reports'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5" />
                All Reports ({myRequests.length})
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {documentLibraryTab === 'all-reports' ? (
        <Card className="shadow-lg border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <FileSpreadsheet className="h-5 w-5 text-blue-500" />
              All Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Request ID</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">File Name</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Type</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Submitted</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Last Updated</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map((request) => (
                    <tr key={request.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <span className="font-mono text-sm text-blue-600 font-semibold">{request.id}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-slate-700">{request.fileName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-slate-600">{request.documentType}</td>
                      <td className="p-3">{getStatusBadge(request.status)}</td>
                      <td className="p-3 text-sm text-slate-600">{request.submittedDate}</td>
                      <td className="p-3 text-sm text-slate-600">{request.lastUpdated}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => onViewForm?.(request.id)}
                            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-md"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              Remarks Inbox - Documents Returned for Revision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {remarkedDocuments.map((doc) => (
                <Card key={doc.id} className="border-2 border-purple-200 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-800">{doc.fileName}</h4>
                            <span className="font-mono text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">{doc.id}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {doc.documentType}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Returned: {doc.returnedDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={doc.returnedBy === 'reviewer' 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md' 
                              : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                            }>
                              Returned by {doc.returnedBy === 'reviewer' ? 'Reviewer' : 'Approver'}
                            </Badge>
                            <span className="text-sm text-slate-600">• {doc.returnedByName}</span>
                          </div>
                          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-amber-800 mb-1">Remarks:</p>
                                <p className="text-sm text-slate-700">{doc.remarks}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-200">
                      <Button
                        size="sm"
                        onClick={() => onViewForm?.(doc.id)}
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-md"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Document
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0 shadow-md"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Make Revisions
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Resubmit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {remarkedDocuments.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Remarks</h3>
                  <p className="text-slate-600">You have no documents pending revision</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Dashboard Content */}
      {renderDashboard()}
    </div>
  );
}