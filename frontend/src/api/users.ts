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
