import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { CheckCircle, Clock, Circle, XCircle, Building2, BarChart3, Sparkles, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AIWorkflowStep } from '../types';

interface WorkflowStage {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending' | 'rejected';
  assignedTo?: string;
  completedDate?: string;
}

interface WorkflowDialogProps {
  open: boolean;
  onClose: () => void;
  department: string;
  currentStatus: string;
  requestId: string;
  aiWorkflow?: AIWorkflowStep[]; // Optional AI-generated workflow
}

// Define workflows for each department
const DEPARTMENT_WORKFLOWS: Record<string, WorkflowStage[]> = {
  'engineering': [
    { id: 'initial', name: 'Initial Review', status: 'pending' },
    { id: 'technical', name: 'Technical Assessment', status: 'pending' },
    { id: 'design', name: 'Design Verification', status: 'pending' },
    { id: 'testing', name: 'Testing & Validation', status: 'pending' },
    { id: 'approval', name: 'Engineering Approval', status: 'pending' },
  ],
  'manufacturing': [
    { id: 'initial', name: 'Initial Review', status: 'pending' },
    { id: 'feasibility', name: 'Feasibility Study', status: 'pending' },
    { id: 'process', name: 'Process Planning', status: 'pending' },
    { id: 'quality', name: 'Quality Check', status: 'pending' },
    { id: 'approval', name: 'Manufacturing Approval', status: 'pending' },
  ],
  'quality': [
    { id: 'initial', name: 'Initial Review', status: 'pending' },
    { id: 'inspection', name: 'Quality Inspection', status: 'pending' },
    { id: 'testing', name: 'Testing & Analysis', status: 'pending' },
    { id: 'certification', name: 'Certification Review', status: 'pending' },
    { id: 'approval', name: 'QA Approval', status: 'pending' },
  ],
  'quality-assurance': [
    { id: 'initial', name: 'Initial Review', status: 'pending' },
    { id: 'inspection', name: 'Quality Inspection', status: 'pending' },
    { id: 'testing', name: 'Testing & Analysis', status: 'pending' },
    { id: 'certification', name: 'Certification Review', status: 'pending' },
    { id: 'approval', name: 'QA Approval', status: 'pending' },
  ],
  'procurement': [
    { id: 'initial', name: 'Initial Review', status: 'pending' },
    { id: 'vendor', name: 'Vendor Evaluation', status: 'pending' },
    { id: 'pricing', name: 'Pricing Analysis', status: 'pending' },
    { id: 'negotiation', name: 'Contract Negotiation', status: 'pending' },
    { id: 'approval', name: 'Procurement Approval', status: 'pending' },
  ],
  'operations': [
    { id: 'initial', name: 'Initial Review', status: 'pending' },
    { id: 'planning', name: 'Operations Planning', status: 'pending' },
    { id: 'resource', name: 'Resource Allocation', status: 'pending' },
    { id: 'execution', name: 'Execution Review', status: 'pending' },
    { id: 'approval', name: 'Operations Approval', status: 'pending' },
  ],
  'research': [
    { id: 'initial', name: 'Initial Review', status: 'pending' },
    { id: 'research', name: 'Research Analysis', status: 'pending' },
    { id: 'development', name: 'Development Review', status: 'pending' },
    { id: 'prototype', name: 'Prototype Testing', status: 'pending' },
    { id: 'approval', name: 'R&D Approval', status: 'pending' },
  ],
  'supply-chain': [
    { id: 'initial', name: 'Initial Review', status: 'pending' },
    { id: 'logistics', name: 'Logistics Planning', status: 'pending' },
    { id: 'inventory', name: 'Inventory Check', status: 'pending' },
    { id: 'distribution', name: 'Distribution Planning', status: 'pending' },
    { id: 'approval', name: 'Supply Chain Approval', status: 'pending' },
  ],
  'finance': [
    { id: 'initial', name: 'Initial Review', status: 'pending' },
    { id: 'budget', name: 'Budget Analysis', status: 'pending' },
    { id: 'cost', name: 'Cost Evaluation', status: 'pending' },
    { id: 'financial', name: 'Financial Approval', status: 'pending' },
    { id: 'approval', name: 'Finance Approval', status: 'pending' },
  ],
};

