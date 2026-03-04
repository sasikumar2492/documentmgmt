import { apiClient } from './client';

export interface RequestApi {
  id: string;
  templateId: string;
  requestId: string;
  title: string | null;
  departmentId: string | null;
  departmentName: string | null;
  status: string;
  createdBy: string | null;
  assignedTo: string | null;
  assignedToName?: string | null;
  reviewSequence?: string[] | null;
  priority?: string | null;
  submissionComments?: string | null;
  createdAt: string;
  updatedAt: string;
  templateFileName: string | null;
  fileSize?: string | null;
}

export interface FormDataApi {
  data: Record<string, unknown>;
  formSectionsSnapshot: unknown;
  updatedAt: string | null;
}

export interface RequestListParams {
  department_id?: string;
  status?: string;
  q?: string;
  assigned_to?: string;
  from_date?: string;
  to_date?: string;
  sortBy?:
    | 'created_at'
    | 'title'
    | 'status'
    | 'request_id'
    | 'department_name'
    | 'assigned_to_name'
    | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export type RequestListResponse =
  | RequestApi[]
  | {
      data: RequestApi[];
      total: number;
      page: number;
      pageSize: number;
    };

export async function getRequests(params?: RequestListParams): Promise<RequestListResponse> {
  const { data } = await apiClient.get<RequestListResponse>('/requests', { params });
  return data;
}

export async function getRequest(id: string): Promise<RequestApi> {
  const { data } = await apiClient.get<RequestApi>(`/requests/${id}`);
  return data;
}

export async function createRequest(body: {
  template_id: string;
  title?: string;
  department_id?: string;
}): Promise<RequestApi> {
  const { data } = await apiClient.post<RequestApi>('/requests', body);
  return data;
}

export async function updateRequest(
  id: string,
  body: {
    title?: string;
    status?: string;
    assigned_to?: string;
    review_sequence?: string[];
    priority?: string;
    submission_comments?: string;
  }
): Promise<RequestApi> {
  const { data } = await apiClient.patch<RequestApi>(`/requests/${id}`, body);
  return data;
}

export async function getFormData(requestId: string): Promise<FormDataApi> {
  const { data } = await apiClient.get<FormDataApi>(`/requests/${requestId}/form-data`);
  return data;
}

export async function putFormData(
  requestId: string,
  body: { data: Record<string, unknown>; formSectionsSnapshot?: unknown }
): Promise<FormDataApi> {
  const { data } = await apiClient.put<FormDataApi>(`/requests/${requestId}/form-data`, body);
  return data;
}

export interface RequestActivityEntry {
  id: string;
  timestamp: string;
  action: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  user?: string;
  userRole?: string;
  department?: string;
  details?: string;
  ipAddress?: string;
  requestId?: string;
}

export async function getRequestActivity(
  requestId: string,
  params?: { limit?: number }
): Promise<RequestActivityEntry[]> {
  const { data } = await apiClient.get<RequestActivityEntry[]>(
    `/requests/${requestId}/activity`,
    { params }
  );
  return data;
}

export interface RequestWorkflowStep {
  id: string;
  stepOrder: number;
  name: string;
  assignedToUserId?: string | null;
  assignedToName?: string | null;
  status: 'pending' | 'current' | 'completed' | 'rejected' | string;
  startedAt?: string | null;
  completedAt?: string | null;
  metadata?: unknown;
}

export interface RequestWorkflowInstance {
  id?: string;
  requestId: string;
  workflowId: string | null;
  aiGeneratedDefinition?: unknown;
  createdAt?: string;
  steps: RequestWorkflowStep[];
}

export async function getRequestWorkflow(
  requestId: string
): Promise<RequestWorkflowInstance> {
  const { data } = await apiClient.get<RequestWorkflowInstance>(
    `/requests/${requestId}/workflow`
  );
  return data;
}

export interface RequestWorkflowActionBody {
  action: 'init' | 'set_workflow' | 'approve' | 'reject' | 'request_revision' | string;
  comment?: string;
  workflow_id?: string;
  ai_generated_definition?: unknown;
}

export async function postRequestWorkflowAction(
  requestId: string,
  body: RequestWorkflowActionBody
): Promise<RequestWorkflowInstance | RequestApi> {
  const { data } = await apiClient.post<RequestWorkflowInstance | RequestApi>(
    `/requests/${requestId}/workflow/actions`,
    body
  );
  return data;
}

