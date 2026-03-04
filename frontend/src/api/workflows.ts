import { apiClient } from './client';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  appliesToTemplateId?: string | null;
  appliesToDepartmentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStepDefinition {
  id: string;
  workflowId: string;
  stepOrder: number;
  name: string;
  roleKey?: string | null;
  departmentId?: string | null;
  isApprovalStep: boolean;
  metadata?: unknown;
  createdAt: string;
}

export interface WorkflowListParams {
  template_id?: string;
  department_id?: string;
  is_active?: boolean;
}

export async function getWorkflows(
  params?: WorkflowListParams
): Promise<WorkflowDefinition[]> {
  const { data } = await apiClient.get<WorkflowDefinition[]>('/workflows', {
    params,
  });
  return data;
}

export async function getWorkflow(id: string): Promise<WorkflowDefinition> {
  const { data } = await apiClient.get<WorkflowDefinition>(`/workflows/${id}`);
  return data;
}

export async function createWorkflow(body: {
  name: string;
  description?: string;
  is_active?: boolean;
  applies_to_template_id?: string;
  applies_to_department_id?: string;
}): Promise<WorkflowDefinition> {
  const { data } = await apiClient.post<WorkflowDefinition>('/workflows', body);
  return data;
}

export async function updateWorkflow(
  id: string,
  body: {
    name?: string;
    description?: string;
    is_active?: boolean;
    applies_to_template_id?: string;
    applies_to_department_id?: string;
  }
): Promise<WorkflowDefinition> {
  const { data } = await apiClient.patch<WorkflowDefinition>(
    `/workflows/${id}`,
    body
  );
  return data;
}

export async function getWorkflowSteps(
  workflowId: string
): Promise<WorkflowStepDefinition[]> {
  const { data } = await apiClient.get<WorkflowStepDefinition[]>(
    `/workflows/${workflowId}/steps`
  );
  return data;
}

export async function replaceWorkflowSteps(
  workflowId: string,
  steps: Array<{
    step_order: number;
    name: string;
    role_key?: string;
    department_id?: string;
    is_approval_step: boolean;
    metadata?: unknown;
  }>
): Promise<WorkflowStepDefinition[]> {
  const { data } = await apiClient.put<WorkflowStepDefinition[]>(
    `/workflows/${workflowId}/steps`,
    steps
  );
  return data;
}