// Department display names
const DEPARTMENT_NAMES: Record<string, string> = {
  'engineering': 'Engineering',
  'manufacturing': 'Manufacturing',
  'quality': 'Quality Assurance',
  'quality-assurance': 'Quality Assurance',
  'procurement': 'Procurement',
  'operations': 'Operations',
  'research': 'Research & Development',
  'supply-chain': 'Supply Chain',
  'finance': 'Finance',
};

// Map status to workflow stage
const getWorkflowFromStatus = (status: string, department: string): WorkflowStage[] => {
  const baseWorkflow = DEPARTMENT_WORKFLOWS[department] || DEPARTMENT_WORKFLOWS['engineering'];
  
  // Create a copy of the workflow
  const workflow = baseWorkflow.map(stage => ({ ...stage }));
  
  // Update stages based on current status
  if (status === 'approved') {
    return workflow.map(stage => ({ ...stage, status: 'completed' as const }));
  } else if (status === 'rejected') {
    workflow[0].status = 'rejected';
    return workflow;
  } else if (status === 'pending') {
    workflow[0].status = 'current';
    return workflow;
  } else if (status === 'submitted' || status === 'initial-review') {
    workflow[0].status = 'completed';
    workflow[1].status = 'current';
    return workflow;
  } else if (status === 'review-process') {
    workflow[0].status = 'completed';
    workflow[1].status = 'completed';
    workflow[2].status = 'current';
    return workflow;
  } else if (status === 'final-review') {
    workflow[0].status = 'completed';
    workflow[1].status = 'completed';
    workflow[2].status = 'completed';
    workflow[3].status = 'current';
    return workflow;
  } else if (status === 'supplier-sample') {
    workflow[0].status = 'completed';
    workflow[1].status = 'completed';
    workflow[2].status = 'completed';
    workflow[3].status = 'completed';
    workflow[4].status = 'current';
    return workflow;
  }
  
  return workflow;
};

const getStatusIcon = (status: WorkflowStage['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'current':
      return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
    case 'rejected':
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <Circle className="h-5 w-5 text-slate-300" />;
  }
};

const getStatusBadge = (status: WorkflowStage['status']) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-700 border-green-300">Completed</Badge>;
    case 'current':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-300">In Progress</Badge>;
    case 'rejected':
      return <Badge className="bg-red-100 text-red-700 border-red-300">Rejected</Badge>;
    default:
      return <Badge className="bg-slate-100 text-slate-700 border-slate-300">Pending</Badge>;
  }
};

