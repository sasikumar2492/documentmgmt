import { apiClient } from './client';
import type { AuditLogEntry } from '../types';

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

