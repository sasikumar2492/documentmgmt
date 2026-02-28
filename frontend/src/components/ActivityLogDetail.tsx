import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Activity,
  FileSignature,
  User,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
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

interface ActivityLogDetailProps {
  requestId: string;
  onBack: () => void;
  reports?: ReportData[];
}

export function ActivityLogDetail({ requestId, onBack, reports = [] }: ActivityLogDetailProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 5;

  // Generate a personalized signature style based on username
  const generateSignatureStyle = (username: string): string => {
    // Convert username to a stylized signature representation
    // Remove extra spaces and convert to title case
    const cleanName = username.trim().replace(/\s+/g, ' ');
    
    // Create a cursive-style representation
    return cleanName;
  };

  // Generate activities from report data
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
      esign: `PREP/${report.uploadedBy?.toUpperCase().replace(/\s+/g, '')}/${uploadDate.replace(/\//g, '')}/001`,
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
      esign: `PREP/${report.uploadedBy?.toUpperCase().replace(/\s+/g, '')}/${uploadDate.replace(/\//g, '')}/002`,
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
        performedBy: report.returnedByName || report.assignedTo || 'Reviewer',
        role: report.returnedBy === 'approver' ? 'Approver' : 'Reviewer',
        timestamp: report.returnedDate || lastModified,
        department: department,
        details: report.remarks || 'Request rejected. Please review and resubmit with necessary corrections.',
        esign: `${report.returnedBy === 'approver' ? 'APP' : 'REV'}/${report.returnedDate || lastModified}/002`,
        status: 'completed',
      });
    } else if (report.status === 'needs-revision') {
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
        action: 'Revisions Requested',
        performedBy: report.returnedByName || report.assignedTo || 'Reviewer',
        role: report.returnedBy === 'approver' ? 'Approver' : 'Reviewer',
        timestamp: report.returnedDate || lastModified,
        department: department,
        details: report.remarks || 'Revisions requested. Please make the necessary corrections and resubmit.',
        esign: `${report.returnedBy === 'approver' ? 'APP' : 'REV'}/${report.returnedDate || lastModified}/002`,
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
      case 'needs-revision':
        return 'returned';
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

  // Find the report by requestId
  const currentReport = reports.find(
    (report) => report.id === requestId || report.requestId === requestId
  );

  // Generate activity log from current report
  let selectedLog: RequestActivityLog | null = null;
  
  if (currentReport) {
    const activities = generateActivitiesFromReport(currentReport);
    selectedLog = {
      requestId: currentReport.requestId || `REQ-${currentReport.id}`,
      fileName: currentReport.fileName || 'Unknown Document',
      documentType: currentReport.documentType || 'Approval Request',
      department: currentReport.assignedTo || currentReport.department || 'General',
      status: mapReportStatusToActivityStatus(currentReport.status),
      submittedDate: currentReport.uploadDate || new Date().toLocaleDateString(),
      lastUpdated: currentReport.lastModified || currentReport.uploadDate || new Date().toLocaleString(),
      totalActivities: activities.length,
      activities: activities,
    };
  }

  if (!selectedLog) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg border-2 border-slate-200">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Activity Log Not Found</h3>
            <p className="text-slate-600 mb-4">The requested activity log could not be found.</p>
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-md"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Activity Log
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const getActivityStatusIcon = (status: ActivityLogEntry['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = selectedLog.activities.slice(indexOfFirstActivity, indexOfLastActivity);

  const totalPages = Math.ceil(selectedLog.activities.length / activitiesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="sm"
                  className="border-indigo-300 hover:bg-indigo-100"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="h-7 w-7 text-indigo-600" />
                  Activity Timeline - {requestId}
                </h2>
              </div>
              <p className="text-slate-600">Complete activity history for this request</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Information Card */}
      <Card className="shadow-lg border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <FileText className="h-5 w-5 text-indigo-600" />
            Request Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Request ID</p>
              <p className="font-mono text-lg text-indigo-600 font-bold">{selectedLog.requestId}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">File Name</p>
              <p className="text-sm text-slate-700 font-medium">{selectedLog.fileName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Document Type</p>
              <p className="text-sm text-slate-700">{selectedLog.documentType}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Department</p>
              <Badge variant="outline" className="border-slate-300 text-slate-700">
                <Building2 className="h-3 w-3 mr-1" />
                {selectedLog.department}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Status</p>
              {getStatusBadge(selectedLog.status)}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Total Activities</p>
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">
                {selectedLog.totalActivities} Activities
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Submitted Date</p>
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <Calendar className="h-3 w-3" />
                {selectedLog.submittedDate}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Last Updated</p>
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <Clock className="h-3 w-3" />
                {selectedLog.lastUpdated}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="shadow-lg border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Activity className="h-5 w-5 text-indigo-600" />
            Activity Timeline ({selectedLog.activities.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {currentActivities.map((activity, index) => (
              <div key={activity.id} className="relative">
                {/* Timeline Line */}
                {index !== currentActivities.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-purple-300"></div>
                )}

                {/* Activity Card */}
                <div className="flex gap-4">
                  {/* Timeline Dot */}
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      {getActivityStatusIcon(activity.status)}
                    </div>
                  </div>

                  {/* Activity Content */}
                  <Card className="flex-1 border-2 border-indigo-100 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-lg mb-1">{activity.action}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {activity.performedBy}
                            </span>
                            <Badge variant="outline" className="border-purple-300 text-purple-700 text-xs">
                              {activity.role}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {activity.department}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                            <Clock className="h-3 w-3" />
                            {activity.timestamp}
                          </div>
                          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            {activity.details}
                          </p>
                          {activity.esign && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg shadow-sm">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                                    <Shield className="h-5 w-5 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileSignature className="h-4 w-4 text-green-600" />
                                    <p className="text-xs font-bold text-green-900 uppercase tracking-wide">21 CFR Part 11 Electronic Signature</p>
                                  </div>
                                  
                                  {/* Visual Signature - Username in Cursive Style */}
                                  <div className="mb-3 p-3 bg-white rounded border border-green-200">
                                    <div className="text-center">
                                      <p className="text-3xl font-signature text-indigo-700" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                                        {generateSignatureStyle(activity.performedBy)}
                                      </p>
                                      <div className="mt-1 pt-2 border-t border-slate-200">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Digitally Signed By</p>
                                        <p className="text-xs font-semibold text-slate-700">{activity.performedBy}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Signature Details */}
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-white p-2 rounded border border-green-200">
                                      <p className="text-[10px] text-green-700 font-semibold mb-0.5">Signature ID</p>
                                      <p className="font-mono text-green-900">{activity.esign}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-green-200">
                                      <p className="text-[10px] text-green-700 font-semibold mb-0.5">Role</p>
                                      <p className="font-semibold text-green-900">{activity.role}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-green-200">
                                      <p className="text-[10px] text-green-700 font-semibold mb-0.5">Timestamp</p>
                                      <p className="text-green-900">{activity.timestamp}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-green-200">
                                      <p className="text-[10px] text-green-700 font-semibold mb-0.5">Department</p>
                                      <p className="text-green-900">{activity.department}</p>
                                    </div>
                                  </div>

                                  {/* Legal Notice */}
                                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                    <p className="text-[9px] text-blue-800 leading-tight">
                                      <span className="font-semibold">Legal Notice:</span> This electronic signature is legally binding and complies with 21 CFR Part 11, ESIGN Act, and UETA. The signature is cryptographically sealed and cannot be repudiated.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <Badge
                            className={
                              activity.status === 'completed'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                                : activity.status === 'in-progress'
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
                                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md'
                            }
                          >
                            {activity.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-md"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="text-slate-600">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-md"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}