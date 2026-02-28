import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  ChevronDown,
  ChevronUp,
  Activity,
  FileSignature,
  User,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Upload,
  Send,
  UserCheck,
  CheckCircle,
  XCircle,
  Search,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ReportData } from '../types';

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

interface RequestActivityLog {
  requestId: string;
  fileName: string;
  documentType: string;
  department: string;
  status: 'pending' | 'in-review' | 'approved' | 'rejected' | 'returned';
  submittedDate: string;
  lastUpdated: string;
  totalActivities: number;
  activities: ActivityLogEntry[];
}

interface ActivityLogTableProps {
  onViewDetail?: (requestId: string) => void;
  reports?: ReportData[];
  onExport?: () => void;
}

export function ActivityLogTable({ onViewDetail, reports = [], onExport }: ActivityLogTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDocType, setFilterDocType] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Generate activity logs from reports data
  const generateActivitiesFromReport = (report: ReportData): ActivityLogEntry[] => {
    const activities: ActivityLogEntry[] = [];
    const department = report.assignedTo || report.department || 'General';
    const fileName = report.fileName || 'Unknown Document';
    const uploadDate = report.uploadDate || new Date().toLocaleDateString();
    const lastModified = report.lastModified || uploadDate;
    
    // Activity 1: Document Uploaded (First)
    activities.push({
      id: `ACT-${report.id}-01`,
      action: 'Document Uploaded',
      performedBy: report.uploadedBy || 'System User',
      role: 'Preparator',
      timestamp: uploadDate,
      department: department,
      details: `Document successfully uploaded to system. File: ${fileName}, Size: ${report.fileSize || 'N/A'}`,
      status: 'completed',
    });

    // Activity 2: Request Created (Second)
    activities.push({
      id: `ACT-${report.id}-02`,
      action: 'Request Created',
      performedBy: report.uploadedBy || 'System User',
      role: 'Preparator',
      timestamp: uploadDate,
      department: department,
      details: `Approval request created for ${fileName}. Request initiated for processing.`,
      esign: `SYS/${uploadDate}/001`,
      status: 'completed',
    });

    // Add status-specific activities
    if (report.status === 'submitted' || report.status === 'pending') {
      activities.push({
        id: `ACT-${report.id}-03`,
        action: 'Awaiting Reviewer Approval',
        performedBy: 'System',
        role: 'System',
        timestamp: lastModified,
        department: department,
        details: 'Request submitted and awaiting reviewer approval.',
        status: 'pending',
      });
    } else if (report.status === 'initial-review' || report.status === 'review-process') {
      activities.push({
        id: `ACT-${report.id}-03`,
        action: 'Reviewer Assigned',
        performedBy: 'System Auto-Assignment',
        role: 'System',
        timestamp: uploadDate,
        department: department,
        details: `Assigned ${report.assignedTo || 'reviewer'} based on department rules`,
        status: 'completed',
      });
      activities.push({
        id: `ACT-${report.id}-04`,
        action: 'Review in Progress',
        performedBy: report.assignedTo || 'Reviewer',
        role: 'Reviewer',
        timestamp: lastModified,
        department: department,
        details: `Currently reviewing ${fileName}. Technical validation in progress.`,
        esign: `REV/${lastModified}/001`,
        status: 'in-progress',
      });
    } else if (report.status === 'approved') {
      activities.push({
        id: `ACT-${report.id}-03`,
        action: 'Reviewer Assigned',
        performedBy: 'System Auto-Assignment',
        role: 'System',
        timestamp: uploadDate,
        department: department,
        details: `Assigned ${report.assignedTo || 'reviewer'} based on department rules`,
        status: 'completed',
      });
      activities.push({
        id: `ACT-${report.id}-04`,
        action: 'Review Completed',
        performedBy: report.assignedTo || 'Reviewer',
        role: 'Reviewer',
        timestamp: lastModified,
        department: department,
        details: `Review completed successfully. Recommended for final approval.`,
        esign: `REV/${lastModified}/001`,
        status: 'completed',
      });
      activities.push({
        id: `ACT-${report.id}-05`,
        action: 'Final Approval',
        performedBy: report.assignedTo || 'Approver',
        role: 'Approver',
        timestamp: lastModified,
        department: department,
        details: `${fileName} has been fully approved. Request completed.`,
        esign: `APP/${lastModified}/001`,
        status: 'completed',
      });
    } else if (report.status === 'rejected') {
      activities.push({
        id: `ACT-${report.id}-03`,
        action: 'Reviewer Assigned',
        performedBy: 'System Auto-Assignment',
        role: 'System',
        timestamp: uploadDate,
        department: department,
        details: `Assigned ${report.assignedTo || 'reviewer'} based on department rules`,
        status: 'completed',
      });
      activities.push({
        id: `ACT-${report.id}-04`,
        action: 'Review Started',
        performedBy: report.assignedTo || 'Reviewer',
        role: 'Reviewer',
        timestamp: lastModified,
        department: department,
        details: `Started review of ${fileName}`,
        esign: `REV/${lastModified}/001`,
        status: 'completed',
      });
      activities.push({
        id: `ACT-${report.id}-05`,
        action: 'Request Rejected',
        performedBy: report.assignedTo || 'Reviewer',
        role: 'Reviewer',
        timestamp: lastModified,
        department: department,
        details: report.remarks || 'Request rejected. Please review and resubmit with necessary corrections.',
        esign: `REV/${lastModified}/002`,
        status: 'completed',
      });
    }

    return activities;
  };

  // Map report status to activity log status
  const mapReportStatusToActivityStatus = (reportStatus?: string): RequestActivityLog['status'] => {
    if (!reportStatus) return 'pending';
    
    switch (reportStatus) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'initial-review':
      case 'review-process':
      case 'final-review':
        return 'in-review';
      case 'submitted':
      case 'pending':
      default:
        return 'pending';
    }
  };

  // Generate activity logs from reports
  const allActivityLogs: RequestActivityLog[] = reports.map((report) => {
    const activities = generateActivitiesFromReport(report);
    
    return {
      requestId: report.requestId || `REQ-${report.id}`,
      fileName: report.fileName || 'Unknown Document',
      documentType: report.documentType || 'Approval Request',
      department: report.assignedTo || report.department || 'General',
      status: mapReportStatusToActivityStatus(report.status),
      submittedDate: report.uploadDate || new Date().toLocaleDateString(),
      lastUpdated: report.lastModified || report.uploadDate || new Date().toLocaleString(),
      totalActivities: activities.length,
      activities: activities,
    };
  });

  // Extract unique values for filters
  const uniqueDocTypes = Array.from(new Set(allActivityLogs.map(log => log.documentType)));
  const uniqueDepts = Array.from(new Set(allActivityLogs.map(log => log.department)));

  // Apply filtering
  const filteredLogs = allActivityLogs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      log.requestId.toLowerCase().includes(searchLower) ||
      log.fileName.toLowerCase().includes(searchLower)
    );
    
    const matchesDocType = filterDocType === 'all' || log.documentType === filterDocType;
    const matchesDept = filterDept === 'all' || log.department === filterDept;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

    return matchesSearch && matchesDocType && matchesDept && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstRecord, indexOfLastRecord);

  const toggleRow = (requestId: string) => {
    setSelectedRequest((prev) => (prev === requestId ? null : requestId));
  };

  const getStatusBadge = (status: RequestActivityLog['status']) => {
    const styles = {
      pending: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md',
      'in-review': 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md',
      approved: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md',
      rejected: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md',
      returned: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md',
    };
    return <Badge className={styles[status]}>{status.replace('-', ' ').toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search Row */}
      <Card className="bg-white border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                type="text"
                placeholder="Search Request ID or File..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-xl"
              />
            </div>

            <div className="w-44">
              <Select value={filterDocType} onValueChange={setFilterDocType}>
                <SelectTrigger className="border-slate-200 rounded-xl bg-white">
                  <SelectValue placeholder="Doc Type" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl shadow-xl border-slate-100">
                  <SelectItem value="all">All Doc Types</SelectItem>
                  {uniqueDocTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-44">
              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger className="border-slate-200 rounded-xl bg-white">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl shadow-xl border-slate-100">
                  <SelectItem value="all">All Depts</SelectItem>
                  {uniqueDepts.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-44">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="border-slate-200 rounded-xl bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl shadow-xl border-slate-100">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-review">In-Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
        </CardContent>
      </Card>

      {/* Activity Log Table */}
      <Card className="shadow-lg border-0 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Request ID</th>
                <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">File Name</th>
                <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Document Type</th>
                <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Department</th>
                <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Activities</th>
                <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Last Updated</th>
                <th className="text-right p-4 text-xs font-bold text-slate-700 uppercase tracking-wider pr-8">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log) => (
                <tr key={log.requestId} className="border-b border-slate-50 hover:bg-blue-50/30 transition-all group">
                  <td className="p-4">
                    <span className="font-mono text-sm text-blue-600 font-bold">{log.requestId}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-bold text-slate-700">{log.fileName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {log.documentType}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                      <Building2 className="h-3.5 w-3.5" />
                      {log.department}
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="p-4 text-center">
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-sm px-3 py-1 rounded-full text-[10px] font-bold">
                      {log.totalActivities}
                    </Badge>
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {log.lastUpdated}
                    </div>
                  </td>
                  <td className="p-4 text-right pr-8">
                    <Button
                      size="sm"
                      onClick={() => {
                        toggleRow(log.requestId);
                        if (onViewDetail) onViewDetail(log.requestId);
                      }}
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-20 bg-white">
            <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4 opacity-50" />
            <h3 className="text-sm font-bold text-slate-400">No matching activity logs found</h3>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredLogs.length > 0 && (
          <div className="p-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredLogs.length)} of {filteredLogs.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-lg border-slate-200 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 p-0 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page 
                        ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                        : "border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-lg border-slate-200 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Activity Details View */}
      {selectedRequest && (
        <Card className="shadow-xl border-0 bg-white rounded-2xl overflow-hidden mt-6 animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-slate-800 text-lg">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                  <Activity className="h-5 w-5" />
                </div>
                Timeline: {selectedRequest}
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedRequest(null)}
                className="rounded-xl hover:bg-slate-100 text-slate-500"
              >
                Close View
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {(() => {
              const selectedLog = filteredLogs.find((log) => log.requestId === selectedRequest);
              if (!selectedLog) return null;

              return (
                <div className="space-y-8">
                  {/* Timeline */}
                  <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {selectedLog.activities.map((activity, index) => (
                      <div key={activity.id} className="relative">
                        {/* Dot */}
                        <div className={`absolute -left-8 top-1 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 ${
                          activity.status === 'completed' ? 'bg-emerald-500' : 
                          activity.status === 'in-progress' ? 'bg-blue-500' : 'bg-amber-500'
                        }`}>
                          {activity.status === 'completed' ? <CheckCircle className="h-4 w-4 text-white" /> : 
                           activity.status === 'in-progress' ? <Clock className="h-4 w-4 text-white" /> : 
                           <AlertCircle className="h-4 w-4 text-white" />}
                        </div>

                        <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 hover:border-blue-200 transition-all hover:bg-white hover:shadow-lg group">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-slate-800 text-base">{activity.action}</h4>
                                <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-0 uppercase tracking-tighter ${
                                  activity.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                                  activity.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {activity.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {activity.performedBy} ({activity.role})
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {activity.timestamp}
                                </span>
                              </div>
                            </div>

                            {activity.esign && (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                                <FileSignature className="h-4 w-4" />
                                <div className="text-[10px]">
                                  <p className="font-bold leading-none mb-0.5">E-SIGNED</p>
                                  <p className="font-mono opacity-80">{activity.esign}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="bg-white/80 rounded-xl p-4 border border-slate-50 text-sm text-slate-600 leading-relaxed shadow-sm group-hover:shadow-md transition-all">
                            {activity.details}
                          </div>
                          
                          <div className="mt-4 flex items-center gap-2">
                             <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               <Building2 className="h-3 w-3" />
                               {activity.department}
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
