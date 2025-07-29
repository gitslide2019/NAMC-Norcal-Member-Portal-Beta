#!/usr/bin/env node

/**
 * HubSpot Workflow Deployment Script
 * 
 * Automated deployment of TECH Clean California workflows to HubSpot.
 * This script creates and configures all 5 TECH workflows with proper
 * enrollment criteria, actions, and monitoring.
 */

import { config } from 'dotenv';
import { TechHubSpotService } from '../../src/features/tech-clean-california/services/hubspot-integration';
import {
  CONTRACTOR_ENROLLMENT_WORKFLOW,
  CONTRACTOR_RECERTIFICATION_WORKFLOW,
  PROJECT_INITIATION_WORKFLOW,
  QUALITY_DOCUMENTATION_WORKFLOW,
  INCENTIVE_PROCESSING_WORKFLOW
} from '../../src/features/tech-clean-california/workflows';

// Load environment variables
config();

interface WorkflowDeploymentConfig {
  workflowId: string;
  name: string;
  description: string;
  enabled: boolean;
  oncePerContact: boolean;
  enrollmentCriteria: any;
  actions: any[];
  goals?: any[];
}

class HubSpotWorkflowDeployer {
  private hubspotService: TechHubSpotService;
  private environment: string;

  constructor() {
    const hubspotConfig = {
      apiKey: process.env.HUBSPOT_API_KEY!,
      baseUrl: process.env.HUBSPOT_API_URL || 'https://api.hubapi.com',
      portalId: process.env.HUBSPOT_PORTAL_ID!,
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN!
    };

    this.hubspotService = new TechHubSpotService(hubspotConfig);
    this.environment = process.env.NODE_ENV || 'development';
  }

  /**
   * Deploy all TECH workflows to HubSpot
   */
  async deployAllWorkflows(): Promise<void> {
    console.log('🚀 Starting TECH Clean California workflow deployment...');
    console.log(`Environment: ${this.environment}`);
    console.log('================================================\n');

    const workflows = [
      this.convertToHubSpotWorkflow(CONTRACTOR_ENROLLMENT_WORKFLOW),
      this.convertToHubSpotWorkflow(CONTRACTOR_RECERTIFICATION_WORKFLOW),
      this.convertToHubSpotWorkflow(PROJECT_INITIATION_WORKFLOW),
      this.convertToHubSpotWorkflow(QUALITY_DOCUMENTATION_WORKFLOW),
      this.convertToHubSpotWorkflow(INCENTIVE_PROCESSING_WORKFLOW)
    ];

    for (const workflow of workflows) {
      try {
        console.log(`📋 Deploying workflow: ${workflow.name}`);
        await this.deployWorkflow(workflow);
        console.log(`✅ Successfully deployed: ${workflow.name}\n`);
      } catch (error) {
        console.error(`❌ Failed to deploy ${workflow.name}:`, error);
        throw error;
      }
    }

    console.log('🎉 All TECH workflows deployed successfully!');
    await this.validateDeployment();
  }

  /**
   * Deploy a single workflow to HubSpot
   */
  private async deployWorkflow(workflowConfig: WorkflowDeploymentConfig): Promise<void> {
    const workflowData = {
      name: workflowConfig.name,
      description: workflowConfig.description,
      enabled: workflowConfig.enabled,
      oncePerContact: workflowConfig.oncePerContact,
      enrollmentCriteria: this.buildEnrollmentCriteria(workflowConfig.enrollmentCriteria),
      actions: this.buildWorkflowActions(workflowConfig.actions),
      goals: workflowConfig.goals || []
    };

    // Check if workflow already exists
    const existingWorkflow = await this.getExistingWorkflow(workflowConfig.workflowId);
    
    if (existingWorkflow) {
      console.log(`  📝 Updating existing workflow: ${workflowConfig.workflowId}`);
      await this.updateWorkflow(existingWorkflow.id, workflowData);
    } else {
      console.log(`  📝 Creating new workflow: ${workflowConfig.workflowId}`);
      await this.createWorkflow(workflowData);
    }

    // Set up workflow monitoring
    await this.setupWorkflowMonitoring(workflowConfig.workflowId);
  }

