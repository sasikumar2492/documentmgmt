import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { 
  UserCheck, 
  Send, 
  Users, 
  MessageSquare, 
  Clock,
  ShieldCheck,
  Info,
  X,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Badge } from './ui/badge';
import { getUsers } from '../api/users';

interface SubmissionAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (assignment: { reviewerIds: string[]; priority: string; comments: string; action?: string }) => void;
  documentTitle: string;
  userRole?: string;
}

/** Display shape for a reviewer in the modal (from API user). */
interface ReviewerOption {
  id: string;
  name: string;
  dept: string;
  role: string;
}

export const SubmissionAssignmentModal: React.FC<SubmissionAssignmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  documentTitle,
  userRole
}) => {
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [priority, setPriority] = useState('medium');
  const [comments, setComments] = useState('');
  const [reviewers, setReviewers] = useState<ReviewerOption[]>([]);
  const [reviewersLoading, setReviewersLoading] = useState(false);
  const [reviewersError, setReviewersError] = useState<string | null>(null);

  // Load users from backend when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setReviewersLoading(true);
    setReviewersError(null);
    getUsers()
      .then((list) => {
        setReviewers(
          list.map((u) => ({
            id: u.id,
            name: u.fullName || u.username || '—',
            dept: u.departmentName || '—',
            role: u.role || 'User',
          }))
        );
      })
      .catch(() => {
        setReviewersError('Failed to load reviewers');
        setReviewers([]);
      })
      .finally(() => setReviewersLoading(false));
  }, [isOpen]);

  const isReviewerOnly = userRole === 'manager_reviewer' || 
                         (userRole || '').toLowerCase().includes('reviewer');
                         
  const isApproverOnly = userRole === 'approver' || 
                         userRole === 'manager_approver' || 
                         (userRole || '').toLowerCase().includes('approver');

  // For UI labels and colors, manager_approver is often treated as a Reviewer in this system's specific UI configuration
  const displayAsReviewer = isReviewerOnly || userRole === 'manager_approver';
  const displayAsApprover = isApproverOnly && userRole !== 'manager_approver';

  const isReviewAction = isReviewerOnly || isApproverOnly;

  const handleAddReviewer = (reviewerId: string) => {
    if (reviewerId && !selectedReviewers.includes(reviewerId)) {
      setSelectedReviewers([...selectedReviewers, reviewerId]);
    }
  };

  const handleRemoveReviewer = (reviewerId: string) => {
    setSelectedReviewers(selectedReviewers.filter(id => id !== reviewerId));
  };

  const handleConfirmAction = (action: string) => {
    if (selectedReviewers.length === 0 && !isReviewAction) {
      alert('Please select at least one reviewer.');
      return;
    }
    onConfirm({ reviewerIds: selectedReviewers, priority, comments, action });
  };

  const getReviewerDetails = (id: string) => reviewers.find((r) => r.id === id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <Send className="h-5 w-5 text-white" />
              </div>
              Submit for Approval
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-sm mt-2">
              Assign this document to reviewers. The order of selection determines the review sequence.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 bg-white max-h-[70vh] overflow-y-auto">
          {/* Document Summary */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm border border-blue-200">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Submitting Document</p>
              <h4 className="text-sm font-bold text-slate-900 truncate">{documentTitle}</h4>
            </div>
            <Badge className="bg-blue-600">Draft State</Badge>
          </div>

          {/* Reviewer Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <UserPlus className="h-3 w-3" /> Select Reviewers
              </Label>
              <Select 
                onValueChange={handleAddReviewer}
                value=""
                disabled={reviewersLoading}
              >
                <SelectTrigger className="border-slate-200 focus:ring-blue-500 bg-white">
                  <SelectValue placeholder={reviewersLoading ? 'Loading reviewers...' : 'Click to add a reviewer...'} />
                </SelectTrigger>
                <SelectContent>
                  {reviewersError && (
                    <div className="p-2 text-xs text-red-500 text-center">{reviewersError}</div>
                  )}
                  {!reviewersError && reviewers.filter(r => !selectedReviewers.includes(r.id)).map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{r.name}</span>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${r.role.toLowerCase().includes('approver') ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'}`}>
                            {r.role}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-slate-400">{r.dept}{r.dept !== '—' ? ' Department' : ''}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {!reviewersError && !reviewersLoading && reviewers.filter(r => !selectedReviewers.includes(r.id)).length === 0 && (
                    <div className="p-2 text-xs text-slate-400 text-center">All available reviewers selected</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Request Priority</Label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'high'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 px-4 rounded-lg border-2 text-xs font-bold uppercase tracking-tighter transition-all ${
                    priority === p 
                      ? p === 'high' ? 'bg-red-50 border-red-500 text-red-600' : p === 'medium' ? 'bg-amber-50 border-amber-500 text-amber-600' : 'bg-green-50 border-green-500 text-green-600'
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Reviewers Sequence */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Clock className="h-3 w-3" /> Review Sequence
            </Label>
            {selectedReviewers.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                <p className="text-xs text-slate-400">No reviewers selected yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedReviewers.map((id, index) => {
                  const reviewer = getReviewerDetails(id);
                  return (
                    <div 
                      key={id} 
                      className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm group animate-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-100">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">{reviewer?.name}</p>
                          <Badge variant="outline" className={`text-[8px] px-1 py-0 h-3.5 ${reviewer?.role?.toLowerCase().includes('approver') ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'}`}>
                            {reviewer?.role}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{reviewer?.dept} Dept</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveReviewer(id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <MessageSquare className="h-3 w-3" /> Submission Remarks
            </Label>
            <Textarea 
              placeholder="Add specific instructions for the review team..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[100px] border-slate-200 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-xl flex gap-3 items-start border border-slate-100">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              This document will follow a sequential workflow. <strong>Reviewer 1</strong> must approve before it proceeds to <strong>Reviewer 2</strong>, and so on.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3 sm:justify-end">
          <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-600">
            Cancel
          </Button>
          {isReviewerOnly || isApproverOnly ? (
            <>
              <Button 
                onClick={() => handleConfirmAction('reviewed')}
                className={`bg-gradient-to-r ${isApproverOnly ? 'from-blue-500 to-indigo-600' : 'from-emerald-500 to-teal-600'} text-white shadow-lg ${isApproverOnly ? 'shadow-blue-200' : 'shadow-emerald-200'} hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold px-6`}
              >
                {displayAsApprover ? 'Approved' : 'Reviewed'}
              </Button>
              <Button 
                onClick={() => handleConfirmAction('revision')}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold px-6"
              >
                Need Revision
              </Button>
              <Button 
                onClick={() => handleConfirmAction('rejected')}
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200 hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold px-6"
              >
                Rejected
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => handleConfirmAction('submit')}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold px-8"
            >
              Confirm & Submit
              <Send className="h-4 w-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};