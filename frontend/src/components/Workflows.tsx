import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  GitBranch, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Settings,
  Plus,
  MoreVertical,
  ArrowRight,
  FileText,
  Building2,
  X,
  UserPlus,
  Save
} from 'lucide-react';
import { ViewType, ReportData, TemplateData } from '../types';
import { AIWorkflowCreator } from './AIWorkflowCreator';

interface WorkflowsProps {
  reports: ReportData[];
  templates: TemplateData[];
  onNavigate: (view: ViewType) => void;
  onConfigureWorkflow?: (workflow: DepartmentWorkflow) => void;
  workflowCustomSteps?: Record<string, any[]>;
  approvedWorkflows?: Array<{
    id: string;
    fileName: string;
    department: string;
    uploadDate: string;
    workflow: any[];
    approvedDate: string;
  }>;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'pending';
  assignedTo?: string;
  completedDate?: string;
  order?: number;
}

interface DepartmentWorkflow {
  id: string;
  departmentId: string;
  departmentName: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  documentsCount: number;
  templatesCount: number;
  steps: WorkflowStep[];
  createdDate: string;
}

const DEPARTMENTS = [
  { id: 'engineering', name: 'Engineering', color: 'blue' },
  { id: 'manufacturing', name: 'Manufacturing', color: 'purple' },
  { id: 'quality', name: 'Quality Assurance', color: 'green' },
  { id: 'procurement', name: 'Procurement', color: 'orange' },
  { id: 'operations', name: 'Operations', color: 'indigo' },
  { id: 'research', name: 'Research & Development', color: 'pink' }
];

