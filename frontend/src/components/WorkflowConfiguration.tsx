import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  Save,
  GitBranch,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowDown,
  Copy,
  AlertCircle,
  Shield,
  FileSignature,
  Eye,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  History
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

export interface WorkflowStage {
  id: string;
  name: string;
  type: 'sequential' | 'parallel';
  approvers: string[];
  requiredApprovals: number;
  autoAdvance: boolean;
  escalationTime?: number; // hours
  requireComments: boolean;
  requireSignature: boolean;
  allowDelegation: boolean;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  department: string;
  documentTypes: string[];
  stages: WorkflowStage[];
  active: boolean;
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

interface WorkflowConfigurationProps {
  onSave?: (template: WorkflowTemplate) => void;
}

export const WorkflowConfiguration: React.FC<WorkflowConfigurationProps> = ({ onSave }) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([
    {
      id: 'wf-1',
      name: 'Standard Document Approval',
      description: 'Standard 3-stage sequential approval for general documents',
      department: 'Quality Assurance',
      documentTypes: ['Template', 'Report', 'Specification'],
      active: true,
      createdBy: 'admin@company.com',
      createdAt: '2024-01-15',
      lastModified: '2024-01-20',
      stages: [
        {
          id: 'stage-1',
          name: 'Initial Review',
          type: 'sequential',
          approvers: ['reviewer1@company.com'],
          requiredApprovals: 1,
          autoAdvance: true,
          escalationTime: 24,
          requireComments: true,
          requireSignature: true,
          allowDelegation: true
        },
        {
          id: 'stage-2',
          name: 'Manager Approval',
          type: 'sequential',
          approvers: ['manager1@company.com'],
          requiredApprovals: 1,
          autoAdvance: true,
          escalationTime: 48,
          requireComments: true,
          requireSignature: true,
          allowDelegation: false
        },
        {
          id: 'stage-3',
          name: 'Final Approval',
          type: 'sequential',
          approvers: ['director@company.com'],
          requiredApprovals: 1,
          autoAdvance: true,
          escalationTime: 72,
          requireComments: false,
          requireSignature: true,
          allowDelegation: false
        }
      ]
    },
    {
      id: 'wf-2',
      name: 'Parallel Multi-Department Review',
      description: 'Parallel approval requiring sign-off from multiple departments',
      department: 'Engineering',
      documentTypes: ['Design Document', 'Specification'],
      active: true,
      createdBy: 'admin@company.com',
      createdAt: '2024-01-10',
      lastModified: '2024-01-18',
      stages: [
        {
          id: 'stage-1',
          name: 'Multi-Department Review',
          type: 'parallel',
          approvers: [
            'qa@company.com',
            'engineering@company.com',
            'regulatory@company.com'
          ],
          requiredApprovals: 3,
          autoAdvance: true,
          escalationTime: 48,
          requireComments: true,
          requireSignature: true,
          allowDelegation: true
        },
        {
          id: 'stage-2',
          name: 'Executive Approval',
          type: 'sequential',
          approvers: ['executive@company.com'],
          requiredApprovals: 1,
          autoAdvance: true,
          escalationTime: 72,
          requireComments: false,
          requireSignature: true,
          allowDelegation: false
        }
      ]
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());

  // New workflow template state
  const [newWorkflow, setNewWorkflow] = useState<Partial<WorkflowTemplate>>({
    name: '',
    description: '',
    department: '',
    documentTypes: [],
    stages: [],
    active: true
  });

  const toggleTemplateExpanded = (templateId: string) => {
    const newExpanded = new Set(expandedTemplates);
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId);
    } else {
      newExpanded.add(templateId);
    }
    setExpandedTemplates(newExpanded);
  };

