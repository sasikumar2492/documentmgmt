import { ElectronicSignature, UserRole } from '../types';

/**
 * Generates a unique signature ID
 */
function generateSignatureId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `SIG-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generates a certificate number
 */
function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `CERT-${year}-${random}`;
}

/**
 * Generates a verification hash (simulated)
 */
function generateVerificationHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(16, '0');
}

/**
 * Simulates getting IP address
 */
function getSimulatedIPAddress(): string {
  const octet = () => Math.floor(Math.random() * 255);
  return `${octet()}.${octet()}.${octet()}.${octet()}`;
}

/**
 * Gets device/browser information
 */
function getDeviceInfo(): string {
  const userAgent = navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown Browser';
  if (userAgent.includes('Firefox')) browser = 'Mozilla Firefox';
  else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Google Chrome';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edg')) browser = 'Microsoft Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';
  
  // Detect OS
  let os = 'Unknown OS';
  if (userAgent.includes('Win')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return `${browser} on ${os}`;
}

/**
 * Determines verification method based on action type
 */
function determineVerificationMethod(action: string): 'password' | 'biometric' | '2fa' | 'certificate' {
  const criticalActions = ['request_approved', 'request_rejected', 'template_deleted', 'request_deleted'];
  
  if (criticalActions.includes(action)) {
    // Critical actions use stronger verification
    const methods: Array<'2fa' | 'certificate'> = ['2fa', 'certificate'];
    return methods[Math.floor(Math.random() * methods.length)];
  }
  
  // Non-critical actions can use simpler verification
  const methods: Array<'password' | 'biometric'> = ['password', 'biometric'];
  return methods[Math.floor(Math.random() * methods.length)];
}

/**
 * Determines if an action requires electronic signature
 */
export function requiresSignature(action: string): boolean {
  const signatureRequiredActions = [
    'request_submitted',
    'request_approved',
    'request_rejected',
    'status_changed',
    'template_created',
    'workflow_approved',
    'template_deleted',
    'request_deleted'
  ];
  
  return signatureRequiredActions.includes(action);
}

/**
 * Generates an electronic signature for an audit log action
 */
export function generateElectronicSignature(
  signatoryName: string,
  signatoryRole: UserRole,
  action: string,
  entityId: string
): ElectronicSignature {
  const signatureId = generateSignatureId();
  const certificateNumber = generateCertificateNumber();
  const signedAt = new Date().toISOString();
  const ipAddress = getSimulatedIPAddress();
  const deviceInfo = getDeviceInfo();
  const verificationMethod = determineVerificationMethod(action);
  
  // Create verification data string
  const verificationData = `${signatureId}${certificateNumber}${signatoryName}${signedAt}${entityId}`;
  const verificationHash = generateVerificationHash(verificationData);
  
  return {
    signatureId,
    certificateNumber,
    signatoryName,
    signatoryRole,
    signedAt,
    ipAddress,
    deviceInfo,
    verificationHash,
    isVerified: true, // All generated signatures are verified
    verificationMethod
  };
}

/**
 * Formats signature verification method for display
 */
export function formatVerificationMethod(method: ElectronicSignature['verificationMethod']): string {
  const methodMap = {
    'password': 'Password Authentication',
    'biometric': 'Biometric Verification',
    '2fa': 'Two-Factor Authentication',
    'certificate': 'Digital Certificate'
  };
  
  return methodMap[method] || method;
}

/**
 * Validates signature hash (simulated verification)
 */
export function validateSignatureHash(signature: ElectronicSignature, entityId: string): boolean {
  const verificationData = `${signature.signatureId}${signature.certificateNumber}${signature.signatoryName}${signature.signedAt}${entityId}`;
  const expectedHash = generateVerificationHash(verificationData);
  
  return signature.verificationHash === expectedHash;
}
