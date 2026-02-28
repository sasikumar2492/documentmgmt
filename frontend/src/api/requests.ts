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

export async function getRequests(params?: { department_id?: string; status?: string }): Promise<RequestApi[]> {
  const { data } = await apiClient.get<RequestApi[]>('/requests', { params });
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
