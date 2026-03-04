import { apiClient } from './client';

export interface WorkflowRule {
  id: string;
  name: string;
  description?: string | null;
  appliesToTemplateId?: string | null;
  appliesToDepartmentId?: string | null;
  conditionJson?: unknown;
  actionJson?: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowRuleListParams {
  template_id?: string;
  department_id?: string;
  is_active?: boolean;
}

export async function getWorkflowRules(
  params?: WorkflowRuleListParams
): Promise<WorkflowRule[]> {
  const { data } = await apiClient.get<WorkflowRule[]>('/workflow-rules', {
    params,
  });
  return data;
}

export async function getWorkflowRule(id: string): Promise<WorkflowRule> {
  const { data } = await apiClient.get<WorkflowRule>(`/workflow-rules/${id}`);
  return data;
}

export async function createWorkflowRule(body: {
  name: string;
  description?: string;
  applies_to_template_id?: string;
  applies_to_department_id?: string;
  condition_json?: unknown;
  action_json?: unknown;
  is_active?: boolean;
}): Promise<WorkflowRule> {
  const { data } = await apiClient.post<WorkflowRule>('/workflow-rules', body);
  return data;
}

export async function updateWorkflowRule(
  id: string,
  body: {
    name?: string;
    description?: string;
    applies_to_template_id?: string;
    applies_to_department_id?: string;
    condition_json?: unknown;
    action_json?: unknown;
    is_active?: boolean;
  }
): Promise<WorkflowRule> {
  const { data } = await apiClient.patch<WorkflowRule>(
    `/workflow-rules/${id}`,
    body
  );
  return data;
}

