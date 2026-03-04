import { apiClient } from './client';

export interface DashboardSummary {
  requestCountsByStatus: Record<string, number>;
  recentRequests: Array<{
    id: string;
    requestId: string;
    title: string | null;
    status: string;
    departmentName: string | null;
    createdAt: string;
  }>;
  recentTemplates: Array<{
    id: string;
    fileName: string;
    status: string;
    updatedAt: string;
  }>;
}

export interface DashboardSummaryParams {
  limit?: number;
  days?: number;
  department_id?: string;
  assigned_to?: string;
}

export async function getDashboardSummary(
  params?: DashboardSummaryParams
): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>('/dashboard/summary', {
    params,
  });
  return data;
}

