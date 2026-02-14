/**
 * Security utilities for the Mermaid Editor
 * 
 * This module implements defense-in-depth security mechanisms for the diagram editor:
 * 
 * 1. RATE LIMITING
 *    - Daily caps on exports prevent resource exhaustion
 *    - Hourly limits on template loads and diagram shares
 *    - Size limits prevent processing of extremely large diagrams
 * 
 * 2. INPUT VALIDATION
 *    - Diagram code validated for suspicious patterns (javascript:, onclick handlers, etc.)
 *    - URL encoding validated to prevent bypass attempts
 *    - Nesting levels checked to prevent ReDoS attacks
 * 
 * 3. CLIENT-SIDE LIMITATIONS (Important for Portfolio Reference)
 *    - This app runs entirely client-side and is designed as a reference implementation
 *    - Client-side security alone is NOT sufficient for production use
 *    - For production systems:
 *      * Implement server-side validation of all inputs
 *      * Use Content Security Policy (CSP) headers
 *      * Add server-side rate limiting with proper session tracking
 *      * Implement authentication and authorization
 *      * Use HTTPS and secure headers
 * 
 * 4. MERMAID SECURITY CONFIGURATION
 *    - Mermaid configured with securityLevel: 'strict'
 *    - This prevents clickable elements and onclick handlers
 *    - Diagram rendering happens in an isolated context
 */

/**
 * Daily rate limit configuration
 */
export const RATE_LIMITS = {
  EXPORTS_PER_DAY: 50,
  TEMPLATE_LOADS_PER_HOUR: 100,
  DIAGRAM_SHARES_PER_HOUR: 30,
  MAX_DIAGRAM_SIZE_KB: 256,
  MAX_URL_LENGTH: 2048
};

/**
 * Storage keys for rate limiting
 */
const STORAGE_KEYS = {
  EXPORT_COUNT: 'mermaid-editor-exports',
  EXPORT_DATE: 'mermaid-editor-export-date',
  REQUEST_LOG: 'mermaid-editor-requests',
};

/**
 * Check if daily export limit has been exceeded
 */
export function canExportToday(): { allowed: boolean; remaining: number } {
  if (typeof window === 'undefined') {
    return { allowed: true, remaining: RATE_LIMITS.EXPORTS_PER_DAY };
  }

  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const storedDate = localStorage.getItem(STORAGE_KEYS.EXPORT_DATE);
    const storedCount = parseInt(localStorage.getItem(STORAGE_KEYS.EXPORT_COUNT) || '0', 10);

    // Reset if date changed
    if (storedDate !== today) {
      localStorage.setItem(STORAGE_KEYS.EXPORT_DATE, today);
      localStorage.setItem(STORAGE_KEYS.EXPORT_COUNT, '0');
      return { allowed: true, remaining: RATE_LIMITS.EXPORTS_PER_DAY };
    }

    // Check limit
    const remaining = RATE_LIMITS.EXPORTS_PER_DAY - storedCount;
    return {
      allowed: storedCount < RATE_LIMITS.EXPORTS_PER_DAY,
      remaining: Math.max(0, remaining)
    };
  } catch (error) {
    console.error('Error checking export limit:', error);
    return { allowed: true, remaining: RATE_LIMITS.EXPORTS_PER_DAY };
  }
}

/**
 * Increment export counter
 */
export function recordExport(): void {
  if (typeof window === 'undefined') return;

  try {
    const count = parseInt(localStorage.getItem(STORAGE_KEYS.EXPORT_COUNT) || '0', 10);
    localStorage.setItem(STORAGE_KEYS.EXPORT_COUNT, Math.min(count + 1, RATE_LIMITS.EXPORTS_PER_DAY).toString());
  } catch (error) {
    console.error('Error recording export:', error);
  }
}

/**
 * Validate Mermaid diagram code for suspicious patterns
 * 
 * PORTFOLIO NOTE: This demonstrates defensive input validation patterns.
 * The following checks represent common attack vectors:
 * 
 * - javascript:// protocol - XSS vector often used in href attributes
 * - Event handlers (onclick, onerror, etc.) - Direct script execution
 * - <script> tags - Manual script injection attempts
 * - Data URIs with HTML content - Encoded payload delivery
 * - Excessive nesting - DoS via ReDoS or processor exhaustion
 * 
 * While Mermaid has built-in protections, validating at input time provides
 * an additional layer of defense and helps catch malicious intent early.
 */
export function validateDiagramCode(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check size
  const sizeKB = new Blob([code]).size / 1024;
  if (sizeKB > RATE_LIMITS.MAX_DIAGRAM_SIZE_KB) {
    errors.push(`Diagram exceeds maximum size of ${RATE_LIMITS.MAX_DIAGRAM_SIZE_KB}KB (current: ${sizeKB.toFixed(1)}KB)`);
  }

  // Check for suspicious JavaScript-like patterns
  const suspiciousPatterns = [
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<script/gi,
    /src\s*=\s*['"](data:text\/html|javascript:)/gi,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(code)) {
      errors.push(`Suspicious pattern detected: ${pattern.source}`);
    }
  }

  // Check for excessive nesting or recursion
  const nestingLevels = (code.match(/[\[\(\{]/g) || []).length;
  if (nestingLevels > 1000) {
    errors.push(`Excessive nesting detected (${nestingLevels} levels)`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize and validate URL-encoded diagram
 */
export function validateEncodedDiagram(encoded: string): { valid: boolean; error?: string } {
  // Check length
  if (encoded.length > RATE_LIMITS.MAX_URL_LENGTH) {
    return {
      valid: false,
      error: `URL exceeds maximum length of ${RATE_LIMITS.MAX_URL_LENGTH} characters`
    };
  }

  // Validate base64
  try {
    atob(encoded);
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Invalid diagram encoding'
    };
  }
}

/**
 * Throttle function calls to prevent abuse
 */
export function createThrottle(fn: (...args: any[]) => void, delayMs: number) {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delayMs) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Simple request rate limiter for specific operations
 */
export class RequestLimiter {
  private timestamps: Map<string, number[]> = new Map();

  constructor(private maxRequests: number, private windowMs: number) {}

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const times = this.timestamps.get(key) || [];

    // Remove old timestamps outside the window
    const recentTimes = times.filter(t => now - t < this.windowMs);

    if (recentTimes.length < this.maxRequests) {
      recentTimes.push(now);
      this.timestamps.set(key, recentTimes);
      return true;
    }

    return false;
  }

  getRemaining(key: string): number {
    const now = Date.now();
    const times = this.timestamps.get(key) || [];
    const recentTimes = times.filter(t => now - t < this.windowMs);
    return Math.max(0, this.maxRequests - recentTimes.length);
  }

  reset(key: string): void {
    this.timestamps.delete(key);
  }
}

/**
 * Get security summary for display
 */
export function getSecuritySummary() {
  const exportLimit = canExportToday();
  return {
    exportsRemaining: exportLimit.remaining,
    exportsLimit: RATE_LIMITS.EXPORTS_PER_DAY,
    maxDiagramSize: `${RATE_LIMITS.MAX_DIAGRAM_SIZE_KB}KB`,
    maxUrlLength: RATE_LIMITS.MAX_URL_LENGTH
  };
}

export default {
  RATE_LIMITS,
  canExportToday,
  recordExport,
  validateDiagramCode,
  validateEncodedDiagram,
  createThrottle,
  RequestLimiter,
  getSecuritySummary
};
