// HubSpot integration service for TECH Clean California program
import { AuthUser } from '@/types'

export interface HubSpotContact {
  id: string
  email: string
  firstname: string
  lastname: string
  company: string
  phone?: string
  properties: Record<string, any>
}

export interface TechContractor {
  id: string
  name: string
  email: string
  company: string
  phone?: string
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE'
  certifications: string[]
  hubspotId?: string
  createdAt: Date
  updatedAt: Date
}

class HubSpotIntegrationService {
  private apiKey: string
  private baseUrl = 'https://api.hubapi.com'

  constructor() {
    this.apiKey = process.env.HUBSPOT_API_KEY || ''
    if (!this.apiKey) {
      console.warn('HubSpot API key not configured')
    }
  }

  /**
   * Get contacts from HubSpot
   */
  async getContacts(limit = 100): Promise<HubSpotContact[]> {
    if (!this.apiKey) {
      return this.getMockContacts()
    }

    try {
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.results.map(this.formatContact)
    } catch (error) {
      console.error('Failed to fetch HubSpot contacts:', error)
      return this.getMockContacts()
    }
  }

  /**
   * Create or update contact in HubSpot
   */
  async upsertContact(contractor: Partial<TechContractor>): Promise<HubSpotContact | null> {
    if (!this.apiKey) {
      return this.getMockContact(contractor)
    }

    try {
      const contactData = {
        properties: {
          email: contractor.email,
          firstname: contractor.name?.split(' ')[0],
          lastname: contractor.name?.split(' ').slice(1).join(' '),
          company: contractor.company,
          phone: contractor.phone,
          tech_program_status: contractor.status || 'PENDING'
        }
      }

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      })

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.statusText}`)
      }

      const data = await response.json()
      return this.formatContact(data)
    } catch (error) {
      console.error('Failed to upsert HubSpot contact:', error)
      return this.getMockContact(contractor)
    }
  }

  /**
   * Get TECH contractors with enhanced data
   */
  async getTechContractors(): Promise<TechContractor[]> {
    const contacts = await this.getContacts()
    
    return contacts
      .filter(contact => contact.properties.tech_program_status)
      .map(contact => ({
        id: contact.id,
        name: `${contact.firstname} ${contact.lastname}`.trim(),
        email: contact.email,
        company: contact.properties.company || '',
        phone: contact.phone,
        status: contact.properties.tech_program_status || 'PENDING',
        certifications: contact.properties.certifications ? 
          contact.properties.certifications.split(',') : [],
        hubspotId: contact.id,
        createdAt: new Date(contact.properties.createdate || Date.now()),
        updatedAt: new Date(contact.properties.lastmodifieddate || Date.now())
      }))
  }

  /**
   * Sync user to HubSpot as TECH contractor
   */
  async syncUserToTech(user: AuthUser): Promise<TechContractor | null> {
    const contractor: Partial<TechContractor> = {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      company: user.company || '',
      phone: user.phone,
      status: 'ACTIVE'
    }

    const hubspotContact = await this.upsertContact(contractor)
    
    if (hubspotContact) {
      return {
        id: user.id,
        name: contractor.name!,
        email: contractor.email!,
        company: contractor.company!,
        phone: contractor.phone,
        status: contractor.status!,
        certifications: [],
        hubspotId: hubspotContact.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    return null
  }

  private formatContact(data: any): HubSpotContact {
    return {
      id: data.id,
      email: data.properties.email || '',
      firstname: data.properties.firstname || '',
      lastname: data.properties.lastname || '',
      company: data.properties.company || '',
      phone: data.properties.phone,
      properties: data.properties
    }
  }

  private getMockContacts(): HubSpotContact[] {
    return [
      {
        id: '1',
        email: 'john.contractor@example.com',
        firstname: 'John',
        lastname: 'Contractor',
        company: 'Green Build Solutions',
        phone: '+1-555-0101',
        properties: {
          tech_program_status: 'ACTIVE',
          certifications: 'LEED,Solar Installation',
          createdate: new Date().toISOString(),
          lastmodifieddate: new Date().toISOString()
        }
      },
      {
        id: '2',
        email: 'maria.builder@example.com',
        firstname: 'Maria',
        lastname: 'Builder',
        company: 'Sustainable Construction Co',
        phone: '+1-555-0102',
        properties: {
          tech_program_status: 'PENDING',
          certifications: 'Energy Auditing',
          createdate: new Date().toISOString(),
          lastmodifieddate: new Date().toISOString()
        }
      }
    ]
  }

  private getMockContact(contractor: Partial<TechContractor>): HubSpotContact {
    return {
      id: Date.now().toString(),
      email: contractor.email || '',
      firstname: contractor.name?.split(' ')[0] || '',
      lastname: contractor.name?.split(' ').slice(1).join(' ') || '',
      company: contractor.company || '',
      phone: contractor.phone,
      properties: {
        tech_program_status: contractor.status || 'PENDING',
        createdate: new Date().toISOString(),
        lastmodifieddate: new Date().toISOString()
      }
    }
  }
}

export const hubspotIntegration = new HubSpotIntegrationService()
export default hubspotIntegration