interface WorkflowStep {
  id: string;
  name: string;
  department: string;
  role: string;
  estimatedDays: number;
  required: boolean;
  description: string;
}

interface FormSection {
  id: string;
  title: string;
  fields: any[];
}

// Detect department for a specific section
const detectDepartmentForSection = (section: FormSection): string => {
  const titleLower = section.title.toLowerCase();
  
  // Engineering keywords
  if (titleLower.includes('engineer') || titleLower.includes('technical') || 
      titleLower.includes('design') || titleLower.includes('specification') ||
      titleLower.includes('drawing') || titleLower.includes('cad') ||
      titleLower.includes('architecture')) {
    return 'Engineering';
  }
  
  // Quality Assurance keywords
  if (titleLower.includes('quality') || titleLower.includes('inspection') || 
      titleLower.includes('test') || titleLower.includes('standard') ||
      titleLower.includes('compliance') || titleLower.includes('certification') ||
      titleLower.includes('qa') || titleLower.includes('qc') ||
      titleLower.includes('audit') || titleLower.includes('validation')) {
    return 'Quality Assurance';
  }
  
  // Manufacturing keywords
  if (titleLower.includes('manufactur') || titleLower.includes('production') || 
      titleLower.includes('assembly') || titleLower.includes('fabrication') ||
      titleLower.includes('process') && (titleLower.includes('production') || titleLower.includes('manufacturing'))) {
    return 'Manufacturing';
  }
  
  // Procurement keywords
  if (titleLower.includes('procure') || titleLower.includes('purchas') || 
      titleLower.includes('vendor') || titleLower.includes('supplier') ||
      titleLower.includes('material') || titleLower.includes('sourcing') ||
      titleLower.includes('acquisition')) {
    return 'Procurement';
  }
  
  // Operations keywords
  if (titleLower.includes('operation') || titleLower.includes('logistics') || 
      titleLower.includes('planning') || titleLower.includes('scheduling') ||
      titleLower.includes('inventory') || titleLower.includes('warehouse')) {
    return 'Operations';
  }
  
  // R&D keywords
  if (titleLower.includes('research') || titleLower.includes('development') || 
      titleLower.includes('innovation') || titleLower.includes('prototype') ||
      titleLower.includes('r&d') || titleLower.includes('r & d')) {
    return 'Research & Development';
  }
  
  // Finance keywords
  if (titleLower.includes('finance') || titleLower.includes('budget') || 
      titleLower.includes('cost') || titleLower.includes('payment') ||
      titleLower.includes('pricing') || titleLower.includes('financial')) {
    return 'Finance';
  }
  
  // Safety keywords
  if (titleLower.includes('safety') || titleLower.includes('ehs') ||
      titleLower.includes('health') && titleLower.includes('safety') ||
      titleLower.includes('hazard')) {
    return 'Safety';
  }
  
  // Regulatory/Compliance keywords
  if (titleLower.includes('regulat') || titleLower.includes('legal') || titleLower.includes('regulatory')) {
    return 'Regulatory Affairs';
  }
  
  // Check field labels for additional context
  for (const field of section.fields) {
    const labelLower = field.label?.toLowerCase() || '';
    
    if (labelLower.includes('quality') || labelLower.includes('inspection')) {
      return 'Quality Assurance';
    }
    if (labelLower.includes('engineer') || labelLower.includes('technical')) {
      return 'Engineering';
    }
    if (labelLower.includes('supplier') || labelLower.includes('vendor')) {
      return 'Procurement';
    }
    if (labelLower.includes('manufact') || labelLower.includes('production')) {
      return 'Manufacturing';
    }
  }
  
  // Default to Engineering if no specific department detected
  return 'Engineering';
};

