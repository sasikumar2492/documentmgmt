import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
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
  Fingerprint,
  Smartphone,
  KeyRound,
  Copy,
  Download,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ElectronicSignature } from '../types';
import { formatVerificationMethod, validateSignatureHash } from '../utils/signatureGenerator';
import { toast } from 'sonner@2.0.3';

interface SignatureDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  signature: ElectronicSignature | null | undefined;
  entityId: string | undefined;
  actionDescription: string | undefined;
}

export const SignatureDetailsModal: React.FC<SignatureDetailsModalProps> = ({
  isOpen,
  onClose,
  signature,
  entityId,
  actionDescription
}) => {
  if (!signature || !entityId || !actionDescription) return null;

  const isValid = validateSignatureHash(signature, entityId);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const exportSignature = () => {
    const signatureData = {
      signatureId: signature.signatureId,
      certificateNumber: signature.certificateNumber,
      signatoryName: signature.signatoryName,
      signatoryRole: signature.signatoryRole,
      signedAt: signature.signedAt,
      ipAddress: signature.ipAddress,
      deviceInfo: signature.deviceInfo,
      verificationHash: signature.verificationHash,
      verificationMethod: signature.verificationMethod,
      isVerified: signature.isVerified,
      action: actionDescription,
      entityId: entityId,
      hashValidation: isValid ? 'VALID' : 'INVALID'
    };

    const blob = new Blob([JSON.stringify(signatureData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signature-${signature.signatureId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Signature data exported successfully');
  };

  const getVerificationMethodIcon = () => {
    switch (signature.verificationMethod) {
      case 'password':
        return <KeyRound className="h-5 w-5 text-blue-500" />;
      case 'biometric':
        return <Fingerprint className="h-5 w-5 text-purple-500" />;
      case '2fa':
        return <Smartphone className="h-5 w-5 text-teal-500" />;
      case 'certificate':
        return <FileKey className="h-5 w-5 text-indigo-500" />;
    }
  };

  const getVerificationMethodColor = () => {
    switch (signature.verificationMethod) {
      case 'password':
        return 'from-blue-500 to-cyan-500';
      case 'biometric':
        return 'from-purple-500 to-pink-500';
      case '2fa':
        return 'from-teal-500 to-emerald-500';
      case 'certificate':
        return 'from-indigo-500 to-purple-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Electronic Signature Details
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-1">
                  Cryptographically secured digital signature verification
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Verification Status Banner */}
          <div className={`p-4 rounded-xl border-2 ${
            isValid && signature.isVerified
              ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300'
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
          }`}>
            <div className="flex items-center gap-3">
              {isValid && signature.isVerified ? (
                <>
                  <div className="p-2 rounded-lg bg-emerald-500 shadow-md">
                    <ShieldCheck className="h-6 w-6 text-white animate-pulse" style={{ animationDuration: '2s' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-emerald-700 flex items-center gap-2">
                      Signature Verified
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    </h3>
                    <p className="text-sm text-emerald-600">
                      This signature has been cryptographically verified and is authentic
                    </p>
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-md">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </Badge>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-lg bg-red-500 shadow-md">
                    <X className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-700">Signature Verification Failed</h3>
                    <p className="text-sm text-red-600">
                      This signature could not be verified
                    </p>
                  </div>
                  <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-md">
                    Invalid
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Action Information */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Signed Action
            </h3>
            <p className="text-blue-700 font-medium">{actionDescription}</p>
          </div>

          {/* Signature Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Signature ID */}
            <div className="p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                    <Hash className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Signature ID</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(signature.signatureId, 'Signature ID')}
                  className="h-7 w-7 p-0 hover:bg-indigo-100"
                >
                  <Copy className="h-3 w-3 text-indigo-600" />
                </Button>
              </div>
              <p className="text-xs font-mono text-slate-600 break-all bg-slate-50 p-2 rounded">
                {signature.signatureId}
              </p>
            </div>

            {/* Certificate Number */}
            <div className="p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-purple-300 transition-all shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Certificate Number</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(signature.certificateNumber, 'Certificate Number')}
                  className="h-7 w-7 p-0 hover:bg-purple-100"
                >
                  <Copy className="h-3 w-3 text-purple-600" />
                </Button>
              </div>
              <p className="text-xs font-mono text-slate-600 break-all bg-slate-50 p-2 rounded">
                {signature.certificateNumber}
              </p>
            </div>

            {/* Signatory Name */}
            <div className="p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Signatory</span>
              </div>
              <p className="font-medium text-slate-800">{signature.signatoryName}</p>
              <p className="text-xs text-slate-500 capitalize mt-1">Role: {signature.signatoryRole.replace('_', ' ')}</p>
            </div>

            {/* Timestamp */}
            <div className="p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-teal-300 transition-all shadow-sm hover:shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100">
                  <Calendar className="h-4 w-4 text-teal-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Signed At</span>
              </div>
              <p className="font-medium text-slate-800">
                {new Date(signature.signedAt).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>

            {/* IP Address */}
            <div className="p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-orange-300 transition-all shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100">
                    <Globe className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">IP Address</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(signature.ipAddress, 'IP Address')}
                  className="h-7 w-7 p-0 hover:bg-orange-100"
                >
                  <Copy className="h-3 w-3 text-orange-600" />
                </Button>
              </div>
              <p className="font-mono text-sm text-slate-800 bg-slate-50 p-2 rounded">
                {signature.ipAddress}
              </p>
            </div>

            {/* Device Info */}
            <div className="p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100">
                  <Monitor className="h-4 w-4 text-cyan-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Device Information</span>
              </div>
              <p className="text-sm text-slate-800">{signature.deviceInfo}</p>
            </div>
          </div>

          {/* Verification Method */}
          <div className={`p-5 rounded-xl bg-gradient-to-r ${getVerificationMethodColor()} bg-opacity-10 border-2 border-opacity-20`}
               style={{ borderColor: 'currentColor' }}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${getVerificationMethodColor()} shadow-lg`}>
                {getVerificationMethodIcon()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 mb-1">Verification Method</h3>
                <p className="text-slate-700 font-medium">{formatVerificationMethod(signature.verificationMethod)}</p>
                <p className="text-xs text-slate-600 mt-1">
                  This signature was verified using {formatVerificationMethod(signature.verificationMethod).toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Hash */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 border-2 border-slate-300">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-slate-700 to-gray-700">
                  <FileKey className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-700 block">Cryptographic Hash</span>
                  <span className="text-xs text-slate-500">SHA-256 Verification</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(signature.verificationHash, 'Verification Hash')}
                className="h-7 w-7 p-0 hover:bg-slate-200"
              >
                <Copy className="h-3 w-3 text-slate-600" />
              </Button>
            </div>
            <p className="text-xs font-mono text-slate-700 break-all bg-white p-3 rounded border border-slate-200">
              {signature.verificationHash}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              This cryptographic hash ensures the signature's integrity and authenticity
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              onClick={exportSignature}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Signature Data
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-300 hover:bg-slate-50"
            >
              Close
            </Button>
          </div>

          {/* Legal Notice */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              <Lock className="h-3 w-3 inline mr-1" />
              This electronic signature has the same legal validity as a handwritten signature in accordance with applicable e-signature laws
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};