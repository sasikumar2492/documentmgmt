import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FormSection, FormField, UserRole } from '../types/index';
import { FileText, Save, CheckCircle, Sparkles, Edit3, ChevronLeft, ChevronRight, FileStack, Eye, ThumbsUp, Plus, Trash2, X, XCircle, MessageSquare } from 'lucide-react';
import { Separator } from './ui/separator';
import { AddFieldModal } from './AddFieldModal';

interface DynamicFormViewerProps {
  sections: FormSection[];
  fileName: string;
  department: string;
  onSave?: (formData: Record<string, any>) => void;
  onClose?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onNeedRevisions?: () => void;
  initialData?: Record<string, any>;
  isViewOnly?: boolean;
  isEditing?: boolean;
  userRole?: UserRole;
  returnedRemarks?: string;
  returnedBy?: 'reviewer' | 'approver';
  returnedByName?: string;
  returnedDate?: string;
  externalPage?: number;
  hideShell?: boolean;
}

const DEPARTMENTS = [
  { id: 'engineering', name: 'Engineering' },
  { id: 'manufacturing', name: 'Manufacturing' },
  { id: 'quality', name: 'Quality Assurance' },
  { id: 'procurement', name: 'Procurement' },
  { id: 'operations', name: 'Operations' },
  { id: 'research', name: 'Research & Development' }
];

