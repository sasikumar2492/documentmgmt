import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileCheck, GraduationCap, TrendingUp, GitCompare } from 'lucide-react';
import { Button } from './components/ui/button';
import { TemplateData, ReportData, FormData, ViewType, NotificationData, FormSection, UserRole, AIWorkflowStep, AuditLogEntry, TrainingRecord, DepartmentData } from './types';
import { defaultFormData, initialReportsData } from './constants';
import { LoginHeader } from './components/LoginHeader';
import { LoginFooter } from './components/LoginFooter';
import { SignInPage } from './components/SignInPage';
import { Dashboard } from './components/Dashboard';
import { LeftSidebar } from './components/LeftSidebar';
import { UploadTemplates } from './components/UploadTemplates';
import { RaiseRequest } from './components/RaiseRequest';
import { Reports } from './components/Reports';
import { DocumentLibrary } from './components/DocumentLibrary';
import { PreparatorDocumentLibrary } from './components/PreparatorDocumentLibrary';
import { ReviewerDocumentLibrary } from './components/ReviewerDocumentLibrary';
import { ApproverDocumentLibrary } from './components/ApproverDocumentLibrary';
import { DocumentPublishing } from './components/DocumentPublishing';
import { DocumentManagement } from './components/DocumentManagement';
import { TrainingManagement } from './components/TrainingManagement';
import { DocumentEffectiveness } from './components/DocumentEffectiveness';
import { DocumentVersioning } from './components/DocumentVersioning';
import { Workflows } from './components/Workflows';
import { ConfigureWorkflow } from './components/ConfigureWorkflow';
import { UserManagement } from './components/UserManagement';
import { Breadcrumbs } from './components/Breadcrumbs';
import { DepartmentsView } from './components/DepartmentsView';
import { EnterpriseSettings } from './components/EnterpriseSettings';
import { NotificationSettings } from './components/NotificationSettings';
import { NotificationsPage } from './components/NotificationsPage';
import { NotificationsHub } from './components/NotificationsHub';
import { Chat } from './components/Chat';
import { DynamicFormViewer } from './components/DynamicFormViewer';
import { AIConversionPreview } from './components/AIConversionPreview';
import { WorkflowApprovalStep } from './components/WorkflowApprovalStep';
import { AnalyticsReports } from './components/AnalyticsReports';
import { AuditLogs } from './components/AuditLogs';
import { WorkflowConfiguration } from './components/WorkflowConfiguration';
import { ReviewApprovalInterface } from './components/ReviewApprovalInterface';
import { HomePage } from './components/HomePage';
import { TicketFlow } from './components/TicketFlow';
import { TicketFlowLogin } from './components/TicketFlowLogin';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHomeDashboard } from './components/AdminHomeDashboard';
import { RolePermissionsManagement } from './components/RolePermissionsManagement';
import { DepartmentSetupManagement } from './components/DepartmentSetupManagement';
import { SOPConfiguration } from './components/SOPConfiguration';
import { WorkflowRulesSetup } from './components/WorkflowRulesSetup';
import { ReportsAnalyticsDashboard } from './components/ReportsAnalyticsDashboard';
import { PreparatorDashboard } from './components/PreparatorDashboard';
import { ActivityLogTable } from './components/ActivityLogTable';
import { ActivityLogDetail } from './components/ActivityLogDetail';
import { RemarksInbox } from './components/RemarksInbox';
import { DocumentEditScreen } from './components/DocumentEditScreen';
import { DocumentPreviewScreen } from './components/DocumentPreviewScreen';
import { SyncfusionRequestEditor } from './components/SyncfusionRequestEditor';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { parseExcelToFormSections, extractDepartmentFromFilename, formSectionsToFormData } from './utils/excelParser';
import { parseWordToFormSections } from './utils/wordParser';
import { parsePdfToFormSections } from './utils/pdfParser';
import { generateWorkflowFromSections } from './utils/workflowGenerator';
import { generateElectronicSignature, requiresSignature } from './utils/signatureGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { CheckCircle, Clock, FileSignature } from 'lucide-react';

import { SubmissionAssignmentModal } from './components/SubmissionAssignmentModal';
import { login, getMe, getStoredToken, setStoredToken, clearAuth } from './api/auth';
import { setAuthToken, setOnUnauthorized } from './api/client';
import type { AuthUser } from './api/auth';
import { getTemplates, uploadTemplate, updateTemplate, getTemplateFileBlob, exportSfdtToDocx } from './api/templates';
import { getDepartments } from './api/departments';
import {
  getRequests,
  createRequest,
  updateRequest,
  getFormData,
  putFormData,
} from './api/requests';

