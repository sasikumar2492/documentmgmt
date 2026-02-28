import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Calendar,
  FileText,
  BarChart3,
  PieChart,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Target,
  Activity,
  Users,
  Clock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Star,
  RefreshCw,
  Edit,
  X,
  Send,
  Building2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

import { ReportData, UserRole } from '../types';

interface EffectivenessRecord {
  id: string;
  documentId: string;
  documentName: string;
  department: string;
  version: string;
  publishedDate: string;
  reviewDate: string;
  effectivenessScore: number;
  complianceRate: number;
  issuesReported: number;
  feedbackCount: number;
  usageFrequency: string;
  status: 'effective' | 'needs-review' | 'ineffective' | 'revision-initiated';
  lastAuditDate: string;
  auditor: string;
  revisionRemarks?: string;
  revisionRequestedBy?: string;
  revisionRequestedDept?: string;
  revisionType?: string;
}

interface DocumentEffectivenessProps {
  reports?: ReportData[];
  onViewDocument?: (reportId: string) => void;
  userRole?: UserRole;
  onEditDocument?: (reportId: string) => void;
}

export const DocumentEffectiveness: React.FC<DocumentEffectivenessProps> = ({ 
  reports = [], 
  onViewDocument,
  userRole = 'admin',
  onEditDocument
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'documentName' | 'effectivenessScore' | 'reviewDate'>('effectivenessScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Revision Modal State
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EffectivenessRecord | null>(null);
  const [revisionData, setRevisionData] = useState({
    type: 'minor',
    remarks: '',
    fromDepartment: ''
  });

  const isPreparator = userRole?.toLowerCase().includes('preparator') || userRole?.toLowerCase().includes('requestor');
  const isManagerOrAdmin = userRole?.toLowerCase().includes('manager') || userRole?.toLowerCase() === 'admin';

  const handleInitiateRevision = (record: EffectivenessRecord) => {
    setSelectedRecord(record);
    setRevisionData({
      type: 'minor',
      remarks: '',
      fromDepartment: record.department
    });
    setIsRevisionModalOpen(true);
  };

  const handleViewDetails = (record: EffectivenessRecord) => {
    setSelectedRecord(record);
    setIsDetailsModalOpen(true);
  };

  const handleSubmitRevision = () => {
    if (!selectedRecord) return;

    // Update local state to reflect "Revision Initiated"
    setMockRecords(prev => prev.map(rec => 
      rec.id === selectedRecord.id 
        ? { 
            ...rec, 
            status: 'revision-initiated' as const,
            revisionRemarks: revisionData.remarks,
            revisionRequestedBy: `${userRole === 'admin' ? 'System Administrator' : 'Department Manager'}`,
            revisionRequestedDept: revisionData.fromDepartment,
            revisionType: revisionData.type === 'major' ? 'Major Revision' : 'Minor Revision'
          } 
        : rec
    ));

    // Simulate notification to preparator
    alert(`Revision Request Submitted!\n\nDocument: ${selectedRecord?.documentName}\nStatus updated to: REVISION INITIATED\nPreparator has been notified.`);
    setIsRevisionModalOpen(false);
  };

  // Map published reports to effectiveness records
  const publishedRecords = reports
    .filter(r => r.status === 'published')
    .map(r => ({
      id: `eff_pub_${r.id}`,
      realReportId: r.id,
      documentId: r.requestId || 'N/A',
      documentName: r.fileName,
      department: r.department || 'Uncategorized',
      version: 'v1.0',
      publishedDate: r.publishedDate || r.uploadDate,
      reviewDate: new Date(new Date(r.publishedDate || r.uploadDate).getTime() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 months later
      effectivenessScore: 85 + Math.floor(Math.random() * 10), // Random high score
      complianceRate: 90 + Math.floor(Math.random() * 8),
      issuesReported: Math.floor(Math.random() * 3),
      feedbackCount: 5 + Math.floor(Math.random() * 20),
      usageFrequency: 'High',
      status: 'effective' as const,
      lastAuditDate: new Date().toISOString().split('T')[0],
      auditor: r.publishedBy || 'System'
    }));

  const [mockRecords, setMockRecords] = useState<(EffectivenessRecord & { realReportId?: string })[]>([
    {
      id: 'eff_1',
      documentId: 'DOC-001',
      documentName: 'Quality Management System',
      department: 'Quality Assurance',
      version: 'v2.1',
      publishedDate: '2024-10-15',
      reviewDate: '2025-02-15',
      effectivenessScore: 92,
      complianceRate: 95,
      issuesReported: 2,
      feedbackCount: 45,
      usageFrequency: 'Daily',
      status: 'effective',
      lastAuditDate: '2025-01-20',
      auditor: 'Sarah Manager'
    },
    {
      id: 'eff_2',
      documentId: 'DOC-002',
      documentName: 'Safety Guidelines v2.1',
      department: 'Manufacturing',
      version: 'v2.1',
      publishedDate: '2024-11-01',
      reviewDate: '2025-03-01',
      effectivenessScore: 78,
      complianceRate: 82,
      issuesReported: 8,
      feedbackCount: 32,
      usageFrequency: 'Weekly',
      status: 'needs-review',
      lastAuditDate: '2025-01-15',
      auditor: 'Sarah Manager',
      revisionRemarks: 'The current safety guidelines do not account for the new high-pressure molding machines installed in Hall B. We need to update the emergency shutdown procedures.',
      revisionRequestedBy: 'Michael Chen (Manager)',
      revisionRequestedDept: 'Production Operations',
      revisionType: 'Major Revision'
    },
    {
      id: 'eff_3',
      documentId: 'DOC-003',
      documentName: 'ISO Standards Handbook',
      department: 'Engineering',
      version: 'v3.0',
      publishedDate: '2024-09-20',
      reviewDate: '2025-01-20',
      effectivenessScore: 88,
      complianceRate: 91,
      issuesReported: 3,
      feedbackCount: 56,
      usageFrequency: 'Daily',
      status: 'effective',
      lastAuditDate: '2025-01-18',
      auditor: 'Sarah Manager'
    },
    {
      id: 'eff_4',
      documentId: 'DOC-004',
      documentName: 'SCM Procedures Manual',
      department: 'Supply Chain',
      version: 'v1.5',
      publishedDate: '2024-08-10',
      reviewDate: '2024-12-10',
      effectivenessScore: 65,
      complianceRate: 70,
      issuesReported: 15,
      feedbackCount: 28,
      usageFrequency: 'Monthly',
      status: 'ineffective',
      lastAuditDate: '2025-01-10',
      auditor: 'Sarah Manager',
      revisionRemarks: 'Obsolete vendor list. Need to integrate new procurement standards for ESG compliance.',
      revisionRequestedBy: 'Linda Wu (Quality Admin)',
      revisionRequestedDept: 'Supply Chain Management',
      revisionType: 'Minor Revision'
    },
    {
      id: 'eff_5',
      documentId: 'DOC-005',
      documentName: 'Inspection Protocol v3.0',
      department: 'Quality Assurance',
      version: 'v3.0',
      publishedDate: '2024-12-01',
      reviewDate: '2025-04-01',
      effectivenessScore: 94,
      complianceRate: 97,
      issuesReported: 1,
      feedbackCount: 62,
      usageFrequency: 'Daily',
      status: 'effective',
      lastAuditDate: '2025-01-22',
      auditor: 'Sarah Manager'
    }
  ]);

  const records = [...publishedRecords, ...mockRecords];

  const departments = Array.from(new Set(records.map(r => r.department)));

  // Filter and sort records
  const filteredRecords = records
    .filter(record => {
      const matchesSearch =
        record.documentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.documentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.department?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'documentName') {
        comparison = a.documentName.localeCompare(b.documentName);
      } else if (sortField === 'effectivenessScore') {
        comparison = a.effectivenessScore - b.effectivenessScore;
      } else if (sortField === 'reviewDate') {
        comparison = new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime();
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'effective': { label: 'Effective', className: 'bg-green-500 text-white' },
      'needs-review': { label: 'Needs Review', className: 'bg-yellow-500 text-white' },
      'ineffective': { label: 'Ineffective', className: 'bg-red-500 text-white' },
      'revision-initiated': { label: 'Revision Initiated', className: 'bg-amber-500 text-white' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['needs-review'];

    return (
      <Badge className={`${config.className} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-green-50 text-green-700 border-green-300';
    if (score >= 70) return 'bg-yellow-50 text-yellow-700 border-yellow-300';
    return 'bg-red-50 text-red-700 border-red-300';
  };

  const toggleSort = (field: 'documentName' | 'effectivenessScore' | 'reviewDate') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Calculate statistics
  const stats = {
    total: records.length,
    effective: records.filter(r => r.status === 'effective').length,
    needsReview: records.filter(r => r.status === 'needs-review').length,
    ineffective: records.filter(r => r.status === 'ineffective').length,
    avgScore: Math.round(
      records.reduce((sum, r) => sum + r.effectivenessScore, 0) / records.length
    ),
    avgCompliance: Math.round(
      records.reduce((sum, r) => sum + r.complianceRate, 0) / records.length
    )
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Document Effectiveness
            </h1>
            <p className="text-slate-600 mt-1">
              Monitor and evaluate document performance and compliance
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Documents</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Effective</p>
                <p className="text-2xl font-bold text-green-600">{stats.effective}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Needs Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.needsReview}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Ineffective</p>
                <p className="text-2xl font-bold text-red-600">{stats.ineffective}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Score</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.avgScore}%</p>
              </div>
              <Target className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Compliance</p>
                <p className="text-2xl font-bold text-teal-600">{stats.avgCompliance}%</p>
              </div>
              <Activity className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-slate-300"
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
                <SelectItem value="effective">Effective</SelectItem>
                <SelectItem value="needs-review">Needs Review</SelectItem>
                <SelectItem value="ineffective">Ineffective</SelectItem>
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

            {/* Export Button */}
            <Button
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg ml-auto"
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Effectiveness Table */}
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <TrendingUp className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No effectiveness records found
              </h3>
              <p className="text-slate-500 text-center max-w-md">
                No records match your search criteria. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 min-w-[250px]"
                      onClick={() => toggleSort('documentName')}
                    >
                      <div className="flex items-center gap-1">
                        Document
                        {sortField === 'documentName' && (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">Department</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[100px]">Version</TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[100px]">Feedback</TableHead>
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 min-w-[150px]"
                      onClick={() => toggleSort('reviewDate')}
                    >
                      <div className="flex items-center gap-1">
                        Review Date
                        {sortField === 'reviewDate' && (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-blue-600">{record.documentId}</span>
                          <span className="font-medium text-slate-800">{record.documentName}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-300">
                          {record.department}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                          {record.version}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span className="text-slate-700">{record.feedbackCount}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{record.reviewDate}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="View Details"
                            onClick={() => handleViewDetails(record as EffectivenessRecord)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Download Report"
                          >
                            <Download className="h-4 w-4" />
                          </Button>

                          {isPreparator && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Edit Document"
                              onClick={() => {
                                if (record.realReportId && onEditDocument) {
                                  onEditDocument(record.realReportId);
                                } else {
                                  alert('Editing is only available for live published documents.');
                                }
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}

                          {isManagerOrAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              title="Initiate Revision"
                              onClick={() => handleInitiateRevision(record as EffectivenessRecord)}
                            >
                              <RefreshCw className="h-4 w-4" />
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

      {/* Revision Initiation Modal */}
      <Dialog open={isRevisionModalOpen} onOpenChange={setIsRevisionModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-slate-200 shadow-2xl bg-white !bg-white text-slate-900 !text-slate-900">
          <DialogHeader className="bg-white !bg-white">
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <RefreshCw className="h-5 w-5" />
              Initiate Document Revision
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Complete the details below to notify the preparator and begin the revision process for "{selectedRecord?.documentName}".
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4 bg-white !bg-white">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="revision-type" className="text-right font-semibold text-slate-700">
                Revision Type
              </Label>
              <div className="col-span-3">
                <Select 
                  value={revisionData.type} 
                  onValueChange={(val) => setRevisionData({...revisionData, type: val})}
                >
                  <SelectTrigger className="border-slate-300 bg-white !bg-white text-slate-900 !text-slate-900">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white !bg-white text-slate-900 !text-slate-900 border-slate-200">
                    <SelectItem value="minor">Minor Revision (Typos, Formatting)</SelectItem>
                    <SelectItem value="major">Major Revision (Process Change, Content Update)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right font-semibold text-slate-700">
                Department
              </Label>
              <div className="col-span-3 relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="department"
                  value={revisionData.fromDepartment}
                  onChange={(e) => setRevisionData({...revisionData, fromDepartment: e.target.value})}
                  className="pl-10 border-slate-300 bg-white !bg-white text-slate-900 !text-slate-900"
                  placeholder="Requesting Department"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="remarks" className="font-semibold px-1 text-slate-700">
                Revision Remarks / Justification
              </Label>
              <Textarea
                id="remarks"
                placeholder="Explain why this revision is being initiated..."
                value={revisionData.remarks}
                onChange={(e) => setRevisionData({...revisionData, remarks: e.target.value})}
                className="min-h-[120px] border-slate-300 resize-none focus:ring-amber-500/20 bg-white !bg-white text-slate-900 !text-slate-900"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 bg-white !bg-white">
            <Button 
              variant="outline" 
              onClick={() => setIsRevisionModalOpen(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitRevision}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 gap-2"
              disabled={!revisionData.remarks || !revisionData.fromDepartment}
            >
              <Send className="h-4 w-4" />
              Submit Revision Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Document Details Modal - Now showing Revision Info */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px] border-slate-200 shadow-2xl bg-white !bg-white text-slate-900 !text-slate-900">
          <DialogHeader className="bg-white !bg-white border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl text-slate-800">
                  {selectedRecord?.documentName}
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-mono text-xs">
                  ID: {selectedRecord?.documentId} • Version: {selectedRecord?.version}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Revision Information Section */}
            {selectedRecord?.revisionRemarks ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold">
                    <RefreshCw className="h-5 w-5 animate-spin-slow" />
                    <span>Revision Request Details</span>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    {selectedRecord?.revisionType || 'General Revision'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs uppercase text-amber-600 font-bold tracking-wider">Comments / Justification</Label>
                    <p className="text-slate-700 mt-1 bg-white/50 p-3 rounded-lg border border-amber-100 italic">
                      "{selectedRecord.revisionRemarks}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-xs uppercase text-amber-600 font-bold tracking-wider">Provided By</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-700 font-medium">{selectedRecord.revisionRequestedBy}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs uppercase text-amber-600 font-bold tracking-wider">Department</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-700 font-medium">{selectedRecord.revisionRequestedDept}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-6 w-6 text-slate-400" />
                </div>
                <h4 className="text-slate-700 font-semibold">No Pending Revisions</h4>
                <p className="text-sm text-slate-500 mt-1">
                  This document is currently up-to-date with no active revision requests.
                </p>
              </div>
            )}

            {/* General Metrics Section */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <p className="text-xs text-slate-500 uppercase font-bold">Effectiveness</p>
                <p className={`text-xl font-bold mt-1 ${getScoreColor(selectedRecord?.effectivenessScore || 0)}`}>
                  {selectedRecord?.effectivenessScore}%
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <p className="text-xs text-slate-500 uppercase font-bold">Compliance</p>
                <p className="text-xl font-bold text-teal-600 mt-1">
                  {selectedRecord?.complianceRate}%
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <p className="text-xs text-slate-500 uppercase font-bold">Feedback</p>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  {selectedRecord?.feedbackCount}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 bg-white !bg-white">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsModalOpen(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
            >
              Close
            </Button>
            {isPreparator && selectedRecord?.revisionRemarks && (
              <Button 
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  if (selectedRecord.realReportId && onEditDocument) {
                    onEditDocument(selectedRecord.realReportId);
                  } else {
                    alert('Redirecting to document editor...');
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
              >
                <Edit className="h-4 w-4 mr-2" />
                Start Revision
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
