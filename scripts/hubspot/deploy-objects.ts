#!/usr/bin/env node

/**
 * HubSpot Custom Object Deployment Script
 * 
 * Automated deployment of TECH Clean California custom objects to HubSpot.
 * Creates 4 custom objects with properties, associations, and validation rules.
 */

import { config } from 'dotenv';
import { TechHubSpotService } from '../../src/features/tech-clean-california/services/hubspot-integration';
import { HUBSPOT_OBJECTS } from '../../src/features/tech-clean-california/constants';

// Load environment variables
config();

interface ObjectProperty {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  description?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: any;
}

interface CustomObjectDefinition {
  name: string;
  labels: {
    singular: string;
    plural: string;
  };
  properties: ObjectProperty[];
  associations?: string[];
  requiredProperties: string[];
}

class HubSpotObjectDeployer {
  private hubspotService: TechHubSpotService;
  private environment: string;
  private baseUrl: string;
  private accessToken: string;

  constructor() {
    const hubspotConfig = {
      apiKey: process.env.HUBSPOT_API_KEY!,
      baseUrl: process.env.HUBSPOT_API_URL || 'https://api.hubapi.com',
      portalId: process.env.HUBSPOT_PORTAL_ID!,
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN!
    };

    this.hubspotService = new TechHubSpotService(hubspotConfig);
    this.environment = process.env.NODE_ENV || 'development';
    this.baseUrl = hubspotConfig.baseUrl;
    this.accessToken = hubspotConfig.accessToken;
  }

  /**
   * Deploy all TECH custom objects to HubSpot
   */
  async deployAllObjects(): Promise<void> {
    console.log('🚀 Starting TECH Clean California custom object deployment...');
    console.log(`Environment: ${this.environment}`);
    console.log('================================================\n');

    const objects = [
      this.getTechContractorDefinition(),
      this.getTechProjectDefinition(),
      this.getTechCustomerAgreementDefinition(),
      this.getTechDocumentationDefinition()
    ];

    for (const objectDef of objects) {
      try {
        console.log(`📦 Deploying object: ${objectDef.name}`);
        await this.deployObject(objectDef);
        console.log(`✅ Successfully deployed: ${objectDef.name}\n`);
      } catch (error) {
        console.error(`❌ Failed to deploy ${objectDef.name}:`, error);
        throw error;
      }
    }

    // Set up object associations
    await this.setupObjectAssociations();

    console.log('🎉 All TECH custom objects deployed successfully!');
    await this.validateDeployment();
  }