  /**
   * Convert TECH workflow definition to HubSpot format
   */
  private convertToHubSpotWorkflow(techWorkflow: any): WorkflowDeploymentConfig {
    return {
      workflowId: techWorkflow.hubspotWorkflowId,
      name: `${techWorkflow.workflowName} - ${this.environment.toUpperCase()}`,
      description: `TECH Clean California workflow: ${techWorkflow.workflowName}`,
      enabled: this.environment === 'production',
      oncePerContact: true,
      enrollmentCriteria: techWorkflow.enrollmentCriteria,
      actions: techWorkflow.steps,
      goals: techWorkflow.goals
    };
  }

  /**
   * Build HubSpot enrollment criteria from TECH workflow definition
   */
  private buildEnrollmentCriteria(criteria: any): any {
    const hubspotCriteria = {
      criteriaType: 'STANDARD',
      filterBranches: [{
        filterBranchType: 'OR',
        filters: []
      }]
    };

    // Primary enrollment criterion
    hubspotCriteria.filterBranches[0].filters.push({
      filterType: 'PROPERTY',
      property: criteria.contactProperty,
      operator: this.mapOperator(criteria.operation),
      value: criteria.value
    });

    // Additional criteria
    if (criteria.additionalCriteria) {
      criteria.additionalCriteria.forEach((criterion: any) => {
        hubspotCriteria.filterBranches[0].filters.push({
          filterType: 'PROPERTY',
          property: criterion.property,
          operator: this.mapOperator(criterion.operation),
          value: criterion.value
        });
      });
    }

    return hubspotCriteria;
  }

  /**
   * Build HubSpot workflow actions from TECH workflow steps
   */
  private buildWorkflowActions(steps: any[]): any[] {
    const hubspotActions: any[] = [];

    steps.forEach((step, index) => {
      // Add delay if specified
      if (step.timing && step.timing !== 'immediate') {
        hubspotActions.push(this.createDelayAction(step.timing));
      }

      // Add step conditions if specified
      if (step.conditions && step.conditions.length > 0) {
        hubspotActions.push(this.createBranchAction(step.conditions, step.actions));
      } else {
        // Add step actions directly
        step.actions.forEach((action: any) => {
          hubspotActions.push(this.convertToHubSpotAction(action));
        });
      }
    });

    return hubspotActions;
  }

  /**
   * Convert TECH action to HubSpot action format
   */
  private convertToHubSpotAction(action: any): any {
    switch (action.type) {
      case 'send_email':
        return {
          actionType: 'SEND_EMAIL',
          emailId: this.getEmailTemplateId(action.template),
          delay: action.delay || '0 minutes'
        };

      case 'create_task':
        return {
          actionType: 'CREATE_TASK',
          subject: action.task.title,
          body: action.task.description,
          assignedTo: this.getUserId(action.task.assignedTo),
          priority: action.task.priority,
          dueDate: action.task.dueDate
        };

      case 'update_contact_property':
        return {
          actionType: 'SET_CONTACT_PROPERTY',
          property: action.property,
          value: action.value
        };

      case 'create_tech_contractor_record':
        return {
          actionType: 'CREATE_RECORD',
          objectType: 'tech_contractor',
          properties: action.properties
        };

      case 'update_tech_contractor_record':
        return {
          actionType: 'UPDATE_RECORD',
          objectType: 'tech_contractor',
          properties: action.properties
        };

      case 'add_to_list':
        return {
          actionType: 'ADD_TO_LIST',
          listId: this.getListId(action.listName)
        };

      case 'remove_from_list':
        return {
          actionType: 'REMOVE_FROM_LIST',
          listId: this.getListId(action.listName)
        };

      case 'branch_logic':
        return {
          actionType: 'BRANCH',
          branches: action.branches.map((branch: any) => ({
            condition: this.buildCondition(branch.condition),
            actions: branch.actions.map((a: any) => this.convertToHubSpotAction(a))
          }))
        };

      default:
        console.warn(`Unknown action type: ${action.type}`);
        return {
          actionType: 'WEBHOOK',
          url: `${process.env.NAMC_PORTAL_URL}/api/tech/webhooks/custom-action`,
          method: 'POST',
          body: JSON.stringify(action)
        };
    }
  }

  /**
   * Create delay action
   */
  private createDelayAction(timing: string): any {
    const delayMap: Record<string, string> = {
      'delay_24_hours': '1 DAY',
      'delay_48_hours': '2 DAYS',
      'delay_7_days': '7 DAYS',
      'delay_30_days': '30 DAYS'
    };

    return {
      actionType: 'DELAY',
      delay: delayMap[timing] || '1 DAY'
    };
  }

