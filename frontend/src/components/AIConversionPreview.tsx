import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FormSection, FormField } from '../types/index';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  FileText, 
  Save, 
  CheckCircle, 
  Sparkles, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  FileStack, 
  Eye, 
  Plus,
  X,
  Wand2,
  Zap,
  Brain,
  Database,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { Separator } from './ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { OriginalDocViewer } from './OriginalDocViewer';

interface AIConversionPreviewProps {
  templateId: string;
  sections: FormSection[];
  fileName: string;
  department: string;
  fileSize: string;
  uploadDate: string;
  onSave: (sections: FormSection[], updatedFileName: string, updatedDepartment: string) => void;
  onCancel: () => void;
}

const DEPARTMENTS = [
  { id: 'engineering', name: 'Engineering' },
  { id: 'manufacturing', name: 'Manufacturing' },
  { id: 'quality', name: 'Quality Assurance' },
  { id: 'procurement', name: 'Procurement' },
  { id: 'operations', name: 'Operations' },
  { id: 'research', name: 'Research & Development' }
];

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'select', label: 'Dropdown Select' }
];

// Common SAP Fields Database
const SAP_FIELDS = [
  // Material Master Data
  { id: 'MARA-MATNR', label: 'Material Number', type: 'text' as const, category: 'Material Master', description: 'Unique material identifier' },
  { id: 'MARA-MAKTX', label: 'Material Description', type: 'text' as const, category: 'Material Master', description: 'Short description of material' },
  { id: 'MARA-MTART', label: 'Material Type', type: 'text' as const, category: 'Material Master', description: 'Type of material (ROH, HALB, FERT, etc.)' },
  { id: 'MARA-MATKL', label: 'Material Group', type: 'text' as const, category: 'Material Master', description: 'Material group for classification' },
  { id: 'MARA-MEINS', label: 'Base Unit of Measure', type: 'text' as const, category: 'Material Master', description: 'Base UOM (EA, KG, L, etc.)' },
  { id: 'MARA-BRGEW', label: 'Gross Weight', type: 'number' as const, category: 'Material Master', description: 'Gross weight of material' },
  { id: 'MARA-NTGEW', label: 'Net Weight', type: 'number' as const, category: 'Material Master', description: 'Net weight of material' },
  { id: 'MARC-WERKS', label: 'Plant', type: 'text' as const, category: 'Material Master', description: 'Plant where material is stored' },
  { id: 'MARC-LGORT', label: 'Storage Location', type: 'text' as const, category: 'Material Master', description: 'Storage location code' },
  
  // Vendor Master Data
  { id: 'LFA1-LIFNR', label: 'Vendor Number', type: 'text' as const, category: 'Vendor Master', description: 'Unique vendor account number' },
  { id: 'LFA1-NAME1', label: 'Vendor Name', type: 'text' as const, category: 'Vendor Master', description: 'Name of vendor' },
  { id: 'LFA1-LAND1', label: 'Country Key', type: 'text' as const, category: 'Vendor Master', description: 'Country of vendor' },
  { id: 'LFA1-ORT01', label: 'City', type: 'text' as const, category: 'Vendor Master', description: 'Vendor city' },
  { id: 'LFA1-STRAS', label: 'Street Address', type: 'text' as const, category: 'Vendor Master', description: 'Street and house number' },
  
  // Purchase Order Data
  { id: 'EKKO-EBELN', label: 'Purchase Order Number', type: 'text' as const, category: 'Purchase Order', description: 'PO document number' },
  { id: 'EKKO-AEDAT', label: 'PO Creation Date', type: 'date' as const, category: 'Purchase Order', description: 'Date PO was created' },
  { id: 'EKKO-LIFNR', label: 'Vendor', type: 'text' as const, category: 'Purchase Order', description: 'Vendor account number' },
  { id: 'EKKO-WAERS', label: 'Currency', type: 'text' as const, category: 'Purchase Order', description: 'Currency key (USD, EUR, etc.)' },
  { id: 'EKPO-MATNR', label: 'Material', type: 'text' as const, category: 'Purchase Order', description: 'Material number' },
  { id: 'EKPO-MENGE', label: 'PO Quantity', type: 'number' as const, category: 'Purchase Order', description: 'Quantity ordered' },
  
  // Quality Management
  { id: 'QALS-PRUEFLOS', label: 'Inspection Lot', type: 'text' as const, category: 'Quality Management', description: 'Inspection lot number' },
  { id: 'QALS-MATNR', label: 'Material for Inspection', type: 'text' as const, category: 'Quality Management', description: 'Material being inspected' },
  { id: 'QALS-WERK', label: 'Plant for Inspection', type: 'text' as const, category: 'Quality Management', description: 'Plant where inspection occurs' },
  
  // Approval & Workflow
  { id: 'APPROVAL-APPROVER', label: 'Approver Name', type: 'text' as const, category: 'Approval', description: 'Name of approver' },
  { id: 'APPROVAL-DATE', label: 'Approval Date', type: 'date' as const, category: 'Approval', description: 'Date of approval' },
  { id: 'APPROVAL-COMMENTS', label: 'Approval Comments', type: 'textarea' as const, category: 'Approval', description: 'Comments from approver' },
  { id: 'APPROVAL-STATUS', label: 'Approval Status', type: 'text' as const, category: 'Approval', description: 'Current approval status' },
  { id: 'APPROVAL-DEPARTMENT', label: 'Department', type: 'text' as const, category: 'Approval', description: 'Department responsible' },
  
  // Document Information
  { id: 'DOC-NUMBER', label: 'Document Number', type: 'text' as const, category: 'Document', description: 'Unique document identifier' },
  { id: 'DOC-TYPE', label: 'Document Type', type: 'text' as const, category: 'Document', description: 'Type of document' },
  { id: 'DOC-VERSION', label: 'Document Version', type: 'text' as const, category: 'Document', description: 'Version number' },
  { id: 'DOC-DATE', label: 'Document Date', type: 'date' as const, category: 'Document', description: 'Document creation date' },
  
  // General Fields
  { id: 'GEN-COMPANY', label: 'Company Code', type: 'text' as const, category: 'General', description: 'Company code in SAP' },
  { id: 'GEN-USERNAME', label: 'User Name', type: 'text' as const, category: 'General', description: 'SAP user name' },
  { id: 'GEN-TIMESTAMP', label: 'Timestamp', type: 'date' as const, category: 'General', description: 'Date and time stamp' },
];

