import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  CheckCircle2,
  Wand2,
  Users,
  ArrowRight,
  Save,
  Lightbulb,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';

interface WorkflowStep {
  id: string;
  name: string;
  assignedTo: string;
  description?: string;
  estimatedDuration?: string;
}

interface AIWorkflowCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (workflow: any) => void;
  editWorkflow?: any; // Workflow to edit (if in edit mode)
}

export const AIWorkflowCreator: React.FC<AIWorkflowCreatorProps> = ({ 
  isOpen, 
  onClose,
  onSave,
  editWorkflow
}) => {
  const [workflowName, setWorkflowName] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedSteps, setGeneratedSteps] = useState<WorkflowStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'ai'; content: string }>>([
    {
      type: 'ai',
      content: 'Hello! I\'m your AI Workflow Assistant. Describe the workflow you want to create, and I\'ll help you generate the approval steps automatically. For example: "Create a workflow for engineering documents with technical review, manager approval, and final sign-off."'
    }
  ]);

  // Load edit data when editWorkflow changes
  useEffect(() => {
    if (editWorkflow) {
      setWorkflowName(editWorkflow.departmentName || editWorkflow.name || '');
      setDepartment(editWorkflow.departmentId || editWorkflow.department || '');
      setDescription(editWorkflow.description || '');
      setGeneratedSteps(editWorkflow.steps || []);
      
      // Add a welcome message for edit mode
      setChatMessages([
        {
          type: 'ai',
          content: `You're editing "${editWorkflow.departmentName || editWorkflow.name}". I've loaded the existing workflow with ${editWorkflow.steps?.length || 0} steps. You can modify the steps below, add new ones, or use the chat to regenerate the workflow.`
        }
      ]);
    } else {
      // Reset for create mode
      setWorkflowName('');
      setDepartment('');
      setDescription('');
      setGeneratedSteps([]);
      setChatMessages([
        {
          type: 'ai',
          content: 'Hello! I\'m your AI Workflow Assistant. Describe the workflow you want to create, and I\'ll help you generate the approval steps automatically. For example: "Create a workflow for engineering documents with technical review, manager approval, and final sign-off."'
        }
      ]);
    }
  }, [editWorkflow]);

  const departments = [
    { id: 'engineering', name: 'Engineering', color: 'from-blue-500 to-blue-600' },
    { id: 'manufacturing', name: 'Manufacturing', color: 'from-purple-500 to-purple-600' },
    { id: 'quality', name: 'Quality Assurance', color: 'from-teal-500 to-teal-600' },
    { id: 'procurement', name: 'Procurement', color: 'from-orange-500 to-orange-600' },
    { id: 'operations', name: 'Operations', color: 'from-green-500 to-green-600' },
    { id: 'research', name: 'Research & Development', color: 'from-indigo-500 to-indigo-600' }
  ];

  const samplePrompts = [
    "Create a 3-step approval workflow with team lead, manager, and director review",
    "Design a quality assurance workflow with inspection, testing, and certification steps",
    "Build a procurement workflow with vendor evaluation, price approval, and purchase order steps",
    "Generate a fast-track workflow for urgent requests with only 2 approval levels"
  ];

  const handleGenerateWorkflow = () => {
    if (!userPrompt.trim()) return;

    setIsGenerating(true);
    setChatMessages([...chatMessages, { type: 'user', content: userPrompt }]);

    // Simulate AI processing
    setTimeout(() => {
      // AI-generated steps based on user input
      const steps: WorkflowStep[] = [];
      
      // Parse the prompt and generate appropriate steps
      if (userPrompt.toLowerCase().includes('3-step') || userPrompt.toLowerCase().includes('three')) {
        steps.push(
          { id: '1', name: 'Team Lead Review', assignedTo: 'Department Team Lead', description: 'Initial review and validation', estimatedDuration: '2 hours' },
          { id: '2', name: 'Manager Approval', assignedTo: 'Department Manager', description: 'Management level approval', estimatedDuration: '4 hours' },
          { id: '3', name: 'Director Sign-off', assignedTo: 'Department Director', description: 'Final executive approval', estimatedDuration: '8 hours' }
        );
      } else if (userPrompt.toLowerCase().includes('quality') || userPrompt.toLowerCase().includes('qa')) {
        steps.push(
          { id: '1', name: 'Initial Inspection', assignedTo: 'QA Specialist', description: 'Visual and documentation inspection', estimatedDuration: '3 hours' },
          { id: '2', name: 'Testing & Validation', assignedTo: 'QA Testing Team', description: 'Comprehensive testing procedures', estimatedDuration: '6 hours' },
          { id: '3', name: 'Compliance Check', assignedTo: 'QA Manager', description: 'Compliance and standards verification', estimatedDuration: '4 hours' },
          { id: '4', name: 'Certification', assignedTo: 'QA Director', description: 'Final certification and approval', estimatedDuration: '2 hours' }
        );
      } else if (userPrompt.toLowerCase().includes('procurement') || userPrompt.toLowerCase().includes('vendor')) {
        steps.push(
          { id: '1', name: 'Vendor Evaluation', assignedTo: 'Procurement Specialist', description: 'Assess vendor qualifications', estimatedDuration: '1 day' },
          { id: '2', name: 'Price Approval', assignedTo: 'Finance Manager', description: 'Budget and pricing review', estimatedDuration: '4 hours' },
          { id: '3', name: 'Contract Review', assignedTo: 'Legal Team', description: 'Legal and contract verification', estimatedDuration: '1 day' },
          { id: '4', name: 'Purchase Order', assignedTo: 'Procurement Manager', description: 'Final PO generation and approval', estimatedDuration: '2 hours' }
        );
      } else if (userPrompt.toLowerCase().includes('fast') || userPrompt.toLowerCase().includes('urgent') || userPrompt.toLowerCase().includes('2')) {
        steps.push(
          { id: '1', name: 'Immediate Review', assignedTo: 'On-call Manager', description: 'Urgent priority review', estimatedDuration: '1 hour' },
          { id: '2', name: 'Executive Approval', assignedTo: 'Director', description: 'Fast-track executive decision', estimatedDuration: '2 hours' }
        );
      } else {
        // Default workflow
        steps.push(
          { id: '1', name: 'Request Submission', assignedTo: 'Requester', description: 'Initial request submission', estimatedDuration: '30 minutes' },
          { id: '2', name: 'Initial Review', assignedTo: 'Team Lead', description: 'First level review', estimatedDuration: '4 hours' },
          { id: '3', name: 'Technical Review', assignedTo: 'Technical Expert', description: 'Detailed technical evaluation', estimatedDuration: '8 hours' },
          { id: '4', name: 'Manager Approval', assignedTo: 'Department Manager', description: 'Management approval', estimatedDuration: '4 hours' },
          { id: '5', name: 'Final Sign-off', assignedTo: 'Director', description: 'Executive final approval', estimatedDuration: '8 hours' }
        );
      }

      setGeneratedSteps(steps);
      
      const aiResponse = `Perfect! I've generated a ${steps.length}-step workflow based on your requirements. The workflow includes: ${steps.map(s => s.name).join(', ')}. You can review and customize each step below, or regenerate if you'd like different steps.`;
      
      setChatMessages(prev => [...prev, { type: 'ai', content: aiResponse }]);
      setIsGenerating(false);
      setUserPrompt('');
    }, 1500);
  };

  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      name: 'New Step',
      assignedTo: '',
      description: '',
      estimatedDuration: '4 hours'
    };
    setGeneratedSteps([...generatedSteps, newStep]);
  };

  const handleUpdateStep = (id: string, field: keyof WorkflowStep, value: string) => {
    setGeneratedSteps(generatedSteps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const handleDeleteStep = (id: string) => {
    setGeneratedSteps(generatedSteps.filter(step => step.id !== id));
  };

  const handleSaveWorkflow = () => {
    const workflow = {
      name: workflowName,
      department,
      description,
      steps: generatedSteps,
      createdDate: new Date().toISOString(),
      status: 'active'
    };
    
    console.log('Saving workflow:', workflow);
    if (onSave) {
      onSave(workflow);
    }
    alert(`Workflow "${workflowName}" created successfully!`);
    onClose();
  };

  const handleUseSamplePrompt = (prompt: string) => {
    setUserPrompt(prompt);
  };

  if (!isOpen) return null;

  const selectedDept = departments.find(d => d.id === department);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                {editWorkflow ? 'Edit Workflow' : 'AI Workflow Creator'}
                <Wand2 className="h-5 w-5" />
              </h2>
              <p className="text-sm text-white/90">
                {editWorkflow ? 'Modify your workflow using AI assistance' : 'Let AI help you design the perfect workflow'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left Side - AI Chat Interface */}
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <div className="p-4">
                  <h3 className="text-slate-800 font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    AI Assistant
                  </h3>
                  
                  {/* Chat Messages */}
                  <div className="bg-white rounded-lg p-4 mb-4 max-h-60 overflow-y-auto space-y-3 border border-blue-200">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-sm text-slate-600">Generating workflow...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sample Prompts */}
                  <div className="mb-4">
                    <Label className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-orange-600" />
                      Quick Start Prompts
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {samplePrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handleUseSamplePrompt(prompt)}
                          className="text-left px-3 py-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-xs text-slate-700 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleGenerateWorkflow()}
                      placeholder="Describe your workflow requirements..."
                      className="flex-1 px-4 py-2.5 bg-white border border-blue-300 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isGenerating}
                    />
                    <Button
                      onClick={handleGenerateWorkflow}
                      disabled={!userPrompt.trim() || isGenerating}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Workflow Basic Info */}
              <Card className="border-slate-200">
                <div className="p-4 space-y-4">
                  <h3 className="text-slate-800 font-semibold">Workflow Information</h3>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-700">Workflow Name *</Label>
                    <Input
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="e.g., Engineering Approval Workflow"
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">Department *</Label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">Description</Label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the workflow purpose..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Side - Generated Workflow Steps */}
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-800 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600" />
                      Generated Workflow Steps
                      {generatedSteps.length > 0 && (
                        <span className="text-sm text-purple-600">({generatedSteps.length} steps)</span>
                      )}
                    </h3>
                    <Button
                      onClick={handleAddStep}
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Step
                    </Button>
                  </div>

                  {generatedSteps.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center border border-purple-200">
                      <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                      <p className="text-slate-600 mb-2">No steps generated yet</p>
                      <p className="text-sm text-slate-500">Use the AI Assistant to describe your workflow, or click "Add Step" to create manually</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {generatedSteps.map((step, index) => (
                        <Card key={step.id} className="bg-white border-purple-200">
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Step Number */}
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {index + 1}
                              </div>

                              {/* Step Details */}
                              <div className="flex-1 space-y-3">
                                <div className="space-y-2">
                                  <Label className="text-xs text-slate-600">Step Name</Label>
                                  <Input
                                    value={step.name}
                                    onChange={(e) => handleUpdateStep(step.id, 'name', e.target.value)}
                                    className="border-purple-200"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs text-slate-600 flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    Assigned To
                                  </Label>
                                  <Input
                                    value={step.assignedTo}
                                    onChange={(e) => handleUpdateStep(step.id, 'assignedTo', e.target.value)}
                                    className="border-purple-200"
                                    placeholder="Role or person name"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">Description</Label>
                                    <Input
                                      value={step.description || ''}
                                      onChange={(e) => handleUpdateStep(step.id, 'description', e.target.value)}
                                      className="border-purple-200"
                                      placeholder="Step description"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">Est. Duration</Label>
                                    <Input
                                      value={step.estimatedDuration || ''}
                                      onChange={(e) => handleUpdateStep(step.id, 'estimatedDuration', e.target.value)}
                                      className="border-purple-200"
                                      placeholder="e.g., 4 hours"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteStep(step.id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>

                            {/* Arrow to next step */}
                            {index < generatedSteps.length - 1 && (
                              <div className="flex justify-center mt-3">
                                <ArrowRight className="h-5 w-5 text-purple-400 rotate-90" />
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-between items-center">
          <div className="text-sm text-slate-600">
            {generatedSteps.length > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                {generatedSteps.length} steps configured
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveWorkflow}
              disabled={!workflowName || !department || generatedSteps.length === 0}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {editWorkflow ? 'Update Workflow' : 'Create Workflow'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};