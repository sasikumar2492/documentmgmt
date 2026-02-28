import React from 'react';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { FormData } from '../types';
import { DocumentSmartScroll } from './DocumentSmartScroll';
import { CheckCircle, XCircle, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';

interface FormPagesProps {
  currentPage: number;
  formData: FormData;
  onFormDataChange: (field: keyof FormData, value: any) => void;
  onSave: () => void;
  onReset: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onReject?: () => void;
  onNeedRevisions?: () => void;
  onCancel: () => void;
  isViewOnly?: boolean;
  userRole?: string;
  setCurrentPage: (page: number) => void;
}

// Create a complete fallback FormData object
const createFallbackFormData = (): FormData => ({
  isPart: false,
  isMaterial: false,
  materialCode: '',
  partMaterial: '',
  supplierCode: '',
  supplierName: '',
  shippedCargoType: '',
  isPrelaunch: false,
  isPrototype: false,
  site: '',
  dateSentToFactory: '',
  billOfLadingNo: '',
  quantity: '',
  reasonMaterialChange: false,
  reasonApprovalExpiry: false,
  reasonNewSupplier: false,
  reasonChangeDesign: false,
  reasonNewPart: false,
  reasonProcessChange: false,
  productTechnicalCode: '',
  productName: '',
  productStage: '',
  isMassProduction: false,
  isProductDevelopment: false,
  dataSheetNo: '',
  drawingNo: '',
  manufacturerSelectionNumber: '',
  requesterName: '',
  requesterPosition: '',
  requesterDateSignature: '',
  approverName: '',
  approverPosition: '',
  approverDateSignature: '',
  requestAcceptable: false,
  notAcceptable: false,
  notAcceptableDueTo: '',
  qaName1: '',
  qaPosition1: '',
  qaDateSignature1: '',
  noTestReport: false,
  noECR: false,
  qaName2: '',
  qaPosition2: '',
  qaDateSignature2: '',
  noSample: false,
  noPrototype: false,
  dimensionalOK: false,
  dimensionalNOK: false,
  dimensionalEvidence: '',
  materialOK: false,
  materialNOK: false,
  materialEvidence: '',
  durabilityOK: false,
  durabilityNOK: false,
  durabilityEvidence: '',
  performanceOK: false,
  performanceNOK: false,
  performanceEvidence: '',
  assemblyOK: false,
  assemblyNOK: false,
  assemblyEvidence: '',
  documentsOK: false,
  documentsNOK: false,
  documentsEvidence: '',
  samplesOK: false,
  samplesNOK: false,
  samplesEvidence: '',
  betterThan: false,
  worseThan: false,
  sameAs: false,
  noParallel: false,
  comparisonEvidence: '',
  expertName1: '',
  expertPosition1: '',
  expertDateSignature1: '',
  managerName1: '',
  managerPosition1: '',
  managerDateSignature1: '',
  isGeneral: true,
  isExclusive: false,
  documentCode: '',
  durabilityOKP4: false,
  durabilityNOKP4: false,
  durabilityEvidenceP4: '',
  performanceOKP4: false,
  performanceNOKP4: false,
  performanceEvidenceP4: '',
  assemblyOKP4: false,
  assemblyNOKP4: false,
  assemblyEvidenceP4: '',
  documentsOKP4: false,
  documentsNOKP4: false,
  documentsEvidenceP4: '',
  samplesOKP4: false,
  samplesNOKP4: false,
  samplesEvidenceP4: '',
  betterThanP4: false,
  worseThanP4: false,
  sameAsP4: false,
  noParallelP4: false,
  comparisonEvidenceP4: '',
  expertName2: '',
  expertPosition2: '',
  expertDateSignature2: '',
  managerName2: '',
  managerPosition2: '',
  managerDateSignature2: '',
  qaExpertName: '',
  qaExpertPosition: '',
  qaExpertDateSignature: '',
  qaManagerName: '',
  qaManagerPosition: '',
  qaManagerDateSignature: '',
  isApproved: false,
  isConditionallyApproved: false,
  isApprovedLimited: false,
  isRejected: false,
  approvalDescription: '',
  approvalUntilDate: '',
  deputyName: '',
  deputyPosition: '',
  deputyDateSignature: '',
  prelaunchNeeded: false,
  prelaunchNotNeeded: false,
  auditNeeded: false,
  auditNotNeeded: false,
  archiveDate: '',
  evidence: '',
  actions: '',
  finalName: '',
  finalPosition: '',
  finalDateSignature: '',
  isGeneralP6: true,
  isExclusiveP6: false,
  documentCodeP6: ''
});

export const FormPages: React.FC<FormPagesProps> = ({
  currentPage,
  formData,
  onFormDataChange,
  onSave,
  onReset,
  onSubmit,
  onApprove,
  onReject,
  onNeedRevisions,
  onCancel,
  isViewOnly = false,
  userRole,
  setCurrentPage
}) => {
  const [isSmartScrollCollapsed, setIsSmartScrollCollapsed] = React.useState(false);

  const staticSections = [
    { id: 'p1', title: 'Basic Information', fields: [] },
    { id: 'p2', title: 'Initial Review', fields: [] },
    { id: 'p3', title: 'QA Assessment', fields: [] },
    { id: 'p4', title: 'Expert Opinion', fields: [] },
    { id: 'p5', title: 'Final Approval', fields: [] },
    { id: 'p6', title: 'Archive & Evidence', fields: [] },
  ];

  const mappedSections = staticSections.map((s, i) => ({
    ...s,
    fields: Object.keys(formData || {}).filter(k => k.includes(`P${i+1}`) || (i === 0 && !k.includes('P'))).map(k => ({ id: k, label: k, type: 'text' }))
  }));

  const safeFormData = React.useMemo(() => {
    if (!formData || typeof formData !== 'object') {
      return createFallbackFormData();
    }
    const fallback = createFallbackFormData();
    return { ...fallback, ...formData };
  }, [formData]);

  const renderPage1 = () => (
    <>
      <div className="grid grid-cols-3 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <div className="space-y-1">
            <div>Date:</div>
            <div>No:</div>
            <div>Pages 1 of 6</div>
          </div>
        </div>
        <div className="border-r-2 border-gray-800 p-3 flex items-center justify-center">
          <h1 className="text-center">Request for Approval Part/Manufacturer</h1>
        </div>
        <div className="p-3"></div>
      </div>
      <div className="border-b-2 border-gray-800 p-3 text-center bg-gray-100">
        <h2>Request for Approval Part/Manufacturer</h2>
      </div>
      <div className="grid grid-cols-4 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="part-main" 
                checked={Boolean(safeFormData?.isPart)}
                onCheckedChange={(checked) => onFormDataChange('isPart', checked)}
              />
              <label htmlFor="part-main">part</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="material-main" 
                checked={Boolean(safeFormData?.isMaterial)}
                onCheckedChange={(checked) => onFormDataChange('isMaterial', checked)}
              />
              <label htmlFor="material-main">material</label>
            </div>
          </div>
        </div>
        <div className="border-r-2 border-gray-800 p-3">
          <label className="block mb-1">Material code:</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.materialCode || '')}
            onChange={(e) => onFormDataChange('materialCode', e.target.value)}
          />
        </div>
        <div className="col-span-2 p-3">
          <label className="block mb-1">Part/material:</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.partMaterial || '')}
            onChange={(e) => onFormDataChange('partMaterial', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <label className="block mb-1">Supplier code:</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.supplierCode || '')}
            onChange={(e) => onFormDataChange('supplierCode', e.target.value)}
          />
        </div>
        <div className="p-3">
          <label className="block mb-1">Supplier Name:</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.supplierName || '')}
            onChange={(e) => onFormDataChange('supplierName', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <label className="block mb-1">Type of Shipped Cargo:</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.shippedCargoType || '')}
            onChange={(e) => onFormDataChange('shippedCargoType', e.target.value)}
          />
        </div>
        <div className="border-r-2 border-gray-800 p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox 
              id="prelaunch-main" 
              checked={Boolean(safeFormData?.isPrelaunch)}
              onCheckedChange={(checked) => onFormDataChange('isPrelaunch', checked)}
            />
            <label htmlFor="prelaunch-main">Pre-launch</label>
          </div>
        </div>
        <div className="border-r-2 border-gray-800 p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox 
              id="prototype-main" 
              checked={Boolean(safeFormData?.isPrototype)}
              onCheckedChange={(checked) => onFormDataChange('isPrototype', checked)}
            />
            <label htmlFor="prototype-main">Prototype programme</label>
          </div>
        </div>
        <div className="p-3">
          <label className="block mb-1">Site:</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.site || '')}
            onChange={(e) => onFormDataChange('site', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <label className="block mb-1">Date Sent to Factory:</label>
          <Input 
            className="w-full" 
            type="text" 
            placeholder="Enter date" 
            value={String(safeFormData?.dateSentToFactory || '')}
            onChange={(e) => onFormDataChange('dateSentToFactory', e.target.value)}
          />
        </div>
        <div className="border-r-2 border-gray-800 p-3">
          <label className="block mb-1">Bill of Lading No.</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.billOfLadingNo || '')}
            onChange={(e) => onFormDataChange('billOfLadingNo', e.target.value)}
          />
        </div>
        <div className="p-3">
          <label className="block mb-1">Quantity :</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.quantity || '')}
            onChange={(e) => onFormDataChange('quantity', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <div className="space-y-2">
            <label className="block">Reason for request:</label>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="material-change-main" 
                checked={Boolean(safeFormData?.reasonMaterialChange)}
                onCheckedChange={(checked) => onFormDataChange('reasonMaterialChange', checked)}
              />
              <label htmlFor="material-change-main">Material change</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="approval-expiry-main" 
                checked={Boolean(safeFormData?.reasonApprovalExpiry)}
                onCheckedChange={(checked) => onFormDataChange('reasonApprovalExpiry', checked)}
              />
              <label htmlFor="approval-expiry-main">Approval expiry</label>
            </div>
          </div>
        </div>
        <div className="border-r-2 border-gray-800 p-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="new-supplier-main" 
                checked={Boolean(safeFormData?.reasonNewSupplier)}
                onCheckedChange={(checked) => onFormDataChange('reasonNewSupplier', checked)}
              />
              <label htmlFor="new-supplier-main">New supplier</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="change-design-main" 
                checked={Boolean(safeFormData?.reasonChangeDesign)}
                onCheckedChange={(checked) => onFormDataChange('reasonChangeDesign', checked)}
              />
              <label htmlFor="change-design-main">Change of design</label>
            </div>
          </div>
        </div>
        <div className="border-r-2 border-gray-800 p-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="new-part-main" 
                checked={Boolean(safeFormData?.reasonNewPart)}
                onCheckedChange={(checked) => onFormDataChange('reasonNewPart', checked)}
              />
              <label htmlFor="new-part-main">new part/material</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="process-change-main" 
                checked={Boolean(safeFormData?.reasonProcessChange)}
                onCheckedChange={(checked) => onFormDataChange('reasonProcessChange', checked)}
              />
              <label htmlFor="process-change-main">production process change</label>
            </div>
          </div>
        </div>
        <div className="p-3"></div>
      </div>
      <div className="grid grid-cols-2 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <label className="block mb-1">product technical code:</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.productTechnicalCode || '')}
            onChange={(e) => onFormDataChange('productTechnicalCode', e.target.value)}
          />
        </div>
        <div className="p-3">
          <label className="block mb-1">product name:</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.productName || '')}
            onChange={(e) => onFormDataChange('productName', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <label className="block mb-1">product stage:</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.productStage || '')}
            onChange={(e) => onFormDataChange('productStage', e.target.value)}
          />
        </div>
        <div className="border-r-2 border-gray-800 p-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="mass-production-main" 
              checked={Boolean(safeFormData?.isMassProduction)}
              onCheckedChange={(checked) => onFormDataChange('isMassProduction', checked)}
            />
            <label htmlFor="mass-production-main">Mass Production</label>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="product-development-main" 
              checked={Boolean(safeFormData?.isProductDevelopment)}
              onCheckedChange={(checked) => onFormDataChange('isProductDevelopment', checked)}
            />
            <label htmlFor="product-development-main">Product Development Project</label>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <label className="block mb-1">Data sheet No. :</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.dataSheetNo || '')}
            onChange={(e) => onFormDataChange('dataSheetNo', e.target.value)}
          />
        </div>
        <div className="border-r-2 border-gray-800 p-3">
          <label className="block mb-1">drawing No.:</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.drawingNo || '')}
            onChange={(e) => onFormDataChange('drawingNo', e.target.value)}
          />
        </div>
        <div className="p-3">
          <label className="block mb-1">Manufacturer Selection Number:</label>
          <Input 
            className="w-full" 
            value={String(safeFormData?.manufacturerSelectionNumber || '')}
            onChange={(e) => onFormDataChange('manufacturerSelectionNumber', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="border-r-2 border-gray-800">
          <div className="bg-blue-100 p-3 text-center border-b-2 border-gray-800">
            <h3>Requester</h3>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <label className="block mb-1">Name and Surname:</label>
              <Input 
                className="w-full" 
                value={String(safeFormData?.requesterName || '')}
                onChange={(e) => onFormDataChange('requesterName', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">Position:</label>
              <Input 
                className="w-full" 
                value={String(safeFormData?.requesterPosition || '')}
                onChange={(e) => onFormDataChange('requesterPosition', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">Date and Signiture:</label>
              <Input 
                className="w-full" 
                type="text" 
                placeholder="Enter date" 
                value={String(safeFormData?.requesterDateSignature || '')}
                onChange={(e) => onFormDataChange('requesterDateSignature', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="bg-blue-100 p-3 text-center border-b-2 border-gray-800">
            <h3>Approver</h3>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <label className="block mb-1">Name and Surname:</label>
              <Input 
                className="w-full" 
                value={String(safeFormData?.approverName || '')}
                onChange={(e) => onFormDataChange('approverName', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">Position:</label>
              <Input 
                className="w-full" 
                value={String(safeFormData?.approverPosition || '')}
                onChange={(e) => onFormDataChange('approverPosition', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">Date and Signiture:</label>
              <Input 
                className="w-full" 
                type="text" 
                placeholder="Enter date" 
                value={String(safeFormData?.approverDateSignature || '')}
                onChange={(e) => onFormDataChange('approverDateSignature', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center space-x-4">
        {(userRole || '').toLowerCase().includes('reviewer') ? (
          <>
            <Button variant="outline" onClick={onNeedRevisions} className="px-8 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg">
              Need Revision
            </Button>
            <Button variant="outline" onClick={onReset} className="px-8 py-2 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white border-0 shadow-lg">
              Reviewed
            </Button>
            <Button onClick={onReject} className="px-8 py-2 bg-red-600 hover:bg-red-700 text-white shadow-lg">
              Rejected
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onSave} className="px-8 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg">
              Save
            </Button>
            <Button variant="outline" onClick={onReset} className="px-8 py-2 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white border-0 shadow-lg">
              Reset
            </Button>
            <Button onClick={onSubmit} className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
              Submit Request
            </Button>
          </>
        )}
      </div>
    </>
  );

  const renderPage2 = () => (
    <>
      <div className="grid grid-cols-3 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <div className="space-y-1">
            <div>Date:</div>
            <div>No:</div>
            <div>Pages 2 of 6</div>
          </div>
        </div>
        <div className="border-r-2 border-gray-800 p-3 flex items-center justify-center">
          <h1 className="text-center">Request for Approval Part/Manufacturer</h1>
        </div>
        <div className="p-3"></div>
      </div>
      <div className="border-b-2 border-gray-800 p-3 text-center bg-blue-100">
        <h3>Initial Review of Part Approval Request - Manufacturer</h3>
      </div>
      <div className="grid grid-cols-2 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox 
              id="request-acceptable" 
              checked={Boolean(safeFormData?.requestAcceptable)}
              onCheckedChange={(checked) => onFormDataChange('requestAcceptable', checked)}
            />
            <label htmlFor="request-acceptable">Request is acceptable</label>
          </div>
        </div>
        <div className="p-3"></div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-3 border-b-2 border-gray-800">
          <div className="border-r-2 border-gray-800 p-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="not-acceptable" 
                checked={Boolean(safeFormData?.notAcceptable)}
                onCheckedChange={(checked) => onFormDataChange('notAcceptable', checked)}
              />
              <label htmlFor="not-acceptable">Not acceptable</label>
            </div>
          </div>
          <div className="border-r-2 border-gray-800 p-3">
            <label className="block mb-1">due to:</label>
            <Input 
              className="w-full" 
              value={String(safeFormData?.notAcceptableDueTo || '')}
              onChange={(e) => onFormDataChange('notAcceptableDueTo', e.target.value)}
            />
          </div>
          <div className="p-3 space-y-2">
            <div>
              <label className="block mb-1">Name and Surname:</label>
              <Input 
                className="w-full" 
                value={String(safeFormData?.qaName1 || '')}
                onChange={(e) => onFormDataChange('qaName1', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">Position:</label>
              <Input 
                className="w-full" 
                value={String(safeFormData?.qaPosition1 || '')}
                onChange={(e) => onFormDataChange('qaPosition1', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">Date and Signiture:</label>
              <Input 
                className="w-full" 
                type="text" 
                placeholder="Enter date" 
                value={String(safeFormData?.qaDateSignature1 || '')}
                onChange={(e) => onFormDataChange('qaDateSignature1', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full flex items-center" style={{ transform: 'translateX(100%)' }}>
          <div className="transform -rotate-90 whitespace-nowrap text-center px-2">quality assurance</div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="no-test-report" 
              checked={Boolean(safeFormData?.noTestReport)}
              onCheckedChange={(checked) => onFormDataChange('noTestReport', checked)}
            />
            <label htmlFor="no-test-report">Non-Submission of Test Report/Data Sheet</label>
          </div>
        </div>
        <div className="border-r-2 border-gray-800 p-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="no-ecr" 
              checked={Boolean(safeFormData?.noECR)}
              onCheckedChange={(checked) => onFormDataChange('noECR', checked)}
            />
            <label htmlFor="no-ecr">No ECR exist</label>
          </div>
        </div>
        <div className="p-3 space-y-2">
          <div>
            <label className="block mb-1">Name and Surname:</label>
            <Input 
              className="w-full" 
              value={String(safeFormData?.qaName2 || '')}
              onChange={(e) => onFormDataChange('qaName2', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Position:</label>
            <Input 
              className="w-full" 
              value={String(safeFormData?.qaPosition2 || '')}
              onChange={(e) => onFormDataChange('qaPosition2', e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Date and Signiture:</label>
            <Input 
              className="w-full" 
              type="text" 
              placeholder="Enter date" 
              value={String(safeFormData?.qaDateSignature2 || '')}
              onChange={(e) => onFormDataChange('qaDateSignature2', e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3">
        <div className="border-r-2 border-gray-800 p-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="no-sample" 
              checked={Boolean(safeFormData?.noSample)}
              onCheckedChange={(checked) => onFormDataChange('noSample', checked)}
            />
            <label htmlFor="no-sample">Non-Submission of Sample</label>
          </div>
        </div>
        <div className="border-r-2 border-gray-800 p-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="no-prototype" 
              checked={Boolean(safeFormData?.noPrototype)}
              onCheckedChange={(checked) => onFormDataChange('noPrototype', checked)}
            />
            <label htmlFor="no-prototype">Lack of prototype Sample Approval</label>
          </div>
        </div>
        <div className="p-3"></div>
      </div>
      <div className="mt-6 flex justify-center space-x-4">
        <Button variant="outline" onClick={onCancel} className="px-8 py-2 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white border-0 shadow-lg">
          Cancel
        </Button>
      </div>
    </>
  );

  const renderPage3 = () => (
    <>
      <div className="grid grid-cols-3 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <div className="space-y-1">
            <div>Date:</div>
            <div>No:</div>
            <div>Pages 3 of 6</div>
          </div>
        </div>
        <div className="border-r-2 border-gray-800 p-3 flex items-center justify-center">
          <h1 className="text-center font-bold">QA Evaluation and Laboratory test</h1>
        </div>
        <div className="p-3"></div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-3 border-b-2 border-gray-800">
          <div className="border-r-2 border-gray-800 p-2 font-bold bg-gray-50 flex items-center justify-center">Items</div>
          <div className="border-r-2 border-gray-800 p-2 font-bold bg-gray-50 flex items-center justify-center">Decision</div>
          <div className="p-2 font-bold bg-gray-50 flex items-center justify-center">Evidences/Attachment</div>
        </div>
        <div className="grid grid-cols-3 border-b-2 border-gray-800">
          <div className="border-r-2 border-gray-800 p-3 font-medium">Dimensional</div>
          <div className="border-r-2 border-gray-800 p-3">
            <div className="flex justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dim-ok" 
                  checked={Boolean(safeFormData?.dimensionalOK)}
                  onCheckedChange={(checked) => onFormDataChange('dimensionalOK', checked)}
                />
                <label htmlFor="dim-ok">OK</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dim-nok" 
                  checked={Boolean(safeFormData?.dimensionalNOK)}
                  onCheckedChange={(checked) => onFormDataChange('dimensionalNOK', checked)}
                />
                <label htmlFor="dim-nok">NOK</label>
              </div>
            </div>
          </div>
          <div className="p-3">
            <Input 
              className="w-full" 
              placeholder="Evidence" 
              value={String(safeFormData?.dimensionalEvidence || '')}
              onChange={(e) => onFormDataChange('dimensionalEvidence', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 border-b-2 border-gray-800">
          <div className="border-r-2 border-gray-800 p-3 font-medium">Material</div>
          <div className="border-r-2 border-gray-800 p-3">
            <div className="flex justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mat-ok" 
                  checked={Boolean(safeFormData?.materialOK)}
                  onCheckedChange={(checked) => onFormDataChange('materialOK', checked)}
                />
                <label htmlFor="mat-ok">OK</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mat-nok" 
                  checked={Boolean(safeFormData?.materialNOK)}
                  onCheckedChange={(checked) => onFormDataChange('materialNOK', checked)}
                />
                <label htmlFor="mat-nok">NOK</label>
              </div>
            </div>
          </div>
          <div className="p-3">
            <Input 
              className="w-full" 
              placeholder="Evidence" 
              value={String(safeFormData?.materialEvidence || '')}
              onChange={(e) => onFormDataChange('materialEvidence', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 border-b-2 border-gray-800">
          <div className="border-r-2 border-gray-800 p-3 font-medium">Durability</div>
          <div className="border-r-2 border-gray-800 p-3">
            <div className="flex justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dur-ok" 
                  checked={Boolean(safeFormData?.durabilityOK)}
                  onCheckedChange={(checked) => onFormDataChange('durabilityOK', checked)}
                />
                <label htmlFor="dur-ok">OK</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dur-nok" 
                  checked={Boolean(safeFormData?.durabilityNOK)}
                  onCheckedChange={(checked) => onFormDataChange('durabilityNOK', checked)}
                />
                <label htmlFor="dur-nok">NOK</label>
              </div>
            </div>
          </div>
          <div className="p-3">
            <Input 
              className="w-full" 
              placeholder="Evidence" 
              value={String(safeFormData?.durabilityEvidence || '')}
              onChange={(e) => onFormDataChange('durabilityEvidence', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 border-b-2 border-gray-800">
          <div className="border-r-2 border-gray-800 p-3 font-medium">Performance</div>
          <div className="border-r-2 border-gray-800 p-3">
            <div className="flex justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="perf-ok" 
                  checked={Boolean(safeFormData?.performanceOK)}
                  onCheckedChange={(checked) => onFormDataChange('performanceOK', checked)}
                />
                <label htmlFor="perf-ok">OK</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="perf-nok" 
                  checked={Boolean(safeFormData?.performanceNOK)}
                  onCheckedChange={(checked) => onFormDataChange('performanceNOK', checked)}
                />
                <label htmlFor="perf-nok">NOK</label>
              </div>
            </div>
          </div>
          <div className="p-3">
            <Input 
              className="w-full" 
              placeholder="Evidence" 
              value={String(safeFormData?.performanceEvidence || '')}
              onChange={(e) => onFormDataChange('performanceEvidence', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 border-b-2 border-gray-800">
          <div className="border-r-2 border-gray-800 p-3 font-medium">Assembly</div>
          <div className="border-r-2 border-gray-800 p-3">
            <div className="flex justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ass-ok" 
                  checked={Boolean(safeFormData?.assemblyOK)}
                  onCheckedChange={(checked) => onFormDataChange('assemblyOK', checked)}
                />
                <label htmlFor="ass-ok">OK</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ass-nok" 
                  checked={Boolean(safeFormData?.assemblyNOK)}
                  onCheckedChange={(checked) => onFormDataChange('assemblyNOK', checked)}
                />
                <label htmlFor="ass-nok">NOK</label>
              </div>
            </div>
          </div>
          <div className="p-3">
            <Input 
              className="w-full" 
              placeholder="Evidence" 
              value={String(safeFormData?.assemblyEvidence || '')}
              onChange={(e) => onFormDataChange('assemblyEvidence', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 border-b-2 border-gray-800">
          <div className="border-r-2 border-gray-800 p-3 font-medium">Technical documents</div>
          <div className="border-r-2 border-gray-800 p-3">
            <div className="flex justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="doc-ok" 
                  checked={Boolean(safeFormData?.documentsOK)}
                  onCheckedChange={(checked) => onFormDataChange('documentsOK', checked)}
                />
                <label htmlFor="doc-ok">OK</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="doc-nok" 
                  checked={Boolean(safeFormData?.documentsNOK)}
                  onCheckedChange={(checked) => onFormDataChange('documentsNOK', checked)}
                />
                <label htmlFor="doc-nok">NOK</label>
              </div>
            </div>
          </div>
          <div className="p-3">
            <Input 
              className="w-full" 
              placeholder="Evidence" 
              value={String(safeFormData?.documentsEvidence || '')}
              onChange={(e) => onFormDataChange('documentsEvidence', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 border-b-2 border-gray-800">
          <div className="border-r-2 border-gray-800 p-3 font-medium">Samples</div>
          <div className="border-r-2 border-gray-800 p-3">
            <div className="flex justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sam-ok" 
                  checked={Boolean(safeFormData?.samplesOK)}
                  onCheckedChange={(checked) => onFormDataChange('samplesOK', checked)}
                />
                <label htmlFor="sam-ok">OK</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sam-nok" 
                  checked={Boolean(safeFormData?.samplesNOK)}
                  onCheckedChange={(checked) => onFormDataChange('samplesNOK', checked)}
                />
                <label htmlFor="sam-nok">NOK</label>
              </div>
            </div>
          </div>
          <div className="p-3">
            <Input 
              className="w-full" 
              placeholder="Evidence" 
              value={String(safeFormData?.samplesEvidence || '')}
              onChange={(e) => onFormDataChange('samplesEvidence', e.target.value)}
            />
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full flex items-center" style={{ transform: 'translateX(100%)' }}>
          <div className="transform -rotate-90 whitespace-nowrap text-center px-2">quality assurance assessment</div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3 font-bold bg-gray-50 flex items-center justify-center">Compare With Parallel product/Manufacturer</div>
        <div className="border-r-2 border-gray-800 p-3 flex flex-col justify-center space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="better" checked={Boolean(safeFormData?.betterThan)} onCheckedChange={(checked) => onFormDataChange('betterThan', checked)} />
            <label htmlFor="better">Better than parallel</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="worse" checked={Boolean(safeFormData?.worseThan)} onCheckedChange={(checked) => onFormDataChange('worseThan', checked)} />
            <label htmlFor="worse">Worse than parallel</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="same" checked={Boolean(safeFormData?.sameAs)} onCheckedChange={(checked) => onFormDataChange('sameAs', checked)} />
            <label htmlFor="same">Same as parallel</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="no-parallel" checked={Boolean(safeFormData?.noParallel)} onCheckedChange={(checked) => onFormDataChange('noParallel', checked)} />
            <label htmlFor="no-parallel">No parallel exist</label>
          </div>
        </div>
        <div className="p-3">
          <Textarea 
            className="w-full h-full min-h-[100px]" 
            placeholder="Comparison evidence" 
            value={String(safeFormData?.comparisonEvidence || '')}
            onChange={(e) => onFormDataChange('comparisonEvidence', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="border-r-2 border-gray-800">
          <div className="bg-blue-50 p-3 text-center border-b-2 border-gray-800 font-bold">Expert opinion</div>
          <div className="p-3 space-y-2">
            <Input placeholder="Name" value={String(safeFormData?.expertName1 || '')} onChange={(e) => onFormDataChange('expertName1', e.target.value)} />
            <Input placeholder="Position" value={String(safeFormData?.expertPosition1 || '')} onChange={(e) => onFormDataChange('expertPosition1', e.target.value)} />
            <Input placeholder="Date & Signature" value={String(safeFormData?.expertDateSignature1 || '')} onChange={(e) => onFormDataChange('expertDateSignature1', e.target.value)} />
          </div>
        </div>
        <div>
          <div className="bg-blue-50 p-3 text-center border-b-2 border-gray-800 font-bold">Manager assessment</div>
          <div className="p-3 space-y-2">
            <Input placeholder="Name" value={String(safeFormData?.managerName1 || '')} onChange={(e) => onFormDataChange('managerName1', e.target.value)} />
            <Input placeholder="Position" value={String(safeFormData?.managerPosition1 || '')} onChange={(e) => onFormDataChange('managerPosition1', e.target.value)} />
            <Input placeholder="Date & Signature" value={String(safeFormData?.managerDateSignature1 || '')} onChange={(e) => onFormDataChange('managerDateSignature1', e.target.value)} />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <Button variant="outline" onClick={onCancel} className="px-8 py-2 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white border-0 shadow-lg">
          Cancel
        </Button>
      </div>
    </>
  );

  const renderPage4 = () => (
    <>
      <div className="grid grid-cols-3 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <div className="space-y-1">
            <div>Date:</div>
            <div>No:</div>
            <div>Pages 4 of 6</div>
          </div>
        </div>
        <div className="border-r-2 border-gray-800 p-3 flex items-center justify-center">
          <h1 className="text-center font-bold">QA Evaluation and Laboratory test (Cont.)</h1>
        </div>
        <div className="p-3"></div>
      </div>
      <div className="grid grid-cols-2 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3 flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Checkbox id="gen" checked={Boolean(safeFormData?.isGeneral)} onCheckedChange={(checked) => onFormDataChange('isGeneral', checked)} />
            <label htmlFor="gen">General</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="exc" checked={Boolean(safeFormData?.isExclusive)} onCheckedChange={(checked) => onFormDataChange('isExclusive', checked)} />
            <label htmlFor="exc">Exclusive</label>
          </div>
        </div>
        <div className="p-3">
          <Input placeholder="Document Code" value={String(safeFormData?.documentCode || '')} onChange={(e) => onFormDataChange('documentCode', e.target.value)} />
        </div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-3 border-b-2 border-gray-800 bg-gray-50">
          <div className="border-r-2 border-gray-800 p-2 font-bold text-center">Items</div>
          <div className="border-r-2 border-gray-800 p-2 font-bold text-center">Decision</div>
          <div className="p-2 font-bold text-center">Evidences</div>
        </div>
        {[
          { id: 'durP4', label: 'Durability', field: 'durability' },
          { id: 'perfP4', label: 'Performance', field: 'performance' },
          { id: 'assP4', label: 'Assembly', field: 'assembly' },
          { id: 'docP4', label: 'Documents', field: 'documents' },
          { id: 'samP4', label: 'Samples', field: 'samples' }
        ].map(item => (
          <div key={item.id} className="grid grid-cols-3 border-b-2 border-gray-800">
            <div className="border-r-2 border-gray-800 p-3 font-medium">{item.label}</div>
            <div className="border-r-2 border-gray-800 p-3">
              <div className="flex justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${item.id}-ok`} 
                    checked={Boolean(safeFormData?.[`${item.field}OKP4` as keyof FormData])}
                    onCheckedChange={(c) => onFormDataChange(`${item.field}OKP4` as keyof FormData, c)}
                  />
                  <label htmlFor={`${item.id}-ok`}>OK</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${item.id}-nok`} 
                    checked={Boolean(safeFormData?.[`${item.field}NOKP4` as keyof FormData])}
                    onCheckedChange={(c) => onFormDataChange(`${item.field}NOKP4` as keyof FormData, c)}
                  />
                  <label htmlFor={`${item.id}-nok`}>NOK</label>
                </div>
              </div>
            </div>
            <div className="p-3">
              <Input 
                value={String(safeFormData?.[`${item.field}EvidenceP4` as keyof FormData] || '')} 
                onChange={(e) => onFormDataChange(`${item.field}EvidenceP4` as keyof FormData, e.target.value)} 
              />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3 font-bold bg-gray-50 flex items-center justify-center">Comparison</div>
        <div className="border-r-2 border-gray-800 p-3 space-y-2">
          {['betterThanP4', 'worseThanP4', 'sameAsP4', 'noParallelP4'].map(k => (
            <div key={k} className="flex items-center space-x-2">
              <Checkbox id={k} checked={Boolean(safeFormData?.[k as keyof FormData])} onCheckedChange={(c) => onFormDataChange(k as keyof FormData, c)} />
              <label htmlFor={k}>{k.replace('P4', '').replace(/([A-Z])/g, ' $1')}</label>
            </div>
          ))}
        </div>
        <div className="p-3">
          <Textarea value={String(safeFormData?.comparisonEvidenceP4 || '')} onChange={(e) => onFormDataChange('comparisonEvidenceP4', e.target.value)} className="h-full min-h-[100px]" />
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="border-r-2 border-gray-800 p-3 space-y-2">
          <p className="font-bold border-b mb-2">Expert opinion</p>
          <Input placeholder="Name" value={String(safeFormData?.expertName2 || '')} onChange={(e) => onFormDataChange('expertName2', e.target.value)} />
          <Input placeholder="Position" value={String(safeFormData?.expertPosition2 || '')} onChange={(e) => onFormDataChange('expertPosition2', e.target.value)} />
          <Input placeholder="Date" value={String(safeFormData?.expertDateSignature2 || '')} onChange={(e) => onFormDataChange('expertDateSignature2', e.target.value)} />
        </div>
        <div className="p-3 space-y-2">
          <p className="font-bold border-b mb-2">Manager assessment</p>
          <Input placeholder="Name" value={String(safeFormData?.managerName2 || '')} onChange={(e) => onFormDataChange('managerName2', e.target.value)} />
          <Input placeholder="Position" value={String(safeFormData?.managerPosition2 || '')} onChange={(e) => onFormDataChange('managerPosition2', e.target.value)} />
          <Input placeholder="Date" value={String(safeFormData?.managerDateSignature2 || '')} onChange={(e) => onFormDataChange('managerDateSignature2', e.target.value)} />
        </div>
      </div>
    </>
  );

  const renderPage5 = () => (
    <>
      <div className="grid grid-cols-3 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <div className="space-y-1">
            <div>Date:</div>
            <div>No:</div>
            <div>Pages 5 of 6</div>
          </div>
        </div>
        <div className="border-r-2 border-gray-800 p-3 flex items-center justify-center">
          <h1 className="text-center font-bold text-xl uppercase tracking-wider">Final Decision and Approval</h1>
        </div>
        <div className="p-3"></div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-2 border-b-2 border-gray-800">
          <div className="border-r-2 border-gray-800 p-3">
            <label className="block mb-2 font-bold text-blue-800 uppercase text-xs">Quality Assurance Expert:</label>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-600">Name and Surname:</label>
              <Input value={String(safeFormData?.qaExpertName || '')} onChange={(e) => onFormDataChange('qaExpertName', e.target.value)} className="bg-slate-50 border-slate-300" />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-600">Position:</label>
              <Input value={String(safeFormData?.qaExpertPosition || '')} onChange={(e) => onFormDataChange('qaExpertPosition', e.target.value)} className="bg-slate-50 border-slate-300" />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-600">Date and Signature:</label>
              <Input value={String(safeFormData?.qaExpertDateSignature || '')} onChange={(e) => onFormDataChange('qaExpertDateSignature', e.target.value)} className="bg-slate-50 border-slate-300" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full flex items-center" style={{ transform: 'translateX(100%)', height: '150px' }}>
          <div className="transform -rotate-90 whitespace-nowrap text-center px-4 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-t-lg">Prepared By</div>
        </div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-2 border-b-2 border-gray-800">
          <div className="border-r-2 border-gray-800 p-3">
            <label className="block mb-2 font-bold text-emerald-800 uppercase text-xs">Quality Assurance Manager:</label>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-600">Name and Surname:</label>
              <Input value={String(safeFormData?.qaManagerName || '')} onChange={(e) => onFormDataChange('qaManagerName', e.target.value)} className="bg-slate-50 border-slate-300" />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-600">Position:</label>
              <Input value={String(safeFormData?.qaManagerPosition || '')} onChange={(e) => onFormDataChange('qaManagerPosition', e.target.value)} className="bg-slate-50 border-slate-300" />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-600">Date and Signature:</label>
              <Input value={String(safeFormData?.qaManagerDateSignature || '')} onChange={(e) => onFormDataChange('qaManagerDateSignature', e.target.value)} className="bg-slate-50 border-slate-300" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full flex items-center" style={{ transform: 'translateX(100%)', height: '150px' }}>
          <div className="transform -rotate-90 whitespace-nowrap text-center px-4 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-t-lg">Accepted By</div>
        </div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-3 border-b-2 border-gray-800">
          <div className="border-r-2 border-gray-800 p-3 bg-slate-50">
            <div className="space-y-3">
              {['isApproved', 'isConditionallyApproved', 'isApprovedLimited', 'isRejected'].map(k => (
                <div key={k} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                  <Checkbox id={k} checked={Boolean(safeFormData?.[k as keyof FormData])} onCheckedChange={(c) => onFormDataChange(k as keyof FormData, c)} />
                  <label htmlFor={k} className="text-sm font-bold text-slate-700 leading-none cursor-pointer">{k.replace('is', '').replace(/([A-Z])/g, ' $1')}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="border-r-2 border-gray-800 p-3 space-y-4">
            <div>
              <label className="block mb-1 text-xs font-bold text-slate-500 uppercase">Decision Details</label>
              <Textarea value={String(safeFormData?.approvalDescription || '')} onChange={(e) => onFormDataChange('approvalDescription', e.target.value)} className="h-24 text-sm" />
            </div>
            <div>
              <label className="block mb-1 text-xs font-bold text-slate-500 uppercase">Validity Period</label>
              <Input value={String(safeFormData?.approvalUntilDate || '')} onChange={(e) => onFormDataChange('approvalUntilDate', e.target.value)} />
            </div>
          </div>
          <div className="p-3 space-y-3 bg-amber-50/30">
            <Input placeholder="Approver Name" value={String(safeFormData?.deputyName || '')} onChange={(e) => onFormDataChange('deputyName', e.target.value)} className="bg-white" />
            <Input placeholder="Position" value={String(safeFormData?.deputyPosition || '')} onChange={(e) => onFormDataChange('deputyPosition', e.target.value)} className="bg-white" />
            <Input placeholder="Date & Signature" value={String(safeFormData?.deputyDateSignature || '')} onChange={(e) => onFormDataChange('deputyDateSignature', e.target.value)} className="bg-white" />
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full flex items-center" style={{ transform: 'translateX(100%)', height: '200px' }}>
          <div className="transform -rotate-90 whitespace-nowrap text-center px-4 py-1 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-t-lg shadow-md">Approved By</div>
        </div>
      </div>
    </>
  );

  const renderPage6 = () => (
    <>
      <div className="grid grid-cols-3 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <div className="space-y-1">
            <div>Date:</div>
            <div>No:</div>
            <div>Pages 6 of 6</div>
          </div>
        </div>
        <div className="border-r-2 border-gray-800 p-3 flex items-center justify-center">
          <h1 className="text-center font-black text-xl uppercase">Final Registration</h1>
        </div>
        <div className="p-3"></div>
      </div>
      <div className="grid grid-cols-2 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-4 space-y-3 bg-slate-50">
          <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border shadow-sm">
            <Checkbox id="p-needed" checked={Boolean(safeFormData?.prelaunchNeeded)} onCheckedChange={(c) => onFormDataChange('prelaunchNeeded', c)} />
            <label htmlFor="p-needed" className="font-bold text-sm">Pre-launch Needed</label>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border shadow-sm">
            <Checkbox id="p-not" checked={Boolean(safeFormData?.prelaunchNotNeeded)} onCheckedChange={(c) => onFormDataChange('prelaunchNotNeeded', c)} />
            <label htmlFor="p-not" className="font-bold text-sm text-slate-500">Pre-launch Not Needed</label>
          </div>
        </div>
        <div className="p-4 space-y-3 bg-slate-50">
          <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border shadow-sm">
            <Checkbox id="a-needed" checked={Boolean(safeFormData?.auditNeeded)} onCheckedChange={(c) => onFormDataChange('auditNeeded', c)} />
            <label htmlFor="a-needed" className="font-bold text-sm">Audit Needed</label>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border shadow-sm">
            <Checkbox id="a-not" checked={Boolean(safeFormData?.auditNotNeeded)} onCheckedChange={(c) => onFormDataChange('auditNotNeeded', c)} />
            <label htmlFor="a-not" className="font-bold text-sm text-slate-500">Audit Not Needed</label>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-b-2 border-gray-800">
        <div className="border-r-2 border-gray-800 p-3">
          <label className="block mb-1 text-xs font-bold text-slate-400 uppercase">Archive Date</label>
          <Input value={String(safeFormData?.archiveDate || '')} onChange={(e) => onFormDataChange('archiveDate', e.target.value)} />
        </div>
        <div className="border-r-2 border-gray-800 p-3">
          <label className="block mb-1 text-xs font-bold text-slate-400 uppercase">Final Evidence</label>
          <Textarea value={String(safeFormData?.evidence || '')} onChange={(e) => onFormDataChange('evidence', e.target.value)} className="h-20" />
        </div>
        <div className="p-3">
          <label className="block mb-1 text-xs font-bold text-slate-400 uppercase">Pending Actions</label>
          <Textarea value={String(safeFormData?.actions || '')} onChange={(e) => onFormDataChange('actions', e.target.value)} className="h-20" />
        </div>
      </div>
      <div className="grid grid-cols-1 border-b-2 border-gray-800 p-4 bg-blue-50/20">
        <div className="grid grid-cols-3 gap-6">
          <Input placeholder="Final Registration Name" value={String(safeFormData?.finalName || '')} onChange={(e) => onFormDataChange('finalName', e.target.value)} />
          <Input placeholder="Position" value={String(safeFormData?.finalPosition || '')} onChange={(e) => onFormDataChange('finalPosition', e.target.value)} />
          <Input placeholder="Registration Date" value={String(safeFormData?.finalDateSignature || '')} onChange={(e) => onFormDataChange('finalDateSignature', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-4 bg-slate-100/50">
        <div className="border-r-2 border-gray-800 p-3 flex gap-4">
          <Checkbox checked={Boolean(safeFormData?.isGeneralP6)} onCheckedChange={(c) => onFormDataChange('isGeneralP6', c)} />
          <label className="text-xs font-bold">GENERAL</label>
          <Checkbox checked={Boolean(safeFormData?.isExclusiveP6)} onCheckedChange={(c) => onFormDataChange('isExclusiveP6', c)} />
          <label className="text-xs font-bold">EXCLUSIVE</label>
        </div>
        <div className="border-r-2 border-gray-800 p-3">
          <Input placeholder="DOC CODE" value={String(safeFormData?.documentCodeP6 || '')} onChange={(e) => onFormDataChange('documentCodeP6', e.target.value)} className="bg-white" />
        </div>
        <div className="col-span-2 p-3 text-[10px] font-bold text-slate-400 leading-tight">
          Purchase • Quality Control • Quality Assurance • Engineering
        </div>
      </div>
    </>
  );

  if (!safeFormData) return <div className="p-8 text-center text-slate-600">Loading...</div>;

  return (
    <div className="relative min-h-[297mm]">
      <div className="bg-white border-2 border-gray-800 shadow-2xl overflow-visible p-8 mb-20 relative">
        {currentPage === 1 && renderPage1()}
        {currentPage === 2 && renderPage2()}
        {currentPage === 3 && renderPage3()}
        {currentPage === 4 && renderPage4()}
        {currentPage === 5 && renderPage5()}
        {currentPage === 6 && renderPage6()}
      </div>
    </div>
  );
};
