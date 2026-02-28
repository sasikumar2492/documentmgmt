import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  Search, 
  Database, 
  Plus, 
  X, 
  CheckCircle2, 
  FileText,
  Calendar,
  Hash,
  AlignLeft,
  ToggleLeft
} from 'lucide-react';
import { FormField } from '../types/index';

interface AddFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddField: (field: FormField) => void;
  sectionId: string;
  existingFieldIds: string[];
}

// Common SAP Fields Database
const SAP_FIELDS = [
  // Material Master Data
  { id: 'MARA-MATNR', label: 'Material Number', type: 'text' as const, category: 'Material Master', description: 'Unique material identifier' },
  { id: 'MARA-MAKTX', label: 'Material Description', type: 'text' as const, category: 'Material Master', description: 'Short description of material' },
  { id: 'MARA-MTART', label: 'Material Type', type: 'text' as const, category: 'Material Master', description: 'Type of material (ROH, HALB, FERT, etc.)' },
  { id: 'MARA-MATKL', label: 'Material Group', type: 'text' as const, category: 'Material Master', description: 'Material group for classification' },
  { id: 'MARA-MEINS', label: 'Base Unit of Measure', type: 'text' as const, category: 'Material Master', description: 'Base UOM (EA, KG, L, etc.)' },
  { id: 'MARA-MBRSH', label: 'Industry Sector', type: 'text' as const, category: 'Material Master', description: 'Industry sector classification' },
  { id: 'MARA-BRGEW', label: 'Gross Weight', type: 'number' as const, category: 'Material Master', description: 'Gross weight of material' },
  { id: 'MARA-NTGEW', label: 'Net Weight', type: 'number' as const, category: 'Material Master', description: 'Net weight of material' },
  { id: 'MARA-GEWEI', label: 'Weight Unit', type: 'text' as const, category: 'Material Master', description: 'Unit for weight (KG, LB, etc.)' },
  { id: 'MARC-WERKS', label: 'Plant', type: 'text' as const, category: 'Material Master', description: 'Plant where material is stored' },
  { id: 'MARC-LGORT', label: 'Storage Location', type: 'text' as const, category: 'Material Master', description: 'Storage location code' },
  { id: 'MARC-PRCTR', label: 'Profit Center', type: 'text' as const, category: 'Material Master', description: 'Profit center assignment' },
  { id: 'MARC-MMSTA', label: 'Plant-Specific Material Status', type: 'text' as const, category: 'Material Master', description: 'Material status at plant level' },
  
  // Vendor Master Data
  { id: 'LFA1-LIFNR', label: 'Vendor Number', type: 'text' as const, category: 'Vendor Master', description: 'Unique vendor account number' },
  { id: 'LFA1-NAME1', label: 'Vendor Name', type: 'text' as const, category: 'Vendor Master', description: 'Name of vendor' },
  { id: 'LFA1-SORTL', label: 'Search Term', type: 'text' as const, category: 'Vendor Master', description: 'Search term for vendor' },
  { id: 'LFA1-LAND1', label: 'Country Key', type: 'text' as const, category: 'Vendor Master', description: 'Country of vendor' },
  { id: 'LFA1-ORT01', label: 'City', type: 'text' as const, category: 'Vendor Master', description: 'Vendor city' },
  { id: 'LFA1-PSTLZ', label: 'Postal Code', type: 'text' as const, category: 'Vendor Master', description: 'Postal/ZIP code' },
  { id: 'LFA1-STRAS', label: 'Street Address', type: 'text' as const, category: 'Vendor Master', description: 'Street and house number' },
  { id: 'LFA1-TELF1', label: 'Telephone Number', type: 'text' as const, category: 'Vendor Master', description: 'Primary phone number' },
  { id: 'LFA1-SMTP_ADDR', label: 'Email Address', type: 'text' as const, category: 'Vendor Master', description: 'Vendor email address' },
  
  // Purchase Order Data
  { id: 'EKKO-EBELN', label: 'Purchase Order Number', type: 'text' as const, category: 'Purchase Order', description: 'PO document number' },
  { id: 'EKKO-AEDAT', label: 'PO Creation Date', type: 'date' as const, category: 'Purchase Order', description: 'Date PO was created' },
  { id: 'EKKO-ERNAM', label: 'Created By', type: 'text' as const, category: 'Purchase Order', description: 'User who created PO' },
  { id: 'EKKO-LIFNR', label: 'Vendor', type: 'text' as const, category: 'Purchase Order', description: 'Vendor account number' },
  { id: 'EKKO-WAERS', label: 'Currency', type: 'text' as const, category: 'Purchase Order', description: 'Currency key (USD, EUR, etc.)' },
  { id: 'EKKO-BEDAT', label: 'PO Document Date', type: 'date' as const, category: 'Purchase Order', description: 'Document date of PO' },
  { id: 'EKPO-EBELP', label: 'PO Item', type: 'text' as const, category: 'Purchase Order', description: 'Item number within PO' },
  { id: 'EKPO-MATNR', label: 'Material', type: 'text' as const, category: 'Purchase Order', description: 'Material number' },
  { id: 'EKPO-MENGE', label: 'PO Quantity', type: 'number' as const, category: 'Purchase Order', description: 'Quantity ordered' },
  { id: 'EKPO-NETPR', label: 'Net Price', type: 'number' as const, category: 'Purchase Order', description: 'Net price per unit' },
  { id: 'EKPO-NETWR', label: 'Net Order Value', type: 'number' as const, category: 'Purchase Order', description: 'Total net value' },
  
  // Quality Management
  { id: 'QALS-PRUEFLOS', label: 'Inspection Lot', type: 'text' as const, category: 'Quality Management', description: 'Inspection lot number' },
  { id: 'QALS-MATNR', label: 'Material for Inspection', type: 'text' as const, category: 'Quality Management', description: 'Material being inspected' },
  { id: 'QALS-WERK', label: 'Plant for Inspection', type: 'text' as const, category: 'Quality Management', description: 'Plant where inspection occurs' },
  { id: 'QALS-PASTRTERM', label: 'Inspection Start Date', type: 'date' as const, category: 'Quality Management', description: 'Start date of inspection' },
  { id: 'QALS-PAENDTERM', label: 'Inspection End Date', type: 'date' as const, category: 'Quality Management', description: 'End date of inspection' },
  { id: 'QALS-QMTXT', label: 'QM Short Text', type: 'textarea' as const, category: 'Quality Management', description: 'Quality management description' },
  
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
  { id: 'DOC-REFERENCE', label: 'Reference Number', type: 'text' as const, category: 'Document', description: 'External reference number' },
  
  // General Fields
  { id: 'GEN-COMPANY', label: 'Company Code', type: 'text' as const, category: 'General', description: 'Company code in SAP' },
  { id: 'GEN-FISCAL-YEAR', label: 'Fiscal Year', type: 'text' as const, category: 'General', description: 'Fiscal year' },
  { id: 'GEN-PERIOD', label: 'Posting Period', type: 'text' as const, category: 'General', description: 'Accounting period' },
  { id: 'GEN-USERNAME', label: 'User Name', type: 'text' as const, category: 'General', description: 'SAP user name' },
  { id: 'GEN-TIMESTAMP', label: 'Timestamp', type: 'date' as const, category: 'General', description: 'Date and time stamp' },
];

