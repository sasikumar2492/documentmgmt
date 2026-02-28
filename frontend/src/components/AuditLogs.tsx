import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCcw, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Upload, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  GitBranch, 
  AlertCircle,
  Calendar,
  User,
  Building2,
  Eye,
  ChevronDown,
  ChevronUp,
  Activity,
  Shield,
  FileKey,
  ShieldCheck,
  History,
  ClipboardList
} from 'lucide-react';
import { AuditLogEntry, UserRole, ReportData } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { SignatureDetailsModal } from './SignatureDetailsModal';
import { DocuSignViewer } from './DocuSignViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ActivityLogTable } from './ActivityLogTable';

interface AuditLogsProps {
  auditLogs: AuditLogEntry[];
  reports: ReportData[];
  onRefresh?: () => void;
  onExport?: () => void;
  filterRequestId?: string | null;
  onViewActivityDetail?: (requestId: string) => void;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ 
  auditLogs,
  reports,
  onRefresh,
  onExport,
  filterRequestId,
  onViewActivityDetail
}) => {
  const [activeTab, setActiveTab] = useState('audit');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntityType, setFilterEntityType] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // Signature modal state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<{
    signature: any;
    entityId: string;
    actionDescription: string;
  } | null>(null);

  const handleViewSignature = (log: AuditLogEntry) => {
    if (log.signature) {
      setSelectedSignature({
        signature: log.signature,
        entityId: log.entityId,
        actionDescription: log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      });
      setIsSignatureModalOpen(true);
    }
  };

  // Get action icon and color
  const getActionIcon = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'document_uploaded':
        return <Upload className="h-4 w-4 text-blue-500" />;
      case 'request_submitted':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'request_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'request_rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'status_changed':
        return <RefreshCcw className="h-4 w-4 text-orange-500" />;
      case 'template_created':
        return <FileText className="h-4 w-4 text-indigo-500" />;
      case 'workflow_approved':
        return <GitBranch className="h-4 w-4 text-teal-500" />;
      case 'form_edited':
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case 'user_login':
        return <UserPlus className="h-4 w-4 text-cyan-500" />;
      case 'user_logout':
        return <UserMinus className="h-4 w-4 text-gray-500" />;
      case 'template_deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'request_deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get action badge color
  const getActionBadgeClass = (action: AuditLogEntry['action']): string => {
    switch (action) {
      case 'request_approved':
      case 'workflow_approved':
        return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-md hover:shadow-lg';
      case 'request_rejected':
      case 'template_deleted':
      case 'request_deleted':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-md hover:shadow-lg';
      case 'status_changed':
        return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-md hover:shadow-lg';
      case 'form_edited':
        return 'bg-gradient-to-r from-yellow-500 to-orange-400 text-white border-0 shadow-md hover:shadow-lg';
      case 'document_uploaded':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-md hover:shadow-lg';
      case 'request_submitted':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 shadow-md hover:shadow-lg';
      case 'template_created':
        return 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-md hover:shadow-lg';
      case 'user_login':
        return 'bg-gradient-to-r from-cyan-500 to-blue-400 text-white border-0 shadow-md hover:shadow-lg';
      default:
        return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white border-0 shadow-md hover:shadow-lg';
    }
  };

  // Get entity type icon
  const getEntityTypeIcon = (entityType: AuditLogEntry['entityType']) => {
    switch (entityType) {
      case 'document':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'request':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'template':
        return <FileText className="h-4 w-4 text-indigo-600" />;
      case 'workflow':
        return <GitBranch className="h-4 w-4 text-teal-600" />;
      case 'user':
        return <User className="h-4 w-4 text-orange-600" />;
      case 'system':
        return <Shield className="h-4 w-4 text-slate-600" />;
      default:
        return <FileText className="h-4 w-4 text-slate-600" />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    // Request ID filter (highest priority - if filtering by request ID, only show those logs)
    if (filterRequestId && log.requestId !== filterRequestId) return false;

    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      log.user.toLowerCase().includes(searchLower) ||
      log.entityName.toLowerCase().includes(searchLower) ||
      log.details.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      (log.requestId || '').toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Entity type filter
    if (filterEntityType !== 'all' && log.entityType !== filterEntityType) return false;

    // Department filter
    if (filterDepartment !== 'all' && log.department !== filterDepartment) return false;

    // Date range filter
    if (filterDateRange !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - logDate.getTime();
      const diffDays = Math.floor(diffMs / 86400000);

      switch (filterDateRange) {
        case 'today':
          if (diffDays > 0) return false;
          break;
        case 'week':
          if (diffDays > 7) return false;
          break;
        case 'month':
          if (diffDays > 30) return false;
          break;
      }
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-10 left-10 w-2 h-2 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
        <div className="absolute top-20 right-20 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
        <div className="absolute top-40 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '4.5s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-teal-400 rounded-full animate-ping" style={{ animationDelay: '1.5s', animationDuration: '5s' }}></div>
        <div className="absolute top-60 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '2.5s', animationDuration: '4.5s' }}></div>
      </div>

      {/* Tabs System - Now the primary view */}
      <Tabs defaultValue="audit" value={activeTab} onValueChange={setActiveTab} className="w-full relative z-10">
        <TabsList className="bg-white/80 backdrop-blur-md border border-slate-200 p-1 rounded-2xl shadow-sm mb-6 w-fit">
          <TabsTrigger value="audit" className="rounded-xl px-6 py-2 gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
            <History className="h-4 w-4" />
            System Audit Logs
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-xl px-6 py-2 gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
            <ClipboardList className="h-4 w-4" />
            Request Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6 mt-0">
          {/* Filters and Search */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    type="text"
                    placeholder="Search logs (user, action, entity)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-xl"
                  />
                </div>

                <div className="w-48">
                  <Select value={filterEntityType} onValueChange={setFilterEntityType}>
                    <SelectTrigger className="border-slate-200 rounded-xl bg-white">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl shadow-xl border-slate-100">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="request">Request</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="workflow">Workflow</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-48">
                  <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                    <SelectTrigger className="border-slate-200 rounded-xl bg-white">
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl shadow-xl border-slate-100">
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={onRefresh}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm"
                    title="Refresh Logs"
                  >
                    <RefreshCcw className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={onExport}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm"
                    title="Export Data"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card className="bg-white border-0 shadow-lg overflow-hidden rounded-2xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                  <TableHead className="w-12 text-center"></TableHead>
                  <TableHead className="font-bold text-slate-700">Timestamp</TableHead>
                  <TableHead className="font-bold text-slate-700">Action</TableHead>
                  <TableHead className="font-bold text-slate-700">User</TableHead>
                  <TableHead className="font-bold text-slate-700">Entity</TableHead>
                  <TableHead className="font-bold text-slate-700">Details</TableHead>
                  <TableHead className="w-12 text-right pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20 text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <Activity className="h-10 w-10 opacity-20" />
                        <p className="font-medium">No audit logs found matching your criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.flatMap((log) => {
                    const rows = [
                      <TableRow key={log.id} className="hover:bg-blue-50/30 transition-all border-b border-slate-50 group">
                        <TableCell className="text-center">
                          <div className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                            {getActionIcon(log.action)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{formatTimestamp(log.timestamp)}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getActionBadgeClass(log.action)} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                          {log.signature && (
                            <div className="mt-1">
                              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 cursor-pointer text-[10px]" onClick={() => handleViewSignature(log)}>
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Electronically Signed
                              </Badge>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border-2 border-white shadow-sm">
                              {log.user.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-800 leading-none">{log.user}</span>
                              <span className="text-[10px] text-slate-500 capitalize">{log.userRole}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400">
                              {getEntityTypeIcon(log.entityType)}
                            </div>
                            <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]" title={log.entityName}>{log.entityName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500 line-clamp-1 max-w-[250px]" title={log.details}>{log.details}</span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                            className="h-8 w-8 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            {expandedLogId === log.id ? <ChevronUp className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ];

                    if (expandedLogId === log.id) {
                      rows.push(
                        <TableRow key={`${log.id}-detail`} className="bg-blue-50/20 hover:bg-blue-50/20 border-b border-slate-100">
                          <TableCell colSpan={7} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Action</label>
                                <p className="text-sm font-bold text-slate-800 capitalize">{log.action.replace(/_/g, ' ')}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IP Address</label>
                                <p className="text-sm font-mono text-slate-600">{log.ipAddress || 'Not recorded'}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entity Metadata</label>
                                <p className="text-xs font-medium text-slate-600 truncate">{log.entityId}</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</label>
                                <p className="text-sm font-bold text-blue-600 capitalize">{log.department || 'General'}</p>
                              </div>
                              <div className="lg:col-span-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">System Details</label>
                                <p className="text-sm text-slate-700 leading-relaxed">{log.details}</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return rows;
                  })
                )}
              </TableBody>
            </Table>
            
            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Page {currentPage} of {totalPages}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentPage(c => Math.max(1, c-1))} disabled={currentPage === 1} className="h-8 rounded-lg">Prev</Button>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentPage(c => Math.min(totalPages, c+1))} disabled={currentPage === totalPages} className="h-8 rounded-lg">Next</Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <ActivityLogTable 
            reports={reports} 
            onViewDetail={onViewActivityDetail}
          />
        </TabsContent>
      </Tabs>

      {/* Signature Details Modal */}
      <DocuSignViewer
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        signature={selectedSignature?.signature}
        entityId={selectedSignature?.entityId}
        actionDescription={selectedSignature?.actionDescription}
        documentName={selectedSignature ? `${selectedSignature.actionDescription} - Document` : 'Document'}
      />
    </div>
  );
};
