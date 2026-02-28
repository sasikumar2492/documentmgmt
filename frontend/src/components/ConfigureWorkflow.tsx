import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  ArrowLeft,
  Plus,
  X,
  Users,
  Settings,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  Trash2
} from 'lucide-react';
import { ViewType } from '../types';

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

interface ConfigureWorkflowProps {
  workflow: DepartmentWorkflow | null;
  onNavigate: (view: ViewType) => void;
  onSaveWorkflow?: (workflowId: string, customSteps: WorkflowStep[]) => void;
}

export const ConfigureWorkflow: React.FC<ConfigureWorkflowProps> = ({ workflow, onNavigate, onSaveWorkflow }) => {
  const [newApprovalStep, setNewApprovalStep] = useState({ name: '', assignedTo: '', order: '' });
  const [customApprovals, setCustomApprovals] = useState<WorkflowStep[]>([]);

  if (!workflow) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl text-slate-600">No workflow selected</h2>
          <Button 
            className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            onClick={() => onNavigate('workflows')}
          >
            Back to Workflows
          </Button>
        </div>
      </div>
    );
  }

  const handleAddApproval = () => {
    if (newApprovalStep.name && newApprovalStep.assignedTo && newApprovalStep.order) {
      const newStep: WorkflowStep = {
        id: `custom_${Date.now()}`,
        name: newApprovalStep.name,
        status: 'pending',
        assignedTo: newApprovalStep.assignedTo,
        order: parseInt(newApprovalStep.order)
      };
      setCustomApprovals([...customApprovals, newStep]);
      setNewApprovalStep({ name: '', assignedTo: '', order: '' });
    }
  };

  const handleRemoveApproval = (stepId: string) => {
    setCustomApprovals(customApprovals.filter(step => step.id !== stepId));
  };

  const handleSaveWorkflow = () => {
    console.log('Saving workflow with custom approvals:', customApprovals);
    // Save the custom steps to the parent component
    if (onSaveWorkflow && workflow) {
      onSaveWorkflow(workflow.id, sortedCustomApprovals);
    }
    // Navigate back to workflows page
    onNavigate('workflows');
  };

  // Sort custom approvals by order number
  const sortedCustomApprovals = [...customApprovals].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    return orderA - orderB;
  });

  // Merge default and custom steps, then sort by order
  const getAllSteps = () => {
    const defaultSteps = workflow.steps.map((step, index) => ({
      ...step,
      order: index + 1,
      isCustom: false
    }));
    
    const customStepsWithFlag = sortedCustomApprovals.map(step => ({
      ...step,
      isCustom: true
    }));
    
    return [...defaultSteps, ...customStepsWithFlag].sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB;
    });
  };

  const allSteps = getAllSteps();

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with Back Button */}
      <div className="mb-8">
        <Button
          className="mb-4 gap-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white hover:from-slate-600 hover:to-slate-700 shadow-sm hover:shadow-md transition-all"
          onClick={() => onNavigate('workflows')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workflows
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1">Configure Workflow</h1>
            <p className="text-slate-500">{workflow.departmentName} - Add or modify approval steps</p>
          </div>
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
            {workflow.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Workflow Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Workflow Overview Card */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Workflow Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-slate-600">Department</Label>
                <p className="mt-1">{workflow.departmentName}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-600">Description</Label>
                <p className="text-sm text-slate-700 mt-1">{workflow.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                <div>
                  <Label className="text-xs text-slate-600">Documents</Label>
                  <p className="mt-1">{workflow.documentsCount}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Templates</Label>
                  <p className="mt-1">{workflow.templatesCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add New Approval Step Card */}
          <Card className="border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Add Approval Step
              </CardTitle>
              <CardDescription>Create a new approval step for this workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="step-name" className="text-slate-700">Step Name</Label>
                <Input
                  id="step-name"
                  value={newApprovalStep.name}
                  onChange={(e) => setNewApprovalStep({ ...newApprovalStep, name: e.target.value })}
                  placeholder="e.g., Technical Validation"
                  className="mt-1.5 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="assigned-to" className="text-slate-700">Assigned To</Label>
                <Input
                  id="assigned-to"
                  value={newApprovalStep.assignedTo}
                  onChange={(e) => setNewApprovalStep({ ...newApprovalStep, assignedTo: e.target.value })}
                  placeholder="e.g., Senior Engineer"
                  className="mt-1.5 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="order" className="text-slate-700">Order</Label>
                <Input
                  id="order"
                  value={newApprovalStep.order}
                  onChange={(e) => setNewApprovalStep({ ...newApprovalStep, order: e.target.value })}
                  placeholder="e.g., 1"
                  className="mt-1.5 bg-white"
                />
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all gap-2"
                onClick={handleAddApproval}
                disabled={!newApprovalStep.name || !newApprovalStep.assignedTo || !newApprovalStep.order}
              >
                <Plus className="h-4 w-4" />
                Add Step
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Current & Custom Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Approval Steps */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Current Approval Steps</CardTitle>
              <CardDescription>Existing workflow steps that are already configured</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflow.steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center">
                        <span className="text-sm text-slate-700">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-slate-800 mb-1">{step.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-3.5 w-3.5" />
                        <span>{step.assignedTo}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStepStatusIcon(step.status)}
                      <Badge 
                        className={
                          step.status === 'completed' 
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : step.status === 'active'
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }
                      >
                        {step.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Approval Steps */}
          <Card className="border border-purple-200 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-600" />
                Custom Approval Steps
              </CardTitle>
              <CardDescription>Additional steps you've added to this workflow</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedCustomApprovals.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-dashed border-purple-300">
                  <AlertCircle className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-1">No custom steps added yet</p>
                  <p className="text-sm text-slate-500">Use the form on the left to add new approval steps</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedCustomApprovals.map((step, index) => (
                    <div 
                      key={step.id} 
                      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-purple-200 shadow-sm"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white">
                          <span className="text-sm">{step.order}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-slate-800">{step.name}</h4>
                          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300">
                            Order: {step.order}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="h-3.5 w-3.5" />
                          <span>{step.assignedTo}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all"
                        onClick={() => handleRemoveApproval(step.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visual Workflow Flow */}
          <Card className="border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Complete Workflow Flow
              </CardTitle>
              <CardDescription>Visual representation of all approval steps in order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-6 border border-blue-200">
                <div className="flex items-start justify-between gap-2 overflow-x-auto pb-4">
                  {allSteps.map((step, index) => (
                    <div key={step.id} className="flex-1 min-w-[140px] relative">
                      {/* Connecting Line */}
                      {index < allSteps.length - 1 && (
                        <div className="absolute top-10 left-1/2 w-full h-0.5 bg-slate-300 -z-10"></div>
                      )}

                      {/* Step Content */}
                      <div className="flex flex-col items-center text-center">
                        {/* Circle Icon */}
                        <div 
                          className={`
                            w-20 h-20 rounded-full flex items-center justify-center border-4 mb-3 transition-all
                            ${step.isCustom 
                              ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-400' 
                              : step.status === 'completed'
                              ? 'bg-green-50 border-green-500'
                              : step.status === 'active'
                              ? 'bg-blue-50 border-blue-500'
                              : 'bg-slate-50 border-slate-300'
                            }
                          `}
                        >
                          {step.isCustom ? (
                            <Plus className="h-8 w-8 text-purple-600" />
                          ) : (
                            getStepStatusIcon(step.status)
                          )}
                        </div>
                        
                        {/* Step Name */}
                        <p className="text-slate-800 mb-2 px-1">
                          {step.name}
                        </p>
                        
                        {/* Assigned To */}
                        {step.assignedTo && (
                          <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                            <Users className="h-3 w-3" />
                            <span>{step.assignedTo}</span>
                          </div>
                        )}
                        
                        {/* Custom Step Badge */}
                        {step.isCustom && (
                          <Badge className="mt-2 bg-purple-100 text-purple-700 border-purple-300 text-xs">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all"
              onClick={() => onNavigate('workflows')}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all gap-2"
              onClick={handleSaveWorkflow}
            >
              <Save className="h-4 w-4" />
              Save Workflow Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};