const FIELD_TYPE_OPTIONS = [
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'textarea', label: 'Text Area', icon: AlignLeft },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'checkbox', label: 'Checkbox', icon: ToggleLeft },
];

export const AddFieldModal: React.FC<AddFieldModalProps> = ({
  isOpen,
  onClose,
  onAddField,
  sectionId,
  existingFieldIds
}) => {
  const [step, setStep] = useState<'select-type' | 'sap-fields' | 'custom-field'>('select-type');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Custom field form state
  const [customFieldLabel, setCustomFieldLabel] = useState('');
  const [customFieldType, setCustomFieldType] = useState<FormField['type']>('text');
  const [customFieldRequired, setCustomFieldRequired] = useState(false);
  const [isSAPField, setIsSAPField] = useState(false);
  const [selectedSAPFieldId, setSelectedSAPFieldId] = useState('');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(SAP_FIELDS.map(f => f.category));
    return Array.from(cats).sort();
  }, []);

  // Filter SAP fields based on search and category
  const filteredSAPFields = useMemo(() => {
    return SAP_FIELDS.filter(field => {
      const matchesSearch = searchQuery === '' || 
        field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === null || field.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSelectSAPField = (sapField: typeof SAP_FIELDS[0]) => {
    const newField: FormField = {
      id: `${sectionId}_${sapField.id}_${Date.now()}`,
      label: sapField.label,
      type: sapField.type,
      value: '',
      required: false,
      sapFieldId: sapField.id
    };
    
    onAddField(newField);
    handleClose();
  };

  const handleCreateCustomField = () => {
    if (isSAPField && !selectedSAPFieldId) {
      alert('Please select a SAP field');
      return;
    }
    
    if (!isSAPField && !customFieldLabel.trim()) {
      alert('Please enter a field label');
      return;
    }

    let newField: FormField;
    
    if (isSAPField) {
      const sapField = SAP_FIELDS.find(f => f.id === selectedSAPFieldId);
      if (!sapField) return;
      
      newField = {
        id: `${sectionId}_${sapField.id}_${Date.now()}`,
        label: sapField.label,
        type: customFieldType,
        value: '',
        required: customFieldRequired,
        sapFieldId: sapField.id
      };
    } else {
      newField = {
        id: `${sectionId}_custom_${Date.now()}`,
        label: customFieldLabel.trim(),
        type: customFieldType,
        value: '',
        required: customFieldRequired
      };
    }
    
    onAddField(newField);
    handleClose();
  };

  const handleClose = () => {
    setStep('select-type');
    setSearchQuery('');
    setSelectedCategory(null);
    setCustomFieldLabel('');
    setCustomFieldType('text');
    setCustomFieldRequired(false);
    setIsSAPField(false);
    setSelectedSAPFieldId('');
    onClose();
  };

  const getFieldTypeIcon = (type: string) => {
    const option = FIELD_TYPE_OPTIONS.find(o => o.value === type);
    return option?.icon || FileText;
  };

  // Debug: Log when modal state changes
  React.useEffect(() => {
    console.log('AddFieldModal isOpen:', isOpen, 'step:', step);
    if (isOpen) {
      console.log('✅ MODAL SHOULD BE VISIBLE NOW!');
    }
  }, [isOpen, step]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Debug header to test visibility */}
        <div className="fixed top-0 left-0 bg-red-500 text-white p-4 z-[9999]">
          MODAL IS OPEN: {isOpen ? 'YES' : 'NO'} - Step: {step}
        </div>
        
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <div>Add New Field</div>
              <DialogDescription className="mt-1">
                {step === 'select-type' && 'Choose whether to add a SAP field or create a custom field'}
                {step === 'sap-fields' && 'Select from standard SAP fields'}
                {step === 'custom-field' && 'Create a custom field with your own specifications'}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Select Field Type */}
          {step === 'select-type' && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {/* SAP Fields Option */}
                <button
                  onClick={() => setStep('sap-fields')}
                  className="group relative p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-left bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Database className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">SAP Fields</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Select from {SAP_FIELDS.length}+ standard SAP fields
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Recommended
                    </Badge>
                  </div>
                </button>

                {/* Custom Field Option */}
                <button
                  onClick={() => setStep('custom-field')}
                  className="group relative p-6 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:shadow-lg transition-all duration-200 text-left bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Custom Field</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Create your own field with custom properties
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Flexible
                    </Badge>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: SAP Fields Selection */}
          {step === 'sap-fields' && (
            <div className="space-y-4 py-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search SAP fields by name, ID, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className={selectedCategory === null ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" : ""}
                >
                  All Categories ({SAP_FIELDS.length})
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" : ""}
                  >
                    {category} ({SAP_FIELDS.filter(f => f.category === category).length})
                  </Button>
                ))}
              </div>

              {/* SAP Fields List */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {filteredSAPFields.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No SAP fields found matching your search</p>
                  </div>
                ) : (
                  filteredSAPFields.map((field) => {
                    const Icon = getFieldTypeIcon(field.type);
                    return (
                      <button
                        key={field.id}
                        onClick={() => handleSelectSAPField(field)}
                        className="w-full p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 text-left bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              <h4 className="font-medium text-gray-900 truncate">{field.label}</h4>
                              <Badge variant="outline" className="ml-auto flex-shrink-0 text-xs">
                                {field.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{field.id}</p>
                            <p className="text-sm text-gray-600">{field.description}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            {field.category}
                          </Badge>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Back Button */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setStep('select-type')}>
                  Back
                </Button>
                <p className="text-sm text-gray-500 self-center">
                  Showing {filteredSAPFields.length} of {SAP_FIELDS.length} fields
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Custom Field Creation */}
          {step === 'custom-field' && (
            <div className="space-y-6 py-4">
              {/* SAP / Non-SAP Toggle */}
              <div className="space-y-3">
                <Label>Field Source *</Label>
                <div className="flex gap-3 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => {
                      setIsSAPField(false);
                      setSelectedSAPFieldId('');
                    }}
                    className={`flex-1 py-3 px-4 rounded-md transition-all duration-200 font-medium ${
                      !isSAPField
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-4 w-4" />
                      Non-SAP Field
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setIsSAPField(true);
                      setCustomFieldLabel('');
                    }}
                    className={`flex-1 py-3 px-4 rounded-md transition-all duration-200 font-medium ${
                      isSAPField
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Database className="h-4 w-4" />
                      SAP Field
                    </div>
                  </button>
                </div>
              </div>

              {/* Field Label - Conditional: Text Input or Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="field-label">Field Label *</Label>
                {isSAPField ? (
                  <select
                    id="field-label"
                    value={selectedSAPFieldId}
                    onChange={(e) => {
                      setSelectedSAPFieldId(e.target.value);
                      const selected = SAP_FIELDS.find(f => f.id === e.target.value);
                      if (selected) {
                        setCustomFieldType(selected.type);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Select a SAP Field --</option>
                    {categories.map(category => (
                      <optgroup key={category} label={category}>
                        {SAP_FIELDS
                          .filter(f => f.category === category)
                          .map(field => (
                            <option key={field.id} value={field.id}>
                              {field.label} ({field.id})
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="field-label"
                    placeholder="e.g., Requestor Name, Department Code, etc."
                    value={customFieldLabel}
                    onChange={(e) => setCustomFieldLabel(e.target.value)}
                  />
                )}
                {isSAPField && selectedSAPFieldId && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Database className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-blue-900 font-medium">
                          {SAP_FIELDS.find(f => f.id === selectedSAPFieldId)?.label}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          {SAP_FIELDS.find(f => f.id === selectedSAPFieldId)?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Field Type */}
              <div className="space-y-2">
                <Label>Field Type *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {FIELD_TYPE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setCustomFieldType(option.value as FormField['type'])}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          customFieldType === option.value
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            customFieldType === option.value
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Required Checkbox */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-gray-200 bg-gray-50">
                <input
                  type="checkbox"
                  id="field-required"
                  checked={customFieldRequired}
                  onChange={(e) => setCustomFieldRequired(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="field-required" className="cursor-pointer">
                  Make this field required
                </Label>
              </div>

              {/* Preview */}
              <div className="space-y-2 p-4 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <Label className="text-xs text-blue-900 uppercase tracking-wide">Preview</Label>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <Label className="mb-2 flex items-center gap-1">
                    {isSAPField 
                      ? (SAP_FIELDS.find(f => f.id === selectedSAPFieldId)?.label || 'Field Label')
                      : (customFieldLabel || 'Field Label')}
                    {customFieldRequired && <span className="text-red-500">*</span>}
                  </Label>
                  {customFieldType === 'textarea' ? (
                    <Textarea placeholder="Enter value..." disabled className="bg-gray-50" />
                  ) : customFieldType === 'checkbox' ? (
                    <div className="flex items-center gap-2">
                      <input type="checkbox" disabled className="h-4 w-4" />
                      <span className="text-sm text-gray-600">Checkbox option</span>
                    </div>
                  ) : (
                    <Input 
                      type={customFieldType === 'number' ? 'number' : customFieldType === 'date' ? 'date' : 'text'}
                      placeholder="Enter value..."
                      disabled
                      className="bg-gray-50"
                    />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep('select-type')}>
                  Back
                </Button>
                <Button
                  onClick={handleCreateCustomField}
                  disabled={isSAPField ? !selectedSAPFieldId : !customFieldLabel.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {isSAPField ? 'SAP' : 'Custom'} Field
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};