export default function App() {
  const [showHomePage, setShowHomePage] = useState(true);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [pendingSubmissionData, setPendingSubmissionData] = useState<{ id: string; title: string } | null>(null);
  const [showTicketFlowLogin, setShowTicketFlowLogin] = useState(false);
  const [ticketFlowLoginModule, setTicketFlowLoginModule] = useState<'ticketflow' | 'dms' | 'qms'>('ticketflow');
  const [isTicketFlowSignedIn, setIsTicketFlowSignedIn] = useState(false);
  const [ticketFlowUser, setTicketFlowUser] = useState({ username: '', password: '' });
  const [intendedModule, setIntendedModule] = useState<'dms' | 'ticket-flow' | null>(null);
  const [previousView, setPreviousView] = useState<ViewType | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [loginData, setLoginData] = useState({ 
    username: '', 
    password: '', 
    rememberMe: false,
    role: 'admin' as UserRole
  });
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedWorkflowForConfig, setSelectedWorkflowForConfig] = useState<any>(null);
  const [workflowCustomSteps, setWorkflowCustomSteps] = useState<Record<string, any[]>>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedRequestIdForAudit, setSelectedRequestIdForAudit] = useState<string | null>(null);
  const [selectedActivityLogRequestId, setSelectedActivityLogRequestId] = useState<string | null>(null);
  const [selectedReportForReview, setSelectedReportForReview] = useState<ReportData | null>(null);
  const [selectedReportForPreview, setSelectedReportForPreview] = useState<ReportData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false); // Track if form is in edit mode
  const [approvedWorkflows, setApprovedWorkflows] = useState<Array<{
    id: string;
    fileName: string;
    department: string;
    uploadDate: string;
    workflow: any[];
    approvedDate: string;
  }>>([]);
  const [pendingConversion, setPendingConversion] = useState<{
    templateId: string;
    sections: FormSection[];
    fileName: string;
    department: string;
    fileSize: string;
    uploadDate: string;
  } | null>(null);
  const [pendingWorkflow, setPendingWorkflow] = useState<{
    templateId: string;
    workflow: any[];
    sections: FormSection[];
    fileName: string;
    department: string;
    fileSize: string;
    uploadDate: string;
    fileType: string;
  } | null>(null);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  
  // Restore session from stored token
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }
    setAuthToken(token);
    getMe()
      .then((user) => {
        setAuthUser(user);
        setLoginData((prev) => ({ ...prev, username: user.username, role: user.role as UserRole }));
        setIsSignedIn(true);
      })
      .catch(() => clearAuth())
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      clearAuth();
      setAuthUser(null);
      setIsSignedIn(false);
      setLoginData({ username: '', password: '', rememberMe: false, role: 'admin' });
    });
    return () => setOnUnauthorized(null as any);
  }, []);

  // Fetch templates and departments from API when signed in
  useEffect(() => {
    if (!authUser) return;
    getTemplates()
      .then((list) => {
        setTemplates(
          list.map((t) => ({
            id: t.id,
            fileName: t.fileName,
            uploadDate:
              typeof t.uploadDate === 'string'
                ? t.uploadDate.split('T')[0]
                : new Date().toISOString().split('T')[0],
            fileSize: t.fileSize || '0',
            // Backend stores department_id; keep the raw ID here
            department: t.department || '',
            status: (t.status as 'approved' | 'pending') || 'pending',
            parsedSections: t.parsedSections ?? undefined,
          }))
        );
        return getDepartments();
      })
      .then((deps) => {
        if (deps) setDepartments(deps);
      })
      .catch(() => {});
  }, [authUser]);

  // Fetch requests (Raise Request / Document Library) when signed in
  const fetchRequestsAsReports = () => {
    if (!authUser) return;
    getRequests()
      .then((list) => {
        const mapped: ReportData[] = list.map((r) => ({
          id: r.id,
          requestId: r.requestId,
          templateId: r.templateId,
          fileName: r.templateFileName || 'Document',
          uploadDate: typeof r.createdAt === 'string' ? r.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          assignedTo: r.assignedTo || '',
          assignedToName: r.assignedToName ?? undefined,
          department: r.departmentName || undefined,
          status: (r.status === 'draft' ? 'pending' : r.status) as ReportData['status'],
          lastModified: r.updatedAt || r.createdAt,
          fileSize: r.fileSize ?? '',
          documentType: 'Request',
          reviewSequence: r.reviewSequence ?? undefined,
          priority: r.priority ?? undefined,
          submissionComments: r.submissionComments ?? undefined,
        }));
        setReports(mapped);
      })
      .catch(() => {});
  };
  useEffect(() => {
    if (!authUser) return;
    fetchRequestsAsReports();
  }, [authUser]);

  const currentUser = authUser
    ? {
        id: authUser.id,
        name: authUser.fullName || authUser.username,
        email: authUser.username,
        role: authUser.role,
        isAdmin: authUser.role === 'admin',
        department: authUser.departmentId || 'Engineering'
      }
    : {
        id: '1',
        name: loginData.username || 'Admin User',
        email: loginData.username || 'admin@company.com',
        role: loginData.role,
        isAdmin: loginData.role === 'admin',
        department: 'Engineering'
      };
  
  // Ensure currentFormData is never undefined by providing a fallback
  const [currentFormData, setCurrentFormData] = useState<FormData>(() => {
    return defaultFormData || {
      // Fallback in case defaultFormData is undefined
      isPart: false,
      isMaterial: false,
      materialCode: '',
      partMaterial: '',
      supplierCode: '',
      supplierName: '',
      shippedCargoType: '',
      isPrelaunch: false,
      isPrototype: false,
      site: '',
      dateSentToFactory: '',
      billOfLadingNo: '',
      quantity: '',
      reasonMaterialChange: false,
      reasonApprovalExpiry: false,
      reasonNewSupplier: false,
      reasonChangeDesign: false,
      reasonNewPart: false,
      reasonProcessChange: false,
      productTechnicalCode: '',
      productName: '',
      productStage: '',
      isMassProduction: false,
      isProductDevelopment: false,
      dataSheetNo: '',
      drawingNo: '',
      manufacturerSelectionNumber: '',
      requesterName: '',
      requesterPosition: '',
      requesterDateSignature: '',
      approverName: '',
      approverPosition: '',
      approverDateSignature: '',
      requestAcceptable: false,
      notAcceptable: false,
      notAcceptableDueTo: '',
      qaName1: '',
      qaPosition1: '',
      qaDateSignature1: '',
      noTestReport: false,
      noECR: false,
      qaName2: '',
      qaPosition2: '',
      qaDateSignature2: '',
      noSample: false,
      noPrototype: false,
      dimensionalOK: false,
      dimensionalNOK: false,
      dimensionalEvidence: '',
      materialOK: false,
      materialNOK: false,
      materialEvidence: '',
      durabilityOK: false,
      durabilityNOK: false,
      durabilityEvidence: '',
      performanceOK: false,
      performanceNOK: false,
      performanceEvidence: '',
      assemblyOK: false,
      assemblyNOK: false,
      assemblyEvidence: '',
      documentsOK: false,
      documentsNOK: false,
      documentsEvidence: '',
      samplesOK: false,
      samplesNOK: false,
      samplesEvidence: '',
      betterThan: false,
      worseThan: false,
      sameAs: false,
      noParallel: false,
      comparisonEvidence: '',
      expertName1: '',
      expertPosition1: '',
      expertDateSignature1: '',
      managerName1: '',
      managerPosition1: '',
      managerDateSignature1: '',
      isGeneral: true,
      isExclusive: false,
      documentCode: '',
      durabilityOKP4: false,
      durabilityNOKP4: false,
      durabilityEvidenceP4: '',
      performanceOKP4: false,
      performanceNOKP4: false,
      performanceEvidenceP4: '',
      assemblyOKP4: false,
      assemblyNOKP4: false,
      assemblyEvidenceP4: '',
      documentsOKP4: false,
      documentsNOKP4: false,
      documentsEvidenceP4: '',
      samplesOKP4: false,
      samplesNOKP4: false,
      samplesEvidenceP4: '',
      betterThanP4: false,
      worseThanP4: false,
      sameAsP4: false,
      noParallelP4: false,
      comparisonEvidenceP4: '',
      expertName2: '',
      expertPosition2: '',
      expertDateSignature2: '',
      managerName2: '',
      managerPosition2: '',
      managerDateSignature2: '',
      qaExpertName: '',
      qaExpertPosition: '',
      qaExpertDateSignature: '',
      qaManagerName: '',
      qaManagerPosition: '',
      qaManagerDateSignature: '',
      isApproved: false,
      isConditionallyApproved: false,
      isApprovedLimited: false,
      isRejected: false,
      approvalDescription: '',
      approvalUntilDate: '',
      deputyName: '',
      deputyPosition: '',
      deputyDateSignature: '',
      prelaunchNeeded: false,
      prelaunchNotNeeded: false,
      auditNeeded: false,
      auditNotNeeded: false,
      archiveDate: '',
      evidence: '',
      actions: '',
      finalName: '',
      finalPosition: '',
      finalDateSignature: '',
      isGeneralP6: true,
      isExclusiveP6: false,
      documentCodeP6: ''
    };
  });
  
  // Templates from API (AI Conversion)
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [reports, setReports] = useState<ReportData[]>(initialReportsData || []);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Notification system state
  const [notifications, setNotifications] = useState<NotificationData[]>([
    {
      id: 'sample_1',
      title: 'Welcome to the System',
      message: 'Your document management system is now ready to use.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      type: 'request_submitted',
      isRead: false
    }
  ]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Audit Logs system state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Training Management system state
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setCurrentFormData(prev => {
      if (!prev) return currentFormData;
      return { ...prev, [field]: value };
    });
  };

  const saveFormData = () => {
    if (currentDocumentId && currentFormData) {
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === currentDocumentId 
            ? { 
                ...report, 
                formData: currentFormData,
                lastModified: new Date().toISOString()
              }
            : report
        )
      );
    }
  };

  const loadFormData = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (report?.templateId) {
      try {
        const res = await getFormData(reportId);
        if (res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
          const formData = res.data as FormData;
          setCurrentFormData(formData);
          // Update the reports state to include the loaded formData (which may contain _sfdt from backend)
          setReports(prev => prev.map(r => 
            r.id === reportId 
              ? { ...r, formData }
              : r
          ));
          return;
        }
      } catch (_) {}
    }
    if (report && report.formData) {
      setCurrentFormData(report.formData);
    } else {
      setCurrentFormData(defaultFormData || currentFormData);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) return;
    setLoginError(null);
    setLoginInProgress(true);
    try {
      const data = await login(loginData.username, loginData.password);
      setStoredToken(data.token);
      setAuthUser(data.user);
      setLoginData((prev) => ({ ...prev, username: data.user.username, role: data.user.role as UserRole }));
      setIsSignedIn(true);
      if (intendedModule === 'ticket-flow') {
        setCurrentView('ticket-flow');
      } else if (data.user.role.toLowerCase().includes('approver')) {
        setCurrentView('document-library');
      } else if (data.user.role === 'admin') {
        setCurrentView('admin-home');
      } else {
        setCurrentView('dashboard');
      }
      setIntendedModule(null);
    } catch (err: any) {
      setLoginError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoginInProgress(false);
    }
  };

  const handleSignOut = () => {
    clearAuth();
    setAuthUser(null);
    setIsSignedIn(false);
    setLoginData({ username: '', password: '', rememberMe: false, role: 'admin' });
    setCurrentView('dashboard');
    setShowHomePage(false);
    setIntendedModule(null);
  };

  const handleTicketFlowLogin = (username: string, password: string) => {
    if (username && password) {
      if (ticketFlowLoginModule === 'dms') {
        let role: UserRole = 'admin';
        if (username.includes('preparator')) role = 'preparator';
        else if (username.includes('reviewer')) {
          const match = username.match(/reviewer\s*(\d+)/i);
          role = match ? `Reviewer ${match[1]}` as UserRole : 'Reviewer 1';
        }
        else if (username.includes('approver')) {
          const match = username.match(/approver\s*(\d+)/i);
          role = match ? `Approver ${match[1]}` as UserRole : 'approver';
        }
        else if (username.includes('manager')) {
          if (username === 'robert.manager') role = 'manager_reviewer';
          else role = 'manager';
        }
        
        setLoginData({ username, password, rememberMe: false, role });
        setIsSignedIn(true);
        if (role === 'admin') setCurrentView('admin-home');
        else if (role === 'manager') setCurrentView('document-management');
        else setCurrentView('dashboard');
      } else {
        setTicketFlowUser({ username, password });
        setIsTicketFlowSignedIn(true);
      }
      setShowTicketFlowLogin(false);
    }
  };

  const handleTicketFlowSignOut = () => {
    setIsTicketFlowSignedIn(false);
    setTicketFlowUser({ username: '', password: '' });
    setShowHomePage(true);
  };

  const handleViewChange = (view: ViewType) => {
    setPreviousView(currentView);
    setCurrentView(view);
    if (view === 'approval-form' || view === 'dynamic-form' || view === 'syncfusion-editor') {
      setCurrentPage(1);
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setUploadInProgress(true);
    const file = selectedFiles[0];
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';

    toast.info(`Analyzing ${file.name}...`, {
      description: 'Parsing document structure.',
    });

    try {
      let parsedSections: FormSection[] = [];
      if (fileType === 'xlsx' || fileType === 'xls') {
        parsedSections = await parseExcelToFormSections(file);
      } else if (fileType === 'doc' || fileType === 'docx') {
        parsedSections = await parseWordToFormSections(file);
      } else if (fileType === 'pdf') {
        parsedSections = await parsePdfToFormSections(file);
      }

      const workflowResult = generateWorkflowFromSections(file.name, parsedSections, fileType);

      let departmentId: string | null = null;
      try {
        const departments = await getDepartments();
        const primary = workflowResult.primaryDepartment ?? '';
        const match = departments.find(
          (d) =>
            d.name.toLowerCase().replace(/\s+&\s+/g, ' ').replace(/\s+/g, '_') === primary ||
            primary === d.name.toLowerCase().replace(/\s+/g, '_')
        );
        if (match) departmentId = match.id;
      } catch (_) {}

      toast.info(`Uploading ${file.name}...`, { description: 'Saving to server.' });
      const uploaded = await uploadTemplate(file, departmentId);
      const templateId = uploaded.id;

      const fileSizeBytes = file.size;
      const fileSizeFormatted = `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
      const uploadDateFormatted = new Date().toISOString().split('T')[0];

      if (currentView === 'document-management') {
        setPendingConversion({
          templateId,
          sections: parsedSections,
          fileName: file.name,
          department: workflowResult.primaryDepartment,
          fileSize: fileSizeFormatted,
          uploadDate: uploadDateFormatted,
        });
        setCurrentView('ai-conversion-preview');
        toast.success('AI Analysis Complete!', {
          description: `Document "${file.name}" analyzed. Showing conversion preview.`,
        });
      } else {
        setPendingWorkflow({
          templateId,
          workflow: workflowResult.steps || workflowResult.workflow,
          sections: parsedSections,
          fileName: file.name,
          department: workflowResult.primaryDepartment,
          fileSize: fileSizeFormatted,
          uploadDate: uploadDateFormatted,
          fileType,
        });
        setCurrentView('workflow-approval');
        toast.success('AI Analysis Complete!', {
          description: `Document "${file.name}" analyzed. Please review the generated workflow.`,
        });
      }
    } catch (error: any) {
      console.error('Error processing file:', error);
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      const msg = error.response?.data?.error || error.message || 'Upload or analysis failed';
      const hint = isTimeout
        ? ' Upload timed out. Is the backend running? Run "npm run dev" in the backend folder and check http://localhost:4000/api/health'
        : error.message?.includes('Network Error')
          ? ' Check that the backend is running at http://localhost:4000'
          : '';
      toast.error(msg + (hint ? '. ' + hint : ''));
    } finally {
      setUploadInProgress(false);
    }
  };

  const handleWorkflowApprove = () => {
    if (pendingWorkflow) {
      const approvedWorkflow = {
        id: `workflow_${Date.now()}`,
        fileName: pendingWorkflow.fileName,
        department: pendingWorkflow.department,
        uploadDate: pendingWorkflow.uploadDate,
        workflow: pendingWorkflow.workflow,
        approvedDate: new Date().toISOString().split('T')[0]
      };
      setApprovedWorkflows(prev => [approvedWorkflow, ...prev]);
      setPendingConversion({
        templateId: pendingWorkflow.templateId,
        sections: pendingWorkflow.sections,
        fileName: pendingWorkflow.fileName,
        department: pendingWorkflow.department,
        fileSize: pendingWorkflow.fileSize,
        uploadDate: pendingWorkflow.uploadDate
      });
      setPendingWorkflow(null);
      setCurrentView('ai-conversion-preview');
    }
  };

  const handleWorkflowReject = () => {
    setPendingWorkflow(null);
    setSelectedFiles(null);
    setCurrentView('upload-templates');
  };

  const handleConversionSave = async (updatedSections: FormSection[], updatedFileName?: string, updatedDepartment?: string) => {
    if (!pendingConversion) return;
    const { templateId } = pendingConversion;
    const fileName = updatedFileName || pendingConversion.fileName;
    const departmentSlug = updatedDepartment || pendingConversion.department;

    try {
      let departmentId: string | null = null;
      if (departmentSlug) {
        try {
          const departments = await getDepartments();
          const match = departments.find(
            (d) =>
              d.name.toLowerCase().replace(/\s+&\s+/g, ' ').replace(/\s+/g, '_') === departmentSlug ||
              departmentSlug === d.name.toLowerCase().replace(/\s+/g, '_')
          );
          if (match) departmentId = match.id;
        } catch (_) {}
      }

      const updated = await updateTemplate(templateId, {
        file_name: fileName,
        department_id: departmentId ?? undefined,
        parsed_sections: updatedSections,
      });

      setTemplates((prev) => {
        const others = prev.filter((t) => t.id !== templateId);
        return [
          {
            id: updated.id,
            fileName: updated.fileName,
            uploadDate: typeof updated.uploadDate === 'string' ? updated.uploadDate.split('T')[0] : new Date().toISOString().split('T')[0],
            fileSize: updated.fileSize || '0',
            department: updated.department || departmentSlug,
            status: (updated.status as 'approved' | 'pending') || 'pending',
            parsedSections: updated.parsedSections ?? updatedSections,
          },
          ...others,
        ];
      });
      setPendingConversion(null);
      setSelectedFiles(null);

      addAuditLog(
        'document_uploaded',
        'document',
        updated.id,
        fileName,
        `Document uploaded and converted.`,
        departmentSlug
      );

      toast.success('Template Saved Successfully!');
      setCurrentView('raise-request');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save template');
    }
  };

  const handleConversionCancel = () => {
    setPendingConversion(null);
    setSelectedFiles(null);
    
    // Return to the appropriate view based on role
    if (loginData.role === 'admin' || loginData.role === 'manager' || loginData.role === 'preparator') {
      setCurrentView('document-management');
    } else {
      setCurrentView('upload-templates');
    }
  };

  const handleClearSelection = () => {
    setSelectedFiles(null);
  };

  const handleViewForm = async (requestIdOrReportId: string) => {
    let report = reports.find(r => r.requestId === requestIdOrReportId) || reports.find(r => r.id === requestIdOrReportId);
    if (report) {
      setCurrentDocumentId(report.id);
      setIsEditMode(false);
      const template = templates.find(t => t.fileName === report.fileName);
      await loadFormData(report.id);
      // Always use DocumentEditScreen with Syncfusion editor
      setCurrentView('document-edit-screen-fixed');
    }
  };

  const handleEditForm = async (requestIdOrReportId: string) => {
    const report = reports.find(r => r.requestId === requestIdOrReportId) || reports.find(r => r.id === requestIdOrReportId);
    if (report) {
      setCurrentDocumentId(report.id);
      setIsEditMode(true);
      const template = templates.find(t => t.fileName === report.fileName);
      await loadFormData(report.id);
      
      // Always use DocumentEditScreen with Syncfusion editor
      setCurrentView('document-edit-screen-fixed');
    }
  };

  const handleFormSelection = async (templateId: string) => {
    const selectedTemplate = templates.find((t) => t.id === templateId);
    if (!selectedTemplate?.parsedSections?.length) {
      setCurrentFormData(defaultFormData || currentFormData);
      // Use DocumentEditScreen with Syncfusion editor instead of approval-form
      setCurrentView('document-edit-screen-fixed');
      setCurrentDocumentId(templateId);
      return;
    }
    try {
      const req = await createRequest({ template_id: templateId });
      const newReport: ReportData = {
        id: req.id,
        requestId: req.requestId,
        templateId: req.templateId,
        fileName: req.templateFileName || selectedTemplate.fileName,
        uploadDate: typeof req.createdAt === 'string' ? req.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        assignedTo: req.assignedTo || '',
        department: req.departmentName || undefined,
        status: 'pending',
        lastModified: req.updatedAt || req.createdAt,
        fileSize: selectedTemplate.fileSize || '',
        documentType: 'Request',
      };
      setReports((prev) => [newReport, ...prev]);
      setCurrentDocumentId(req.id);
      await loadFormData(req.id);
      setCurrentView('syncfusion-editor');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create request');
    }
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(reports.filter(report => report.id !== reportId));
    toast.success('Report Deleted');
  };

  const handlePreviewDocument = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;
    if (report.templateId && !report.formData) {
      try {
        const res = await getFormData(reportId);
        // For Syncfusion-based requests, keep the raw data object so we can read the saved SFDT (_sfdt)
        const withFormData = { ...report, formData: res.data as unknown as FormData };
        setSelectedReportForPreview(withFormData);
      } catch (_) {
        setSelectedReportForPreview(report);
      }
    } else {
      setSelectedReportForPreview(report);
    }
    setCurrentView('document-preview');
  };

  const handleDownloadDocument = async (reportId: string, fileName: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) {
      toast.error('Document not found', { description: 'The selected document could not be found.' });
      return;
    }

    try {
      toast.info('Download started', { description: `Downloading ${fileName || report.fileName}...` });

      // For API-backed requests that came from a template, check for edited SFDT first
      if (report.templateId) {
        let blob: Blob;
        
        // Check if there's an updated SFDT version (user edited the document)
        const hasUpdatedSfdt = report.formData && (report.formData as any)._sfdt;
        if (hasUpdatedSfdt) {
          // Download the edited version
          blob = await exportSfdtToDocx((report.formData as any)._sfdt, fileName || report.fileName || 'document.docx');
          toast.info('Downloading edited version', { description: 'Converting modified document...' });
        } else {
          // Download the original template
          blob = await getTemplateFileBlob(report.templateId);
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || report.fileName || 'document';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Download completed');
        return;
      }

      // Fallback for non-template seeded demo data (no backend file yet)
      toast.error('Download not available', {
        description: 'This demo document does not have an attached file to download yet.',
      });
    } catch (err) {
      console.error('Download error', err);
      toast.error('Download failed', { description: 'Please try again or contact support.' });
    }
  };

  const handlePublishDocument = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setReports(prev => prev.map(r => r.id === reportId ? { 
        ...r, 
        status: 'published',
        publishedDate: new Date().toISOString(),
        publishedBy: loginData.username
      } : r));
      toast.success('Document Published');
      
      // After publish document should moved into document effectiveness module
      setTimeout(() => {
        setCurrentView('document-effectiveness');
      }, 1000);
    }
  };

  const updateReportStatus = (reportId: string, newStatus: ReportData['status']) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
  };

  const createNewReport = (templateId: string, assignment?: { reviewerIds: string[]; priority: string; comments: string }) => {
    const template = templates.find(t => t.id === templateId);
    if (template && currentFormData) {
      const newId = (Math.max(...reports.map(r => parseInt(r.id) || 0), 0) + 1).toString();
      const newReqNum = Math.max(...reports.map(r => {
        const match = r.requestId?.match(/REQ(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }), 0) + 1;
      
      const newReport: ReportData = {
        id: newId,
        requestId: `REQ${newReqNum.toString().padStart(3, '0')}`,
        fileName: template.fileName,
        uploadDate: new Date().toISOString().split('T')[0],
        assignedTo: assignment ? assignment.reviewerIds[0] : 'Current User',
        status: assignment ? 'submitted' : 'pending',
        lastModified: new Date().toISOString(),
        fileSize: template.fileSize,
        department: template.department,
        formData: { ...currentFormData },
        documentType: 'Request',
        fromUser: loginData.username,
        reviewSequence: assignment?.reviewerIds,
        currentReviewerIndex: assignment ? 0 : undefined,
        priority: assignment?.priority,
        submissionComments: assignment?.comments
      };
      setReports(prev => [newReport, ...prev]);
      return newId;
    }
    return null;
  };

  const handleSyncfusionSave = async (sfdt: string) => {
    const report = currentDocumentId ? reports.find((r) => r.id === currentDocumentId) : null;
    if (!report?.templateId || !currentDocumentId) return;
    setCurrentFormData((prev) => ({ ...prev, _sfdt: sfdt } as FormData));
    try {
      const template = templates.find((t) => t.id === report.templateId);
      await putFormData(currentDocumentId, {
        data: { ...(currentFormData as Record<string, unknown>), _sfdt: sfdt },
        formSectionsSnapshot: template?.parsedSections ?? undefined,
      });
      
      // Update the reports state with the new SFDT so downloads work correctly
      setReports(prev => prev.map(r => 
        r.id === currentDocumentId 
          ? { ...r, formData: { ...r.formData, _sfdt: sfdt } as FormData }
          : r
      ));
      
      toast.success('Draft saved');
    } catch (_) {
      toast.error('Failed to save draft');
    }
  };

  const handleSave = async (latestSfdt?: string) => {
    if (currentView === 'syncfusion-editor') return;
    
    // If SFDT is provided (from Syncfusion editor), save it
    if (latestSfdt) {
      return handleSyncfusionSave(latestSfdt);
    }
    
    saveFormData();
    const report = currentDocumentId ? reports.find((r) => r.id === currentDocumentId) : null;
    if (report?.templateId && currentDocumentId && currentFormData) {
      try {
        const template = templates.find((t) => t.id === report.templateId);
        await putFormData(currentDocumentId, {
          data: currentFormData as Record<string, unknown>,
          formSectionsSnapshot: template?.parsedSections ?? undefined,
        });
        toast.success('Form saved');
      } catch (_) {
        toast.error('Failed to save form');
      }
      return;
    }
    toast.success('Form Saved');
    if (loginData.role === 'preparator' && currentView === 'dynamic-form') {
      setCurrentView('document-management');
    }
  };

  const handleSubmit = async (latestSfdt?: string) => {
    const report = currentDocumentId ? reports.find((r) => r.id === currentDocumentId) : null;
    let docTitle = 'Request Document';
    if (currentDocumentId && report) {
      const t = report.templateId ? templates.find((tpl) => tpl.id === report.templateId) : templates.find((tpl) => tpl.fileName === report.fileName);
      docTitle = t?.fileName || report?.fileName || 'Request Document';
    }

    // Syncfusion / template flow: save draft first, then open Submit for Approval modal
    if (report?.templateId && currentDocumentId) {
      try {
        const payload = (currentFormData || {}) as Record<string, unknown>;
        if (latestSfdt !== undefined) payload._sfdt = latestSfdt;
        await putFormData(currentDocumentId, {
          data: payload,
          formSectionsSnapshot: templates.find((t) => t.id === report.templateId)?.parsedSections ?? undefined,
        });
        
        // Update the reports state with the new SFDT for consistency
        if (latestSfdt !== undefined) {
          setReports(prev => prev.map(r => 
            r.id === currentDocumentId 
              ? { ...r, formData: { ...r.formData, _sfdt: latestSfdt } as FormData }
              : r
          ));
        }
        
        setPendingSubmissionData({ id: currentDocumentId, title: docTitle });
        setIsSubmissionModalOpen(true);
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to save draft');
      }
      return;
    }

    saveFormData();
    if (currentDocumentId) {
      setPendingSubmissionData({ id: currentDocumentId, title: docTitle });
      setIsSubmissionModalOpen(true);
    }
  };

  const handleFinalSubmit = async (assignment: { reviewerIds: string[]; priority: string; comments: string; action?: string }) => {
    if (!pendingSubmissionData) return;
    
    const { id } = pendingSubmissionData;
    const { action } = assignment;

    // Handle Reviewer specialized actions
    if (action && action !== 'submit') {
      const statusMap: Record<string, ReportData['status']> = {
        'reviewed': (loginData.role === 'approver' || loginData.role === 'manager_approver') ? 'approved' : 'reviewed',
        'revision': 'needs-revision',
        'rejected': 'rejected'
      };
      
      const newStatus = statusMap[action];
      if (newStatus) {
        updateReportStatus(id, newStatus);
        
        // Log activity
        const actionLabel = action === 'reviewed' 
          ? ((loginData.role === 'approver' || loginData.role === 'manager_approver') ? 'Approved' : 'Reviewed')
          : action === 'revision' ? 'Sent for Revision' : 'Rejected';
          
        toast.success(`Request ${actionLabel} successfully`);
        
        setIsSubmissionModalOpen(false);
        setCurrentView('document-library');
        return;
      }
    }

    // Check if we are submitting a new request from a template or an existing report (draft)
    const reportIndex = reports.findIndex(r => r.id === id);
    const isNewRequest = reportIndex === -1;

    if (isNewRequest) {
      createNewReport(id, assignment);
      toast.success('Workflow Initiated', {
        description: `Submitted to ${assignment.reviewerIds.length} reviewers in sequence.`
      });
      setCurrentView('document-library');
      setIsSubmissionModalOpen(false);
      setPendingSubmissionData(null);
    } else {
      // Update existing report (including from Syncfusion editor)
      const updatedReport: ReportData = {
        ...reports[reportIndex],
        status: 'submitted',
        reviewSequence: assignment.reviewerIds,
        currentReviewerIndex: 0,
        assignedTo: assignment.reviewerIds[0],
        priority: assignment.priority,
        submissionComments: assignment.comments,
        lastModified: new Date().toISOString()
      };

      setReports(prev => [updatedReport, ...prev.filter(r => r.id !== id)]);

      // Persist submission data to backend: status, assigned_to, review sequence, priority, comments
      try {
        await updateRequest(id, {
          status: 'submitted',
          assigned_to: assignment.reviewerIds[0] || undefined,
          review_sequence: assignment.reviewerIds,
          priority: assignment.priority,
          submission_comments: assignment.comments || undefined,
        });
        fetchRequestsAsReports();
        toast.success('Workflow Initiated', {
          description: `Sequential review started with ${assignment.reviewerIds.length} members.`
        });
        setCurrentView('document-library');
        setIsSubmissionModalOpen(false);
        setPendingSubmissionData(null);
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { error?: string; detail?: string } } })?.response?.data;
        const errorMessage = msg?.detail || msg?.error || 'Failed to update request';
        toast.error('Submit failed', { description: errorMessage });
      }
    }
  };

  const handleApprove = () => {
    saveFormData();
    if (currentDocumentId) {
      if (currentPage < 6) {
        setCurrentPage(currentPage + 1);
        toast.success(`Page ${currentPage} Approved`);
      } else {
        updateReportStatus(currentDocumentId, 'approved');
        toast.success('Final Registration Completed');
        setCurrentView('document-library');
      }
    }
  };

  const handleCancel = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
    else setCurrentView('dashboard');
  };

  const handleReset = () => {
    setCurrentFormData(defaultFormData || currentFormData);
    toast.info('Form Reset');
  };

  const handleReject = () => {
    if (currentDocumentId) {
      updateReportStatus(currentDocumentId, 'rejected');
      toast.error('Document Rejected');
    }
    setCurrentView('document-library');
  };

  const handleNeedRevisions = () => {
    if (currentDocumentId) {
      setReports(prev => prev.map(r => r.id === currentDocumentId ? { ...r, status: 'needs-revision' } : r));
      toast.warning('Revisions Requested');
    }
    setCurrentView('document-library');
  };

  const addNotification = (notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>) => {
    setNotifications(prev => [{ ...notification, id: `notif_${Date.now()}`, timestamp: new Date().toISOString(), isRead: false }, ...prev]);
  };

  const handleNotificationToggle = () => setIsNotificationOpen(!isNotificationOpen);
  const handleMarkAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const handleMarkAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const handleDeleteNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const handleSaveWorkflowConfig = (id: string, steps: any[]) => {
    setWorkflowCustomSteps(prev => ({ ...prev, [id]: steps }));
  };

  const addAuditLog = (action: AuditLogEntry['action'], entityType: AuditLogEntry['entityType'], entityId: string, entityName: string, details: string, department?: string) => {
    setAuditLogs(prev => [{
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action, entityType, entityId, entityName, user: loginData.username, userRole: loginData.role, department, details, ipAddress: '127.0.0.1'
    }, ...prev]);
  };

  const handleAuditLogsRefresh = () => {
    toast.success('Audit logs refreshed');
  };

  const handleAuditLogsExport = () => {
    toast.success('Audit logs exported successfully');
  };

  const handleDynamicFormSubmit = async (data: Record<string, unknown>) => {
    if (!currentDocumentId) return;
    const report = reports.find((r) => r.id === currentDocumentId);
    if (report?.templateId) {
      try {
        const template = templates.find((t) => t.id === report.templateId);
        await putFormData(currentDocumentId, {
          data,
          formSectionsSnapshot: template?.parsedSections ?? undefined,
        });
        setCurrentFormData(data as FormData);
        setReports((prev) =>
          prev.map((r) => (r.id === currentDocumentId ? { ...r, formData: data as FormData, lastModified: new Date().toISOString() } : r))
        );
        toast.success('Form saved');
      } catch (_) {
        toast.error('Failed to save form');
      }
      return;
    }
    if (currentDocumentId) {
      const template = templates.find(t => t.id === currentDocumentId);
      if (template) {
        createNewReport(currentDocumentId);
        toast.success('Request Submitted Successfully!');
        setCurrentView('raise-request');
      } else {
        const report = reports.find(r => r.id === currentDocumentId);
        if (report) {
          updateReportStatus(currentDocumentId, 'submitted');
          toast.success('Changes Submitted Successfully!');
          setCurrentView('document-library');
        }
      }
    }
  };

  const renderDashboard = () => {
    let dashboardReports = reports;
    if (loginData.role === 'manager_reviewer') {
      dashboardReports = reports.filter(r => !['unknown', 'pending', 'review-process', 'review process'].includes((r.status || '').toLowerCase()));
    }
    
    return (
      <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 min-h-full">
        {loginData.role === 'preparator' ? (
          <PreparatorDashboard onNavigate={handleViewChange} reports={dashboardReports} />
        ) : (
          <Dashboard onNavigate={handleViewChange} reports={dashboardReports} templates={templates} />
        )}
      </div>
    );
  };

  const renderUploadTemplates = () => renderDocumentManagement();

  const renderRaiseRequest = () => {
    const readyTemplates = templates.filter(
      (t) => t.parsedSections && t.parsedSections.length > 0
    );
    return (
      <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 min-h-full">
        <RaiseRequest
          templates={readyTemplates}
          onFormSelect={handleFormSelection}
          onNavigate={handleViewChange}
          departments={departments}
        />
      </div>
    );
  };

  const renderReports = () => {
    let reportsData = reports;
    if (loginData.role === 'manager_reviewer') {
      reportsData = reports.filter(r => !['unknown', 'pending', 'review-process', 'review process'].includes((r.status || '').toLowerCase()));
    }
    
    return (
      <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 min-h-full">
        <Reports
          reports={reportsData}
          onViewForm={handleViewForm}
          onNavigate={handleViewChange}
          filterStatus={filterStatus}
          searchTerm={searchTerm}
          onFilterStatusChange={setFilterStatus}
          onSearchTermChange={setSearchTerm}
          onPreviewDocument={handlePreviewDocument}
          onDeleteReport={handleDeleteReport}
          onDownloadDocument={handleDownloadDocument}
        />
      </div>
    );
  };

  const renderDocumentLibrary = () => {
    // Hide all reports with status 'pending' from Document Library for every role
    let filtered = reports.filter(
      (r) => (r.status || '').toLowerCase() !== 'pending'
    );
    if (loginData.role === 'manager_reviewer') {
      filtered = filtered.filter(
        (r) => !['unknown', 'review-process', 'review process'].includes((r.status || '').toLowerCase())
      );
    }
    // Enrich with department name (from API or template + departments) and file size (from template)
    const libraryReports = filtered.map((r) => {
      const template = r.templateId ? templates.find((t) => t.id === r.templateId) : undefined;
      const deptName =
        r.department ||
        (template && (departments.find((d) => d.id === template.department)?.name ?? template.department)) ||
        undefined;
      const fileSize = r.fileSize || template?.fileSize || undefined;
      return { ...r, department: deptName ?? 'N/A', fileSize: fileSize ?? 'N/A' };
    });

    return (
      <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 min-h-full">
        {loginData.role === 'admin' || loginData.role === 'preparator' ? (
          <PreparatorDocumentLibrary
            reports={libraryReports}
            onViewForm={handleViewForm}
            onPreviewDocument={handlePreviewDocument}
            onDeleteReport={handleDeleteReport}
            onDownloadDocument={handleDownloadDocument}
            onNavigate={handleViewChange}
            onPublishDocument={handlePublishDocument}
            userRole={loginData.role}
            currentUsername={loginData.username}
          />
        ) : loginData.role === 'manager_reviewer' ? (
          <ReviewerDocumentLibrary
            reports={libraryReports}
            onViewForm={handleViewForm}
            onPreviewDocument={handlePreviewDocument}
            onDownloadDocument={handleDownloadDocument}
            onNavigate={handleViewChange}
            currentUsername={loginData.username}
          />
        ) : (
          <DocumentLibrary
            reports={libraryReports}
            templates={templates}
            departments={departments}
            onViewForm={handleViewForm}
            onPreviewDocument={handlePreviewDocument}
            onDeleteReport={handleDeleteReport}
            onDownloadDocument={handleDownloadDocument}
            onNavigate={handleViewChange}
            onPublishDocument={handlePublishDocument}
            userRole={loginData.role}
            currentUsername={loginData.username}
          />
        )}
      </div>
    );
  };

  const renderDocumentManagement = () => (
    <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 min-h-full">
      <DocumentManagement
        templates={templates}
        reports={reports}
        onNavigate={handleViewChange}
        selectedFiles={selectedFiles}
        onFileUpload={handleFileUpload}
        onUploadSubmit={handleUploadSubmit}
        onClearSelection={handleClearSelection}
        uploadInProgress={uploadInProgress}
      />
    </div>
  );

  const renderWorkflows = () => (
    <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 min-h-full text-blue-800">
      <Workflows
        reports={reports}
        templates={templates}
        onNavigate={handleViewChange}
        onConfigureWorkflow={setSelectedWorkflowForConfig}
        workflowCustomSteps={workflowCustomSteps}
        approvedWorkflows={approvedWorkflows}
      />
    </div>
  );

  const renderConfigureWorkflow = () => (
    <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 min-h-full">
      <ConfigureWorkflow
        workflow={selectedWorkflowForConfig}
        onNavigate={handleViewChange}
        onSaveWorkflow={handleSaveWorkflowConfig}
      />
    </div>
  );

  const renderUserManagement = () => (
    <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 min-h-full">
      <UserManagement onNavigate={handleViewChange} />
    </div>
  );

  const renderAIConversionPreview = () => {
    if (!pendingConversion) {
      setCurrentView('upload-templates');
      return null;
    }
    return (
      <div className="bg-slate-50 min-h-full flex-1 min-w-0 w-full">
        <AIConversionPreview
          templateId={pendingConversion.templateId}
          sections={pendingConversion.sections}
          fileName={pendingConversion.fileName}
          department={pendingConversion.department}
          fileSize={pendingConversion.fileSize}
          uploadDate={pendingConversion.uploadDate}
          onSave={handleConversionSave}
          onCancel={handleConversionCancel}
        />
      </div>
    );
  };

  const renderWorkflowApproval = () => {
    if (!pendingWorkflow) return null;
    return (
      <WorkflowApprovalStep
        fileName={pendingWorkflow.fileName}
        department={pendingWorkflow.department}
        fileSize={pendingWorkflow.fileSize}
        uploadDate={pendingWorkflow.uploadDate}
        workflow={pendingWorkflow.workflow}
        fileType={pendingWorkflow.fileType}
        sections={pendingWorkflow.sections}
        onApprove={handleWorkflowApprove}
        onReject={handleWorkflowReject}
      />
    );
  };

  if (showHomePage) {
    return (
      <HomePage 
        onNavigateToDMS={() => { 
          setShowHomePage(false); 
          setIntendedModule('dms'); 
          setShowTicketFlowLogin(false);
        }}
        onNavigateToLogin={() => { 
          setShowHomePage(false); 
          setShowTicketFlowLogin(false);
        }}
        onNavigateToTicketFlow={() => { 
          setShowHomePage(false); 
          setIntendedModule('ticket-flow');
          setTicketFlowLoginModule('ticketflow');
          setShowTicketFlowLogin(true);
        }}
      />
    );
  }

  if (showTicketFlowLogin) {
    return (
      <TicketFlowLogin 
        onLogin={handleTicketFlowLogin}
        onBackToHome={() => {
          setShowTicketFlowLogin(false);
          setShowHomePage(true);
        }}
        moduleType={ticketFlowLoginModule}
      />
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInPage
        loginData={loginData}
        onLoginDataChange={(data) => setLoginData((prev) => ({ ...prev, ...data }))}
        onSignIn={handleSignIn}
        onBackToHome={() => setShowHomePage(true)}
        loginError={loginError}
        isLoading={loginInProgress}
      />
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="flex-shrink-0">
        {loginData.role === 'admin' ? (
          <AdminSidebar
            currentView={currentView}
            onViewChange={handleViewChange}
            userRole={loginData.role}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleSidebarToggle}
          />
        ) : (
          <LeftSidebar
            isCollapsed={isSidebarCollapsed}
            currentView={currentView}
            onViewChange={handleViewChange}
            onToggleCollapse={handleSidebarToggle}
            onChatToggle={handleChatToggle}
            userRole={loginData.role}
          />
        )}
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 flex-shrink-0">
          <LoginHeader 
            onSignOut={handleSignOut} 
            notifications={notifications}
            isNotificationOpen={isNotificationOpen}
            onNotificationToggle={handleNotificationToggle}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDeleteNotification={handleDeleteNotification}
            currentView={currentView}
            currentPage={currentPage}
            currentDocumentId={currentDocumentId}
            onNavigate={handleViewChange}
            onViewForm={handleViewForm}
            isChatOpen={isChatOpen}
            onChatToggle={handleChatToggle}
            isSidebarCollapsed={isSidebarCollapsed}
            userRole={loginData.role}
            username={loginData.username}
          />
        </div>
        
        <div className="flex-1 flex flex-col min-h-0">
          {currentView === 'dashboard' && <div className="flex-1 overflow-y-auto">{renderDashboard()}</div>}
          {currentView === 'upload-templates' && <div className="flex-1 overflow-y-auto">{renderUploadTemplates()}</div>}
          {currentView === 'raise-request' && <div className="flex-1 overflow-y-auto">{renderRaiseRequest()}</div>}
          {currentView === 'reports' && <div className="flex-1 overflow-y-auto">{renderReports()}</div>}
          {currentView === 'document-library' && <div className="flex-1 overflow-y-auto">{renderDocumentLibrary()}</div>}
          {currentView === 'activity-log' && (
            <div className="bg-gray-50 flex-1 overflow-y-auto p-6">
              <ActivityLogTable 
                onViewDetail={(id) => { setSelectedActivityLogRequestId(id); setCurrentView('activity-log-detail'); }}
                reports={reports}
              />
            </div>
          )}
          {currentView === 'activity-log-detail' && (
            <div className="bg-gray-50 flex-1 overflow-y-auto p-6">
              <ActivityLogDetail 
                requestId={selectedActivityLogRequestId || ''}
                onBack={() => { 
                  if (previousView === 'dynamic-form' || previousView === 'approval-form') {
                    setCurrentView(previousView);
                  } else {
                    setSelectedActivityLogRequestId(null); 
                    setCurrentView('activity-log'); 
                  }
                }}
                reports={reports}
              />
            </div>
          )}
          {currentView === 'remarks-inbox' && (
            <div className="bg-gray-50 flex-1 overflow-y-auto p-6">
              <RemarksInbox 
                onViewForm={handleViewForm}
                onEditForm={handleEditForm}
                reports={reports}
                currentUsername={loginData.username}
                userRole={loginData.role}
              />
            </div>
          )}
          {currentView === 'document-management' && <div className="flex-1 overflow-y-auto">{renderDocumentManagement()}</div>}
          {currentView === 'training-management' && (
            <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 flex-1 overflow-y-auto">
              <TrainingManagement trainingRecords={trainingRecords} publishedDocuments={reports.filter(r => r.status === 'published')} />
            </div>
          )}
          {currentView === 'document-effectiveness' && (
            <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 flex-1 overflow-y-auto">
              <DocumentEffectiveness 
                reports={reports} 
                userRole={loginData.role}
                onViewDocument={(id) => {
                  setCurrentDocumentId(id);
                  setCurrentView('dynamic-form');
                }}
                onEditDocument={(id) => {
                  handleEditForm(id);
                }}
              />
            </div>
          )}
          {currentView === 'document-versioning' && (
            <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 flex-1 overflow-y-auto">
              <DocumentVersioning />
            </div>
          )}
          {currentView === 'workflows' && <div className="flex-1 overflow-y-auto">{renderWorkflows()}</div>}
          {currentView === 'configure-workflow' && <div className="flex-1 overflow-y-auto">{renderConfigureWorkflow()}</div>}
          {currentView === 'user-management' && <div className="flex-1 overflow-y-auto">{renderUserManagement()}</div>}
          {currentView === 'departments' && <div className="flex-1 overflow-y-auto"><DepartmentsView /></div>}
          {currentView === 'enterprise' && <div className="flex-1 overflow-y-auto"><EnterpriseSettings onNavigate={handleViewChange} /></div>}
          {currentView === 'admin-home' && (
            <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 flex-1 overflow-y-auto p-6">
              <AdminHomeDashboard onNavigate={handleViewChange} />
            </div>
          )}
          {currentView === 'role-permissions' && (
            <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 flex-1 overflow-y-auto p-6">
              <RolePermissionsManagement />
            </div>
          )}
          {currentView === 'department-setup' && (
            <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 flex-1 overflow-y-auto p-6">
              <DepartmentSetupManagement />
            </div>
          )}
          {currentView === 'workflow-rules' && (
            <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 flex-1 overflow-y-auto p-6">
              <WorkflowRulesSetup />
            </div>
          )}
          {currentView === 'reports-analytics' && (
            <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 flex-1 overflow-y-auto p-6">
              <ReportsAnalyticsDashboard />
            </div>
          )}
          {currentView === 'notifications' && (
            <div className="flex-1 overflow-y-auto">
              <NotificationsHub
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDeleteNotification={handleDeleteNotification}
                currentUser={currentUser}
              />
            </div>
          )}
          {currentView === 'notification-settings' && <div className="flex-1 overflow-y-auto"><NotificationSettings currentUser={currentUser} /></div>}
          {currentView === 'chat' && <div className="flex-1 overflow-y-auto"><Chat onNavigate={handleViewChange} /></div>}
          {currentView === 'audit-logs' && (
            <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 flex-1 overflow-y-auto p-6">
              <AuditLogs
                auditLogs={auditLogs}
                reports={reports}
                onRefresh={handleAuditLogsRefresh}
                onExport={handleAuditLogsExport}
                filterRequestId={selectedRequestIdForAudit}
                onViewActivityDetail={(requestId) => {
                  setSelectedActivityLogRequestId(requestId);
                  setCurrentView('activity-log-detail');
                }}
              />
            </div>
          )}
          {currentView === 'workflow-configuration' && (
            <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 flex-1 overflow-y-auto p-6">
              <WorkflowConfiguration />
            </div>
          )}
          {currentView === 'review-approval' && selectedReportForReview && (
            <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 flex-1 overflow-y-auto p-6">
              <ReviewApprovalInterface
                document={selectedReportForReview}
                currentUser={{ email: currentUser.username, name: currentUser.fullName || currentUser.username, role: currentUser.role }}
                onApprove={() => handleViewChange('document-library')}
                onReject={() => handleViewChange('document-library')}
                onRequestChanges={() => handleViewChange('document-library')}
                onDelegate={() => handleViewChange('document-library')}
                onClose={() => handleViewChange('document-library')}
              />
            </div>
          )}
          {currentView === 'document-publishing' && (
            <div className="flex-1 overflow-y-auto">
              <DocumentPublishing reports={reports} onViewForm={handleViewForm} onPublishDocument={handlePublishDocument} />
            </div>
          )}
          {currentView === 'dynamic-form' && currentDocumentId && (() => {
            const report = reports.find((r) => r.id === currentDocumentId);
            const template = report?.templateId
              ? templates.find((t) => t.id === report.templateId)
              : templates.find((t) => (report ? t.fileName === report.fileName : t.id === currentDocumentId));
            if (template && template.parsedSections) {
              return (
                <div className="flex-1 h-full overflow-hidden">
                  <DocumentEditScreen
                    documentTitle={template.fileName || 'AI Generated Form'}
                    requestId={report?.requestId || 'NEW-REQ'}
                    department={template.department || 'Engineering'}
                    status={report?.status || 'pending'}
                    userRole={loginData.role}
                    username={loginData.username}
                    onBack={() => setCurrentView(loginData.role === 'preparator' ? 'document-library' : 'raise-request')}
                    onSave={handleSave}
                    onSubmit={handleSubmit}
                    onReset={() => {}}
                    onViewActivity={() => {
                      const report = reports.find(r => r.id === currentDocumentId || r.requestId === currentDocumentId);
                      setSelectedActivityLogRequestId(report?.requestId || report?.id || currentDocumentId || '');
                      handleViewChange('activity-log-detail');
                    }}
                    templateId={template.id}
                    fileName={template.fileName}
                    isDynamicForm={true}
                    sections={template.parsedSections}
                    onDynamicSave={handleDynamicFormSubmit}
                    initialData={report?.formData || currentFormData}
                  />
                </div>
              );
            }
            return <div className="p-8 text-center text-slate-600 flex-1">Template not found</div>;
          })()}
          {currentView === 'syncfusion-editor' && currentDocumentId && (() => {
            const report = reports.find((r) => r.id === currentDocumentId);
            const template = report?.templateId
              ? templates.find((t) => t.id === report.templateId)
              : templates.find((t) => (report ? t.fileName === report.fileName : t.id === currentDocumentId));
            if (!report || !template) return <div className="p-8 text-center text-slate-600 flex-1">Document not found</div>;
            const initialSfdt = (currentFormData as Record<string, unknown>)?._sfdt;
            return (
              <div className="flex-1 h-full overflow-hidden">
                <SyncfusionRequestEditor
                  templateId={template.id}
                  requestId={report.requestId || report.id}
                  documentTitle={template.fileName || report.fileName}
                  fileName={template.fileName || report.fileName}
                  department={template.department || report.department || 'Engineering'}
                  status={report.status || 'pending'}
                  onBack={() => setCurrentView(loginData.role === 'preparator' ? 'document-library' : 'raise-request')}
                  onSave={handleSyncfusionSave}
                  onSubmit={handleSubmit}
                  onReset={() => {}}
                  onViewActivity={() => {
                    setSelectedActivityLogRequestId(report.requestId || report.id || currentDocumentId);
                    handleViewChange('activity-log-detail');
                  }}
                  initialSfdt={typeof initialSfdt === 'string' ? initialSfdt : undefined}
                />
              </div>
            );
          })()}
          {currentView === 'document-edit-screen-fixed' && currentDocumentId && (() => {
            const report = reports.find(r => r.id === currentDocumentId);
            const initialSfdt = (currentFormData as Record<string, unknown>)?._sfdt;
            return (
              <div className="flex-1 h-full overflow-hidden">
                <DocumentEditScreen
                  documentTitle={report?.fileName || 'Standard Form'}
                  requestId={report?.requestId || 'NEW-REQ'}
                  department={report?.department || 'Operations'}
                  status={report?.status || 'pending'}
                  userRole={loginData.role}
                  username={loginData.username}
                  onBack={() => setCurrentView('document-library')}
                  onSave={handleSave}
                  onSubmit={handleSubmit}
                  onReset={handleReset}
                  onViewActivity={() => {
                    const report = reports.find(r => r.id === currentDocumentId || r.requestId === currentDocumentId);
                    setSelectedActivityLogRequestId(report?.requestId || report?.id || currentDocumentId || '');
                    handleViewChange('activity-log-detail');
                  }}
                  useSyncfusionEditor={true}
                  templateId={report?.templateId}
                  fileName={report?.fileName}
                  initialSfdt={typeof initialSfdt === 'string' ? initialSfdt : undefined}
                  isFixedForm={true}
                  currentFormData={currentFormData}
                  updateFormData={updateFormData}
                />
              </div>
            );
          })()}
          {currentView === 'document-preview' && selectedReportForPreview && (
            <div className="flex-1 overflow-y-auto">
              <DocumentPreviewScreen 
                document={selectedReportForPreview}
                onBack={() => { setSelectedReportForPreview(null); setCurrentView('document-library'); }}
                onDownload={() => handleDownloadDocument(selectedReportForPreview.id, selectedReportForPreview.fileName)}
              />
            </div>
          )}
          {currentView === 'ai-conversion-preview' && <div className="flex-1 min-w-0 overflow-y-auto flex flex-col">{renderAIConversionPreview()}</div>}
          {currentView === 'workflow-approval' && <div className="flex-1 overflow-y-auto">{renderWorkflowApproval()}</div>}
        </div>
      </div>
      
      <SubmissionAssignmentModal 
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onConfirm={handleFinalSubmit}
        documentTitle={pendingSubmissionData?.title || "Request Document"}
        userRole={loginData.role}
      />
      
      <Toaster />
    </div>
  );
}