  /**
   * TECH Contractor object definition
   */
  private getTechContractorDefinition(): CustomObjectDefinition {
    return {
      name: HUBSPOT_OBJECTS.TECH_CONTRACTOR,
      labels: {
        singular: 'TECH Contractor',
        plural: 'TECH Contractors'
      },
      properties: [
        {
          name: 'namc_member_id',
          label: 'NAMC Member ID',
          type: 'string',
          fieldType: 'text',
          description: 'NAMC membership identifier',
          required: true
        },
        {
          name: 'enrollment_status',
          label: 'Enrollment Status',
          type: 'enumeration',
          fieldType: 'select',
          description: 'Current enrollment status in TECH program',
          required: true,
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Documents Under Review', value: 'documents_under_review' },
            { label: 'Training Required', value: 'training_required' },
            { label: 'Certification Review', value: 'certification_review' },
            { label: 'Active', value: 'active' },
            { label: 'Suspended', value: 'suspended' },
            { label: 'Rejected', value: 'rejected' }
          ]
        },
        {
          name: 'certification_level',
          label: 'Certification Level',
          type: 'enumeration',
          fieldType: 'select',
          description: 'Current TECH certification level',
          required: true,
          options: [
            { label: 'None', value: 'none' },
            { label: 'Basic', value: 'basic' },
            { label: 'Advanced', value: 'advanced' },
            { label: 'Master', value: 'master' }
          ]
        },
        {
          name: 'service_territories',
          label: 'Service Territories',
          type: 'string',
          fieldType: 'textarea',
          description: 'Utility territories where contractor provides service (semicolon separated)',
          required: true
        },
        {
          name: 'business_license',
          label: 'Business License',
          type: 'string',
          fieldType: 'text',
          description: 'Business license number',
          required: true
        },
        {
          name: 'contractor_license',
          label: 'Contractor License',
          type: 'string',
          fieldType: 'text',
          description: 'Contractor license number',
          required: true
        },
        {
          name: 'insurance_certificate',
          label: 'Insurance Certificate',
          type: 'string',
          fieldType: 'text',
          description: 'Insurance certificate reference'
        },
        {
          name: 'last_training_date',
          label: 'Last Training Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date of most recent training completion'
        },
        {
          name: 'next_recertification_date',
          label: 'Next Recertification Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date when recertification is due'
        },
        {
          name: 'quality_score',
          label: 'Quality Score',
          type: 'number',
          fieldType: 'number',
          description: 'Overall quality score (0-100)'
        },
        {
          name: 'projects_completed',
          label: 'Projects Completed',
          type: 'number',
          fieldType: 'number',
          description: 'Total number of completed TECH projects'
        },
        {
          name: 'average_incentive_amount',
          label: 'Average Incentive Amount',
          type: 'number',
          fieldType: 'number',
          description: 'Average incentive amount per project'
        },
        {
          name: 'created_at',
          label: 'Created Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date contractor record was created'
        },
        {
          name: 'updated_at',
          label: 'Updated Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date contractor record was last updated'
        }
      ],
      requiredProperties: ['namc_member_id', 'enrollment_status', 'certification_level', 'service_territories'],
      associations: ['contacts', 'companies']
    };
  }

  /**
   * TECH Project object definition
   */
  private getTechProjectDefinition(): CustomObjectDefinition {
    return {
      name: HUBSPOT_OBJECTS.TECH_PROJECT,
      labels: {
        singular: 'TECH Project',
        plural: 'TECH Projects'
      },
      properties: [
        {
          name: 'project_id',
          label: 'Project ID',
          type: 'string',
          fieldType: 'text',
          description: 'Unique TECH project identifier',
          required: true
        },
        {
          name: 'customer_id',
          label: 'Customer ID',
          type: 'string',
          fieldType: 'text',
          description: 'Customer identifier',
          required: true
        },
        {
          name: 'contractor_id',
          label: 'Contractor ID',
          type: 'string',
          fieldType: 'text',
          description: 'TECH contractor identifier',
          required: true
        },
        {
          name: 'project_type',
          label: 'Project Type',
          type: 'enumeration',
          fieldType: 'select',
          description: 'Type of heat pump installation',
          required: true,
          options: [
            { label: 'HVAC Heat Pump', value: 'hvac' },
            { label: 'Heat Pump Water Heater', value: 'hpwh' },
            { label: 'Both HVAC and HPWH', value: 'both' }
          ]
        },
        {
          name: 'utility_territory',
          label: 'Utility Territory',
          type: 'enumeration',
          fieldType: 'select',
          description: 'Utility territory for this project',
          required: true,
          options: [
            { label: 'PG&E', value: 'pge' },
            { label: 'SCE', value: 'sce' },
            { label: 'SDG&E', value: 'sdge' },
            { label: 'SMUD', value: 'smud' },
            { label: 'LADWP', value: 'ladwp' },
            { label: 'Other', value: 'other' }
          ]
        },
        {
          name: 'project_status',
          label: 'Project Status',
          type: 'enumeration',
          fieldType: 'select',
          description: 'Current project status',
          required: true,
          options: [
            { label: 'Inquiry', value: 'inquiry' },
            { label: 'Agreement Pending', value: 'agreement_pending' },
            { label: 'Agreement Signed', value: 'agreement_signed' },
            { label: 'Installation Scheduled', value: 'installation_scheduled' },
            { label: 'Installation In Progress', value: 'installation_in_progress' },
            { label: 'Installation Complete', value: 'installation_complete' },
            { label: 'Documentation Pending', value: 'documentation_pending' },
            { label: 'Documentation Review', value: 'documentation_review' },
            { label: 'Incentive Submitted', value: 'incentive_submitted' },
            { label: 'Incentive Approved', value: 'incentive_approved' },
            { label: 'Payment Processed', value: 'payment_processed' },
            { label: 'Project Complete', value: 'project_complete' },
            { label: 'On Hold', value: 'on_hold' },
            { label: 'Cancelled', value: 'cancelled' }
          ]
        },
        {
          name: 'incentive_amount',
          label: 'Incentive Amount',
          type: 'number',
          fieldType: 'number',
          description: 'Final incentive amount'
        },
        {
          name: 'estimated_incentive',
          label: 'Estimated Incentive',
          type: 'number',
          fieldType: 'number',
          description: 'Estimated incentive amount'
        },
        {
          name: 'installation_date',
          label: 'Installation Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Scheduled or actual installation date'
        },
        {
          name: 'completion_date',
          label: 'Completion Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Project completion date'
        },
        {
          name: 'quality_install_required',
          label: 'Quality Install Required',
          type: 'bool',
          fieldType: 'booleancheckbox',
          description: 'Whether PNNL Quality Install Tool is required'
        },
        {
          name: 'hers_testing_required',
          label: 'HERS Testing Required',
          type: 'bool',
          fieldType: 'booleancheckbox',
          description: 'Whether HERS testing is required'
        },
        {
          name: 'cas_testing_required',
          label: 'CAS Testing Required',
          type: 'bool',
          fieldType: 'booleancheckbox',
          description: 'Whether CAS testing is required'
        },
        {
          name: 'demand_response_enrollment',
          label: 'Demand Response Enrollment',
          type: 'bool',
          fieldType: 'booleancheckbox',
          description: 'Whether customer enrolled in demand response'
        },
        {
          name: 'customer_agreement_signed',
          label: 'Customer Agreement Signed',
          type: 'bool',
          fieldType: 'booleancheckbox',
          description: 'Whether customer agreement has been signed'
        },
        {
          name: 'documents_completed',
          label: 'Documents Completed',
          type: 'bool',
          fieldType: 'booleancheckbox',
          description: 'Whether all required documents have been uploaded'
        },
        {
          name: 'incentive_processed',
          label: 'Incentive Processed',
          type: 'bool',
          fieldType: 'booleancheckbox',
          description: 'Whether incentive has been processed'
        },
        {
          name: 'payment_received',
          label: 'Payment Received',
          type: 'bool',
          fieldType: 'booleancheckbox',
          description: 'Whether payment has been received'
        },
        {
          name: 'created_at',
          label: 'Created Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date project was created'
        },
        {
          name: 'updated_at',
          label: 'Updated Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date project was last updated'
        }
      ],
      requiredProperties: ['project_id', 'customer_id', 'contractor_id', 'project_type', 'utility_territory', 'project_status'],
      associations: ['contacts', 'companies', HUBSPOT_OBJECTS.TECH_CONTRACTOR]
    };
  }

  /**
   * TECH Customer Agreement object definition
   */
  private getTechCustomerAgreementDefinition(): CustomObjectDefinition {
    return {
      name: HUBSPOT_OBJECTS.TECH_CUSTOMER_AGREEMENT,
      labels: {
        singular: 'TECH Customer Agreement',
        plural: 'TECH Customer Agreements'
      },
      properties: [
        {
          name: 'agreement_id',
          label: 'Agreement ID',
          type: 'string',
          fieldType: 'text',
          description: 'Unique agreement identifier',
          required: true
        },
        {
          name: 'project_id',
          label: 'Project ID',
          type: 'string',
          fieldType: 'text',
          description: 'Associated project identifier',
          required: true
        },
        {
          name: 'agreement_status',
          label: 'Agreement Status',
          type: 'enumeration',
          fieldType: 'select',
          description: 'Current agreement status',
          required: true,
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Sent', value: 'sent' },
            { label: 'Viewed', value: 'viewed' },
            { label: 'Signed', value: 'signed' },
            { label: 'Completed', value: 'completed' },
            { label: 'Expired', value: 'expired' },
            { label: 'Cancelled', value: 'cancelled' }
          ]
        },
        {
          name: 'sent_date',
          label: 'Sent Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date agreement was sent to customer'
        },
        {
          name: 'signed_date',
          label: 'Signed Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date agreement was signed by customer'
        },
        {
          name: 'customer_signature_url',
          label: 'Customer Signature URL',
          type: 'string',
          fieldType: 'text',
          description: 'URL to customer signature document'
        },
        {
          name: 'contractor_signature_url',
          label: 'Contractor Signature URL',
          type: 'string',
          fieldType: 'text',
          description: 'URL to contractor signature document'
        },
        {
          name: 'documents_required',
          label: 'Documents Required',
          type: 'string',
          fieldType: 'textarea',
          description: 'Required documents for this agreement (semicolon separated)'
        },
        {
          name: 'terms_accepted',
          label: 'Terms Accepted',
          type: 'bool',
          fieldType: 'booleancheckbox',
          description: 'Whether customer accepted terms and conditions'
        },
        {
          name: 'demand_response_consent',
          label: 'Demand Response Consent',
          type: 'bool',
          fieldType: 'booleancheckbox',
          description: 'Whether customer consented to demand response enrollment'
        },
        {
          name: 'data_privacy_consent',
          label: 'Data Privacy Consent',
          type: 'bool',
          fieldType: 'booleancheckbox',
          description: 'Whether customer consented to data sharing'
        },
        {
          name: 'created_at',
          label: 'Created Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date agreement was created'
        },
        {
          name: 'updated_at',
          label: 'Updated Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date agreement was last updated'
        }
      ],
      requiredProperties: ['agreement_id', 'project_id', 'agreement_status'],
      associations: ['contacts', HUBSPOT_OBJECTS.TECH_PROJECT]
    };
  }

  /**
   * TECH Documentation object definition
   */
  private getTechDocumentationDefinition(): CustomObjectDefinition {
    return {
      name: HUBSPOT_OBJECTS.TECH_DOCUMENTATION,
      labels: {
        singular: 'TECH Documentation',
        plural: 'TECH Documentation'
      },
      properties: [
        {
          name: 'doc_id',
          label: 'Document ID',
          type: 'string',
          fieldType: 'text',
          description: 'Unique document identifier',
          required: true
        },
        {
          name: 'project_id',
          label: 'Project ID',
          type: 'string',
          fieldType: 'text',
          description: 'Associated project identifier',
          required: true
        },
        {
          name: 'document_type',
          label: 'Document Type',
          type: 'enumeration',
          fieldType: 'select',
          description: 'Type of documentation',
          required: true,
          options: [
            { label: 'Installation Photos', value: 'installation_photos' },
            { label: 'Equipment Specifications', value: 'equipment_specs' },
            { label: 'Invoices', value: 'invoices' },
            { label: 'Permits', value: 'permits' },
            { label: 'PNNL Quality Install', value: 'pnnl_quality_install' },
            { label: 'HERS Testing', value: 'hers_testing' },
            { label: 'CAS Testing', value: 'cas_testing' },
            { label: 'Customer Agreement', value: 'customer_agreement' },
            { label: 'Other', value: 'other' }
          ]
        },
        {
          name: 'file_urls',
          label: 'File URLs',
          type: 'string',
          fieldType: 'textarea',
          description: 'URLs to uploaded files (semicolon separated)'
        },
        {
          name: 'upload_date',
          label: 'Upload Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date files were uploaded'
        },
        {
          name: 'verification_status',
          label: 'Verification Status',
          type: 'enumeration',
          fieldType: 'select',
          description: 'Document verification status',
          required: true,
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Under Review', value: 'under_review' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Resubmission Required', value: 'resubmission_required' }
          ]
        },
        {
          name: 'verified_by',
          label: 'Verified By',
          type: 'string',
          fieldType: 'text',
          description: 'User who verified the documents'
        },
        {
          name: 'verification_date',
          label: 'Verification Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date documents were verified'
        },
        {
          name: 'verification_notes',
          label: 'Verification Notes',
          type: 'string',
          fieldType: 'textarea',
          description: 'Notes from document verification process'
        },
        {
          name: 'created_at',
          label: 'Created Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date documentation record was created'
        },
        {
          name: 'updated_at',
          label: 'Updated Date',
          type: 'datetime',
          fieldType: 'date',
          description: 'Date documentation record was last updated'
        }
      ],
      requiredProperties: ['doc_id', 'project_id', 'document_type', 'verification_status'],
      associations: [HUBSPOT_OBJECTS.TECH_PROJECT]
    };
  }

  /**
   * Deploy a single custom object to HubSpot
   */
  private async deployObject(objectDef: CustomObjectDefinition): Promise<void> {
    // Check if object already exists
    const existingObject = await this.getExistingObject(objectDef.name);
    
    if (existingObject) {
      console.log(`  📝 Updating existing object: ${objectDef.name}`);
      await this.updateObjectProperties(existingObject.id, objectDef.properties);
    } else {
      console.log(`  📝 Creating new object: ${objectDef.name}`);
      await this.createObject(objectDef);
    }
  }

  /**
   * Create custom object in HubSpot
   */
  private async createObject(objectDef: CustomObjectDefinition): Promise<any> {
    const objectData = {
      name: objectDef.name,
      labels: objectDef.labels,
      primaryDisplayProperty: objectDef.requiredProperties[0],
      secondaryDisplayProperties: objectDef.requiredProperties.slice(1, 3),
      searchableProperties: objectDef.requiredProperties,
      requiredProperties: objectDef.requiredProperties
    };

    const response = await fetch(`${this.baseUrl}/crm/v3/schemas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objectData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create object ${objectDef.name}: ${error}`);
    }

    const createdObject = await response.json();

    // Create properties for the object
    for (const property of objectDef.properties) {
      await this.createObjectProperty(createdObject.name, property);
    }

    return createdObject;
  }

  /**
   * Create object property
   */
  private async createObjectProperty(objectName: string, property: ObjectProperty): Promise<void> {
    const propertyData = {
      name: property.name,
      label: property.label,
      type: property.type,
      fieldType: property.fieldType,
      description: property.description,
      groupName: 'tech_clean_california',
      options: property.options || [],
      displayOrder: -1,
      hasUniqueValue: false,
      hidden: false,
      formField: true
    };

    const response = await fetch(`${this.baseUrl}/crm/v3/properties/${objectName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(propertyData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.warn(`Warning: Failed to create property ${property.name}: ${error}`);
    }
  }

  /**
   * Update object properties
   */
  private async updateObjectProperties(objectId: string, properties: ObjectProperty[]): Promise<void> {
    for (const property of properties) {
      try {
        await this.updateObjectProperty(objectId, property);
      } catch (error) {
        console.warn(`Warning: Failed to update property ${property.name}:`, error);
      }
    }
  }

  /**
   * Update object property
   */
  private async updateObjectProperty(objectName: string, property: ObjectProperty): Promise<void> {
    const propertyData = {
      label: property.label,
      description: property.description,
      options: property.options || []
    };

    const response = await fetch(`${this.baseUrl}/crm/v3/properties/${objectName}/${property.name}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(propertyData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update property ${property.name}: ${error}`);
    }
  }

  /**
   * Get existing object by name
   */
  private async getExistingObject(objectName: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/crm/v3/schemas/${objectName}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get object: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      return null;
    }
  }

  /**
   * Set up object associations
   */
  private async setupObjectAssociations(): Promise<void> {
    console.log('🔗 Setting up object associations...');

    const associations = [
      {
        fromObjectType: HUBSPOT_OBJECTS.TECH_PROJECT,
        toObjectType: HUBSPOT_OBJECTS.TECH_CONTRACTOR,
        name: 'project_to_contractor'
      },
      {
        fromObjectType: HUBSPOT_OBJECTS.TECH_CUSTOMER_AGREEMENT,
        toObjectType: HUBSPOT_OBJECTS.TECH_PROJECT,
        name: 'agreement_to_project'
      },
      {
        fromObjectType: HUBSPOT_OBJECTS.TECH_DOCUMENTATION,
        toObjectType: HUBSPOT_OBJECTS.TECH_PROJECT,
        name: 'documentation_to_project'
      }
    ];

    for (const association of associations) {
      try {
        await this.createAssociation(association);
        console.log(`  ✅ Created association: ${association.name}`);
      } catch (error) {
        console.warn(`  ⚠️ Failed to create association ${association.name}:`, error);
      }
    }
  }

  /**
   * Create object association
   */
  private async createAssociation(association: any): Promise<void> {
    const associationData = {
      fromObjectType: association.fromObjectType,
      toObjectType: association.toObjectType,
      name: association.name
    };

    const response = await fetch(`${this.baseUrl}/crm/v4/associations/${association.fromObjectType}/${association.toObjectType}/labels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(associationData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create association: ${error}`);
    }
  }

  /**
   * Validate deployment
   */
  private async validateDeployment(): Promise<void> {
    console.log('\n🔍 Validating object deployment...');
    
    const objectNames = [
      HUBSPOT_OBJECTS.TECH_CONTRACTOR,
      HUBSPOT_OBJECTS.TECH_PROJECT,
      HUBSPOT_OBJECTS.TECH_CUSTOMER_AGREEMENT,
      HUBSPOT_OBJECTS.TECH_DOCUMENTATION
    ];

    for (const objectName of objectNames) {
      const object = await this.getExistingObject(objectName);
      if (object) {
        console.log(`✅ ${objectName}: Deployed with ${object.properties?.length || 0} properties`);
      } else {
        console.log(`❌ ${objectName}: Not found`);
        throw new Error(`Object ${objectName} not found after deployment`);
      }
    }

    console.log('\n✅ All objects validated successfully!');
  }
}

/**
 * Main deployment function
 */
async function main() {
  try {
    // Validate required environment variables
    const requiredEnvVars = [
      'HUBSPOT_API_KEY',
      'HUBSPOT_PORTAL_ID',
      'HUBSPOT_ACCESS_TOKEN'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    const deployer = new HubSpotObjectDeployer();
    await deployer.deployAllObjects();

    console.log('\n🎉 TECH Clean California custom objects successfully deployed to HubSpot!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment if called directly
if (require.main === module) {
  main();
}

export { HubSpotObjectDeployer };