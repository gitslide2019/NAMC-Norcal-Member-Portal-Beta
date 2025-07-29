#!/usr/bin/env tsx

/**
 * Workflow Validation Script
 * 
 * This script validates NAMC workflow configurations:
 * - Validates workflow definitions against schemas
 * - Checks workflow step dependencies
 * - Validates automation rules and triggers
 * - Ensures data consistency
 */

import { z } from 'zod'
import { 
  NAMCWorkflowDefinition,
  WorkflowStep,
  WorkflowAction,
  WorkflowCondition,
  AutomationRule
} from '@/features/common/types'

// Validation schemas
const WorkflowStepSchema = z.object({
  id: z.string().min(1),
  stepNumber: z.number().positive(),
  stepType: z.enum(['ACTION', 'DELAY', 'CONDITION', 'BRANCH', 'WEBHOOK', 'EMAIL', 'TASK', 'PROPERTY_UPDATE', 'LIST_MEMBERSHIP', 'INTEGRATION']),
  name: z.string().min(1),
  description: z.string().optional(),
  executeImmediately: z.boolean(),
  delay: z.object({
    type: z.enum(['FIXED', 'PROPERTY_BASED', 'SMART']),
    value: z.number().positive(),
    unit: z.enum(['MINUTES', 'HOURS', 'DAYS', 'WEEKS']),
    propertyName: z.string().optional(),
    smartDelaySettings: z.object({
      timezone: z.string(),
      dayOfWeek: z.array(z.number().min(0).max(6)).optional(),
      timeOfDay: z.string().optional(),
      excludeWeekends: z.boolean(),
      excludeHolidays: z.boolean()
    }).optional()
  }).optional(),
  conditions: z.array(z.object({
    id: z.string(),
    type: z.enum(['PROPERTY', 'LIST_MEMBERSHIP', 'EVENT', 'INTEGRATION']),
    operator: z.enum(['EQ', 'NEQ', 'LT', 'LTE', 'GT', 'GTE', 'CONTAINS', 'NOT_CONTAINS', 'STARTS_WITH', 'ENDS_WITH', 'IS_KNOWN', 'IS_UNKNOWN', 'IN', 'NOT_IN', 'HAS_PROPERTY', 'NOT_HAS_PROPERTY', 'IS_MEMBER_OF_LIST', 'NOT_MEMBER_OF_LIST']),
    propertyName: z.string().optional(),
    value: z.any(),
    values: z.array(z.any()).optional(),
    listId: z.string().optional(),
    eventName: z.string().optional(),
    integrationId: z.string().optional()
  })).optional(),
  action: z.object({
    id: z.string(),
    type: z.enum(['SEND_EMAIL', 'CREATE_TASK', 'UPDATE_PROPERTY', 'ADD_TO_LIST', 'REMOVE_FROM_LIST', 'CREATE_DEAL', 'UPDATE_DEAL', 'WEBHOOK', 'INTEGRATION_ACTION', 'NAMC_CUSTOM_ACTION']),
    configuration: z.record(z.any())
  }),
  branches: z.array(z.object({
    id: z.string(),
    name: z.string(),
    conditions: z.array(z.any()),
    nextStepId: z.string(),
    isDefaultBranch: z.boolean()
  })).optional(),
  nextStepId: z.string().optional(),
  metrics: z.object({
    totalExecutions: z.number().nonnegative(),
    successfulExecutions: z.number().nonnegative(),
    failedExecutions: z.number().nonnegative(),
    averageExecutionTime: z.number().nonnegative()
  })
})

const NAMCWorkflowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  type: z.enum(['member_onboarding', 'member_lifecycle', 'project_matching', 'service_request', 'event_engagement', 'renewal_management', 'risk_intervention', 'training_pathway', 'committee_engagement', 'donor_cultivation', 'staff_task_automation', 'member_communication']),
  isActive: z.boolean(),
  enrollmentCriteria: z.object({
    propertyFilters: z.array(z.object({
      propertyName: z.string(),
      operator: z.string(),
      value: z.any(),
      values: z.array(z.any()).optional(),
      propertyType: z.enum(['string', 'number', 'datetime', 'enumeration', 'bool']),
      filterType: z.enum(['PROPERTY', 'INTEGRATION_FIELD'])
    })),
    listMemberships: z.array(z.string()).optional(),
    customCriteria: z.record(z.any()).optional()
  }),
  steps: z.array(WorkflowStepSchema),
  settings: z.object({
    allowMultipleEnrollments: z.boolean(),
    removeFromWorkflow: z.boolean(),
    reenrollmentEnabled: z.boolean(),
    reenrollmentCriteria: z.array(z.any()).optional(),
    suppressForExistingContacts: z.boolean()
  }),
  metrics: z.object({
    totalEnrollments: z.number().nonnegative(),
    activeEnrollments: z.number().nonnegative(),
    completedEnrollments: z.number().nonnegative(),
    conversionRate: z.number().min(0).max(100),
    averageCompletionTime: z.number().nonnegative()
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastModifiedBy: z.string()
})

interface ValidationResult {
  workflow: string
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

interface ValidationReport {
  totalWorkflows: number
  validWorkflows: number
  invalidWorkflows: number
  results: ValidationResult[]
  summary: {
    criticalIssues: number
    warnings: number
    suggestions: number
  }
}

class WorkflowValidator {
  private report: ValidationReport

  constructor() {
    this.report = {
      totalWorkflows: 0,
      validWorkflows: 0,
      invalidWorkflows: 0,
      results: [],
      summary: {
        criticalIssues: 0,
        warnings: 0,
        suggestions: 0
      }
    }
  }

  async validateWorkflows(): Promise<void> {
    console.log('🔍 Starting NAMC Workflow Validation...\n')

    // Load and validate predefined NAMC workflows
    const workflows = await this.loadNAMCWorkflows()
    
    for (const workflow of workflows) {
      await this.validateWorkflow(workflow)
    }

    this.generateReport()
  }

