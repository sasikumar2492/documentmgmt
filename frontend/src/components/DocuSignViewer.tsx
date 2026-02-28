import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Shield, 
  CheckCircle, 
  Calendar, 
  User, 
  Globe, 
  Monitor, 
  Hash, 
  FileKey, 
  Award,
  Lock,
  Download,
  X,
  Sparkles,
  ShieldCheck,
  FileText,
  Clock,
  MapPin,
  Printer,
  Share2,
  Eye,
  Mail,
  Building2,
  Verified
} from 'lucide-react';
import { ElectronicSignature } from '../types';
import { formatVerificationMethod } from '../utils/signatureGenerator';
import { toast } from 'sonner@2.0.3';

interface DocuSignViewerProps {
  isOpen: boolean;
  onClose: () => void;
  signature: ElectronicSignature | null | undefined;
  entityId: string | undefined;
  actionDescription: string | undefined;
  documentName?: string;
}

export const DocuSignViewer: React.FC<DocuSignViewerProps> = ({
  isOpen,
  onClose,
  signature,
  entityId,
  actionDescription,
  documentName = 'Document'
}) => {
  const [activeTab, setActiveTab] = useState<'certificate' | 'history'>('certificate');

  if (!signature || !entityId || !actionDescription) return null;

  const handleDownloadCertificate = () => {
    // Create certificate content
    const certificateContent = `
CERTIFICATE OF COMPLETION
═══════════════════════════════════════════════

Document: ${documentName}
Action: ${actionDescription}
Envelope ID: ${entityId}

═══════════════════════════════════════════════
SIGNATURE DETAILS
═══════════════════════════════════════════════

Signatory Information:
  Name: ${signature.signatoryName}
  Role: ${signature.signatoryRole.replace('_', ' ').toUpperCase()}
  Email: ${signature.signatoryName.toLowerCase().replace(' ', '.')}@company.com

Signature Details:
  Certificate Number: ${signature.certificateNumber}
  Signature ID: ${signature.signatureId}
  Signed At: ${new Date(signature.signedAt).toLocaleString()}
  
Security Information:
  Verification Method: ${formatVerificationMethod(signature.verificationMethod)}
  IP Address: ${signature.ipAddress}
  Device: ${signature.deviceInfo}
  Verification Hash: ${signature.verificationHash}
  Status: VERIFIED ✓

═══════════════════════════════════════════════
DIGITAL CERTIFICATE VERIFICATION
═══════════════════════════════════════════════

This document has been electronically signed and verified.
The signature is cryptographically secured and legally binding.

Certificate Issued: ${new Date(signature.signedAt).toLocaleString()}
Valid Until: Valid Indefinitely
Certificate Authority: Company Document Management System

This certificate confirms that the document was signed by
the identified party on the specified date and time.

═══════════════════════════════════════════════
© ${new Date().getFullYear()} Document Management System
All Rights Reserved
    `;

    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate_${signature.certificateNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Certificate downloaded successfully');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const handleShare = () => {
    const shareText = `Document signed by ${signature.signatoryName} on ${new Date(signature.signedAt).toLocaleDateString()}. Certificate: ${signature.certificateNumber}`;
    navigator.clipboard.writeText(shareText);
    toast.success('Signature details copied to clipboard');
  };

  // Generate signature visualization (simulated handwritten signature)
  const generateSignatureStyle = () => {
    return signature.signatoryName;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden bg-white p-0">
        {/* Hidden accessibility elements */}
        <DialogTitle className="sr-only">
          Certificate of Completion - Electronically Signed Document
        </DialogTitle>
        <DialogDescription className="sr-only">
          View the digital certificate and signature details for this electronically signed document
        </DialogDescription>
        
        {/* DocuSign-style Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Certificate of Completion
                  <Verified className="h-6 w-6" />
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Electronically Signed Document - Legally Binding
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full hover:bg-white/20 text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-slate-50 px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('certificate')}
              className={`px-6 py-3 font-semibold transition-all relative ${
                activeTab === 'certificate'
                  ? 'text-blue-600 bg-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certificate
              </div>
              {activeTab === 'certificate' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-semibold transition-all relative ${
                activeTab === 'history'
                  ? 'text-blue-600 bg-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                History
              </div>
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)] p-6">
          {activeTab === 'certificate' ? (
            <div className="space-y-6">
              {/* Verification Banner */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-emerald-500 shadow-lg">
                    <ShieldCheck className="h-8 w-8 text-white animate-pulse" style={{ animationDuration: '2s' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                      Signature Verified and Legally Binding
                      <Sparkles className="h-5 w-5 text-emerald-600" />
                    </h3>
                    <p className="text-emerald-700 mt-1">
                      This document has been electronically signed and secured with a digital certificate
                    </p>
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg px-4 py-2 text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    VERIFIED
                  </Badge>
                </div>
              </div>

              {/* Document Information */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Document Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Document Name</p>
                    <p className="font-semibold text-slate-800">{documentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Action Type</p>
                    <p className="font-semibold text-slate-800">{actionDescription}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Envelope ID</p>
                    <p className="font-mono text-sm text-slate-800">{entityId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Certificate Number</p>
                    <p className="font-mono text-sm text-blue-600 font-semibold">{signature.certificateNumber}</p>
                  </div>
                </div>
              </div>

              {/* Signature Section - DocuSign Style */}
              <div className="bg-white border-2 border-blue-200 rounded-xl p-8">
                <div className="border-b-2 border-slate-200 pb-6 mb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Signed by</p>
                          <p className="text-lg font-bold text-slate-800">{signature.signatoryName}</p>
                          <p className="text-sm text-slate-600 capitalize">{signature.signatoryRole.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {/* Signature Visualization */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-4">
                        <div className="text-center">
                          <p className="text-5xl font-signature text-blue-900 mb-2" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                            {generateSignatureStyle()}
                          </p>
                          <div className="border-t-2 border-blue-400 pt-2">
                            <p className="text-sm text-blue-700 font-semibold">Digitally Signed</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span>{new Date(signature.signedAt).toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span>{signature.signatoryName.toLowerCase().replace(' ', '.')}@company.com</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <span>{signature.ipAddress}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Monitor className="h-4 w-4 text-blue-600" />
                          <span>{signature.deviceInfo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6">
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-lg text-center shadow-lg">
                        <ShieldCheck className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-xs font-semibold">VERIFIED</p>
                        <p className="text-xs opacity-90 mt-1">Digital Signature</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Information */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-600" />
                    Security & Verification Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Authentication Method</p>
                      <p className="font-semibold text-slate-800">{formatVerificationMethod(signature.verificationMethod)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Signature ID</p>
                      <p className="font-mono text-xs text-slate-800">{signature.signatureId}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500 mb-1">Verification Hash (SHA-256)</p>
                      <p className="font-mono text-xs text-slate-800 break-all bg-white p-2 rounded border border-slate-200">
                        {signature.verificationHash}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800 mb-1">Legal Notice</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      This electronic signature has been created with the intent to sign this document. 
                      The signature is legally binding and valid in accordance with the Electronic Signatures 
                      in Global and National Commerce Act (ESIGN), Uniform Electronic Transactions Act (UETA), 
                      and other applicable laws. The cryptographic seal ensures document integrity and authenticity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // History Tab
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Document Timeline
              </h3>

              {/* Timeline */}
              <div className="relative pl-8 space-y-6">
                {/* Vertical line */}
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500"></div>

                {/* Completed */}
                <div className="relative">
                  <div className="absolute -left-7 top-1 p-2 rounded-full bg-green-500 shadow-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-green-800">Document Signed & Completed</h4>
                      <Badge className="bg-green-500 text-white">Completed</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {signature.signatoryName} completed signing
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(signature.signedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Authenticated */}
                <div className="relative">
                  <div className="absolute -left-7 top-1 p-2 rounded-full bg-blue-500 shadow-lg">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-blue-800">Identity Authenticated</h4>
                      <Badge className="bg-blue-500 text-white">Verified</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Authentication via {formatVerificationMethod(signature.verificationMethod)}
                    </p>
                    <p className="text-xs text-slate-500">
                      IP: {signature.ipAddress} • {signature.deviceInfo}
                    </p>
                  </div>
                </div>

                {/* Sent */}
                <div className="relative">
                  <div className="absolute -left-7 top-1 p-2 rounded-full bg-purple-500 shadow-lg">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-purple-800">Document Created</h4>
                      <Badge className="bg-purple-500 text-white">Initiated</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {actionDescription} - {documentName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Document ID: {entityId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="h-4 w-4" />
              <span>Secured by Document Management System</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                onClick={handleDownloadCertificate}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Download className="h-4 w-4" />
                Download Certificate
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};