export const generateWorkflowFromSections = (
  fileName: string,
  sections: FormSection[],
  fileType: string
): { workflow: WorkflowStep[]; primaryDepartment: string; detectedDepartments: string[]; sectionMapping: { section: string; departments: string[]; fieldCount: number }[] } => {
  console.log('🔍 AI Workflow Generation - Using Section Headings:');
  console.log('═'.repeat(60));
  
  const workflow: WorkflowStep[] = [];
  const sectionMapping: { section: string; departments: string[]; fieldCount: number }[] = [];
  const allDepartments = new Set<string>();
  let stepCounter = 0;
  
  // Create one workflow step per section using the section heading as the step name
  sections.forEach((section, index) => {
    const department = detectDepartmentForSection(section);
    allDepartments.add(department);
    
    const sectionNumber = index + 1;
    const stepName = section.title; // Use actual section heading instead of "Section X"
    
    // Check if section title explicitly contains "section" keyword
    const hasSectionKeyword = /\bsection\b/i.test(section.title);
    
    console.log(`\n📄 Section ${sectionNumber}: \"${section.title}\"${hasSectionKeyword ? ' 🎯 [SECTION KEYWORD DETECTED]' : ''}`);
    console.log(`   • Fields: ${section.fields.length}`);
    console.log(`   • Detected Department: ${department}`);
    console.log(`   ✅ Creating Workflow Step: \"${stepName}\"`);
    
    // Get role based on department
    const roleMapping: Record<string, string> = {
      'Engineering': 'Engineering Manager',
      'Quality Assurance': 'QA Manager',
      'Manufacturing': 'Manufacturing Manager',
      'Procurement': 'Procurement Manager',
      'Operations': 'Operations Manager',
      'Research & Development': 'R&D Lead',
      'Finance': 'Finance Manager',
      'Safety': 'Safety Officer',
      'Regulatory Affairs': 'Compliance Officer'
    };
    
    // Calculate estimated days based on number of fields and department
    let estimatedDays = 2; // Base estimate
    if (section.fields.length > 10) {
      estimatedDays = 3;
    } else if (section.fields.length > 20) {
      estimatedDays = 4;
    }
    
    // Some departments naturally take longer
    if (department === 'Quality Assurance' || department === 'Regulatory Affairs') {
      estimatedDays += 1;
    }
    
    workflow.push({
      id: `step_${++stepCounter}`,
      name: stepName, // USE SECTION HEADING AS WORKFLOW STEP NAME
      department: department,
      role: roleMapping[department] || 'Department Manager',
      estimatedDays: estimatedDays,
      required: true,
      description: `Review and approve ${section.title} (${section.fields.length} field${section.fields.length !== 1 ? 's' : ''})`
    });
    
    // Add to section mapping
    sectionMapping.push({
      section: section.title,
      departments: [department],
      fieldCount: section.fields.length
    });
  });
  
  // Always add final Management approval
  allDepartments.add('Management');
  console.log('\n📋 Final Approval Step:');
  console.log('   ✅ Creating Workflow Step: "Final Management Approval"');
  
  workflow.push({
    id: `step_${++stepCounter}`,
    name: 'Final Management Approval',
    department: 'Management',
    role: allDepartments.size > 4 ? 'Executive Director' : 'Department Head',
    estimatedDays: 1,
    required: true,
    description: 'Final management review and approval for implementation'
  });
  
  // Determine primary department (first detected department)
  const primaryDept = sections.length > 0 ? detectDepartmentForSection(sections[0]) : 'Engineering';
  const primaryDepartment = primaryDept.toLowerCase().replace(/\s+/g, '_').replace('&', 'and');
  
  const detectedDepartments = Array.from(allDepartments);
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 Workflow Generation Complete:');
  console.log(`   • Total Sections: ${sections.length}`);
  console.log(`   • Workflow Steps Created: ${workflow.length}`);
  console.log(`   • Departments Involved: ${detectedDepartments.join(', ')}`);
  console.log(`   • Primary Department: ${primaryDept}`);
  console.log(`   • Total Estimated Days: ${workflow.reduce((sum, s) => sum + s.estimatedDays, 0)}`);
  console.log('═'.repeat(60) + '\n');
  
  // Adjust for urgent files
  const fileNameLower = fileName.toLowerCase();
  if (fileNameLower.includes('urgent') || fileNameLower.includes('priority')) {
    console.log('⚡ URGENT document detected - reducing approval timelines');
    workflow.forEach(step => {
      step.estimatedDays = Math.max(1, Math.floor(step.estimatedDays / 2));
    });
  }
  
  // Adjust for PDF files
  if (fileType === 'pdf') {
    console.log('📄 PDF document - adding extra review time');
    workflow.forEach(step => {
      step.estimatedDays = step.estimatedDays + 1;
    });
  }
  
  return {
    workflow,
    primaryDepartment,
    detectedDepartments,
    sectionMapping
  };
};