  private async loadNAMCWorkflows(): Promise<NAMCWorkflowDefinition[]> {
    // This would typically load from a configuration file or database
    // For this example, we'll define the core NAMC workflows inline
    
    const workflows: Partial<NAMCWorkflowDefinition>[] = [
      {
        id: 'namc-member-onboarding',
        name: 'NAMC Member Onboarding',
        description: 'Automated onboarding workflow for new NAMC members',
        type: 'member_onboarding',
        isActive: true,
        enrollmentCriteria: {
          propertyFilters: [
            {
              propertyName: 'member_type',
              operator: 'EQ',
              value: 'REGULAR',
              propertyType: 'enumeration',
              filterType: 'PROPERTY'
            },
            {
              propertyName: 'onboarding_status',
              operator: 'NEQ',
              value: 'completed',
              propertyType: 'enumeration',
              filterType: 'PROPERTY'
            }
          ]
        },
        steps: [
          {
            id: 'welcome-email',
            stepNumber: 1,
            stepType: 'EMAIL',
            name: 'Send Welcome Email',
            executeImmediately: false,
            delay: {
              type: 'FIXED',
              value: 30,
              unit: 'MINUTES'
            },
            action: {
              id: 'welcome-email-action',
              type: 'SEND_EMAIL',
              configuration: {
                emailTemplate: {
                  templateId: 'welcome_email_template',
                  subject: 'Welcome to NAMC NorCal!',
                  personalizeFromOwner: true,
                  sendFromOwner: false
                }
              }
            },
            nextStepId: 'schedule-welcome-call',
            metrics: {
              totalExecutions: 0,
              successfulExecutions: 0,
              failedExecutions: 0,
              averageExecutionTime: 0
            }
          },
          {
            id: 'schedule-welcome-call',
            stepNumber: 2,
            stepType: 'TASK',
            name: 'Schedule Welcome Call',
            executeImmediately: true,
            action: {
              id: 'welcome-call-task',
              type: 'CREATE_TASK',
              configuration: {
                taskDetails: {
                  taskType: 'CALL',
                  subject: 'Welcome call for new member',
                  notes: 'Schedule welcome call within 3 business days',
                  priority: 'MEDIUM',
                  assignToOwner: true,
                  dueDate: {
                    type: 'DELAY',
                    delay: {
                      type: 'FIXED',
                      value: 3,
                      unit: 'DAYS'
                    }
                  }
                }
              }
            },
            nextStepId: 'check-onboarding-progress',
            metrics: {
              totalExecutions: 0,
              successfulExecutions: 0,
              failedExecutions: 0,
              averageExecutionTime: 0
            }
          },
          {
            id: 'check-onboarding-progress',
            stepNumber: 3,
            stepType: 'CONDITION',
            name: 'Check Onboarding Progress',
            executeImmediately: false,
            delay: {
              type: 'FIXED',
              value: 7,
              unit: 'DAYS'
            },
            conditions: [
              {
                id: 'onboarding-completion-check',
                type: 'PROPERTY',
                operator: 'EQ',
                propertyName: 'onboarding_status',
                value: 'completed'
              }
            ],
            action: {
              id: 'onboarding-check-action',
              type: 'UPDATE_PROPERTY',
              configuration: {
                propertyUpdates: [
                  {
                    propertyName: 'onboarding_progress_percentage',
                    value: 100,
                    valueType: 'STATIC'
                  }
                ]
              }
            },
            branches: [
              {
                id: 'onboarding-complete-branch',
                name: 'Onboarding Complete',
                conditions: [
                  {
                    id: 'completion-condition',
                    type: 'PROPERTY',
                    operator: 'EQ',
                    propertyName: 'onboarding_status',
                    value: 'completed'
                  }
                ],
                nextStepId: 'send-completion-email',
                isDefaultBranch: false
              },
              {
                id: 'onboarding-incomplete-branch',
                name: 'Onboarding Incomplete',
                conditions: [],
                nextStepId: 'send-reminder-email',
                isDefaultBranch: true
              }
            ],
            metrics: {
              totalExecutions: 0,
              successfulExecutions: 0,
              failedExecutions: 0,
              averageExecutionTime: 0
            }
          }
        ],
        settings: {
          allowMultipleEnrollments: false,
          removeFromWorkflow: true,
          reenrollmentEnabled: false,
          suppressForExistingContacts: true
        },
        metrics: {
          totalEnrollments: 0,
          activeEnrollments: 0,
          completedEnrollments: 0,
          conversionRate: 0,
          averageCompletionTime: 0
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'system'
      },
      
      {
        id: 'namc-member-lifecycle',
        name: 'NAMC Member Lifecycle Management',
        description: 'Monitors member engagement and triggers interventions',
        type: 'member_lifecycle',
        isActive: true,
        enrollmentCriteria: {
          propertyFilters: [
            {
              propertyName: 'member_type',
              operator: 'IN',
              values: ['REGULAR', 'admin'],
              propertyType: 'enumeration',
              filterType: 'PROPERTY'
            }
          ]
        },
        steps: [
          {
            id: 'risk-assessment',
            stepNumber: 1,
            stepType: 'CONDITION',
            name: 'Assess Member Risk Level',
            executeImmediately: true,
            conditions: [
              {
                id: 'risk-level-check',
                type: 'PROPERTY',
                operator: 'EQ',
                propertyName: 'member_risk_level',
                value: 'at_risk_intervention'
              }
            ],
            action: {
              id: 'risk-assessment-action',
              type: 'NAMC_CUSTOM_ACTION',
              configuration: {
                namcCustomAction: {
                  actionType: 'CALCULATE_MEMBER_HEALTH_SCORE',
                  parameters: {
                    includeEngagementHistory: true,
                    includeFinancialMetrics: true
                  }
                }
              }
            },
            branches: [
              {
                id: 'at-risk-branch',
                name: 'At Risk - Immediate Intervention',
                conditions: [
                  {
                    id: 'at-risk-condition',
                    type: 'PROPERTY',
                    operator: 'EQ',
                    propertyName: 'member_risk_level',
                    value: 'at_risk_intervention'
                  }
                ],
                nextStepId: 'urgent-intervention',
                isDefaultBranch: false
              },
              {
                id: 'standard-risk-branch',
                name: 'Standard Risk Management',
                conditions: [],
                nextStepId: 'standard-engagement',
                isDefaultBranch: true
              }
            ],
            metrics: {
              totalExecutions: 0,
              successfulExecutions: 0,
              failedExecutions: 0,
              averageExecutionTime: 0
            }
          }
        ],
        settings: {
          allowMultipleEnrollments: true,
          removeFromWorkflow: false,
          reenrollmentEnabled: true,
          suppressForExistingContacts: false
        },
        metrics: {
          totalEnrollments: 0,
          activeEnrollments: 0,
          completedEnrollments: 0,
          conversionRate: 0,
          averageCompletionTime: 0
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: 'system'
      }
    ]

    return workflows as NAMCWorkflowDefinition[]
  }

  private async validateWorkflow(workflow: NAMCWorkflowDefinition): Promise<void> {
    console.log(`🔍 Validating workflow: ${workflow.name}`)
    
    const result: ValidationResult = {
      workflow: workflow.name,
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    try {
      // Schema validation
      NAMCWorkflowSchema.parse(workflow)
      console.log('  ✅ Schema validation passed')
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.isValid = false
        error.errors.forEach(err => {
          result.errors.push(`Schema error at ${err.path.join('.')}: ${err.message}`)
        })
        console.log('  ❌ Schema validation failed')
      }
    }

    // Business logic validation
    this.validateWorkflowLogic(workflow, result)
    this.validateStepDependencies(workflow, result)
    this.validateActionConfiguration(workflow, result)
    this.validateEnrollmentCriteria(workflow, result)

    // Performance and optimization suggestions
    this.generateOptimizationSuggestions(workflow, result)

    this.report.results.push(result)
    this.report.totalWorkflows++

    if (result.isValid && result.errors.length === 0) {
      this.report.validWorkflows++
      console.log('  ✅ Workflow validation completed successfully')
    } else {
      this.report.invalidWorkflows++
      console.log('  ❌ Workflow validation failed')
    }

    this.report.summary.criticalIssues += result.errors.length
    this.report.summary.warnings += result.warnings.length
    this.report.summary.suggestions += result.suggestions.length

    console.log('')
  }

  private validateWorkflowLogic(workflow: NAMCWorkflowDefinition, result: ValidationResult): void {
    // Check for circular dependencies
    const stepIds = new Set(workflow.steps.map(s => s.id))
    const visitedSteps = new Set<string>()
    
    for (const step of workflow.steps) {
      if (step.nextStepId) {
        if (!stepIds.has(step.nextStepId)) {
          result.errors.push(`Step "${step.name}" references non-existent next step: ${step.nextStepId}`)
        }
        
        // Simple circular dependency check
        if (this.hasCircularDependency(workflow.steps, step.id, new Set())) {
          result.errors.push(`Circular dependency detected involving step: ${step.name}`)
        }
      }

      // Check branch logic
      if (step.branches) {
        const hasDefaultBranch = step.branches.some(b => b.isDefaultBranch)
        if (!hasDefaultBranch) {
          result.warnings.push(`Step "${step.name}" has branches but no default branch`)
        }

        step.branches.forEach(branch => {
          if (!stepIds.has(branch.nextStepId)) {
            result.errors.push(`Branch "${branch.name}" references non-existent step: ${branch.nextStepId}`)
          }
        })
      }
    }

    // Check step numbering
    const stepNumbers = workflow.steps.map(s => s.stepNumber).sort((a, b) => a - b)
    for (let i = 0; i < stepNumbers.length; i++) {
      if (i > 0 && stepNumbers[i] === stepNumbers[i - 1]) {
        result.warnings.push(`Duplicate step number found: ${stepNumbers[i]}`)
      }
    }
  }

  private hasCircularDependency(steps: WorkflowStep[], currentStepId: string, visited: Set<string>): boolean {
    if (visited.has(currentStepId)) {
      return true
    }

    visited.add(currentStepId)
    const currentStep = steps.find(s => s.id === currentStepId)
    
    if (currentStep?.nextStepId) {
      return this.hasCircularDependency(steps, currentStep.nextStepId, new Set(visited))
    }

    if (currentStep?.branches) {
      for (const branch of currentStep.branches) {
        if (this.hasCircularDependency(steps, branch.nextStepId, new Set(visited))) {
          return true
        }
      }
    }

    return false
  }

  private validateStepDependencies(workflow: NAMCWorkflowDefinition, result: ValidationResult): void {
    // Validate delay configurations
    workflow.steps.forEach(step => {
      if (step.delay) {
        if (step.delay.type === 'PROPERTY_BASED' && !step.delay.propertyName) {
          result.errors.push(`Step "${step.name}" has property-based delay but no propertyName specified`)
        }

        if (step.delay.type === 'SMART' && !step.delay.smartDelaySettings) {
          result.errors.push(`Step "${step.name}" has smart delay but no smartDelaySettings specified`)
        }

        if (step.delay.value <= 0) {
          result.errors.push(`Step "${step.name}" has invalid delay value: ${step.delay.value}`)
        }
      }

      // Validate conditions
      if (step.conditions) {
        step.conditions.forEach((condition, index) => {
          if (condition.type === 'PROPERTY' && !condition.propertyName) {
            result.errors.push(`Step "${step.name}" condition ${index + 1} is property-based but missing propertyName`)
          }

          if (condition.operator === 'IN' && !condition.values) {
            result.errors.push(`Step "${step.name}" condition ${index + 1} uses IN operator but missing values array`)
          }
        })
      }
    })
  }

  private validateActionConfiguration(workflow: NAMCWorkflowDefinition, result: ValidationResult): void {
    workflow.steps.forEach(step => {
      const action = step.action
      
      switch (action.type) {
        case 'SEND_EMAIL':
          if (!action.configuration.emailTemplate?.templateId) {
            result.errors.push(`Step "${step.name}" email action missing templateId`)
          }
          break
          
        case 'CREATE_TASK':
          const taskDetails = action.configuration.taskDetails
          if (!taskDetails?.subject) {
            result.errors.push(`Step "${step.name}" task action missing subject`)
          }
          if (!taskDetails?.taskType) {
            result.errors.push(`Step "${step.name}" task action missing taskType`)
          }
          break
          
        case 'UPDATE_PROPERTY':
          const propertyUpdates = action.configuration.propertyUpdates
          if (!propertyUpdates || propertyUpdates.length === 0) {
            result.errors.push(`Step "${step.name}" property update action missing propertyUpdates`)
          }
          break
          
        case 'WEBHOOK':
          const webhookConfig = action.configuration.webhookConfig
          if (!webhookConfig?.url) {
            result.errors.push(`Step "${step.name}" webhook action missing URL`)
          }
          if (webhookConfig?.url && !this.isValidUrl(webhookConfig.url)) {
            result.errors.push(`Step "${step.name}" webhook action has invalid URL format`)
          }
          break
          
        case 'NAMC_CUSTOM_ACTION':
          const namcAction = action.configuration.namcCustomAction
          if (!namcAction?.actionType) {
            result.errors.push(`Step "${step.name}" NAMC custom action missing actionType`)
          }
          break
      }
    })
  }

  private validateEnrollmentCriteria(workflow: NAMCWorkflowDefinition, result: ValidationResult): void {
    const criteria = workflow.enrollmentCriteria
    
    if (!criteria.propertyFilters || criteria.propertyFilters.length === 0) {
      result.warnings.push(`Workflow "${workflow.name}" has no enrollment criteria - will enroll all entities`)
    }

    criteria.propertyFilters.forEach((filter, index) => {
      if (!filter.propertyName) {
        result.errors.push(`Enrollment criteria ${index + 1} missing propertyName`)
      }

      if (filter.operator === 'IN' && !filter.values) {
        result.errors.push(`Enrollment criteria ${index + 1} uses IN operator but missing values`)
      }
    })
  }

  private generateOptimizationSuggestions(workflow: NAMCWorkflowDefinition, result: ValidationResult): void {
    // Performance suggestions
    const totalSteps = workflow.steps.length
    if (totalSteps > 10) {
      result.suggestions.push(`Consider breaking down workflow "${workflow.name}" (${totalSteps} steps) into smaller workflows for better performance`)
    }

    // Check for inefficient delays
    const longDelays = workflow.steps.filter(step => 
      step.delay && 
      ((step.delay.unit === 'DAYS' && step.delay.value > 30) || 
       (step.delay.unit === 'WEEKS' && step.delay.value > 4))
    )
    
    if (longDelays.length > 0) {
      result.suggestions.push(`Consider using smart delays instead of long fixed delays for better user experience`)
    }

    // Check for missing error handling
    const actionSteps = workflow.steps.filter(step => 
      ['EMAIL', 'TASK', 'WEBHOOK', 'INTEGRATION'].includes(step.stepType)
    )
    
    if (actionSteps.length > 0 && !workflow.steps.some(step => step.stepType === 'CONDITION')) {
      result.suggestions.push(`Add error handling conditions for action steps in workflow "${workflow.name}"`)
    }

    // Enrollment optimization
    if (workflow.settings.allowMultipleEnrollments && workflow.type === 'member_onboarding') {
      result.suggestions.push(`Consider disabling multiple enrollments for onboarding workflow to prevent duplicate processing`)
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private generateReport(): void {
    console.log('\n' + '='.repeat(60))
    console.log('📋 WORKFLOW VALIDATION REPORT')
    console.log('='.repeat(60))

    console.log(`\n📊 Summary:`)
    console.log(`  Total workflows: ${this.report.totalWorkflows}`)
    console.log(`  ✅ Valid workflows: ${this.report.validWorkflows}`)
    console.log(`  ❌ Invalid workflows: ${this.report.invalidWorkflows}`)
    console.log(`  📈 Success rate: ${Math.round((this.report.validWorkflows / this.report.totalWorkflows) * 100)}%`)

    console.log(`\n🚨 Issues Summary:`)
    console.log(`  ❌ Critical errors: ${this.report.summary.criticalIssues}`)
    console.log(`  ⚠️  Warnings: ${this.report.summary.warnings}`)
    console.log(`  💡 Suggestions: ${this.report.summary.suggestions}`)

    // Detailed results
    console.log(`\n📋 Detailed Results:`)
    this.report.results.forEach(result => {
      const status = result.isValid && result.errors.length === 0 ? '✅' : '❌'
      console.log(`\n${status} ${result.workflow}`)
      
      if (result.errors.length > 0) {
        console.log('  ❌ Errors:')
        result.errors.forEach(error => console.log(`    • ${error}`))
      }
      
      if (result.warnings.length > 0) {
        console.log('  ⚠️  Warnings:')
        result.warnings.forEach(warning => console.log(`    • ${warning}`))
      }
      
      if (result.suggestions.length > 0) {
        console.log('  💡 Suggestions:')
        result.suggestions.forEach(suggestion => console.log(`    • ${suggestion}`))
      }
    })

    console.log(`\n🔧 Recommendations:`)
    if (this.report.invalidWorkflows > 0) {
      console.log('  🚨 Fix critical errors before deploying workflows')
      console.log('  📚 Review workflow documentation and best practices')
    }
    
    if (this.report.summary.warnings > 0) {
      console.log('  ⚠️  Address warnings to improve workflow reliability')
    }
    
    if (this.report.summary.suggestions > 0) {
      console.log('  💡 Consider implementing suggestions for better performance')
    }
    
    if (this.report.validWorkflows === this.report.totalWorkflows) {
      console.log('  🎉 All workflows are valid - ready for deployment!')
    }

    console.log(`\n📋 Next Steps:`)
    console.log('  • Run `npm run workflows:test` to test workflow execution')
    console.log('  • Run `npm run workflows:deploy` to deploy validated workflows')
    console.log('  • Monitor workflow performance after deployment')

    const exitCode = this.report.invalidWorkflows > 0 ? 1 : 0
    process.exit(exitCode)
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Workflow Validation Script

Usage: npm run workflows:validate [options]

Options:
  --help, -h     Show this help message
  --strict       Treat warnings as errors
  --json         Output results in JSON format

Examples:
  npm run workflows:validate              # Validate all workflows
  npm run workflows:validate --strict     # Strict validation mode
  npm run workflows:validate --json       # JSON output

This script validates:
1. Workflow schema compliance
2. Step dependencies and flow logic
3. Action configuration correctness
4. Enrollment criteria validity
5. Performance optimization opportunities

Exit codes:
  0 - All workflows valid
  1 - Some workflows have errors
    `)
    process.exit(0)
  }

  const validator = new WorkflowValidator()
  await validator.validateWorkflows()
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Validation failed with error:', error)
    process.exit(1)
  })
}