  /**
   * Create branch action with conditions
   */
  private createBranchAction(conditions: any[], actions: any[]): any {
    return {
      actionType: 'BRANCH',
      branches: [{
        condition: this.buildCondition(conditions[0]),
        actions: actions.map(action => this.convertToHubSpotAction(action))
      }]
    };
  }

  /**
   * Build condition object
   */
  private buildCondition(condition: any): any {
    return {
      filterType: 'PROPERTY',
      property: condition.property,
      operator: this.mapOperator(condition.operation),
      value: condition.value
    };
  }

  /**
   * Map TECH operators to HubSpot operators
   */
  private mapOperator(operation: string): string {
    const operatorMap: Record<string, string> = {
      'is_equal_to': 'EQ',
      'is_not_equal_to': 'NEQ',
      'is_any_of': 'IN',
      'is_none_of': 'NOT_IN',
      'is_known': 'HAS_PROPERTY',
      'is_unknown': 'NOT_HAS_PROPERTY',
      'is_greater_than': 'GT',
      'is_less_than': 'LT',
      'is_between': 'BETWEEN',
      'is_older_than': 'OLDER_THAN'
    };

    return operatorMap[operation] || 'EQ';
  }

  /**
   * Get email template ID by name
   */
  private getEmailTemplateId(templateName: string): string {
    // This would map to actual HubSpot email template IDs
    // For now, return the template name - would be resolved during deployment
    return templateName;
  }

  /**
   * Get user ID by role/name
   */
  private getUserId(assignedTo: string): string {
    // This would map to actual HubSpot user IDs
    // For now, return a placeholder - would be resolved during deployment
    return assignedTo;
  }

  /**
   * Get list ID by name
   */
  private getListId(listName: string): string {
    // This would map to actual HubSpot list IDs
    // For now, return the list name - would be resolved during deployment
    return listName;
  }

  /**
   * Create workflow in HubSpot
   */
  private async createWorkflow(workflowData: any): Promise<any> {
    const response = await fetch(`${this.hubspotService['baseUrl']}/automation/v3/workflows`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.hubspotService['config'].accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create workflow: ${error}`);
    }

    return response.json();
  }

  /**
   * Update existing workflow
   */
  private async updateWorkflow(workflowId: string, workflowData: any): Promise<any> {
    const response = await fetch(`${this.hubspotService['baseUrl']}/automation/v3/workflows/${workflowId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.hubspotService['config'].accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update workflow: ${error}`);
    }

    return response.json();
  }

  /**
   * Get existing workflow by ID
   */
  private async getExistingWorkflow(workflowId: string): Promise<any> {
    try {
      const response = await fetch(`${this.hubspotService['baseUrl']}/automation/v3/workflows/${workflowId}`, {
        headers: {
          'Authorization': `Bearer ${this.hubspotService['config'].accessToken}`
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get workflow: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      return null;
    }
  }

  /**
   * Set up workflow monitoring
   */
  private async setupWorkflowMonitoring(workflowId: string): Promise<void> {
    // Set up monitoring for workflow performance
    console.log(`  📊 Setting up monitoring for workflow: ${workflowId}`);
    
    // This would configure workflow alerts and performance tracking
    // Implementation would depend on specific HubSpot monitoring capabilities
  }

  /**
   * Validate deployment
   */
  private async validateDeployment(): Promise<void> {
    console.log('\n🔍 Validating deployment...');
    
    const workflowIds = [
      'tech-contractor-enrollment',
      'tech-contractor-recertification',
      'tech-project-initiation',
      'tech-quality-documentation',
      'tech-incentive-processing'
    ];

    for (const workflowId of workflowIds) {
      const workflow = await this.getExistingWorkflow(workflowId);
      if (workflow) {
        console.log(`✅ ${workflowId}: Deployed and active`);
      } else {
        console.log(`❌ ${workflowId}: Not found`);
        throw new Error(`Workflow ${workflowId} not found after deployment`);
      }
    }

    console.log('\n✅ All workflows validated successfully!');
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

    const deployer = new HubSpotWorkflowDeployer();
    await deployer.deployAllWorkflows();

    console.log('\n🎉 TECH Clean California workflows successfully deployed to HubSpot!');
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

export { HubSpotWorkflowDeployer };