// Legacy function for backward compatibility
export const generateWorkflowFromDocument = (
  fileName: string,
  department: string,
  fileType: string
): WorkflowStep[] => {
  // Base workflow templates for different departments
  const workflowTemplates: Record<string, WorkflowStep[]> = {
    engineering: [
      {
        id: 'eng_1',
        name: 'Engineering Review',
        department: 'Engineering',
        role: 'Engineering Manager',
        estimatedDays: 2,
        required: true,
        description: 'Review technical specifications and design requirements'
      },
      {
        id: 'eng_2',
        name: 'Quality Assurance Check',
        department: 'Quality Assurance',
        role: 'QA Manager',
        estimatedDays: 3,
        required: true,
        description: 'Verify compliance with quality standards and testing requirements'
      },
      {
        id: 'eng_3',
        name: 'Manufacturing Feasibility',
        department: 'Manufacturing',
        role: 'Manufacturing Manager',
        estimatedDays: 2,
        required: true,
        description: 'Assess manufacturing feasibility and production requirements'
      },
      {
        id: 'eng_4',
        name: 'Final Approval',
        department: 'Management',
        role: 'Director',
        estimatedDays: 1,
        required: true,
        description: 'Final management approval and sign-off'
      }
    ],
    quality: [
      {
        id: 'qa_1',
        name: 'Initial Quality Review',
        department: 'Quality Assurance',
        role: 'QA Specialist',
        estimatedDays: 1,
        required: true,
        description: 'Initial review of quality standards and inspection criteria'
      },
      {
        id: 'qa_2',
        name: 'Engineering Validation',
        department: 'Engineering',
        role: 'Engineering Manager',
        estimatedDays: 2,
        required: true,
        description: 'Validate technical specifications against quality requirements'
      },
      {
        id: 'qa_3',
        name: 'Compliance Check',
        department: 'Compliance',
        role: 'Compliance Officer',
        estimatedDays: 2,
        required: true,
        description: 'Ensure regulatory compliance and certification requirements'
      },
      {
        id: 'qa_4',
        name: 'QA Manager Approval',
        department: 'Quality Assurance',
        role: 'QA Manager',
        estimatedDays: 1,
        required: true,
        description: 'Final quality assurance approval'
      }
    ],
    procurement: [
      {
        id: 'proc_1',
        name: 'Procurement Request Review',
        department: 'Procurement',
        role: 'Procurement Specialist',
        estimatedDays: 1,
        required: true,
        description: 'Review purchase request details and vendor information'
      },
      {
        id: 'proc_2',
        name: 'Budget Verification',
        department: 'Finance',
        role: 'Finance Manager',
        estimatedDays: 2,
        required: true,
        description: 'Verify budget allocation and cost justification'
      },
      {
        id: 'proc_3',
        name: 'Department Head Approval',
        department: 'Management',
        role: 'Department Head',
        estimatedDays: 1,
        required: true,
        description: 'Department head approval for procurement request'
      },
      {
        id: 'proc_4',
        name: 'Vendor Selection',
        department: 'Procurement',
        role: 'Procurement Manager',
        estimatedDays: 3,
        required: true,
        description: 'Final vendor selection and contract initiation'
      }
    ],
    manufacturing: [
      {
        id: 'mfg_1',
        name: 'Manufacturing Request Review',
        department: 'Manufacturing',
        role: 'Production Planner',
        estimatedDays: 1,
        required: true,
        description: 'Review manufacturing requirements and specifications'
      },
      {
        id: 'mfg_2',
        name: 'Engineering Approval',
        department: 'Engineering',
        role: 'Engineering Manager',
        estimatedDays: 2,
        required: true,
        description: 'Approve technical specifications and drawings'
      },
      {
        id: 'mfg_3',
        name: 'Quality Planning',
        department: 'Quality Assurance',
        role: 'QA Manager',
        estimatedDays: 2,
        required: true,
        description: 'Plan quality control and inspection procedures'
      },
      {
        id: 'mfg_4',
        name: 'Operations Approval',
        department: 'Operations',
        role: 'Operations Manager',
        estimatedDays: 1,
        required: true,
        description: 'Final operations approval for manufacturing'
      }
    ],
    operations: [
      {
        id: 'ops_1',
        name: 'Operations Request Review',
        department: 'Operations',
        role: 'Operations Coordinator',
        estimatedDays: 1,
        required: true,
        description: 'Review operational requirements and resource needs'
      },
      {
        id: 'ops_2',
        name: 'Resource Allocation',
        department: 'Management',
        role: 'Department Head',
        estimatedDays: 2,
        required: true,
        description: 'Allocate resources and approve budget'
      },
      {
        id: 'ops_3',
        name: 'Quality Verification',
        department: 'Quality Assurance',
        role: 'QA Manager',
        estimatedDays: 1,
        required: false,
        description: 'Verify quality standards for operational changes'
      },
      {
        id: 'ops_4',
        name: 'Operations Manager Approval',
        department: 'Operations',
        role: 'Operations Manager',
        estimatedDays: 1,
        required: true,
        description: 'Final operations manager approval'
      }
    ],
    research: [
      {
        id: 'rd_1',
        name: 'Research Proposal Review',
        department: 'Research & Development',
        role: 'R&D Lead',
        estimatedDays: 2,
        required: true,
        description: 'Review research proposal and objectives'
      },
      {
        id: 'rd_2',
        name: 'Technical Feasibility',
        department: 'Engineering',
        role: 'Engineering Manager',
        estimatedDays: 3,
        required: true,
        description: 'Assess technical feasibility and resource requirements'
      },
      {
        id: 'rd_3',
        name: 'Budget Approval',
        department: 'Finance',
        role: 'Finance Manager',
        estimatedDays: 2,
        required: true,
        description: 'Approve research budget and funding allocation'
      },
      {
        id: 'rd_4',
        name: 'Executive Approval',
        department: 'Management',
        role: 'Executive Director',
        estimatedDays: 2,
        required: true,
        description: 'Executive approval for research project'
      }
    ]
  };

  // Get the base workflow for the department
  const baseWorkflow = workflowTemplates[department] || workflowTemplates.engineering;

  // Analyze filename for special keywords that might affect workflow
  const fileNameLower = fileName.toLowerCase();
  let workflow = [...baseWorkflow];

  // Add additional steps based on filename keywords
  if (fileNameLower.includes('urgent') || fileNameLower.includes('priority')) {
    // Reduce estimated days for urgent requests
    workflow = workflow.map(step => ({
      ...step,
      estimatedDays: Math.max(1, Math.floor(step.estimatedDays / 2))
    }));
  }

  if (fileNameLower.includes('supplier') || fileNameLower.includes('vendor')) {
    // Add procurement review if not already present
    const hasProcurement = workflow.some(s => s.department === 'Procurement');
    if (!hasProcurement) {
      workflow.splice(workflow.length - 1, 0, {
        id: 'add_proc',
        name: 'Supplier Verification',
        department: 'Procurement',
        role: 'Procurement Manager',
        estimatedDays: 2,
        required: true,
        description: 'Verify supplier credentials and compliance'
      });
    }
  }

  if (fileNameLower.includes('compliance') || fileNameLower.includes('regulatory')) {
    // Add compliance check if not already present
    const hasCompliance = workflow.some(s => s.department === 'Compliance');
    if (!hasCompliance) {
      workflow.splice(workflow.length - 1, 0, {
        id: 'add_comp',
        name: 'Regulatory Compliance',
        department: 'Compliance',
        role: 'Compliance Officer',
        estimatedDays: 3,
        required: true,
        description: 'Verify regulatory compliance and certifications'
      });
    }
  }

  if (fileNameLower.includes('prototype') || fileNameLower.includes('sample')) {
    // Add manufacturing and testing steps
    const hasManufacturing = workflow.some(s => s.department === 'Manufacturing');
    if (!hasManufacturing) {
      workflow.splice(workflow.length - 2, 0, {
        id: 'add_mfg',
        name: 'Prototype Manufacturing',
        department: 'Manufacturing',
        role: 'Manufacturing Manager',
        estimatedDays: 5,
        required: true,
        description: 'Manufacture prototype and conduct initial testing'
      });
    }
  }

  if (fileType === 'pdf') {
    // PDF documents might need additional review time
    workflow = workflow.map(step => ({
      ...step,
      estimatedDays: step.estimatedDays + 1
    }));
  }

  return workflow;
};

// Generate a human-readable workflow summary
export const generateWorkflowSummary = (workflow: WorkflowStep[]): string => {
  const departments = new Set(workflow.map(s => s.department));
  const totalDays = workflow.reduce((sum, s) => sum + s.estimatedDays, 0);
  const requiredSteps = workflow.filter(s => s.required).length;

  return `This workflow involves ${departments.size} department(s) with ${workflow.length} approval step(s) (${requiredSteps} required). Estimated completion time: ${totalDays} business days.`;
};