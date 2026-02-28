import { apiClient } from './client';
import type { FormSection } from '../types';

export interface TemplateApi {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: string;
  department: string | null;
  departmentName?: string | null;
  status: string;
  parsedSections?: FormSection[] | null;
  uploadedBy?: string | null;
  uploadDate: string;
  updatedAt: string;
}

export interface TemplatesParams {
  department_id?: string;
  status?: string;
}

export async function getTemplates(params?: TemplatesParams): Promise<TemplateApi[]> {
  const { data } = await apiClient.get<TemplateApi[]>('/templates', { params });
  return data;
}

export async function getTemplate(id: string): Promise<TemplateApi> {
  const { data } = await apiClient.get<TemplateApi>(`/templates/${id}`);
  return data;
}

export async function uploadTemplate(file: File, departmentId?: string | null): Promise<TemplateApi> {
  const formData = new FormData();
  formData.append('file', file);
  if (departmentId) formData.append('department_id', departmentId);
  const { data } = await apiClient.post<TemplateApi>('/templates', formData, {
    timeout: 120000, // 2 min for large files or slow connections
  });
  return data;
}

export async function updateTemplate(
  id: string,
  body: { file_name?: string; department_id?: string | null; status?: string; parsed_sections?: FormSection[] | null }
): Promise<TemplateApi> {
  const { data } = await apiClient.patch<TemplateApi>(`/templates/${id}`, {
    ...(body.file_name !== undefined && { file_name: body.file_name }),
    ...(body.department_id !== undefined && { department_id: body.department_id }),
    ...(body.status !== undefined && { status: body.status }),
    ...(body.parsed_sections !== undefined && { parsed_sections: body.parsed_sections }),
  });
  return data;
}

/** Fetch template file as Blob for preview (Original Doc). */
export async function getTemplateFileBlob(templateId: string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(`/templates/${templateId}/file`, {
    responseType: 'blob',
  });
  return data;
}

/** Convert DOCX blob to SFDT via Syncfusion Word Processor Server (Docker). Returns SFDT JSON string or throws. */
export async function importDocxToSfdt(file: Blob, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append('files', file, fileName || 'document.docx');
  const { data } = await apiClient.post<string>('/document-editor/Import', formData, {
    responseType: 'text',
    timeout: 60000,
  });
  return data;
}

/** Convert SFDT (Syncfusion Document Format) back to DOCX Blob. Returns DOCX file as Blob. */
export async function exportSfdtToDocx(sfdt: string, fileName: string): Promise<Blob> {
  const { data } = await apiClient.post<Blob>(
    '/document-editor/Export',
    {
      content: sfdt,
      type: 'Docx',
      fileName: fileName || 'document.docx',
    },
    {
      responseType: 'blob',
      timeout: 60000,
    }
  );
  return data;
}
