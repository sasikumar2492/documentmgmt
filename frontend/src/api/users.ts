import { apiClient } from './client';

export interface UserApi {
  id: string;
  username: string;
  fullName: string | null;
  role: string;
  departmentId: string | null;
  departmentName: string | null;
}

export async function getUsers(): Promise<UserApi[]> {
  const { data } = await apiClient.get<UserApi[]>('/users');
  return data;
}

interface ValidateUserForDocumentRequest {
  email: string;
  password: string;
  documentId: string;
}

interface ValidateUserForDocumentResponse {
  username: string;
  email: string;
  status: 'verified' | string;
}

/**
 * POST /api/users/validate-for-document
 * Secondary verification before performing critical document actions.
 */
export async function validateUserForDocument(
  payload: ValidateUserForDocumentRequest,
): Promise<ValidateUserForDocumentResponse> {
  const { data } = await apiClient.post<ValidateUserForDocumentResponse>(
    '/users/validate-for-document',
    payload,
  );
  return data;
}
