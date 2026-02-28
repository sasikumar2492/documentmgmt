export interface TemplateData {
  id: string;
  fileName: string;
  uploadDate: string;
  fileSize: string;
  department: string; // Single department ID for this template
  status?: 'approved' | 'pending' | 'submitted';
  parsedSections?: FormSection[];
  convertedFormData?: Record<string, any>;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
  header?: string; // Header content from Word document
  footer?: string; // Footer content from Word document
  images?: FormImage[]; // Images extracted from the document
}

export interface FormImage {
  id: string;
  url: string;
  caption?: string;
  pageIndex?: number;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'checkbox' | 'radio' | 'textarea' | 'select' | 'image';
  value?: any;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  sapFieldId?: string; // Optional SAP field identifier
}

export interface ReportData {
  id: string;
  requestId: string;
  /** Template id (for API-backed requests) to resolve sections for editor */
  templateId?: string;
  fileName: string;
  uploadDate: string;
  assignedTo: string;
  /** Display name for assignee (from API); show instead of UUID when set */
  assignedToName?: string;
  department?: string;
  status: 'pending' | 'submitted' | 'resubmitted' | 'initial-review' | 'review-process' | 'final-review' | 'reviewed' | 'approved' | 'rejected' | 'needs-revision' | 'published';
  lastModified: string;
  fileSize: string;
  formData?: FormData;
  aiWorkflow?: AIWorkflowStep[]; // AI-generated workflow for this specific request
  // Metadata fields for classification
  documentType?: string; // Type of document (Template, Request, Report, etc.)
  product?: string; // Product associated with the document
  site?: string; // Site/location associated with the document
  uploadedBy?: string; // User who uploaded the document
  fromUser?: string; // User who submitted the request
  formPages?: FormPage[]; // Parsed form pages for preview
  // Rejection/Revision fields
  returnedBy?: 'reviewer' | 'approver'; // Who returned the document
  returnedByName?: string; // Name of the person who returned it
  returnedDate?: string; // Date when document was returned
  remarks?: string; // Remarks from reviewer/approver
  // Publishing fields
  publishedDate?: string; // Date when document was published
  publishedBy?: string; // User who published the document
  // Submit for Approval (from backend)
  reviewSequence?: string[]; // Ordered list of reviewer user IDs
  priority?: string; // low | medium | high
  submissionComments?: string; // Instructions for review team
}

export interface AIWorkflowStep {
  id: string;
  department: string;
  departmentName: string;
  order: number;
  status: 'completed' | 'current' | 'pending' | 'rejected';
  assignedTo?: string;
  completedDate?: string;
  stages: {
    id: string;
    name: string;
    status: 'completed' | 'current' | 'pending' | 'rejected';
    assignedTo?: string;
    completedDate?: string;
  }[];
}

export interface FormData {
  // Page 1 - Request Information
  isPart: boolean;
  isMaterial: boolean;
  materialCode: string;
  partMaterial: string;
  supplierCode: string;
  supplierName: string;
  shippedCargoType: string;
  isPrelaunch: boolean;
  isPrototype: boolean;
  site: string;
  dateSentToFactory: string;
  billOfLadingNo: string;
  quantity: string;
  reasonMaterialChange: boolean;
  reasonApprovalExpiry: boolean;
  reasonNewSupplier: boolean;
  reasonChangeDesign: boolean;
  reasonNewPart: boolean;
  reasonProcessChange: boolean;
  productTechnicalCode: string;
  productName: string;
  productStage: string;
  isMassProduction: boolean;
  isProductDevelopment: boolean;
  dataSheetNo: string;
  drawingNo: string;
  manufacturerSelectionNumber: string;
  requesterName: string;
  requesterPosition: string;
  requesterDateSignature: string;
  approverName: string;
  approverPosition: string;
  approverDateSignature: string;
  
  // Page 2 - Initial Review
  requestAcceptable: boolean;
  notAcceptable: boolean;
  notAcceptableDueTo: string;
  qaName1: string;
  qaPosition1: string;
  qaDateSignature1: string;
  noTestReport: boolean;
  noECR: boolean;
  qaName2: string;
  qaPosition2: string;
  qaDateSignature2: string;
  noSample: boolean;
  noPrototype: boolean;
  
  // Page 3 - Review Process
  dimensionalOK: boolean;
  dimensionalNOK: boolean;
  dimensionalEvidence: string;
  materialOK: boolean;
  materialNOK: boolean;
  materialEvidence: string;
  durabilityOK: boolean;
  durabilityNOK: boolean;
  durabilityEvidence: string;
  performanceOK: boolean;
  performanceNOK: boolean;
  performanceEvidence: string;
  assemblyOK: boolean;
  assemblyNOK: boolean;
  assemblyEvidence: string;
  documentsOK: boolean;
  documentsNOK: boolean;
  documentsEvidence: string;
  samplesOK: boolean;
  samplesNOK: boolean;
  samplesEvidence: string;
  betterThan: boolean;
  worseThan: boolean;
  sameAs: boolean;
  noParallel: boolean;
  comparisonEvidence: string;
  expertName1: string;
  expertPosition1: string;
  expertDateSignature1: string;
  managerName1: string;
  managerPosition1: string;
  managerDateSignature1: string;
  isGeneral: boolean;
  isExclusive: boolean;
  documentCode: string;
  