export const WorkflowDialog: React.FC<WorkflowDialogProps> = ({
  open,
  onClose,
  department,
  currentStatus,
  requestId,
  aiWorkflow
}) => {
  // If AI workflow exists, use the first department from it, otherwise use the provided department
  const [selectedTab, setSelectedTab] = useState(
    aiWorkflow && aiWorkflow.length > 0 ? aiWorkflow[0].department : (department || 'engineering')
  );
  
  // Determine which departments to display
  const displayDepartments = aiWorkflow && aiWorkflow.length > 0
    ? aiWorkflow.map(step => step.department)
    : Object.keys(DEPARTMENT_WORKFLOWS);

  // Render AI-generated workflow for a department
  const renderAIWorkflowForDepartment = (deptWorkflow: AIWorkflowStep) => {
    const pendingStages = deptWorkflow.stages.filter(stage => 
      stage.status === 'pending' || stage.status === 'current'
    );

    return (
      <div className="space-y-6 mt-4">
        {/* AI Badge */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-lg p-3 flex items-center gap-2">
          <Brain className="h-5 w-5 text-emerald-600 animate-pulse" />
          <Sparkles className="h-4 w-4 text-teal-500" />
          <span className="font-semibold text-emerald-900">AI-Generated Workflow</span>
          <Badge className="ml-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs">
            Step {deptWorkflow.order}
          </Badge>
        </div>

        {deptWorkflow.assignedTo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <span className="font-medium">Assigned to:</span> {deptWorkflow.assignedTo}
            </p>
          </div>
        )}

        {/* Workflow Progress */}
        <div className="space-y-4">
          <div className="relative">
            {deptWorkflow.stages.map((stage, index) => (
              <div key={stage.id} className="relative pb-8 last:pb-0">
                {/* Connector Line */}
                {index < deptWorkflow.stages.length - 1 && (
                  <div className="absolute left-[10px] top-[20px] bottom-0 w-0.5 bg-slate-200"></div>
                )}
                
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="relative z-10 bg-white">
                    {getStatusIcon(stage.status)}
                  </div>
                  
                  {/* Stage Details */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-slate-800">{stage.name}</h4>
                        {stage.assignedTo && (
                          <p className="text-sm text-slate-500">Assigned to: {stage.assignedTo}</p>
                        )}
                      </div>
                      {getStatusBadge(stage.status)}
                    </div>
                    
                    {stage.completedDate && (
                      <p className="text-xs text-slate-500">Completed: {stage.completedDate}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Stages Summary */}
        {pendingStages.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Pending Approvals</h4>
            <div className="space-y-1">
              {pendingStages.map(stage => (
                <div key={stage.id} className="flex items-center gap-2 text-sm text-blue-800">
                  <Clock className="h-4 w-4" />
                  <span>{stage.name}</span>
                  {stage.status === 'current' && (
                    <Badge className="ml-auto bg-blue-600 text-white text-xs">Current</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {deptWorkflow.stages.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-xs text-slate-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {deptWorkflow.stages.filter(s => s.status === 'current').length}
            </div>
            <div className="text-xs text-slate-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-400">
              {deptWorkflow.stages.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-xs text-slate-600">Pending</div>
          </div>
        </div>
      </div>
    );
  };

  const renderWorkflowForDepartment = (deptId: string) => {
    const workflow = getWorkflowFromStatus(currentStatus, deptId);
    const pendingStages = workflow.filter(stage => stage.status === 'pending' || stage.status === 'current');
    const isCurrentDepartment = deptId === department;

    return (
      <div className="space-y-6 mt-4">
        {/* Department Badge */}
        {isCurrentDepartment && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-3 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Primary Department for this Request</span>
          </div>
        )}

        {/* Workflow Progress */}
        <div className="space-y-4">
          <div className="relative">
            {workflow.map((stage, index) => (
              <div key={stage.id} className="relative pb-8 last:pb-0">
                {/* Connector Line */}
                {index < workflow.length - 1 && (
                  <div className="absolute left-[10px] top-[20px] bottom-0 w-0.5 bg-slate-200"></div>
                )}
                
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="relative z-10 bg-white">
                    {getStatusIcon(stage.status)}
                  </div>
                  
                  {/* Stage Details */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-slate-800">{stage.name}</h4>
                        {stage.assignedTo && (
                          <p className="text-sm text-slate-500">Assigned to: {stage.assignedTo}</p>
                        )}
                      </div>
                      {getStatusBadge(stage.status)}
                    </div>
                    
                    {stage.completedDate && (
                      <p className="text-xs text-slate-500">Completed: {stage.completedDate}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Stages Summary */}
        {pendingStages.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Pending Approvals</h4>
            <div className="space-y-1">
              {pendingStages.map(stage => (
                <div key={stage.id} className="flex items-center gap-2 text-sm text-blue-800">
                  <Clock className="h-4 w-4" />
                  <span>{stage.name}</span>
                  {stage.status === 'current' && (
                    <Badge className="ml-auto bg-blue-600 text-white text-xs">Current</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {workflow.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-xs text-slate-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {workflow.filter(s => s.status === 'current').length}
            </div>
            <div className="text-xs text-slate-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-400">
              {workflow.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-xs text-slate-600">Pending</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
            {aiWorkflow && aiWorkflow.length > 0 ? (
              <>
                <Brain className="h-6 w-6 text-emerald-600" />
                AI Workflow Status
              </>
            ) : (
              <>
                <Building2 className="h-6 w-6 text-emerald-600" />
                Multi-Department Workflow Status
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-600 flex items-center gap-2">
            <span>
              Request ID: <span className="font-medium text-blue-700">{requestId}</span>
            </span>
            {aiWorkflow && aiWorkflow.length > 0 && (
              <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI Generated
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
          <TabsList className="grid w-full gap-2 bg-slate-100 p-2 rounded-lg h-auto" style={{ gridTemplateColumns: `repeat(${Math.min(displayDepartments.length, 5)}, 1fr)` }}>
            {displayDepartments.map((deptId) => {
              // For AI workflow, get the specific workflow step
              const aiDeptWorkflow = aiWorkflow?.find(step => step.department === deptId);
              const completedCount = aiDeptWorkflow 
                ? aiDeptWorkflow.stages.filter(s => s.status === 'completed').length
                : getWorkflowFromStatus(currentStatus, deptId).filter(s => s.status === 'completed').length;
              const totalCount = aiDeptWorkflow
                ? aiDeptWorkflow.stages.length
                : getWorkflowFromStatus(currentStatus, deptId).length;
              const deptName = aiDeptWorkflow?.departmentName || DEPARTMENT_NAMES[deptId] || deptId;
              const order = aiDeptWorkflow?.order;
              
              return (
                <TabsTrigger
                  key={deptId}
                  value={deptId}
                  className="relative flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {aiWorkflow && order !== undefined && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">{order}</span>
                    </div>
                  )}
                  <span className="text-xs font-medium truncate w-full text-center">
                    {deptName}
                  </span>
                  <span className="text-xs text-slate-500">
                    {completedCount}/{totalCount}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {displayDepartments.map((deptId) => {
            const aiDeptWorkflow = aiWorkflow?.find(step => step.department === deptId);
            
            return (
              <TabsContent key={deptId} value={deptId} className="mt-4">
                <Card className="border-slate-200">
                  <CardHeader className={aiDeptWorkflow 
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200" 
                    : "bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200"
                  }>
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      {aiDeptWorkflow ? (
                        <>
                          <Brain className="h-5 w-5 text-emerald-600" />
                          {aiDeptWorkflow.departmentName} Workflow
                          <Badge className="ml-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI Step {aiDeptWorkflow.order}
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Building2 className="h-5 w-5 text-blue-600" />
                          {DEPARTMENT_NAMES[deptId] || deptId} Department Workflow
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {aiDeptWorkflow 
                      ? renderAIWorkflowForDepartment(aiDeptWorkflow)
                      : renderWorkflowForDepartment(deptId)
                    }
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Overall Progress Summary */}
        <div className={aiWorkflow && aiWorkflow.length > 0
          ? "mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4"
          : "mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4"
        }>
          <h4 className={aiWorkflow && aiWorkflow.length > 0
            ? "font-semibold text-emerald-900 mb-3 flex items-center gap-2"
            : "font-semibold text-blue-900 mb-3 flex items-center gap-2"
          }>
            {aiWorkflow && aiWorkflow.length > 0 ? (
              <>
                <Brain className="h-5 w-5" />
                AI Workflow Progress
              </>
            ) : (
              <>
                <BarChart3 className="h-5 w-5" />
                Overall Progress Summary
              </>
            )}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {displayDepartments.map((deptId) => {
              const aiDeptWorkflow = aiWorkflow?.find(step => step.department === deptId);
              const completedCount = aiDeptWorkflow
                ? aiDeptWorkflow.stages.filter(s => s.status === 'completed').length
                : getWorkflowFromStatus(currentStatus, deptId).filter(s => s.status === 'completed').length;
              const totalCount = aiDeptWorkflow
                ? aiDeptWorkflow.stages.length
                : getWorkflowFromStatus(currentStatus, deptId).length;
              const percentage = Math.round((completedCount / totalCount) * 100);
              const deptName = aiDeptWorkflow?.departmentName || DEPARTMENT_NAMES[deptId] || deptId;
              const order = aiDeptWorkflow?.order;
              
              return (
                <div key={deptId} className="bg-white rounded-lg p-3 border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {deptName}
                    </span>
                    {order !== undefined && (
                      <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs px-1 py-0">
                        #{order}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-10 text-right">
                      {percentage}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {completedCount} of {totalCount} completed
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};