export const DynamicFormViewer: React.FC<DynamicFormViewerProps> = (props) => {
  const {
    sections,
    fileName,
    department,
    onSave,
    onClose,
    onApprove,
    onReject,
    onNeedRevisions,
    initialData,
    isViewOnly = false,
    isEditing = false,
    userRole,
    returnedRemarks,
    returnedBy,
    returnedByName,
    returnedDate,
    externalPage,
    hideShell = false
  } = props;

  const [internalPage, setInternalPage] = useState(0);
  const currentPage = externalPage !== undefined ? (externalPage - 1) : internalPage;

  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const initialValues: Record<string, any> = {};
    sections.forEach(section => {
      section.fields.forEach(field => {
        initialValues[field.id] = initialData?.[field.id] ?? field.value ?? '';
      });
    });
    return initialValues;
  });

  const totalPages = sections.length;
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [formSections, setFormSections] = useState<FormSection[]>(sections);

  const [editingHeaderPage, setEditingHeaderPage] = useState<number | null>(null);
  const [editingFooterPage, setEditingFooterPage] = useState<number | null>(null);
  const [tempHeaderText, setTempHeaderText] = useState<string>('');
  const [tempFooterText, setTempFooterText] = useState<string>('');
  const [pageRemarks, setPageRemarks] = useState<Record<number, string>>({});

  const handleAddField = (newField: FormField) => {
    const updatedSections = [...formSections];
    updatedSections[currentPage].fields.push(newField);
    setFormSections(updatedSections);
    setFormValues(prev => ({ ...prev, [newField.id]: newField.value || '' }));
  };

  const handleRemoveField = (fieldId: string) => {
    if (isViewOnly) return;
    const updatedSections = [...formSections];
    updatedSections[currentPage].fields = updatedSections[currentPage].fields.filter(f => f.id !== fieldId);
    setFormSections(updatedSections);
    const newFormValues = { ...formValues };
    delete newFormValues[fieldId];
    setFormValues(newFormValues);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    if (!isViewOnly) {
      setFormValues(prev => ({ ...prev, [fieldId]: value }));
    }
  };

  const handleSave = () => {
    if (onSave && !isViewOnly) {
      onSave(formValues);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setInternalPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setInternalPage(currentPage - 1);
    }
  };

  const handlePageSelect = (pageIndex: number) => {
    setInternalPage(pageIndex);
  };

  const [isSmartScrollCollapsed, setIsSmartScrollCollapsed] = useState(false);

  const currentSection = formSections[currentPage];

  const renderField = (field: FormField) => {
    const value = formValues[field.id];
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={`w-full min-h-[100px] border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${isViewOnly ? 'bg-slate-50' : ''}`}
            disabled={isViewOnly}
            readOnly={isViewOnly}
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              disabled={isViewOnly}
            />
            <Label htmlFor={field.id} className={`${isViewOnly ? 'cursor-default' : 'cursor-pointer'} text-slate-600`}>
              {field.label}
            </Label>
          </div>
        );
      case 'date':
        return (
          <Input
            type="date"
            id={field.id}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`w-full border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${isViewOnly ? 'bg-slate-50' : ''}`}
            disabled={isViewOnly}
            readOnly={isViewOnly}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            id={field.id}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={`w-full border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${isViewOnly ? 'bg-slate-50' : ''}`}
            disabled={isViewOnly}
            readOnly={isViewOnly}
          />
        );
      default:
        return (
          <Input
            type="text"
            id={field.id}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={`w-full border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${isViewOnly ? 'bg-slate-50' : ''}`}
            disabled={isViewOnly}
            readOnly={isViewOnly}
          />
        );
    }
  };

  if (hideShell) {
    return (
      <div className="space-y-6">
        <Card key={currentSection.id} className="bg-white border-0 shadow-none">
          <CardHeader className="bg-transparent border-b border-slate-100 px-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">{currentPage + 1}</span>
                  </div>
                  <span>{currentSection.title}</span>
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-0">
            {currentSection.header !== undefined && (
              <div className="mb-6 pb-4 border-b border-slate-100">
                <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200 italic text-slate-600 text-sm">
                  {currentSection.header}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentSection.fields.map((field) => (
                <div key={field.id} className={`${field.type === 'textarea' ? 'md:col-span-2' : ''} relative group`}>
                  {field.type !== 'checkbox' && (
                    <Label htmlFor={field.id} className="text-slate-700 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {field.label}
                        {field.required && !isViewOnly && <span className="text-red-500">*</span>}
                      </span>
                    </Label>
                  )}
                  {renderField(field)}
                </div>
              ))}
            </div>
            {currentSection.footer !== undefined && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200 italic text-slate-400 text-xs">
                  {currentSection.footer}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-transparent relative overflow-visible">
      <div className="max-w-5xl mx-auto">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
          <div className="absolute top-20 right-20 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
        </div>

        <div className="mb-8 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg ${isViewOnly ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-lg shadow-emerald-500/50' : 'bg-gradient-to-br from-blue-500 to-purple-600'} flex items-center justify-center`}>
                {isViewOnly ? <Eye className="h-6 w-6 text-white" /> : <FileText className="h-6 w-6 text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    {isViewOnly ? 'View Submitted Form' : isEditing ? 'Edit Submitted Form' : 'AI Converted Form'}
                  </h1>
                </div>
                <p className="text-slate-500">{fileName}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                    <span className="text-xl font-bold">Section {currentPage + 1}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{currentSection.title}</h2>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100 mb-1">Page</div>
                <div className="text-3xl font-bold">{currentPage + 1}/{totalPages}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <Card key={currentSection.id} className="bg-white border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">{currentPage + 1}</span>
                    </div>
                    <span>{currentSection.title}</span>
                  </CardTitle>
                </div>
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-sm">
                  Section {currentPage + 1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {currentSection.header !== undefined && (
                <div className="mb-6 pb-4 border-b-2 border-blue-200">
                  <div className="bg-blue-50 backdrop-blur-sm rounded-lg px-4 py-3 border border-blue-300">
                    <p className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                      {currentSection.header || <span className="text-slate-500 italic">No header content</span>}
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentSection.fields.map((field) => (
                  <div key={field.id} className={`${field.type === 'textarea' ? 'md:col-span-2' : ''} relative group`}>
                    {field.type !== 'checkbox' && (
                      <Label htmlFor={field.id} className="text-slate-700 mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {field.label}
                          {field.required && !isViewOnly && <span className="text-red-500">*</span>}
                        </span>
                      </Label>
                    )}
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
