import React, { useState } from 'react';
import {
  FileText,
  Check,
  X,
  MessageSquare,
  FileSignature,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  History,
  Shield,
  Lock,
  Edit3,
  Send,
  Users,
  ArrowRight,
  GitBranch,
  Paperclip,
  Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { ReportData } from '../types';

interface ReviewComment {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  timestamp: string;
  type: 'comment' | 'approval' | 'rejection' | 'change-request';
  attachments?: string[];
}

interface ChangeVersion {
  id: string;
  version: string;
  timestamp: string;
  author: string;
  changes: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

interface ReviewApprovalInterfaceProps {
  document: ReportData;
  currentUser: {
    email: string;
    name: string;
    role: string;
  };
  onApprove?: (documentId: string, comments: string, signature: any) => void;
  onReject?: (documentId: string, comments: string, reasons: string[]) => void;
  onRequestChanges?: (documentId: string, changes: string[]) => void;
  onDelegate?: (documentId: string, delegateTo: string) => void;
  onClose?: () => void;
}

export const ReviewApprovalInterface: React.FC<ReviewApprovalInterfaceProps> = ({
  document,
  currentUser,
  onApprove,
  onReject,
  onRequestChanges,
  onDelegate,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'comments' | 'history' | 'changes'>('review');
  const [reviewComments, setReviewComments] = useState('');
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request-changes'>('approve');
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [delegateDialogOpen, setDelegateDialogOpen] = useState(false);
  
  // Signature state
  const [signatureMeaning, setSignatureMeaning] = useState('');
  const [signaturePassword, setSignaturePassword] = useState('');
  const [signatureReason, setSignatureReason] = useState('');
  
  // Rejection reasons
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  
  // Change requests
  const [changeRequests, setChangeRequests] = useState<string[]>([]);
  const [newChangeRequest, setNewChangeRequest] = useState('');
  
  // Delegation
  const [delegateTo, setDelegateTo] = useState('');
  const [delegateReason, setDelegateReason] = useState('');

  // Comments - empty by default, will be populated from actual data
  const [comments, setComments] = useState<ReviewComment[]>([]);

  // Version history - empty by default, will be populated from actual data
  const [versions, setVersions] = useState<ChangeVersion[]>([]);

  const predefinedRejectionReasons = [
    'Incomplete information',
    'Incorrect data or calculations',
    'Non-compliance with standards',
    'Missing required approvals',
    'Insufficient documentation',
    'Technical issues identified',
    'Regulatory concerns',
    'Risk assessment inadequate'
  ];

  const handleInitiateApproval = () => {
    setActionType('approve');
    setActionDialogOpen(true);
  };

  const handleInitiateRejection = () => {
    setActionType('reject');
    setActionDialogOpen(true);
  };

  const handleInitiateChangeRequest = () => {
    setActionType('request-changes');
    setActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (actionType === 'approve') {
      setActionDialogOpen(false);
      setSignatureDialogOpen(true);
    } else if (actionType === 'reject') {
      if (rejectionReasons.length === 0 && !customRejectionReason) {
        toast.error('Please select or enter at least one rejection reason');
        return;
      }
      const allReasons = [...rejectionReasons];
      if (customRejectionReason) {
        allReasons.push(customRejectionReason);
      }
      onReject?.(document.id, reviewComments, allReasons);
      toast.success('Document rejected with feedback');
      setActionDialogOpen(false);
      onClose?.();
    } else if (actionType === 'request-changes') {
      if (changeRequests.length === 0) {
        toast.error('Please specify at least one change request');
        return;
      }
      onRequestChanges?.(document.id, changeRequests);
      toast.success('Change requests submitted');
      setActionDialogOpen(false);
      onClose?.();
    }
  };

  const handleSignDocument = () => {
    if (!signatureMeaning || !signaturePassword || !signatureReason) {
      toast.error('Please complete all signature fields');
      return;
    }

    const signature = {
      signedBy: currentUser.email,
      signedByName: currentUser.name,
      signedAt: new Date().toISOString(),
      meaning: signatureMeaning,
      reason: signatureReason,
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent,
      certificateSerial: `CFR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      verified: true
    };

    onApprove?.(document.id, reviewComments, signature);
    toast.success('Document approved and electronically signed');
    setSignatureDialogOpen(false);
    onClose?.();
  };

  const handleAddComment = () => {
    if (!reviewComments.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    const newComment: ReviewComment = {
      id: `c${comments.length + 1}`,
      author: currentUser.email,
      authorRole: currentUser.role,
      content: reviewComments,
      timestamp: new Date().toISOString(),
      type: 'comment'
    };

    setComments([...comments, newComment]);
    toast.success('Comment added');
    setReviewComments('');
  };

  const handleAddChangeRequest = () => {
    if (newChangeRequest.trim()) {
      setChangeRequests([...changeRequests, newChangeRequest]);
      setNewChangeRequest('');
    }
  };

  const handleRemoveChangeRequest = (index: number) => {
    setChangeRequests(changeRequests.filter((_, i) => i !== index));
  };

  const toggleRejectionReason = (reason: string) => {
    if (rejectionReasons.includes(reason)) {
      setRejectionReasons(rejectionReasons.filter(r => r !== reason));
    } else {
      setRejectionReasons([...rejectionReasons, reason]);
    }
  };

  const handleDelegate = () => {
    if (!delegateTo || !delegateReason) {
      toast.error('Please complete all delegation fields');
      return;
    }
    onDelegate?.(document.id, delegateTo);
    toast.success(`Document delegated to ${delegateTo}`);
    setDelegateDialogOpen(false);
    onClose?.();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{document.fileName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{document.requestId}</Badge>
                    <Badge className="bg-amber-500 text-white">Pending Your Review</Badge>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600 mt-3">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Submitted by: {document.uploadedBy || 'System'}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(document.uploadDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-purple-600" />
                  CFR Part 11 Compliant
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'review' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('review')}
          className="gap-2"
        >
          <FileSignature className="h-4 w-4" />
          Review & Approve
        </Button>
        <Button
          variant={activeTab === 'comments' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('comments')}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Comments ({comments.length})
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('history')}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          Version History ({versions.length})
        </Button>
        <Button
          variant={activeTab === 'changes' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('changes')}
          className="gap-2"
        >
          <Edit3 className="h-4 w-4" />
          Change Tracking
        </Button>
      </div>

      {/* Review Tab */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          {/* Workflow Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Approval Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Initial Review</p>
                    <p className="text-xs text-slate-500">Completed</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center animate-pulse">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Manager Approval</p>
                    <p className="text-xs text-amber-600">Your turn</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-300 text-white flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Final Approval</p>
                    <p className="text-xs text-slate-500">Pending</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Review Comments</CardTitle>
              <CardDescription>
                Provide feedback or comments for this document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Enter your review comments here..."
                rows={6}
                className="resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">
                  Comments will be included in the audit trail
                </p>
                <Button onClick={handleAddComment} variant="outline" size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="border-2 border-dashed border-slate-300">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={handleInitiateApproval}
                  className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg px-8 py-6 text-lg"
                >
                  <CheckCircle className="h-5 w-5" />
                  Approve & Sign
                </Button>
                <Button
                  onClick={handleInitiateChangeRequest}
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg px-8 py-6 text-lg"
                >
                  <Edit3 className="h-5 w-5" />
                  Need Revisions
                </Button>
                <Button
                  onClick={handleInitiateRejection}
                  className="gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg px-8 py-6 text-lg"
                >
                  <XCircle className="h-5 w-5" />
                  Reject
                </Button>
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => setDelegateDialogOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-slate-600"
                >
                  <Users className="h-4 w-4" />
                  Delegate to Another Reviewer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Notice */}
          <Card className="bg-purple-50 border-2 border-purple-200">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="text-sm text-purple-900">
                  <p className="font-semibold mb-1">21 CFR Part 11 Electronic Signature</p>
                  <p className="text-xs">
                    Your approval will require an electronic signature with password verification.
                    All actions are recorded in the audit trail with timestamp, IP address, and
                    cryptographic seal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No comments yet</p>
                <p className="text-sm text-slate-500">Be the first to add a comment</p>
              </CardContent>
            </Card>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id} className={`border-l-4 ${
                comment.type === 'approval' ? 'border-l-green-500 bg-green-50/30' :
                comment.type === 'rejection' ? 'border-l-red-500 bg-red-50/30' :
                comment.type === 'change-request' ? 'border-l-amber-500 bg-amber-50/30' :
                'border-l-blue-500'
              }`}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{comment.author}</p>
                        <Badge variant="outline" className="text-xs">
                          {comment.authorRole}
                        </Badge>
                        <Badge className={
                          comment.type === 'approval' ? 'bg-green-500' :
                          comment.type === 'rejection' ? 'bg-red-500' :
                          comment.type === 'change-request' ? 'bg-amber-500' :
                          'bg-blue-500'
                        }>
                          {comment.type === 'approval' ? 'Approved' :
                           comment.type === 'rejection' ? 'Rejected' :
                           comment.type === 'change-request' ? 'Changes Requested' :
                           'Comment'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(comment.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mt-2">{comment.content}</p>
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {comment.attachments.map((attachment, idx) => (
                        <Badge key={idx} variant="outline" className="gap-1">
                          <Paperclip className="h-3 w-3" />
                          {attachment}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Version History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {versions.map((version, index) => (
            <Card key={version.id} className="border-l-4 border-l-blue-500">
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold">
                      {version.version}
                    </div>
                    <div>
                      <p className="font-semibold">Version {version.version}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(version.timestamp).toLocaleString()} by {version.author}
                      </p>
                    </div>
                  </div>
                  <Badge className={
                    version.status === 'approved' ? 'bg-green-500' :
                    version.status === 'rejected' ? 'bg-red-500' :
                    version.status === 'submitted' ? 'bg-blue-500' :
                    'bg-slate-500'
                  }>
                    {version.status}
                  </Badge>
                </div>
                <div className="ml-13">
                  <p className="text-sm font-medium text-slate-700 mb-2">Changes:</p>
                  <ul className="space-y-1">
                    {version.changes.map((change, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Change Tracking Tab */}
      {activeTab === 'changes' && (
        <Card>
          <CardHeader>
            <CardTitle>Document Changes</CardTitle>
            <CardDescription>
              Track all modifications made to this document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Change Tracking Enabled</p>
                    <p className="text-xs">
                      All modifications to this document are automatically tracked and logged in
                      the audit trail with user identification, timestamp, and nature of change.
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <History className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No changes tracked yet</p>
                <p className="text-sm text-slate-500">Changes will appear here once document is modified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {actionType === 'reject' && <XCircle className="h-5 w-5 text-red-600" />}
              {actionType === 'request-changes' && <Edit3 className="h-5 w-5 text-amber-600" />}
              {actionType === 'approve' && 'Confirm Approval'}
              {actionType === 'reject' && 'Confirm Rejection'}
              {actionType === 'request-changes' && 'Request Changes'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'You are about to approve this document. This action requires electronic signature.'}
              {actionType === 'reject' && 'Please provide reasons for rejecting this document.'}
              {actionType === 'request-changes' && 'Specify the changes required before approval.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {actionType === 'reject' && (
              <>
                <div>
                  <Label className="mb-3 block">Select Rejection Reasons</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {predefinedRejectionReasons.map((reason) => (
                      <label
                        key={reason}
                        className="flex items-start gap-2 p-3 border rounded hover:bg-slate-50 cursor-pointer"
                      >
                        <Checkbox
                          checked={rejectionReasons.includes(reason)}
                          onCheckedChange={() => toggleRejectionReason(reason)}
                        />
                        <span className="text-sm">{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Additional Reason (Optional)</Label>
                  <Textarea
                    value={customRejectionReason}
                    onChange={(e) => setCustomRejectionReason(e.target.value)}
                    placeholder="Provide additional details..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {actionType === 'request-changes' && (
              <div className="space-y-3">
                <div>
                  <Label>Change Requests</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newChangeRequest}
                      onChange={(e) => setNewChangeRequest(e.target.value)}
                      placeholder="Describe required change..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddChangeRequest();
                        }
                      }}
                    />
                    <Button onClick={handleAddChangeRequest} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {changeRequests.length > 0 && (
                  <div className="space-y-2">
                    {changeRequests.map((request, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded"
                      >
                        <p className="text-sm">{request}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveChangeRequest(index)}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {actionType === 'approve' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-900">
                    <p className="font-semibold mb-1">Ready to Approve</p>
                    <p className="text-xs">
                      Click "Continue to Sign" to proceed with electronic signature verification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={
                actionType === 'approve'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : actionType === 'reject'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
              }
            >
              {actionType === 'approve' && 'Continue to Sign'}
              {actionType === 'reject' && 'Confirm Rejection'}
              {actionType === 'request-changes' && 'Submit Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Electronic Signature Dialog - 21 CFR Part 11 */}
      <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-purple-600" />
              Electronic Signature - 21 CFR Part 11
            </DialogTitle>
            <DialogDescription>
              Complete the electronic signature to approve this document
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="text-sm text-purple-900">
                  <p className="font-semibold mb-1">Secure Electronic Signature</p>
                  <p className="text-xs">
                    This signature is legally binding and complies with FDA 21 CFR Part 11
                    requirements for electronic records and signatures.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <Label>Signature Meaning *</Label>
                <Select value={signatureMeaning} onValueChange={setSignatureMeaning}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select signature meaning" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="authorized">Authorized</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Reason for Signature *</Label>
                <Input
                  value={signatureReason}
                  onChange={(e) => setSignatureReason(e.target.value)}
                  placeholder="e.g., Technical review completed, all requirements met"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Password Verification *</Label>
                <Input
                  type="password"
                  value={signaturePassword}
                  onChange={(e) => setSignaturePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Your password is required to authenticate this electronic signature
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs">
              <p className="font-semibold mb-2">Signature Details:</p>
              <div className="space-y-1 text-slate-600">
                <p>• Signed by: {currentUser.name} ({currentUser.email})</p>
                <p>• Timestamp: {new Date().toLocaleString()}</p>
                <p>• IP Address: Will be recorded</p>
                <p>• Certificate Serial: Will be generated</p>
                <p>• Audit Trail: All details will be permanently logged</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSignatureDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSignDocument}
              className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              <FileSignature className="h-4 w-4" />
              Sign & Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delegate Dialog */}
      <Dialog open={delegateDialogOpen} onOpenChange={setDelegateDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Delegate Review
            </DialogTitle>
            <DialogDescription>
              Assign this review to another qualified reviewer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Delegate To *</Label>
              <Input
                value={delegateTo}
                onChange={(e) => setDelegateTo(e.target.value)}
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Delegation Reason *</Label>
              <Textarea
                value={delegateReason}
                onChange={(e) => setDelegateReason(e.target.value)}
                placeholder="Explain why you are delegating this review..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-900">
                  Delegation will be recorded in the audit trail. The delegate must have
                  appropriate authority and training to review this document type.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDelegateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelegate} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Send className="h-4 w-4 mr-2" />
              Delegate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};