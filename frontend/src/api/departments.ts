import { apiClient } from './client';

export interface Department {
  id: string;
  name: string;
  code: string | null;
}

export async function getDepartments(): Promise<Department[]> {
  const { data } = await apiClient.get<Department[]>('/departments');
  return data;
}
