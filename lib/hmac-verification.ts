import { createHmac, timingSafeEqual, randomBytes } from 'crypto';

export type SignatureAlgorithm = 'sha256' | 'sha512';
export type SignatureFormat = 'stripe' | 'github' | 'slack' | 'custom';

export interface HmacVerificationOptions {
  signature: string;
  payload: string | Buffer;
  secret: string;
  algorithm?: SignatureAlgorithm;
  format?: SignatureFormat;
  timestamp?: number;
  tolerance?: number; // seconds
}

export interface HmacVerificationResult {
  isValid: boolean;
  error?: string;
  details?: {
    algorithm: string;
    format: string;
    timestampValid?: boolean;
    signatureMatch?: boolean;
  };
}

export interface SignedPayload {
  signature: string;
  timestamp: number;
  header: string;
}

/**
 * Generate HMAC signature for a payload
 */
export function generateHmacSignature(
  payload: string | Buffer,
  secret: string,
  algorithm: SignatureAlgorithm = 'sha256'
): string {
  const hmac = createHmac(algorithm, secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Generate Stripe-style signed payload (timestamp + signature)
 */
export function generateStripeSignedPayload(
  payload: string | Buffer,
  secret: string,
  algorithm: SignatureAlgorithm = 'sha256'
): SignedPayload {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload.toString()}`;
  const signature = generateHmacSignature(signedPayload, secret, algorithm);
  
  return {
    signature,
    timestamp,
    header: `t=${timestamp},v1=${signature}`,
  };
}

/**
 * Generate GitHub-style signed payload
 */
export function generateGithubSignedPayload(
  payload: string | Buffer,
  secret: string,
  algorithm: SignatureAlgorithm = 'sha256'
): SignedPayload {
  const signature = generateHmacSignature(payload, secret, algorithm);
  const timestamp = Math.floor(Date.now() / 1000);
  
  return {
    signature: `sha256=${signature}`,
    timestamp,
    header: signature,
  };
}

/**
 * Extract signature from Stripe-style header
 * Format: t=timestamp,v1=signature
 */
export function extractStripeSignature(header: string): {
  timestamp: number;
  signature: string;
} | null {
  try {
    const parts = header.split(',');
    let timestamp: number | undefined;
    let signature: string | undefined;
    
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') {
        timestamp = parseInt(value, 10);
      } else if (key === 'v1') {
        signature = value;
      }
    }
    
    if (timestamp && signature) {
      return { timestamp, signature };
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract signature from GitHub-style header
 * Format: sha256=signature
 */
export function extractGithubSignature(header: string): {
  signature: string;
  algorithm: string;
} | null {
  try {
    const parts = header.split('=');
    if (parts.length === 2) {
      return {
        algorithm: parts[0],
        signature: parts[1],
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract signature from Slack-style header
 * Format: v0=signature
 */
export function extractSlackSignature(header: string): {
  version: string;
  signature: string;
} | null {
  try {
    const parts = header.split('=');
    if (parts.length === 2) {
      return {
        version: parts[0],
        signature: parts[1],
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Verify timestamp is within tolerance (prevent replay attacks)
 */
export function verifyTimestamp(
  timestamp: number,
  tolerance: number = 300
): boolean {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.abs(now - timestamp);
  return diff <= tolerance;
}

/**
 * Constant-time signature comparison (prevents timing attacks)
 */
export function constantTimeCompare(a: string, b: string): boolean {
  try {
    const aBuffer = Buffer.from(a, 'hex');
    const bBuffer = Buffer.from(b, 'hex');
    
    if (aBuffer.length !== bBuffer.length) {
      // Create a dummy comparison to maintain constant time
      const dummy = Buffer.alloc(aBuffer.length);
      timingSafeEqual(dummy, aBuffer);
      return false;
    }
    
    return timingSafeEqual(aBuffer, bBuffer);
  } catch {
    // Fallback for non-hex strings
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

/**
 * Verify HMAC signature
 */
export async function verifyHmacSignature(
  options: HmacVerificationOptions
): Promise<HmacVerificationResult> {
  const {
    signature,
    payload,
    secret,
    algorithm = 'sha256',
    format = 'custom',
    timestamp,
    tolerance = 300,
  } = options;
  
  try {
    // Verify timestamp if provided
    if (timestamp !== undefined) {
      if (!verifyTimestamp(timestamp, tolerance)) {
        return {
          isValid: false,
          error: 'Timestamp expired or invalid (possible replay attack)',
          details: {
            algorithm,
            format,
            timestampValid: false,
          },
        };
      }
    }
    
    let expectedSignature: string;
    let signatureToVerify = signature;
    
    // Handle different signature formats
    switch (format) {
      case 'stripe': {
        // For Stripe, we need to verify: HMAC(timestamp.payload, secret)
        const signedPayload = `${timestamp}.${payload.toString()}`;
        expectedSignature = generateHmacSignature(signedPayload, secret, algorithm);
        break;
      }
      
      case 'github': {
        // GitHub format: sha256=signature
        const extracted = extractGithubSignature(signature);
        if (!extracted) {
          return {
            isValid: false,
            error: 'Invalid GitHub signature format',
            details: { algorithm, format },
          };
        }
        signatureToVerify = extracted.signature;
        expectedSignature = generateHmacSignature(payload, secret, extracted.algorithm as SignatureAlgorithm);
        break;
      }
      
      case 'slack': {
        // Slack format: v0=signature, signed payload: v0:timestamp:payload
        const extracted = extractSlackSignature(signature);
        if (!extracted || !timestamp) {
          return {
            isValid: false,
            error: 'Invalid Slack signature format or missing timestamp',
            details: { algorithm, format },
          };
        }
        const signedPayload = `v0:${timestamp}:${payload.toString()}`;
        expectedSignature = generateHmacSignature(signedPayload, secret, algorithm);
        break;
      }
      
      case 'custom':
      default:
        // Direct HMAC verification
        expectedSignature = generateHmacSignature(payload, secret, algorithm);
        break;
    }
    
    // Constant-time comparison
    const signatureMatch = constantTimeCompare(signatureToVerify, expectedSignature);
    
    return {
      isValid: signatureMatch,
      error: signatureMatch ? undefined : 'Signature mismatch',
      details: {
        algorithm,
        format,
        timestampValid: timestamp !== undefined ? verifyTimestamp(timestamp, tolerance) : undefined,
        signatureMatch,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Signature verification failed',
      details: {
        algorithm,
        format,
      },
    };
  }
}

/**
 * Generate a secure random signing secret
 */
export function generateSigningSecret(prefix: string = 'whsec'): string {
  const randomBytes = randomBytes(32).toString('hex');
  return `${prefix}_${randomBytes}`;
}

/**
 * Create signature header for different services
 */
export function createSignatureHeader(
  payload: string | Buffer,
  secret: string,
  service: 'stripe' | 'github' | 'slack' | 'custom' = 'custom',
  algorithm: SignatureAlgorithm = 'sha256'
): { headerName: string; headerValue: string; timestamp?: number } {
  const timestamp = Math.floor(Date.now() / 1000);
  
  switch (service) {
    case 'stripe': {
      const signed = generateStripeSignedPayload(payload, secret, algorithm);
      return {
        headerName: 'Stripe-Signature',
        headerValue: signed.header,
        timestamp: signed.timestamp,
      };
    }
    
    case 'github': {
      const signed = generateGithubSignedPayload(payload, secret, algorithm);
      return {
        headerName: 'X-Hub-Signature-256',
        headerValue: signed.header,
        timestamp: signed.timestamp,
      };
    }
    
    case 'slack': {
      const signature = generateHmacSignature(`v0:${timestamp}:${payload.toString()}`, secret, algorithm);
      return {
        headerName: 'X-Slack-Signature',
        headerValue: `v0=${signature}`,
        timestamp,
      };
    }
    
    case 'custom':
    default: {
      const signature = generateHmacSignature(payload, secret, algorithm);
      return {
        headerName: 'X-Signature-256',
        headerValue: signature,
        timestamp,
      };
    }
  }
}

/**
 * Parse and verify webhook signature from request headers
 */
export async function verifyWebhookSignature(
  headers: Headers,
  payload: string | Buffer,
  secret: string,
  format: SignatureFormat = 'custom',
  tolerance: number = 300
): Promise<HmacVerificationResult> {
  let signature: string | undefined;
  let timestamp: number | undefined;
  let algorithm: SignatureAlgorithm = 'sha256';
  
  // Extract signature based on expected format
  switch (format) {
    case 'stripe': {
      const stripeHeader = headers.get('stripe-signature');
      if (!stripeHeader) {
        return {
          isValid: false,
          error: 'Missing Stripe-Signature header',
          details: { algorithm: 'sha256', format: 'stripe' },
        };
      }
      const extracted = extractStripeSignature(stripeHeader);
      if (!extracted) {
        return {
          isValid: false,
          error: 'Invalid Stripe signature format',
          details: { algorithm: 'sha256', format: 'stripe' },
        };
      }
      signature = extracted.signature;
      timestamp = extracted.timestamp;
      break;
    }
    
    case 'github': {
      const githubHeader = headers.get('x-hub-signature-256');
      if (!githubHeader) {
        return {
          isValid: false,
          error: 'Missing X-Hub-Signature-256 header',
          details: { algorithm: 'sha256', format: 'github' },
        };
      }
      const extracted = extractGithubSignature(githubHeader);
      if (!extracted) {
        return {
          isValid: false,
          error: 'Invalid GitHub signature format',
          details: { algorithm: 'sha256', format: 'github' },
        };
      }
      signature = extracted.signature;
      algorithm = extracted.algorithm as SignatureAlgorithm;
      
      // Get timestamp from separate header
      const timestampHeader = headers.get('x-hub-signature-timestamp');
      if (timestampHeader) {
        timestamp = parseInt(timestampHeader, 10);
      }
      break;
    }
    
    case 'slack': {
      const slackHeader = headers.get('x-slack-signature');
      const timestampHeader = headers.get('x-slack-request-timestamp');
      if (!slackHeader || !timestampHeader) {
        return {
          isValid: false,
          error: 'Missing Slack signature or timestamp header',
          details: { algorithm: 'sha256', format: 'slack' },
        };
      }
      const extracted = extractSlackSignature(slackHeader);
      if (!extracted) {
        return {
          isValid: false,
          error: 'Invalid Slack signature format',
          details: { algorithm: 'sha256', format: 'slack' },
        };
      }
      signature = extracted.signature;
      timestamp = parseInt(timestampHeader, 10);
      break;
    }
    
    case 'custom':
    default: {
      // Try common header names
      signature = 
        headers.get('x-signature-256') ||
        headers.get('x-signature') ||
        headers.get('x-hub-signature') ||
        headers.get('signature') ||
        undefined;
      
      if (!signature) {
        return {
          isValid: false,
          error: 'Missing signature header',
          details: { algorithm: 'sha256', format: 'custom' },
        };
      }
      
      // Try to get timestamp
      const timestampHeader = 
        headers.get('x-timestamp') ||
        headers.get('x-request-timestamp');
      if (timestampHeader) {
        timestamp = parseInt(timestampHeader, 10);
      }
      break;
    }
  }
  
  if (!signature) {
    return {
      isValid: false,
      error: 'Could not extract signature from headers',
      details: { algorithm, format },
    };
  }
  
  return verifyHmacSignature({
    signature,
    payload,
    secret,
    algorithm,
    format,
    timestamp,
    tolerance,
  });
}
