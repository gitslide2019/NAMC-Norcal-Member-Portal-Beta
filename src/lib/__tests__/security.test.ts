import {
  generateSecureSessionId,
  sanitizeString,
  sanitizeEmail,
  sanitizePhoneNumber,
  validateFileType,
  validateFileSize,
  validatePasswordStrength,
  securityHeaders,
  applySecurityHeaders,
  getClientIP,
} from '../security'
import { NextRequest, NextResponse } from 'next/server'

describe('Security Utils', () => {
  describe('generateSecureSessionId', () => {
    it('should generate session ID of correct length', () => {
      const sessionId = generateSecureSessionId()
      
      expect(sessionId).toHaveLength(32)
      expect(typeof sessionId).toBe('string')
    })

    it('should generate unique session IDs', () => {
      const id1 = generateSecureSessionId()
      const id2 = generateSecureSessionId()
      
      expect(id1).not.toBe(id2)
    })

    it('should generate custom length session ID', () => {
      const sessionId = generateSecureSessionId(16)
      
      expect(sessionId).toHaveLength(16)
    })

    it('should only contain valid characters', () => {
      const sessionId = generateSecureSessionId()
      
      expect(sessionId).toMatch(/^[a-zA-Z0-9]+$/)
    })
  })

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      const result = sanitizeString('  hello world  ')
      
      expect(result).toBe('hello world')
    })

    it('should remove HTML tags', () => {
      const result = sanitizeString('<script>alert("xss")</script>Hello')
      
      expect(result).toBe('Hello')
    })

    it('should handle empty string', () => {
      const result = sanitizeString('')
      
      expect(result).toBe('')
    })

    it('should handle null and undefined', () => {
      expect(sanitizeString(null as any)).toBe('')
      expect(sanitizeString(undefined as any)).toBe('')
    })

    it('should preserve safe content', () => {
      const result = sanitizeString('Hello World 123')
      
      expect(result).toBe('Hello World 123')
    })

    it('should remove dangerous script tags', () => {
      const dangerous = '<script>document.cookie</script>Safe content'
      const result = sanitizeString(dangerous)
      
      expect(result).toBe('Safe content')
      expect(result).not.toContain('<script>')
    })
  })

  describe('sanitizeEmail', () => {
    it('should normalize email to lowercase', () => {
      const result = sanitizeEmail('TEST@EXAMPLE.COM')
      
      expect(result).toBe('test@example.com')
    })

    it('should trim whitespace', () => {
      const result = sanitizeEmail('  test@example.com  ')
      
      expect(result).toBe('test@example.com')
    })

    it('should handle empty string', () => {
      const result = sanitizeEmail('')
      
      expect(result).toBe('')
    })

    it('should preserve valid email format', () => {
      const result = sanitizeEmail('user.name+tag@example.co.uk')
      
      expect(result).toBe('user.name+tag@example.co.uk')
    })
  })

  describe('sanitizePhoneNumber', () => {
    it('should remove non-numeric characters', () => {
      const result = sanitizePhoneNumber('(555) 123-4567')
      
      expect(result).toBe('5551234567')
    })

    it('should handle international format', () => {
      const result = sanitizePhoneNumber('+1-555-123-4567')
      
      expect(result).toBe('15551234567')
    })

    it('should handle empty string', () => {
      const result = sanitizePhoneNumber('')
      
      expect(result).toBe('')
    })

    it('should preserve only numbers', () => {
      const result = sanitizePhoneNumber('abc123def456')
      
      expect(result).toBe('123456')
    })
  })

  describe('validateFileType', () => {
    it('should validate allowed file types', () => {
      const allowedTypes = ['.jpg', '.png', '.pdf']
      
      expect(validateFileType('document.pdf', allowedTypes)).toBe(true)
      expect(validateFileType('image.jpg', allowedTypes)).toBe(true)
      expect(validateFileType('photo.PNG', allowedTypes)).toBe(true) // Case insensitive
    })

    it('should reject disallowed file types', () => {
      const allowedTypes = ['.jpg', '.png', '.pdf']
      
      expect(validateFileType('script.exe', allowedTypes)).toBe(false)
      expect(validateFileType('document.doc', allowedTypes)).toBe(false)
    })

    it('should handle files without extensions', () => {
      const allowedTypes = ['.jpg', '.png', '.pdf']
      
      expect(validateFileType('filename', allowedTypes)).toBe(false)
    })

    it('should be case insensitive', () => {
      const allowedTypes = ['.jpg', '.png', '.pdf']
      
      expect(validateFileType('IMAGE.JPG', allowedTypes)).toBe(true)
      expect(validateFileType('document.PDF', allowedTypes)).toBe(true)
    })

    it('should handle multiple dots in filename', () => {
      const allowedTypes = ['.jpg', '.png', '.pdf']
      
      expect(validateFileType('my.file.name.jpg', allowedTypes)).toBe(true)
      expect(validateFileType('my.file.name.exe', allowedTypes)).toBe(false)
    })
  })

  describe('validateFileSize', () => {
    it('should validate file size within limit', () => {
      const maxSize = 1024 * 1024 // 1MB
      
      expect(validateFileSize(500 * 1024, maxSize)).toBe(true) // 500KB
      expect(validateFileSize(maxSize, maxSize)).toBe(true) // Exactly 1MB
    })

    it('should reject file size over limit', () => {
      const maxSize = 1024 * 1024 // 1MB
      
      expect(validateFileSize(2 * 1024 * 1024, maxSize)).toBe(false) // 2MB
    })

    it('should handle zero size files', () => {
      const maxSize = 1024 * 1024 // 1MB
      
      expect(validateFileSize(0, maxSize)).toBe(true)
    })

    it('should handle negative sizes', () => {
      const maxSize = 1024 * 1024 // 1MB
      
      expect(validateFileSize(-100, maxSize)).toBe(false)
    })
  })

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const result = validatePasswordStrength('StrongPass123!')
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(4)
      expect(result.feedback).toHaveLength(0)
    })

    it('should reject weak password', () => {
      const result = validatePasswordStrength('weak')
      
      expect(result.isValid).toBe(false)
      expect(result.score).toBeLessThan(3)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should identify missing uppercase', () => {
      const result = validatePasswordStrength('lowercase123!')
      
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Add uppercase letters')
    })

    it('should identify missing lowercase', () => {
      const result = validatePasswordStrength('UPPERCASE123!')
      
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Add lowercase letters')
    })

    it('should identify missing numbers', () => {
      const result = validatePasswordStrength('PasswordOnly!')
      
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Add numbers')
    })

    it('should identify missing special characters', () => {
      const result = validatePasswordStrength('Password123')
      
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Add special characters')
    })

    it('should identify too short password', () => {
      const result = validatePasswordStrength('Pass1!')
      
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Use at least 8 characters')
    })

    it('should handle empty password', () => {
      const result = validatePasswordStrength('')
      
      expect(result.isValid).toBe(false)
      expect(result.score).toBe(0)
    })
  })

  describe('securityHeaders', () => {
    it('should include all required security headers', () => {
      expect(securityHeaders).toHaveProperty('X-Content-Type-Options', 'nosniff')
      expect(securityHeaders).toHaveProperty('X-Frame-Options', 'DENY')
      expect(securityHeaders).toHaveProperty('X-XSS-Protection', '1; mode=block')
      expect(securityHeaders).toHaveProperty('Strict-Transport-Security')
      expect(securityHeaders).toHaveProperty('Content-Security-Policy')
      expect(securityHeaders).toHaveProperty('Referrer-Policy', 'strict-origin-when-cross-origin')
      expect(securityHeaders).toHaveProperty('Permissions-Policy')
    })

    it('should have restrictive CSP policy', () => {
      const csp = securityHeaders['Content-Security-Policy']
      
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("frame-ancestors 'none'")
      expect(csp).toContain("base-uri 'self'")
    })

    it('should have HSTS with long max-age', () => {
      const hsts = securityHeaders['Strict-Transport-Security']
      
      expect(hsts).toContain('max-age=63072000') // 2 years
      expect(hsts).toContain('includeSubDomains')
      expect(hsts).toContain('preload')
    })

    it('should restrict permissions', () => {
      const permissions = securityHeaders['Permissions-Policy']
      
      expect(permissions).toContain('camera=()')
      expect(permissions).toContain('microphone=()')
      expect(permissions).toContain('geolocation=()')
    })
  })

  describe('applySecurityHeaders', () => {
    it('should apply all security headers to response', () => {
      const response = NextResponse.json({ test: 'data' })
      const securedResponse = applySecurityHeaders(response)
      
      Object.entries(securityHeaders).forEach(([name, value]) => {
        expect(securedResponse.headers.get(name)).toBe(value)
      })
    })

    it('should preserve existing headers', () => {
      const response = NextResponse.json({ test: 'data' })
      response.headers.set('Custom-Header', 'custom-value')
      
      const securedResponse = applySecurityHeaders(response)
      
      expect(securedResponse.headers.get('Custom-Header')).toBe('custom-value')
      expect(securedResponse.headers.get('X-Frame-Options')).toBe('DENY')
    })

    it('should not overwrite existing security headers', () => {
      const response = NextResponse.json({ test: 'data' })
      response.headers.set('X-Frame-Options', 'SAMEORIGIN')
      
      const securedResponse = applySecurityHeaders(response)
      
      // Should keep the original value, not overwrite it
      expect(securedResponse.headers.get('X-Frame-Options')).toBe('SAMEORIGIN')
    })
  })

  describe('getClientIP', () => {
    const createMockRequest = (headers: Record<string, string>) => ({
      headers: {
        get: (name: string) => headers[name.toLowerCase()] || null
      }
    }) as NextRequest

    it('should get IP from x-forwarded-for header', () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1'
      })
      
      const ip = getClientIP(request)
      
      expect(ip).toBe('192.168.1.1')
    })

    it('should get IP from x-real-ip header if x-forwarded-for not available', () => {
      const request = createMockRequest({
        'x-real-ip': '192.168.1.2'
      })
      
      const ip = getClientIP(request)
      
      expect(ip).toBe('192.168.1.2')
    })

    it('should get IP from cf-connecting-ip header (Cloudflare)', () => {
      const request = createMockRequest({
        'cf-connecting-ip': '192.168.1.3'
      })
      
      const ip = getClientIP(request)
      
      expect(ip).toBe('192.168.1.3')
    })

    it('should prioritize x-forwarded-for over other headers', () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '192.168.1.2',
        'cf-connecting-ip': '192.168.1.3'
      })
      
      const ip = getClientIP(request)
      
      expect(ip).toBe('192.168.1.1')
    })

    it('should return unknown if no IP headers present', () => {
      const request = createMockRequest({})
      
      const ip = getClientIP(request)
      
      expect(ip).toBe('unknown')
    })

    it('should handle IPv6 addresses', () => {
      const request = createMockRequest({
        'x-forwarded-for': '2001:db8::1'
      })
      
      const ip = getClientIP(request)
      
      expect(ip).toBe('2001:db8::1')
    })

    it('should trim whitespace from IP', () => {
      const request = createMockRequest({
        'x-forwarded-for': '  192.168.1.1  '
      })
      
      const ip = getClientIP(request)
      
      expect(ip).toBe('192.168.1.1')
    })
  })
})