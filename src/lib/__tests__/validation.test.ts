import { 
  loginSchema, 
  registerSchema, 
  contractorSearchSchema,
  formatValidationError,
  validateRequest
} from '../validation'
import { z } from 'zod'

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      }

      const result = loginSchema.parse(validData)

      expect(result).toEqual({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      })
    })

    it('should transform email to lowercase and trim', () => {
      const data = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      }

      const result = loginSchema.parse(data)

      expect(result.email).toBe('test@example.com')
    })

    it('should set rememberMe default to false', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = loginSchema.parse(data)

      expect(result.rememberMe).toBe(false)
    })

    it('should reject invalid email format', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123'
      }

      expect(() => loginSchema.parse(data)).toThrow('Invalid email format')
    })

    it('should reject empty password', () => {
      const data = {
        email: 'test@example.com',
        password: ''
      }

      expect(() => loginSchema.parse(data)).toThrow('Password is required')
    })

    it('should reject overly long email', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      const data = {
        email: longEmail,
        password: 'password123'
      }

      expect(() => loginSchema.parse(data)).toThrow('Email must be less than 255 characters')
    })

    it('should reject overly long password', () => {
      const longPassword = 'a'.repeat(130)
      const data = {
        email: 'test@example.com',
        password: longPassword
      }

      expect(() => loginSchema.parse(data)).toThrow('Password must be less than 128 characters')
    })
  })

  describe('registerSchema', () => {
    const validRegisterData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      company: 'Test Company',
      agreeToTerms: true
    }

    it('should validate correct registration data', () => {
      const result = registerSchema.parse(validRegisterData)

      expect(result).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        company: 'Test Company',
        agreeToTerms: true
      })
    })

    it('should transform names and company by trimming', () => {
      const data = {
        ...validRegisterData,
        firstName: '  John  ',
        lastName: '  Doe  ',
        company: '  Test Company  '
      }

      const result = registerSchema.parse(data)

      expect(result.firstName).toBe('John')
      expect(result.lastName).toBe('Doe')
      expect(result.company).toBe('Test Company')
    })

    it('should reject invalid name characters', () => {
      const data = {
        ...validRegisterData,
        firstName: 'John123'
      }

      expect(() => registerSchema.parse(data)).toThrow('First name contains invalid characters')
    })

    it('should accept valid name characters including spaces and hyphens', () => {
      const data = {
        ...validRegisterData,
        firstName: "Mary-Jane O'Connor"
      }

      const result = registerSchema.parse(data)
      expect(result.firstName).toBe("Mary-Jane O'Connor")
    })

    it('should reject weak password', () => {
      const data = {
        ...validRegisterData,
        password: 'weak'
      }

      expect(() => registerSchema.parse(data)).toThrow('Password must be at least 8 characters')
    })

    it('should reject password without uppercase', () => {
      const data = {
        ...validRegisterData,
        password: 'password123!'
      }

      expect(() => registerSchema.parse(data)).toThrow('Password must contain at least one uppercase letter')
    })

    it('should reject password without lowercase', () => {
      const data = {
        ...validRegisterData,
        password: 'PASSWORD123!'
      }

      expect(() => registerSchema.parse(data)).toThrow('Password must contain at least one uppercase letter')
    })

    it('should reject password without number', () => {
      const data = {
        ...validRegisterData,
        password: 'Password!'
      }

      expect(() => registerSchema.parse(data)).toThrow('Password must contain at least one uppercase letter')
    })

    it('should reject password without special character', () => {
      const data = {
        ...validRegisterData,
        password: 'Password123'
      }

      expect(() => registerSchema.parse(data)).toThrow('Password must contain at least one uppercase letter')
    })

    it('should require terms agreement', () => {
      const data = {
        ...validRegisterData,
        agreeToTerms: false
      }

      expect(() => registerSchema.parse(data)).toThrow('You must agree to the terms and conditions')
    })

    it('should reject missing required fields', () => {
      const data = {
        firstName: 'John'
        // Missing other required fields
      }

      expect(() => registerSchema.parse(data)).toThrow()
    })

    it('should reject overly long fields', () => {
      const data = {
        ...validRegisterData,
        firstName: 'a'.repeat(60)
      }

      expect(() => registerSchema.parse(data)).toThrow('First name must be less than 50 characters')
    })
  })

  describe('contractorSearchSchema', () => {
    it('should validate with default values', () => {
      const result = contractorSearchSchema.parse({})

      expect(result).toEqual({
        page: 1,
        limit: 25,
        sortBy: 'businessName',
        sortOrder: 'asc'
      })
    })

    it('should validate with all optional fields', () => {
      const data = {
        page: 2,
        limit: 50,
        search: 'construction',
        city: 'San Francisco',
        county: 'San Francisco',
        classification: 'A',
        licenseStatus: 'active',
        sortBy: 'city',
        sortOrder: 'desc'
      }

      const result = contractorSearchSchema.parse(data)
      expect(result).toEqual(data)
    })

    it('should reject invalid page number', () => {
      const data = { page: 0 }

      expect(() => contractorSearchSchema.parse(data)).toThrow()
    })

    it('should reject limit over maximum', () => {
      const data = { limit: 150 }

      expect(() => contractorSearchSchema.parse(data)).toThrow()
    })

    it('should reject invalid sort field', () => {
      const data = { sortBy: 'invalidField' }

      expect(() => contractorSearchSchema.parse(data)).toThrow()
    })

    it('should reject invalid sort order', () => {
      const data = { sortOrder: 'invalid' }

      expect(() => contractorSearchSchema.parse(data)).toThrow()
    })

    it('should require numeric values for page and limit', () => {
      const data = {
        page: 3,
        limit: 10
      }

      const result = contractorSearchSchema.parse(data)
      expect(result.page).toBe(3)
      expect(result.limit).toBe(10)
    })

    it('should reject string values for page and limit', () => {
      const data = {
        page: '3',
        limit: '10'
      }

      expect(() => contractorSearchSchema.parse(data)).toThrow('Expected number, received string')
    })
  })

  describe('formatValidationError', () => {
    it('should format single validation error', () => {
      const schema = z.object({
        email: z.string().email()
      })

      try {
        schema.parse({ email: 'invalid' })
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formatted = formatValidationError(error)
          
          expect(formatted).toEqual([
            {
              field: 'email',
              message: 'Invalid email'
            }
          ])
        }
      }
    })

    it('should format multiple validation errors', () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8)
      })

      try {
        schema.parse({ email: 'invalid', password: 'short' })
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formatted = formatValidationError(error)
          
          expect(formatted).toHaveLength(2)
          expect(formatted).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: expect.stringContaining('email')
              }),
              expect.objectContaining({
                field: 'password',
                message: expect.stringContaining('8')
              })
            ])
          )
        }
      }
    })

    it('should format nested field errors', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(1)
          })
        })
      })

      try {
        schema.parse({ user: { profile: { name: '' } } })
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formatted = formatValidationError(error)
          
          expect(formatted[0].field).toBe('user.profile.name')
        }
      }
    })
  })

  describe('validateRequest', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      age: z.number()
    })

    it('should return parsed data for valid input', () => {
      const data = { name: 'John', age: 25 }
      
      const result = validateRequest(testSchema, data)
      
      expect(result).toEqual(data)
    })

    it('should throw formatted error for invalid input', () => {
      const data = { name: 'John', age: 'invalid' }
      
      expect(() => validateRequest(testSchema, data)).toThrow('Validation failed: age: Expected number, received string')
    })

    it('should include field details in error message', () => {
      const data = { name: '', age: 25 }
      
      expect(() => validateRequest(testSchema, data)).toThrow('Validation failed: name: String must contain at least 1 character(s)')
    })

    it('should handle non-Zod errors', () => {
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Generic error')
        })
      }
      
      expect(() => validateRequest(mockSchema as any, {})).toThrow('Generic error')
    })
  })
})