  // Page 4 - Additional fields
  durabilityOKP4: boolean;
  durabilityNOKP4: boolean;
  durabilityEvidenceP4: string;
  performanceOKP4: boolean;
  performanceNOKP4: boolean;
  performanceEvidenceP4: string;
  assemblyOKP4: boolean;
  assemblyNOKP4: boolean;
  assemblyEvidenceP4: string;
  documentsOKP4: boolean;
  documentsNOKP4: boolean;
  documentsEvidenceP4: string;
  samplesOKP4: boolean;
  samplesNOKP4: boolean;
  samplesEvidenceP4: string;
  betterThanP4: boolean;
  worseThanP4: boolean;
  sameAsP4: boolean;
  noParallelP4: boolean;
  comparisonEvidenceP4: string;
  expertName2: string;
  expertPosition2: string;
  expertDateSignature2: string;
  managerName2: string;
  managerPosition2: string;
  managerDateSignature2: string;
  
  // Page 5 - QA and Management
  qaExpertName: string;
  qaExpertPosition: string;
  qaExpertDateSignature: string;
  qaManagerName: string;
  qaManagerPosition: string;
  qaManagerDateSignature: string;
  isApproved: boolean;
  isConditionallyApproved: boolean;
  isApprovedLimited: boolean;
  isRejected: boolean;
  approvalDescription: string;
  approvalUntilDate: string;
  deputyName: string;
  deputyPosition: string;
  deputyDateSignature: string;
  prelaunchNeeded: boolean;
  prelaunchNotNeeded: boolean;
  auditNeeded: boolean;
  auditNotNeeded: boolean;
  
  // Page 6 - Final Registration
  archiveDate: string;
  evidence: string;
  actions: string;
  finalName: string;
  finalPosition: string;
  finalDateSignature: string;
  isGeneralP6: boolean;
  isExclusiveP6: boolean;
  documentCodeP6: string;
}

export type ViewType = 'dashboard' | 'form' | 'approval-form' | 'dynamic-form' | 'syncfusion-editor' | 'user-management' | 'upload-templates' | 'raise-request' | 'reports' | 'document-library' | 'analytics-reports' | 'document-management' | 'workflows' | 'configure-workflow' | 'departments' | 'notifications' | 'enterprise' | 'notification-settings' | 'chat' | 'ai-conversion-preview' | 'workflow-approval' | 'faq' | 'audit-logs' | 'workflow-configuration' | 'review-approval' | 'my-tasks' | 'home' | 'ticket-flow' | 'admin-home' | 'role-permissions' | 'department-setup' | 'sop-configuration' | 'workflow-rules' | 'reports-analytics' | 'activity-log' | 'activity-log-detail' | 'remarks-inbox' | 'document-publishing' | 'training-management' | 'document-effectiveness' | 'document-versioning' | 'document-preview';

export interface DepartmentData {
  id: string;
  name: string;
}

export interface PublishedTemplate {
  templateId: string;
  departmentId: string;
  publishDate: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'request_submitted' | 'request_resubmitted' | 'template_published' | 'form_approved' | 'form_rejected' | 'document_uploaded' | 'approval_required' | 'needs_revision';
  isRead: boolean;
  requestId?: string;
  targetRoles?: UserRole[]; // Which roles should see this notification
  fromUser?: string; // Who triggered the notification
}

export interface TrainingRecord {
  id: string;
  trainingName: string;
  documentId: string;
  documentName: string;
  department: string;
  trainee: string;
  trainer: string;
  scheduledDate: string;
  completionDate?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
  score?: number;
  attendance: boolean;
  duration: string;
  category: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export type UserRole = 'admin' | 'requestor' | 'preparator' | 'manager' | 'manager_reviewer' | 'manager_approver' | 'approver' | 'Reviewer 1' | 'Reviewer 2' | 'Reviewer 3' | 'Reviewer 4' | 'Approver 1' | 'Approver 2';

export interface UserData {
  username: string;
  role: UserRole;
  department?: string;
  fullName?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'document_uploaded' | 'request_submitted' | 'request_resubmitted' | 'request_approved' | 'request_rejected' | 'status_changed' | 'template_created' | 'workflow_approved' | 'form_edited' | 'user_login' | 'user_logout' | 'template_deleted' | 'request_deleted';
  entityType: 'document' | 'request' | 'template' | 'workflow' | 'user' | 'system';
  entityId: string;
  entityName: string;
  user: string;
  userRole: UserRole;
  department?: string;
  details: string;
  ipAddress?: string;
  previousValue?: string;
  newValue?: string;
  requestId?: string; // Optional request ID for filtering audit logs by specific request
  signature?: ElectronicSignature; // Electronic signature data for critical actions
}

export interface ElectronicSignature {
  signatureId: string; // Unique signature identifier
  certificateNumber: string; // Digital certificate number
  signatoryName: string; // Full name of person who signed
  signatoryRole: UserRole; // Role of the signatory
  signedAt: string; // ISO timestamp of when action was signed
  ipAddress: string; // IP address from which signature was made
  deviceInfo: string; // Browser/Device information
  verificationHash: string; // Simulated verification hash
  isVerified: boolean; // Signature verification status
  verificationMethod: 'password' | 'biometric' | '2fa' | 'certificate'; // How the signature was verified
}

export interface FormPage {
  pageNumber: number;
  title: string; // Page title
  content: string; // HTML or plain text content of the page
  fields: FormField[]; // Fields present on this page
  header?: string; // Header content for this page
  footer?: string; // Footer content for this page
}