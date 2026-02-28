import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  FileText,
  MessageSquare,
  Calendar,
  AlertCircle,
  Eye,
  Edit,
  Send,
  CheckCircle2,
  User,
  Clock,
  XCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { UserRole } from '../types';

interface RemarkedDocument {
  id: string;
  requestId: string;
  fileName: string;
  documentType: string;
  returnedBy: 'reviewer' | 'approver';
  returnedByName: string;
  returnedDate: string;
  remarks: string;
  status: 'needs-revision' | 'rejected';
  originalSubmissionDate: string;
  department?: string;
}

interface RemarksInboxProps {
  onViewForm?: (requestId: string) => void;
  onEditForm?: (requestId: string) => void;
  reports: any[]; // Array of ReportData from App.tsx
  currentUsername: string; // Current logged in user
  userRole?: UserRole;
}

export function RemarksInbox({ onViewForm, onEditForm, reports, currentUsername, userRole }: RemarksInboxProps) {
  // Check if current user is a reviewer or approver (including demo roles)
  const isReviewer = (userRole || '').toLowerCase().includes('reviewer');
  const isApprover = (userRole || '').toLowerCase().includes('approver');

  const [activeTab, setActiveTab] = useState<'reviewer' | 'approver'>(isApprover ? 'approver' : 'reviewer');

  // Filter reports that have been rejected or need revision AND belong to current user
  const remarkedDocuments: RemarkedDocument[] = reports
    .filter(report => 
      (report.status === 'rejected' || report.status === 'needs-revision') && 
      report.returnedByName && // Only show if someone has returned it
      report.fromUser === currentUsername // Only show documents submitted by current user
    )
    .map(report => ({
      id: report.id,
      requestId: report.requestId,
      fileName: report.fileName,
      documentType: report.documentType || 'Request',
      returnedBy: report.returnedBy || 'reviewer',
      returnedByName: report.returnedByName || 'Unknown',
      returnedDate: report.returnedDate || report.lastModified,
      remarks: report.remarks || 'No remarks provided',
      status: report.status as 'needs-revision' | 'rejected',
      originalSubmissionDate: report.uploadDate,
      department: report.department
    }));

  // Filter documents by reviewer or approver
  const reviewerRemarks = remarkedDocuments.filter(doc => doc.returnedBy === 'reviewer');
  const approverRemarks = remarkedDocuments.filter(doc => doc.returnedBy === 'approver');

  const renderRemarksTable = (documents: RemarkedDocument[], emptyMessage: string) => {
    if (documents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No Remarks Found
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
              <TableHead className="font-semibold text-slate-700">Returned By</TableHead>
              <TableHead className="font-semibold text-slate-700">Returned Date</TableHead>
              <TableHead className="font-semibold text-slate-700">Submitted Date</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id} className="hover:bg-slate-50 transition-colors">
                {/* Request ID */}
                <TableCell>
                  <span className="font-mono text-sm text-blue-600 font-medium">
                    {doc.requestId}
                  </span>
                </TableCell>

                {/* Document Name */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate" title={doc.fileName}>
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-slate-500">{doc.documentType}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Department */}
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className="bg-cyan-50 text-cyan-700 border-cyan-300 font-medium"
                  >
                    {doc.department || 'N/A'}
                  </Badge>
                </TableCell>

                {/* Returned By */}
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-slate-700 font-medium">{doc.returnedByName}</span>
                  </div>
                </TableCell>

                {/* Returned Date */}
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{doc.returnedDate}</span>
                  </div>
                </TableCell>

                {/* Submitted Date */}
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{doc.originalSubmissionDate}</span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge 
                    className={
                      doc.status === 'needs-revision'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium'
                        : 'bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium'
                    }
                  >
                    {doc.status === 'needs-revision' ? (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Needs Revision
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </>
                    )}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {/* View Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewForm?.(doc.requestId)}
                      className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                      title="View Document"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>

                    {/* Edit Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditForm?.(doc.requestId)}
                      className="h-8 px-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1"
                      title="Edit Document"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Remarks Inbox
            </h1>
            <p className="text-slate-600 mt-1">
              Review feedback and revise documents returned by reviewers and approvers
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={`grid grid-cols-1 ${(isReviewer || isApprover) ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 mb-6`}>
        {/* Total Remarks Card */}
        <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-purple-700 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Total Remarks
                </CardTitle>
                <p className="text-sm text-purple-600 mt-1">Pending your action</p>
              </div>
              <div className="text-3xl font-bold text-purple-700">
                {isReviewer ? reviewerRemarks.length : isApprover ? approverRemarks.length : remarkedDocuments.length}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Reviewer Remarks Card - Hidden for Approvers */}
        {!isApprover && (
          <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-700 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Reviewer Remarks
                  </CardTitle>
                  <p className="text-sm text-blue-600 mt-1">From reviewers</p>
                </div>
                <div className="text-3xl font-bold text-blue-700">
                  {reviewerRemarks.length}
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Approver Remarks Card - Hidden for Reviewers */}
        {!isReviewer && (
          <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-orange-700 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Approver Remarks
                  </CardTitle>
                  <p className="text-sm text-orange-600 mt-1">From approvers</p>
                </div>
                <div className="text-3xl font-bold text-orange-700">
                  {approverRemarks.length}
                </div>
              </div>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Tabs for Reviewer and Approver Remarks */}
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'reviewer' | 'approver')}>
            <div className="border-b border-slate-200 px-6 pt-6">
              <TabsList className={`grid w-full ${(isReviewer || isApprover) ? 'max-w-xs grid-cols-1' : 'max-w-md grid-cols-2'}`}>
                {!isApprover && (
                  <TabsTrigger 
                    value="reviewer" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Reviewer Remarks ({reviewerRemarks.length})
                  </TabsTrigger>
                )}
                
                {!isReviewer && (
                  <TabsTrigger 
                    value="approver"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approver Remarks ({approverRemarks.length})
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Reviewer Remarks Tab Content - Hidden for Approvers */}
            {!isApprover && (
              <TabsContent value="reviewer" className="mt-0 p-6">
                {renderRemarksTable(
                  reviewerRemarks,
                  'No remarks from reviewers at this time. All your submissions are either approved or under review.'
                )}
              </TabsContent>
            )}

            {/* Approver Remarks Tab Content - Hidden for Reviewers */}
            {!isReviewer && (
              <TabsContent value="approver" className="mt-0 p-6">
                {renderRemarksTable(
                  approverRemarks,
                  'No remarks from approvers at this time. All your submissions are either approved or under review.'
                )}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
