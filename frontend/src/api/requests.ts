import { apiClient } from './client';
import { getStoredToken } from './auth';

const getApiBase = () => import.meta.env.VITE_API_URL || 'http://localhost:4000';

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
  /** Optional preparator display name for this request, used for "Prepared By" in document review. */
  preparatorName?: string | null;
  /** Optional department display name for this request, used for "Site Location" / facility in document review. */
  departmentName?: string | null;
  pageEvents?: { pageNumber: number; eventType: string }[];
}

export interface RequestListParams {
  /** 'raise' = Raise Request list; 'library' = Document Library list (non-draft) */
  view?: 'raise' | 'library';
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
  template_id?: string;
  title?: string;
  department_id?: string;
} = {}): Promise<RequestApi> {
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

/** Fetch request document file as Blob (e.g. template DOCX for this request). Used when form-data has no _sfdt so we can call document-editor/Import. */
export async function getRequestFileBlob(requestId: string): Promise<Blob> {
  const base = getApiBase();
  const token = getStoredToken();
  const res = await fetch(`${base}/api/requests/${requestId}/file`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error(res.status === 404 ? 'Request file not found' : `Download failed (${res.status})`);
  }
  const contentType = (res.headers.get('Content-Type') || '').toLowerCase();
  if (contentType.includes('application/json') || contentType.includes('text/html')) {
    throw new Error('Server returned invalid content for file');
  }
  return res.blob();
}

export async function putFormData(
  requestId: string,
  body: {
    data: Record<string, unknown>;
    formSectionsSnapshot?: unknown;
    pageEvents?: { pageNumber: number; eventType: string }[];
  }
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
  /** Optional per-activity status coming from backend (e.g. completed, in_progress, pending) */
  status?: string;
}

export interface RequestActivityResponse {
  /** Array of activity entries for this request */
  activity: RequestActivityEntry[];
  /** Overall request status used for the header (e.g. submitted, in_progress, approved) */
  requestStatus?: string;
}

export async function getRequestActivity(
  requestId: string
): Promise<RequestActivityResponse> {
  const { data } = await apiClient.get<RequestActivityResponse>(
    `/requests/${requestId}/activity`
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


