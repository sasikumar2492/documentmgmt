import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, ChevronRight, Sparkles, Zap, ArrowRight, Play, Settings, Users, FileCheck, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  name: string;
  department: string;
  role: string;
  estimatedDays: number;
  required: boolean;
  description: string;
}

interface WorkflowApprovalStepProps {
  fileName: string;
  department: string;
  fileSize: string;
  uploadDate: string;
  workflow: WorkflowStep[];
  fileType?: string;
  sections?: { id: string; title: string; fields: any[] }[];
  onApprove: () => void;
  onReject: () => void;
  onModifyWorkflow?: (workflow: WorkflowStep[]) => void;
}

export const WorkflowApprovalStep: React.FC<WorkflowApprovalStepProps> = ({
  fileName,
  department,
  fileSize,
  uploadDate,
  workflow: generatedWorkflow,
  sections,
  onApprove,
  onReject,
  onModifyWorkflow
}) => {
  const [isGenerating, setIsGenerating] = useState(true);

  // Simulate AI generation animation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      'Engineering': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
      'Quality Assurance': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
      'Manufacturing': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
      'Procurement': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
      'Operations': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300' },
      'Research & Development': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300' },
      'Management': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-300' },
      'Compliance': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300' },
      'Regulatory Affairs': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300' },
      'Finance': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
      'Safety': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' }
    };
    return colors[dept] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-300' };
  };

  const totalEstimatedDays = generatedWorkflow.reduce((sum, step) => sum + step.estimatedDays, 0);

  // Download workflow as PDF
  const handleDownloadWorkflow = () => {
    // Create a simple HTML content for the workflow matching the UI format
    const workflowHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Workflow - ${fileName}</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 0;
              padding: 40px; 
              background: linear-gradient(to bottom right, #f8fafc, #eff6ff, #eef2ff);
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
            }
            .header-card {
              background: white;
              border: 2px solid #bfdbfe;
              border-radius: 12px;
              padding: 24px;
              margin-bottom: 24px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header-content {
              background: linear-gradient(to right, #dbeafe, #e0e7ff);
              padding: 20px;
              border-radius: 8px;
              border-bottom: 2px solid #93c5fd;
            }
            h1 { 
              margin: 0 0 8px 0;
              font-size: 28px;
              background: linear-gradient(to right, #2563eb, #4f46e5, #7c3aed);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .auto-generated-badge {
              display: inline-block;
              background: linear-gradient(to right, #22c55e, #10b981);
              color: white;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
              margin-left: 8px;
            }
            .metadata { 
              background: linear-gradient(to bottom right, #f8fafc, #eff6ff);
              padding: 20px; 
              border-radius: 12px; 
              margin: 20px 0;
              border: 2px solid #e0e7ff;
            }
            .metadata-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }
            .metadata-item {
              background: white;
              padding: 12px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .metadata-label {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .metadata-value {
              font-size: 14px;
              color: #1e293b;
              font-weight: bold;
            }
            .workflow-card {
              background: white;
              border: 2px solid #bfdbfe;
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .workflow-title {
              font-size: 20px;
              font-weight: bold;
              color: #1e293b;
              margin-bottom: 8px;
            }
            .workflow-description {
              color: #64748b;
              font-size: 14px;
              margin-bottom: 20px;
            }
            .flowchart-container {
              background: linear-gradient(to bottom right, #f8fafc, #eff6ff);
              border: 2px solid #c7d2fe;
              border-radius: 12px;
              padding: 40px;
              overflow-x: auto;
            }
            .flowchart {
              display: flex;
              align-items: center;
              justify-content: flex-start;
              gap: 16px;
              min-width: max-content;
            }
            .step-container {
              position: relative;
              display: inline-block;
            }
            .step-number {
              position: absolute;
              top: -12px;
              left: -12px;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 14px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              border: 2px solid white;
              z-index: 10;
            }
            .step-pill {
              border-radius: 9999px;
              padding: 24px 32px;
              min-width: 200px;
              text-align: center;
              box-shadow: 0 4px 16px rgba(0,0,0,0.15);
              border: 4px solid;
            }
            .step-pill.first {
              background: linear-gradient(to right, #fb923c, #ea580c);
              border-color: #f97316;
            }
            .step-pill.last {
              background: linear-gradient(to right, #a78bfa, #7c3aed);
              border-color: #8b5cf6;
            }
            .step-pill.odd {
              background: linear-gradient(to right, #22d3ee, #0891b2);
              border-color: #06b6d4;
            }
            .step-pill.even {
              background: linear-gradient(to right, #4ade80, #16a34a);
              border-color: #22c55e;
            }
            .step-pill.default {
              background: linear-gradient(to right, #60a5fa, #2563eb);
              border-color: #3b82f6;
            }
            .step-number.first { background: linear-gradient(to bottom right, #fb923c, #ea580c); }
            .step-number.last { background: linear-gradient(to bottom right, #a78bfa, #7c3aed); }
            .step-number.odd { background: linear-gradient(to bottom right, #22d3ee, #0891b2); }
            .step-number.even { background: linear-gradient(to bottom right, #4ade80, #16a34a); }
            .step-number.default { background: linear-gradient(to bottom right, #60a5fa, #2563eb); }
            .role-badge {
              display: inline-block;
              background: rgba(255,255,255,0.3);
              color: white;
              padding: 4px 8px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 8px;
              border: 1px solid rgba(255,255,255,0.5);
            }
            .position-badge {
              display: inline-block;
              background: white;
              padding: 4px 8px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: bold;
              margin-left: 4px;
            }
            .position-badge.start { color: #ea580c; }
            .position-badge.final { color: #7c3aed; }
            .step-name {
              font-size: 18px;
              font-weight: bold;
              color: white;
              margin: 8px 0;
              text-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }
            .step-department {
              color: rgba(255,255,255,0.9);
              font-size: 14px;
              font-weight: 500;
              margin-bottom: 8px;
            }
            .step-timeline {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 6px 12px;
              border-radius: 9999px;
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
            }
            .step-timeline span {
              color: white;
              font-size: 12px;
              font-weight: bold;
            }
            .arrow {
              position: relative;
              width: 64px;
              height: 4px;
              background: linear-gradient(to right, #94a3b8, #64748b);
            }
            .arrow::after {
              content: '';
              position: absolute;
              right: -4px;
              top: 50%;
              transform: translateY(-50%);
              width: 0;
              height: 0;
              border-top: 6px solid transparent;
              border-bottom: 6px solid transparent;
              border-left: 10px solid #64748b;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #64748b;
              font-size: 12px;
              padding: 20px;
              border-top: 2px solid #e2e8f0;
            }
            .step-details-table {
              width: 100%;
              margin-top: 32px;
              border-collapse: collapse;
            }
            .step-details-table th {
              background: linear-gradient(to right, #f1f5f9, #e0e7ff);
              color: #475569;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              border-bottom: 2px solid #cbd5e1;
              font-size: 13px;
            }
            .step-details-table td {
              padding: 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13px;
              color: #334155;
            }
            .step-details-table tr:hover {
              background: #f8fafc;
            }
            .required-badge {
              background: #fee2e2;
              color: #991b1b;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header Card -->
            <div class="header-card">
              <div class="header-content">
                <h1>
                  ⚡ AI Generated Workflow
                  <span class="auto-generated-badge">✨ Auto-Generated</span>
                </h1>
                <p style="color: #64748b; margin: 8px 0 0 0; font-size: 14px;">
                  Review the automatically generated workflow for your document
                </p>
              </div>
              
              <!-- Metadata Grid -->
              <div class="metadata">
                <div class="metadata-grid">
                  <div class="metadata-item">
                    <div class="metadata-label">Document Name</div>
                    <div class="metadata-value">${fileName}</div>
                  </div>
                  <div class="metadata-item">
                    <div class="metadata-label">Department</div>
                    <div class="metadata-value">${department}</div>
                  </div>
                  <div class="metadata-item">
                    <div class="metadata-label">Upload Date</div>
                    <div class="metadata-value">${uploadDate}</div>
                  </div>
                  <div class="metadata-item">
                    <div class="metadata-label">Total Steps</div>
                    <div class="metadata-value">${generatedWorkflow.length} Steps</div>
                  </div>
                  <div class="metadata-item">
                    <div class="metadata-label">Estimated Duration</div>
                    <div class="metadata-value">${totalEstimatedDays} Days</div>
                  </div>
                  <div class="metadata-item">
                    <div class="metadata-label">Status</div>
                    <div class="metadata-value" style="color: #22c55e;">Active</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Workflow Card -->
            <div class="workflow-card">
              <div class="workflow-title">⚙️ Generated Approval Workflow</div>
              <div class="workflow-description">
                Optimized approval sequence with ${generatedWorkflow.length} steps spanning ${totalEstimatedDays} days
              </div>
              
              <!-- Flowchart -->
              <div class="flowchart-container">
                <div class="flowchart">
                  ${generatedWorkflow.map((step, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === generatedWorkflow.length - 1;
                    
                    let pillClass = 'default';
                    let numberClass = 'default';
                    
                    if (isFirst) {
                      pillClass = 'first';
                      numberClass = 'first';
                    } else if (isLast) {
                      pillClass = 'last';
                      numberClass = 'last';
                    } else if (idx % 3 === 1) {
                      pillClass = 'odd';
                      numberClass = 'odd';
                    } else if (idx % 3 === 2) {
                      pillClass = 'even';
                      numberClass = 'even';
                    }
                    
                    return `
                      <!-- Step ${idx + 1} -->
                      <div class="step-container">
                        <div class="step-number ${numberClass}">${idx + 1}</div>
                        <div class="step-pill ${pillClass}">
                          <div>
                            <span class="role-badge">${step.role}</span>
                            ${isFirst ? '<span class="position-badge start">START</span>' : ''}
                            ${isLast ? '<span class="position-badge final">FINAL</span>' : ''}
                          </div>
                          <div class="step-name">${step.name}</div>
                          <div class="step-department">${step.department}</div>
                          <div class="step-timeline">
                            <span>⏱️ ${step.estimatedDays}d</span>
                          </div>
                        </div>
                      </div>
                      
                      ${idx < generatedWorkflow.length - 1 ? '<div class="arrow"></div>' : ''}
                    `;
                  }).join('')}
                </div>
              </div>
              
              <!-- Detailed Step Information Table -->
              <table class="step-details-table">
                <thead>
                  <tr>
                    <th style="width: 40px;">#</th>
                    <th>Step Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Description</th>
                    <th style="width: 80px;">Duration</th>
                    <th style="width: 80px;">Required</th>
                  </tr>
                </thead>
                <tbody>
                  ${generatedWorkflow.map((step, idx) => `
                    <tr>
                      <td style="font-weight: bold; color: #3b82f6;">${idx + 1}</td>
                      <td style="font-weight: bold;">${step.name}</td>
                      <td>${step.role}</td>
                      <td>${step.department}</td>
                      <td>${step.description}</td>
                      <td style="font-weight: bold;">${step.estimatedDays}d</td>
                      <td>${step.required ? '<span class="required-badge">REQUIRED</span>' : '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="footer">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} by AI Workflow Generator
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Create a Blob from the HTML content
    const blob = new Blob([workflowHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `Workflow_${fileName.replace(/\.[^/.]+$/, '')}_${new Date().getTime()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Workflow Downloaded Successfully!', {
      description: 'The workflow has been saved as an HTML file. You can open it in any browser or print to PDF.'
    });
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl border-2 border-blue-200 shadow-2xl">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              {/* AI Animation */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-white animate-pulse" />
                </div>
              </div>

              {/* Loading Text */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Workflow Generator
                </h2>
                <p className="text-slate-600">
                  Analyzing your document and generating optimal workflow...
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 text-left max-w-md mx-auto">
                {[
                  { text: 'Analyzing document sections and headings', delay: 0 },
                  { text: 'Detecting departments from content', delay: 500 },
                  { text: 'Optimizing approval sequence', delay: 1000 },
                  { text: 'Calculating review timelines', delay: 1500 }
                ].map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]"
                    style={{ animationDelay: `${step.delay}ms` }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-slate-700">{step.text}</span>
                  </div>
                ))}
              </div>

              {/* Loading Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-[slideRight_2.5s_ease-in-out]"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideRight {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-blue-200 shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    AI Generated Workflow
                  </span>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Auto-Generated
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Review and approve the automatically generated workflow for your document
                </CardDescription>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="outline" className="border-blue-400 text-blue-700 text-sm">
                  {department}
                </Badge>
                <p className="text-xs text-slate-500">{fileName}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Generated Approval Workflow */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Generated Approval Workflow
            </CardTitle>
            <CardDescription>
              Optimized approval sequence with {generatedWorkflow.length} steps spanning {totalEstimatedDays} days
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-8 border-2 border-indigo-200 shadow-lg overflow-x-auto">
              {/* Horizontal Flowchart */}
              <div className="flex items-center justify-start gap-4 min-w-max pb-4">
                {generatedWorkflow.map((step, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === generatedWorkflow.length - 1;
                  
                  // Define colors for different positions
                  let bgGradient = 'from-blue-400 to-blue-600';
                  let borderColor = 'border-blue-500';
                  let ringColor = 'ring-blue-200';
                  
                  if (isFirst) {
                    bgGradient = 'from-orange-400 to-orange-600';
                    borderColor = 'border-orange-500';
                    ringColor = 'ring-orange-200';
                  } else if (isLast) {
                    bgGradient = 'from-purple-400 to-purple-600';
                    borderColor = 'border-purple-500';
                    ringColor = 'ring-purple-200';
                  } else if (idx % 3 === 1) {
                    bgGradient = 'from-cyan-400 to-cyan-600';
                    borderColor = 'border-cyan-500';
                    ringColor = 'ring-cyan-200';
                  } else if (idx % 3 === 2) {
                    bgGradient = 'from-green-400 to-green-600';
                    borderColor = 'border-green-500';
                    ringColor = 'ring-green-200';
                  }
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      {/* Workflow Step Pill */}
                      <div className="relative group">
                        {/* Step Number Badge */}
                        <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br ${bgGradient} text-white flex items-center justify-center font-bold text-sm shadow-lg z-10 ring-2 ring-white`}>
                          {idx + 1}
                        </div>
                        
                        {/* Pill Container */}
                        <div className={`relative rounded-full px-8 py-6 bg-gradient-to-r ${bgGradient} shadow-lg hover:shadow-2xl transition-all duration-300 border-4 ${borderColor} ring-4 ${ringColor} min-w-[200px]`}>
                          <div className="text-center">
                            {/* Role Badge */}
                            <div className="mb-2">
                              <Badge className="bg-white/30 backdrop-blur-sm text-white border-white/50 text-xs">
                                {step.role}
                              </Badge>
                              {isFirst && (
                                <Badge className="ml-1 bg-white text-orange-600 border-0 text-xs font-bold">
                                  START
                                </Badge>
                              )}
                              {isLast && (
                                <Badge className="ml-1 bg-white text-purple-600 border-0 text-xs font-bold">
                                  FINAL
                                </Badge>
                              )}
                            </div>
                            
                            {/* Name */}
                            <h4 className="font-bold text-white text-lg mb-1 drop-shadow-md">
                              {step.name}
                            </h4>
                            
                            {/* Department */}
                            <p className="text-white/90 text-sm font-medium mb-2">
                              {step.department}
                            </p>
                            
                            {/* Timeline */}
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                              <AlertCircle className="h-3 w-3 text-white" />
                              <span className="text-white text-xs font-semibold">
                                {step.estimatedDays}d
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover Tooltip */}
                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-xl">
                          <div className="font-semibold mb-1">{step.name}</div>
                          <div className="text-slate-300">{step.description}</div>
                          {step.required && (
                            <div className="mt-1 text-red-300">★ Required Step</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Arrow Connector */}
                      {idx < generatedWorkflow.length - 1 && (
                        <div className="flex items-center ml-4 mr-4">
                          <div className="relative">
                            {/* Horizontal Arrow Line */}
                            <div className="w-16 h-1 bg-gradient-to-r from-slate-400 to-slate-500 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-[shimmer_2s_infinite]"></div>
                            </div>
                            {/* Arrow Head */}
                            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2">
                              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-slate-500"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>

        {/* Action Buttons */}
        <Card className="border-2 border-slate-200 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800">Ready to Proceed?</h4>
                <p className="text-sm text-slate-600">
                  Approve this workflow to continue with document conversion
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={onReject}
                  className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-6"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Cancel Upload
                </Button>
                
                <Button
                  onClick={onApprove}
                  className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all px-8"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Approve & Continue
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                <Button
                  onClick={handleDownloadWorkflow}
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all px-8"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Workflow
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};