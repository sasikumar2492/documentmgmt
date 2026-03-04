export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-gray-400 text-white border-0 text-xs';
    case 'submitted': return 'bg-orange-500 text-white border-0 text-xs';
    case 'resubmitted': return 'bg-cyan-500 text-white border-0 text-xs';
    case 'initial-review': return 'bg-blue-500 text-white border-0 text-xs';
    case 'review-process': return 'bg-purple-600 text-white border-0 text-xs';
    case 'final-review': return 'bg-purple-500 text-white border-0 text-xs';
    case 'reviewed': return 'bg-teal-500 text-white border-0 text-xs';
    case 'approved': return 'bg-green-600 text-white border-0 text-xs';
    case 'rejected': return 'bg-red-500 text-white border-0 text-xs';
    case 'needs-revision': return 'bg-amber-500 text-white border-0 text-xs';
    case 'published': return 'bg-purple-700 text-white border-0 text-xs';
    default: return 'bg-gray-400 text-white border-0 text-xs';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'submitted': return 'Submitted';
    case 'resubmitted': return 'Resubmitted';
    case 'initial-review': return 'Initial Review';
    case 'review-process': return 'Review Process';
    case 'final-review': return 'Final Review';
    case 'reviewed': return 'Reviewed';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'needs-revision': return 'Needs Revision';
    case 'published': return 'Published';
    default: return 'Unknown';
  }
};