export const AIConversionPreview: React.FC<AIConversionPreviewProps> = ({
  templateId,
  sections: initialSections,
  fileName,
  department,
  fileSize,
  uploadDate,
  onSave,
  onCancel,
}) => {
  const [sections, setSections] = useState<FormSection[]>(initialSections);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [docPageCount, setDocPageCount] = useState(0);
  const [currentDocPage, setCurrentDocPage] = useState(0);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);
  const [selectedPageForAddField, setSelectedPageForAddField] = useState(0);
  const [fileNameState, setFileNameState] = useState(fileName);
  const [departmentState, setDepartmentState] = useState(department);
  const [newField, setNewField] = useState<{
    label: string;
    type: string;
    required: boolean;
    placeholder: string;
  }>({
    label: '',
    type: 'text',
    required: false,
    placeholder: ''
  });

  const totalPages = sections.length;
  const currentSection = sections[currentPage];

  const handleNextPage = () => { if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1); };
  const handlePreviousPage = () => { if (currentPage > 0) setCurrentPage(currentPage - 1); };

  const handleAddFieldClick = (pageIndex: number) => {
    setSelectedPageForAddField(pageIndex);
    setIsAddFieldDialogOpen(true);
    setNewField({ label: '', type: 'text', required: false, placeholder: '' });
  };

  const handleAddFieldConfirm = () => {
    if (!newField.label) {
      alert('Please enter a field label');
      return;
    }
    const field: FormField = {
      id: `field_custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: newField.label,
      type: newField.type as FormField['type'],
      required: newField.required || false,
      placeholder: newField.placeholder || '',
      value: ''
    };
    const updatedSections = [...sections];
    updatedSections[selectedPageForAddField] = {
      ...updatedSections[selectedPageForAddField],
      fields: [...updatedSections[selectedPageForAddField].fields, field]
    };
    setSections(updatedSections);
    setIsAddFieldDialogOpen(false);
  };

  const handleRemoveField = (fieldId: string, pageIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[pageIndex] = {
      ...updatedSections[pageIndex],
      fields: updatedSections[pageIndex].fields.filter(f => f.id !== fieldId)
    };
    setSections(updatedSections);
  };

  const handleSaveAll = () => {
    onSave(sections, fileNameState, departmentState);
  };

  const renderField = (field: FormField) => {
    const isCustom = field.id.includes('custom');
    const commonClasses = "w-full border-slate-300 bg-slate-50 text-slate-900";
    
    return (
      <div className={`relative group ${field.type === 'image' ? 'col-span-2' : ''}`}>
        {field.type === 'textarea' ? (
          <Textarea className={`${commonClasses} min-h-[80px]`} disabled readOnly value={field.value || ''} placeholder={field.placeholder} />
        ) : field.type === 'checkbox' ? (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded border border-slate-300">
            <Checkbox checked={!!field.value} disabled />
            <Label className="text-slate-900">{field.label}</Label>
          </div>
        ) : field.type === 'date' ? (
          <div className="relative">
            <Input type="date" className={`${commonClasses} pl-10`} disabled readOnly value={field.value || ''} />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        ) : field.type === 'image' ? (
          <div className="group relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="aspect-video relative overflow-hidden bg-white flex items-center justify-center p-4">
              <ImageWithFallback 
                src={field.value} 
                alt={field.label} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="p-3 bg-white border-t border-slate-100 flex justify-between items-center">
              <p className="text-[10px] font-medium text-slate-500 italic">Fig: {field.label}</p>
              <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] px-1.5 h-4">AI Asset</Badge>
            </div>
          </div>
        ) : (
          <Input type={field.type === 'number' ? 'number' : 'text'} className={commonClasses} disabled readOnly value={field.value || ''} placeholder={field.placeholder} />
        )}
        
        {isCustom && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-red-200 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full h-6 w-6 p-0 shadow-sm"
            onClick={() => handleRemoveField(field.id, currentPage)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-w-0 px-4 py-6 flex flex-col bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 custom-ai-title">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Conversion Preview</h1>
            <p className="text-slate-500 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Intelligence layer successfully mapped {sections.reduce((a, s) => a + s.fields.length, 0)} fields
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200 p-1 rounded-lg mr-2">
            {/* <Button 
              variant={!showOriginal ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setShowOriginal(false)}
              className={!showOriginal ? "bg-white text-blue-600 shadow-sm hover:bg-white" : "text-slate-600 hover:bg-slate-300"}
            >
              <Zap className="h-4 w-4 mr-2" />
              UI Form
            </Button> */}
            <Button 
              variant={showOriginal ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setShowOriginal(true)}
              className={showOriginal ? "bg-white text-blue-600 shadow-sm hover:bg-white" : "text-slate-600 hover:bg-slate-300"}
            >
              <FileText className="h-4 w-4 mr-2" />
              Original Doc
            </Button>
          </div>
          <Button variant="outline" onClick={onCancel} className="border-slate-300 text-slate-600 hover:bg-slate-100 custom-cancel">Cancel</Button>
          <Button onClick={handleSaveAll} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Configuration Section - Document File Name Only */}
      <div className="max-w-md space-y-3 shrink-0">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Document File Name</Label>
        <div className="relative">
          <Input 
            value={fileNameState}
            onChange={(e) => setFileNameState(e.target.value)}
            className="pl-10 h-12 border-slate-300 focus:ring-blue-500 text-slate-900 font-bold bg-white"
          />
          <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        </div>
      </div>

      {/* Editor Content: take all remaining height so document viewer is full height */}
      <div className="flex-1 min-h-0 flex gap-4 items-stretch min-w-0 w-full mt-4">
        {/* Page Selector Sidebar - fixed width */}
        <div className="w-44 shrink-0 space-y-4 sticky top-6 self-start">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Page Structure</h3>
          <div className="space-y-2">
            {showOriginal ? (
              /* Original Doc: dynamic pages from document */
              docPageCount > 0 ? (
                Array.from({ length: docPageCount }, (_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentDocPage(idx)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between group ${
                      currentDocPage === idx
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-transparent bg-white hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        currentDocPage === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <p className={`text-sm font-bold truncate ${currentDocPage === idx ? 'text-blue-700' : 'text-slate-700'}`}>
                        Page {idx + 1}
                      </p>
                    </div>
                    {currentDocPage === idx && <ChevronRight className="h-4 w-4 text-blue-600 shrink-0" />}
                  </button>
                ))
              ) : (
                <div className="p-3 rounded-xl border border-slate-200 bg-white text-slate-500 text-sm">Document</div>
              )
            ) : (
              /* UI Form: sections from AI mapping */
              sections.map((section, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between group ${
                    currentPage === idx
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-transparent bg-white hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      currentPage === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <p className={`text-sm font-bold truncate ${currentPage === idx ? 'text-blue-700' : 'text-slate-700'}`}>
                        {section.title || `Page ${idx + 1}`}
                      </p>
                      <p className="text-[10px] text-slate-400">{section.fields.length} Fields</p>
                    </div>
                  </div>
                  {currentPage === idx && <ChevronRight className="h-4 w-4 text-blue-600 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Editor Page - takes all remaining space */}
        <div className="flex-1 min-h-0 min-w-0 flex flex-col">
          <Card className="border-slate-300 shadow-xl overflow-hidden bg-white flex-1 flex flex-col min-h-0 w-full">
            <div className="h-2 bg-blue-600 shrink-0"></div>
            
            {showOriginal ? (
              <div className="flex-1 p-2 flex flex-col min-h-0 w-full min-w-0 overflow-hidden">
                <OriginalDocViewer
                  templateId={templateId}
                  fileName={fileNameState}
                  currentDocPage={currentDocPage}
                  onDocPagesReady={(count) => {
                    setDocPageCount(count);
                    setCurrentDocPage((p) => Math.min(p, Math.max(0, count - 1)));
                  }}
                  onDocPageChange={(idx) => setCurrentDocPage(idx)}
                  readOnly={true}
                />
              </div>
            ) : (
              <div className="p-10 flex-1 space-y-10">
                {/* Header Visualizer */}
                {currentSection.header && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 relative group border-dashed">
                    <Badge className="absolute -top-3 left-4 bg-slate-900 text-white border-none text-[9px] uppercase tracking-widest px-2">Document Header</Badge>
                    <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap leading-relaxed">{currentSection.header}</pre>
                  </div>
                )}

                {/* Title Section */}
                <div className="border-b border-slate-100 pb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{currentSection.title || `Section ${currentPage + 1}`}</h2>
                    <p className="text-slate-400 text-sm mt-1 italic">Extracted from original document mapping</p>
                  </div>
                  <Button 
                    onClick={() => handleAddFieldClick(currentPage)}
                    variant="outline" 
                    size="sm" 
                    className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 font-bold px-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Field
                  </Button>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                  {currentSection.fields.map((field) => (
                    <div key={field.id} className={`space-y-2 ${field.type === 'image' ? 'col-span-2' : ''}`}>
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <span className="text-[9px] font-bold text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{field.type}</span>
                      </div>
                      {renderField(field)}
                    </div>
                  ))}
                </div>

                {/* Footer Visualizer */}
                {currentSection.footer && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 relative mt-auto border-dashed">
                    <Badge className="absolute -top-3 left-4 bg-slate-900 text-white border-none text-[9px] uppercase tracking-widest px-2">Document Footer</Badge>
                    <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap leading-relaxed">{currentSection.footer}</pre>
                  </div>
                )}
              </div>
            )}
            
            {/* Page Footer */}
            {/* <div className="bg-slate-50 border-t border-slate-100 px-10 py-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div>Page {currentPage + 1} of {totalPages}</div>
              <div className="flex items-center gap-4">
                <button onClick={handlePreviousPage} disabled={currentPage === 0} className="hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-colors">Previous</button>
                <div className="w-px h-3 bg-slate-200"></div>
                <button onClick={handleNextPage} disabled={currentPage === totalPages - 1} className="hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-colors">Next</button>
              </div>
            </div> */}
          </Card>
        </div>
      </div>

      {/* Add Field Dialog */}
      <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Custom Form Field</DialogTitle>
            <DialogDescription>Add a new field to Page {selectedPageForAddField + 1}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-slate-900">
            <div className="grid gap-2">
              <Label>Field Label</Label>
              <Input 
                value={newField.label} 
                onChange={(e) => setNewField({...newField, label: e.target.value})}
                placeholder="e.g., Quality Inspector Name"
                className="text-slate-900"
              />
            </div>
            <div className="grid gap-2">
              <Label>Field Type</Label>
              <Select value={newField.type} onValueChange={(val) => setNewField({...newField, type: val})}>
                <SelectTrigger className="text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="req" 
                checked={newField.required} 
                onCheckedChange={(val) => setNewField({...newField, required: !!val})} 
              />
              <Label htmlFor="req">Required Field</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFieldDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFieldConfirm} className="bg-blue-600 hover:bg-blue-700">Add Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};