export const Workflows: React.FC<WorkflowsProps> = ({
  reports = [],
  templates = [],
  onNavigate,
  onConfigureWorkflow,
  workflowCustomSteps,
  approvedWorkflows = []
}) => {
  const safeReports = Array.isArray(reports) ? reports : [];
  const safeTemplates = Array.isArray(templates) ? templates : [];
  
  // State for modals
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<DepartmentWorkflow | null>(null);
  const [newApprovalStep, setNewApprovalStep] = useState({ name: '', assignedTo: '' });
  const [customApprovals, setCustomApprovals] = useState<WorkflowStep[]>([]);
  const [isAICreatorOpen, setIsAICreatorOpen] = useState(false);
  const [customWorkflows, setCustomWorkflows] = useState<DepartmentWorkflow[]>([]);
  const [editingWorkflow, setEditingWorkflow] = useState<DepartmentWorkflow | null>(null);
  const [editedSteps, setEditedSteps] = useState<WorkflowStep[]>([]);

  // Empty arrays - will be populated from actual data
  const mockRequestors: string[] = [];
  const mockQATeam: string[] = [];

  // Convert approved workflows to DepartmentWorkflow format
  const convertedApprovedWorkflows: DepartmentWorkflow[] = approvedWorkflows.map((aw) => ({
    id: aw.id,
    departmentId: aw.department.toLowerCase().replace(/\s+/g, '-'),
    departmentName: aw.department,
    description: `AI-generated workflow for ${aw.fileName}`,
    status: 'active',
    documentsCount: 1,
    templatesCount: 1,
    steps: aw.workflow.map((step: any, index: number) => ({
      id: step.id,
      name: step.name,
      status: index === 0 ? 'active' : 'pending',
      assignedTo: step.role,
      completedDate: undefined,
      order: index + 1
    })),
    createdDate: aw.approvedDate
  }));

  // Use only approved workflows and custom AI-created workflows (remove static department workflows)
  const allWorkflows = [...convertedApprovedWorkflows, ...customWorkflows];

  // Statistics (updated to include only AI workflows)
  const stats = {
    activeWorkflows: allWorkflows.filter(w => w.status === 'active').length,
    totalDocuments: allWorkflows.reduce((sum, w) => sum + w.documentsCount, 0),
    totalTemplates: allWorkflows.reduce((sum, w) => sum + w.templatesCount, 0),
    completedSteps: allWorkflows.reduce((sum, w) => sum + w.steps.filter(s => s.status === 'completed').length, 0),
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'active':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-slate-400" />;
      default:
        return null;
    }
  };

  const getWorkflowStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: 'Active', className: 'bg-green-100 text-green-700 border-green-300' },
      paused: { label: 'Paused', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      completed: { label: 'Completed', className: 'bg-blue-100 text-blue-700 border-blue-300' },
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-slate-100 text-slate-700 border-slate-300' };
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getDepartmentColor = (departmentId: string) => {
    const dept = DEPARTMENTS.find(d => d.id === departmentId);
    return dept?.color || 'blue';
  };

  const handleConfigure = (workflow: DepartmentWorkflow) => {
    setEditingWorkflow(workflow);
    setIsAICreatorOpen(true);
  };

  const handleViewDetails = (workflow: DepartmentWorkflow) => {
    setSelectedWorkflow(workflow);
    setDetailsDialogOpen(true);
  };

  // Get all steps for a workflow including custom steps
  const getAllWorkflowSteps = (workflow: DepartmentWorkflow | null) => {
    if (!workflow) return [];
    
    const defaultSteps = workflow.steps.map((step, index) => ({
      ...step,
      order: index + 1
    }));
    
    const customSteps = workflowCustomSteps?.[workflow.id] || [];
    
    // Merge and sort by order number
    const allSteps = [...defaultSteps, ...customSteps].sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB;
    });
    
    return allSteps;
  };

  const handleAddApproval = () => {
    if (newApprovalStep.name && newApprovalStep.assignedTo) {
      const newStep: WorkflowStep = {
        id: `custom_${Date.now()}`,
        name: newApprovalStep.name,
        status: 'pending',
        assignedTo: newApprovalStep.assignedTo
      };
      setCustomApprovals([...customApprovals, newStep]);
      setNewApprovalStep({ name: '', assignedTo: '' });
    }
  };

  const handleRemoveApproval = (stepId: string) => {
    setCustomApprovals(customApprovals.filter(step => step.id !== stepId));
  };

  const handleSaveWorkflow = () => {
    if (!editingWorkflow) return;
    
    // Merge edited steps with any new custom approvals
    const allSteps = [...editedSteps, ...customApprovals].map((step, index) => ({
      ...step,
      order: index + 1
    }));
    
    // Update the workflow with new steps
    const updatedWorkflow: DepartmentWorkflow = {
      ...editingWorkflow,
      steps: allSteps
    };
    
    // Check if it's a custom workflow or department workflow
    if (editingWorkflow.id.startsWith('wf_custom_')) {
      // Update custom workflow
      setCustomWorkflows(customWorkflows.map(w => 
        w.id === editingWorkflow.id ? updatedWorkflow : w
      ));
    } else {
      // For department workflows, we need to add the modified version to custom workflows
      // with a new ID to preserve it
      const customizedWorkflow = {
        ...updatedWorkflow,
        id: `wf_custom_${Date.now()}`,
        departmentName: `${updatedWorkflow.departmentName} (Modified)`,
        description: `${updatedWorkflow.description} - Modified`
      };
      setCustomWorkflows([...customWorkflows, customizedWorkflow]);
    }
    
    setConfigureDialogOpen(false);
    setEditingWorkflow(null);
    setEditedSteps([]);
    setCustomApprovals([]);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1">Workflows</h1>
            <p className="text-slate-500">Manage and monitor your document approval workflows</p>
          </div>
          <Button onClick={() => setIsAICreatorOpen(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white gap-2 shadow-lg">
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-slate-600 mb-2">Active Workflows</CardTitle>
                  <div className="text-3xl text-slate-800">{stats.activeWorkflows}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Play className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-slate-600 mb-2">Completed Steps</CardTitle>
                  <div className="text-3xl text-slate-800">{stats.completedSteps}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-slate-600 mb-2">Documents</CardTitle>
                  <div className="text-3xl text-slate-800">{stats.totalDocuments}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm text-slate-600 mb-2">Templates</CardTitle>
                  <div className="text-3xl text-slate-800">{stats.totalTemplates}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Workflows List */}
        <div className="space-y-6">
          {allWorkflows.map((workflow) => {
            // Calculate progress for this workflow
            const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
            const totalSteps = workflow.steps.length;
            const progress = Math.round((completedSteps / totalSteps) * 100);
            
            return (
            <Card key={workflow.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-800">{workflow.departmentName} Workflow</CardTitle>
                        <CardDescription className="text-slate-500">{workflow.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getWorkflowStatusBadge(workflow.status)}
                    <Button size="sm" className="h-8 w-8 p-0 bg-gradient-to-r from-slate-500 to-slate-600 text-white hover:from-slate-600 hover:to-slate-700">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Workflow Metadata */}
                <div className="flex items-center gap-6 mt-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{workflow.documentsCount} documents</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{workflow.templatesCount} templates</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{progress}% complete</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Workflow Steps */}
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex-1 relative">
                        {/* Connecting Line */}
                        {index < workflow.steps.length - 1 && (
                          <div className="absolute top-6 left-1/2 w-full h-0.5 bg-slate-200 -z-10">
                            <div
                              className={`h-full transition-all duration-500 ${
                                step.status === 'completed' ? 'bg-green-500' : 'bg-slate-200'
                              }`}
                            ></div>
                          </div>
                        )}

                        {/* Step Content */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-3 ${
                              step.status === 'completed'
                                ? 'bg-green-50 border-green-500'
                                : step.status === 'active'
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-slate-50 border-slate-300'
                            }`}
                          >
                            {getStepStatusIcon(step.status)}
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-slate-800 mb-1">{step.name}</p>
                            {step.assignedTo && (
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                                <Users className="h-3 w-3" />
                                <span>{step.assignedTo}</span>
                              </div>
                            )}
                            {step.completedDate && (
                              <p className="text-xs text-slate-400 mt-1">{step.completedDate}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all" onClick={() => handleConfigure(workflow)}>
                      <Settings className="h-4 w-4" />
                      Configure
                    </Button>
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-md hover:shadow-lg transition-all">
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                  </div>
                  <Button size="sm" className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all" onClick={() => handleViewDetails(workflow)}>
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>

        {/* Empty State (if no workflows) */}
        {allWorkflows.length === 0 && (
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 text-lg font-medium mb-1">No workflows yet</p>
                <p className="text-slate-500 mb-6">Create your first workflow to automate document approvals</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Configure Workflow Dialog */}
      <Dialog open={configureDialogOpen} onOpenChange={setConfigureDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Workflow - {editingWorkflow?.departmentName}</DialogTitle>
            <DialogDescription>
              Edit existing steps or add new approval steps to customize the workflow.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Existing Steps */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Current Workflow Steps</h3>
              <div className="space-y-2 mb-4">
                {editedSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <Input
                        value={step.name}
                        onChange={(e) => {
                          const updated = [...editedSteps];
                          updated[index] = { ...step, name: e.target.value };
                          setEditedSteps(updated);
                        }}
                        className="bg-white mb-1"
                        placeholder="Step name"
                      />
                      <Input
                        value={step.assignedTo || ''}
                        onChange={(e) => {
                          const updated = [...editedSteps];
                          updated[index] = { ...step, assignedTo: e.target.value };
                          setEditedSteps(updated);
                        }}
                        className="bg-white text-sm"
                        placeholder="Assigned to"
                      />
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700" 
                      onClick={() => setEditedSteps(editedSteps.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Step Section */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Add New Step</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="approval-name" className="text-slate-700">Step Name</Label>
                  <Input
                    id="approval-name"
                    value={newApprovalStep.name}
                    onChange={(e) => setNewApprovalStep({ ...newApprovalStep, name: e.target.value })}
                    placeholder="Enter step name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="approval-assigned" className="text-slate-700">Assigned To</Label>
                  <Input
                    id="approval-assigned"
                    value={newApprovalStep.assignedTo}
                    onChange={(e) => setNewApprovalStep({ ...newApprovalStep, assignedTo: e.target.value })}
                    placeholder="Enter assigned person"
                    className="mt-1"
                  />
                </div>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700" 
                  onClick={handleAddApproval}
                  disabled={!newApprovalStep.name || !newApprovalStep.assignedTo}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>
            </div>

            {/* New Steps Added */}
            {customApprovals.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">New Steps Added</h3>
                <div className="space-y-2">
                  {customApprovals.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-semibold">
                        {editedSteps.length + index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{step.name}</p>
                        <p className="text-xs text-slate-600">{step.assignedTo}</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700" 
                        onClick={() => handleRemoveApproval(step.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                setConfigureDialogOpen(false);
                setEditingWorkflow(null);
                setEditedSteps([]);
                setCustomApprovals([]);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md" 
              onClick={handleSaveWorkflow}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Workflow
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Workflow Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedWorkflow?.departmentName} Workflow Details</DialogTitle>
            <DialogDescription>
              Complete information about workflow, requestors, and team members
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Workflow Overview */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-blue-600" />
                Workflow Overview
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-600">Status</Label>
                  <p className="text-sm mt-1">{getWorkflowStatusBadge(selectedWorkflow?.status || 'active')}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Department</Label>
                  <p className="text-sm mt-1">{selectedWorkflow?.departmentName}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Total Documents</Label>
                  <p className="text-sm mt-1">{selectedWorkflow?.documentsCount || 0}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Templates</Label>
                  <p className="text-sm mt-1">{selectedWorkflow?.templatesCount || 0}</p>
                </div>
              </div>
            </div>

            {/* Requestors Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-600" />
                All Requestors
              </h3>
              <div className="space-y-2">
                {mockRequestors.map((requestor, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs">
                      {requestor.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-slate-700">{requestor}</span>
                    <Badge className="ml-auto bg-purple-100 text-purple-700">Requestor</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* QA Team Section */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                QA Team Members
              </h3>
              <div className="space-y-2">
                {mockQATeam.map((member, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-xs">
                      {member.split(' ').slice(-2).map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-slate-700">{member}</span>
                    <Badge className="ml-auto bg-green-100 text-green-700">QA</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Approval Steps
              </h3>
              <div className="space-y-2">
                {getAllWorkflowSteps(selectedWorkflow).map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 p-2 bg-white rounded-md shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800">{step.name}</p>
                      <p className="text-xs text-slate-500">{step.assignedTo}</p>
                    </div>
                    {getWorkflowStatusBadge(step.status)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700" 
              onClick={() => setDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Workflow Creator */}
      <AIWorkflowCreator
        isOpen={isAICreatorOpen}
        onClose={() => {
          setIsAICreatorOpen(false);
          setEditingWorkflow(null);
        }}
        editWorkflow={editingWorkflow}
        onSave={(workflow) => {
          if (editingWorkflow) {
            // Edit mode: Update existing workflow
            const updatedWorkflow: DepartmentWorkflow = {
              ...editingWorkflow,
              departmentName: workflow.name || editingWorkflow.departmentName,
              departmentId: workflow.department || editingWorkflow.departmentId,
              description: workflow.description || editingWorkflow.description,
              steps: workflow.steps.map((step: any, index: number) => ({
                id: step.id,
                name: step.name,
                status: step.status || (index === 0 ? 'active' : 'pending'),
                assignedTo: step.assignedTo,
                completedDate: step.completedDate,
                order: index + 1
              }))
            };

            // Check if it's a custom workflow or department workflow
            if (editingWorkflow.id.startsWith('wf_custom_')) {
              // Update custom workflow
              setCustomWorkflows(customWorkflows.map(w => 
                w.id === editingWorkflow.id ? updatedWorkflow : w
              ));
            } else {
              // For department workflows, create a modified copy
              const customizedWorkflow = {
                ...updatedWorkflow,
                id: `wf_custom_${Date.now()}`,
                departmentName: `${workflow.name || editingWorkflow.departmentName} (Modified)`,
              };
              setCustomWorkflows([...customWorkflows, customizedWorkflow]);
            }
          } else {
            // Create mode: Add new workflow
            const newWorkflow: DepartmentWorkflow = {
              id: `wf_custom_${Date.now()}`,
              departmentId: workflow.department || 'custom',
              departmentName: workflow.name || 'Custom Workflow',
              description: workflow.description || 'AI-generated workflow',
              status: workflow.status || 'active',
              documentsCount: 0,
              templatesCount: 0,
              steps: workflow.steps.map((step: any, index: number) => ({
                id: step.id,
                name: step.name,
                status: index === 0 ? 'active' : 'pending',
                assignedTo: step.assignedTo,
                completedDate: undefined,
                order: index + 1
              })),
              createdDate: workflow.createdDate || new Date().toISOString().split('T')[0]
            };
            
            setCustomWorkflows([...customWorkflows, newWorkflow]);
          }
          
          setIsAICreatorOpen(false);
          setEditingWorkflow(null);
        }}
      />
    </>
  );
};