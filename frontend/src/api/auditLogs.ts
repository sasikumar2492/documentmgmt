import { apiClient } from './client';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  user?: string;
  userRole?: string;
  department?: string;
  details?: string;
  ipAddress?: string;
  requestId?: string;
}

export interface AuditLogParams {
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  request_id?: string;
  date_range?: 'today' | 'week' | 'month';
  from_date?: string;
  to_date?: string;
  limit?: number;
}

export async function getAuditLogs(
  params?: AuditLogParams
): Promise<AuditLogEntry[]> {
  const { data } = await apiClient.get<AuditLogEntry[]>('/audit-logs', {
    params,
  });
  return data;
}