  const handleCreateTemplate = () => {
    const template: WorkflowTemplate = {
      id: `wf-${Date.now()}`,
      name: newWorkflow.name || '',
      description: newWorkflow.description || '',
      department: newWorkflow.department || '',
      documentTypes: newWorkflow.documentTypes || [],
      stages: newWorkflow.stages || [],
      active: true,
      createdBy: 'current-user@company.com',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setTemplates([...templates, template]);
    toast.success('Workflow template created successfully');
    setCreateDialogOpen(false);
    setNewWorkflow({
      name: '',
      description: '',
      department: '',
      documentTypes: [],
      stages: [],
      active: true
    });
  };

  const handleDuplicateTemplate = (template: WorkflowTemplate) => {
    const duplicated: WorkflowTemplate = {
      ...template,
      id: `wf-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setTemplates([...templates, duplicated]);
    toast.success('Workflow template duplicated');
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this workflow template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success('Workflow template deleted');
    }
  };

  const handleToggleActive = (templateId: string) => {
    setTemplates(templates.map(t =>
      t.id === templateId ? { ...t, active: !t.active } : t
    ));
    toast.success('Workflow status updated');
  };

  const addStageToNewWorkflow = () => {
    const newStage: WorkflowStage = {
      id: `stage-${Date.now()}`,
      name: 'New Stage',
      type: 'sequential',
      approvers: [],
      requiredApprovals: 1,
      autoAdvance: true,
      requireComments: true,
      requireSignature: true,
      allowDelegation: true
    };

    setNewWorkflow({
      ...newWorkflow,
      stages: [...(newWorkflow.stages || []), newStage]
    });
  };

  const removeStageFromNewWorkflow = (stageId: string) => {
    setNewWorkflow({
      ...newWorkflow,
      stages: (newWorkflow.stages || []).filter(s => s.id !== stageId)
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Workflow Configuration
            </h1>
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30">
              <Settings className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-600 font-medium">21 CFR Part 11 Compliant</span>
            </div>
          </div>
          <p className="text-slate-600">
            Configure multi-level approval workflows with sequential and parallel stages
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardDescription className="text-purple-100">Total Workflows</CardDescription>
            <CardTitle className="text-3xl font-bold">{templates.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardDescription className="text-green-100">Active Workflows</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {templates.filter(t => t.active).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardDescription className="text-blue-100">Departments</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {new Set(templates.map(t => t.department)).size}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardDescription className="text-amber-100">Avg. Stages</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {templates.length > 0
                ? Math.round(templates.reduce((acc, t) => acc + t.stages.length, 0) / templates.length)
                : 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Workflow Templates List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-purple-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
              <GitBranch className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Workflow Templates</CardTitle>
              <CardDescription>
                Manage approval workflows for different document types
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {templates.map(template => (
              <Card
                key={template.id}
                className={`border-2 transition-all ${
                  template.active
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-slate-200 bg-slate-50/30'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTemplateExpanded(template.id)}
                          className="h-6 w-6 p-0"
                        >
                          {expandedTemplates.has(template.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge
                          variant={template.active ? 'default' : 'outline'}
                          className={
                            template.active
                              ? 'bg-green-500 text-white'
                              : 'text-slate-500'
                          }
                        >
                          {template.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Shield className="h-3 w-3" />
                          CFR Part 11
                        </Badge>
                      </div>
                      <CardDescription className="ml-8">
                        {template.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-2 ml-8">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Users className="h-3 w-3" />
                          {template.department}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <GitBranch className="h-3 w-3" />
                          {template.stages.length} stage{template.stages.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <FileSignature className="h-3 w-3" />
                          {template.stages.filter(s => s.requireSignature).length} signature
                          {template.stages.filter(s => s.requireSignature).length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setViewDialogOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template)}
                        className="h-8 w-8 p-0"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(template.id)}
                        className="h-8 w-8 p-0"
                        title={template.active ? 'Deactivate' : 'Activate'}
                      >
                        {template.active ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-slate-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="h-8 w-8 p-0 text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded View - Workflow Stages */}
                {expandedTemplates.has(template.id) && (
                  <CardContent className="pt-0">
                    <div className="ml-8 space-y-3">
                      {template.stages.map((stage, index) => (
                        <div key={stage.id} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                stage.type === 'parallel'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-purple-500 text-white'
                              }`}
                            >
                              {index + 1}
                            </div>
                            {index < template.stages.length - 1 && (
                              <div className="w-0.5 h-12 bg-slate-300 my-1" />
                            )}
                          </div>
                          <Card className="flex-1 border-slate-200">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-sm">{stage.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className={
                                        stage.type === 'parallel'
                                          ? 'border-blue-500 text-blue-700 bg-blue-50'
                                          : 'border-purple-500 text-purple-700 bg-purple-50'
                                      }
                                    >
                                      {stage.type === 'parallel' ? 'Parallel' : 'Sequential'}
                                    </Badge>
                                    {stage.requireSignature && (
                                      <Badge variant="outline" className="gap-1">
                                        <FileSignature className="h-3 w-3" />
                                        E-Signature
                                      </Badge>
                                    )}
                                    {stage.requireComments && (
                                      <Badge variant="outline" className="gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        Comments
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {stage.escalationTime && (
                                  <div className="flex items-center gap-1 text-xs text-amber-600">
                                    <Clock className="h-3 w-3" />
                                    {stage.escalationTime}h
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-slate-600 space-y-1">
                                <div>
                                  <span className="font-medium">Approvers:</span>{' '}
                                  {stage.approvers.join(', ')}
                                </div>
                                <div>
                                  <span className="font-medium">Required:</span>{' '}
                                  {stage.requiredApprovals} approval
                                  {stage.requiredApprovals !== 1 ? 's' : ''}
                                </div>
                                <div className="flex gap-4 mt-2">
                                  <span
                                    className={
                                      stage.autoAdvance ? 'text-green-600' : 'text-slate-500'
                                    }
                                  >
                                    {stage.autoAdvance ? '✓' : '✗'} Auto-advance
                                  </span>
                                  <span
                                    className={
                                      stage.allowDelegation ? 'text-green-600' : 'text-slate-500'
                                    }
                                  >
                                    {stage.allowDelegation ? '✓' : '✗'} Allow delegation
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Workflow Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              Workflow Details
            </DialogTitle>
            <DialogDescription>
              Complete workflow configuration and approval path
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-6 py-4">
              {/* Template Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-600">Workflow Name</Label>
                  <p className="font-semibold">{selectedTemplate.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Department</Label>
                  <p className="font-semibold">{selectedTemplate.department}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-slate-600">Description</Label>
                  <p className="text-sm">{selectedTemplate.description}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Created By</Label>
                  <p className="text-sm">{selectedTemplate.createdBy}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Last Modified</Label>
                  <p className="text-sm">
                    {new Date(selectedTemplate.lastModified).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Workflow Stages Visual */}
              <div>
                <Label className="text-xs text-slate-600 mb-3 block">Approval Path</Label>
                <div className="space-y-4">
                  {selectedTemplate.stages.map((stage, index) => (
                    <div key={stage.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            stage.type === 'parallel'
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                              : 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white'
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index < selectedTemplate.stages.length - 1 && (
                          <ArrowDown className="h-6 w-6 text-slate-400 my-2" />
                        )}
                      </div>
                      <Card className="flex-1 border-2">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-base">{stage.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  className={
                                    stage.type === 'parallel'
                                      ? 'bg-blue-500'
                                      : 'bg-purple-500'
                                  }
                                >
                                  {stage.type}
                                </Badge>
                                {stage.requireSignature && (
                                  <Badge variant="outline" className="gap-1">
                                    <FileSignature className="h-3 w-3" />
                                    Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {stage.escalationTime && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded text-amber-700">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  {stage.escalationTime}h
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="bg-slate-50 p-3 rounded">
                              <p className="font-medium text-xs text-slate-600 mb-1">
                                Approvers ({stage.approvers.length})
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {stage.approvers.map((approver, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {approver}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Required: {stage.requiredApprovals}
                              </div>
                              <div className="flex items-center gap-2">
                                {stage.requireComments ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-slate-400" />
                                )}
                                Comments Required
                              </div>
                              <div className="flex items-center gap-2">
                                {stage.autoAdvance ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-slate-400" />
                                )}
                                Auto-advance
                              </div>
                              <div className="flex items-center gap-2">
                                {stage.allowDelegation ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-slate-400" />
                                )}
                                Allow Delegation
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Workflow Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Create New Workflow
            </DialogTitle>
            <DialogDescription>
              Configure a new approval workflow template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Workflow Name *</Label>
                <Input
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  placeholder="e.g., Engineering Design Review"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={newWorkflow.description}
                  onChange={(e) =>
                    setNewWorkflow({ ...newWorkflow, description: e.target.value })
                  }
                  placeholder="Describe the purpose and scope of this workflow"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label>Department *</Label>
                <Select
                  value={newWorkflow.department}
                  onValueChange={(value) =>
                    setNewWorkflow({ ...newWorkflow, department: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Regulatory Affairs">Regulatory Affairs</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Procurement">Procurement</SelectItem>
                    <SelectItem value="Supply Chain">Supply Chain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Workflow Stages */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Approval Stages</Label>
                <Button
                  onClick={addStageToNewWorkflow}
                  size="sm"
                  className="gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                >
                  <Plus className="h-3 w-3" />
                  Add Stage
                </Button>
              </div>
              {(newWorkflow.stages || []).length === 0 ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <GitBranch className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">No stages added yet</p>
                  <p className="text-xs text-slate-500">Click "Add Stage" to begin</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(newWorkflow.stages || []).map((stage, index) => (
                    <Card key={stage.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                placeholder="Stage name"
                                value={stage.name}
                                onChange={(e) => {
                                  const updated = [...(newWorkflow.stages || [])];
                                  updated[index] = { ...stage, name: e.target.value };
                                  setNewWorkflow({ ...newWorkflow, stages: updated });
                                }}
                              />
                              <Select
                                value={stage.type}
                                onValueChange={(value: 'sequential' | 'parallel') => {
                                  const updated = [...(newWorkflow.stages || [])];
                                  updated[index] = { ...stage, type: value };
                                  setNewWorkflow({ ...newWorkflow, stages: updated });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="sequential">Sequential</SelectItem>
                                  <SelectItem value="parallel">Parallel</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={stage.requireSignature}
                                  onCheckedChange={(checked) => {
                                    const updated = [...(newWorkflow.stages || [])];
                                    updated[index] = {
                                      ...stage,
                                      requireSignature: checked as boolean
                                    };
                                    setNewWorkflow({ ...newWorkflow, stages: updated });
                                  }}
                                />
                                E-Signature
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={stage.requireComments}
                                  onCheckedChange={(checked) => {
                                    const updated = [...(newWorkflow.stages || [])];
                                    updated[index] = {
                                      ...stage,
                                      requireComments: checked as boolean
                                    };
                                    setNewWorkflow({ ...newWorkflow, stages: updated });
                                  }}
                                />
                                Require Comments
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={stage.allowDelegation}
                                  onCheckedChange={(checked) => {
                                    const updated = [...(newWorkflow.stages || [])];
                                    updated[index] = {
                                      ...stage,
                                      allowDelegation: checked as boolean
                                    };
                                    setNewWorkflow({ ...newWorkflow, stages: updated });
                                  }}
                                />
                                Allow Delegation
                              </label>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStageFromNewWorkflow(stage.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Compliance Notice */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="text-sm text-purple-900">
                  <p className="font-semibold mb-1">21 CFR Part 11 Compliance</p>
                  <p className="text-xs">
                    This workflow will include electronic signature controls, audit trails, and
                    system validation to ensure compliance with FDA regulations.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={
                !newWorkflow.name ||
                !newWorkflow.department ||
                (newWorkflow.stages || []).length === 0
              }
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
