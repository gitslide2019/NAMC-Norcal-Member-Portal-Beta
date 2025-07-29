/**
 * Workflow Helpers for E2E Tests
 * 
 * Helper functions for workflow-related operations in end-to-end tests:
 * - Workflow creation and management
 * - Execution monitoring
 * - Step configuration
 * - Status verification
 */

import { Page, expect } from '@playwright/test'

export const workflowHelper = {
  /**
   * Create a new workflow through the UI
   */
  async createWorkflow(page: Page, workflowData: {
    name: string
    description?: string
    type: 'member_onboarding' | 'event_followup' | 'deal_nurturing' | 'member_retention'
    enabled?: boolean
    steps?: Array<{
      type: string
      delay?: number
      properties?: Record<string, any>
    }>
    triggers?: string[]
  }) {
    await page.goto('/admin/workflows')
    await page.click('[data-testid="create-workflow-button"]')
    
    // Fill basic information
    await page.fill('[data-testid="workflow-name"]', workflowData.name)
    
    if (workflowData.description) {
      await page.fill('[data-testid="workflow-description"]', workflowData.description)
    }
    
    await page.selectOption('[data-testid="workflow-type"]', workflowData.type)
    
    // Configure steps if provided
    if (workflowData.steps) {
      for (const step of workflowData.steps) {
        await page.click('[data-testid="add-step-button"]')
        await page.selectOption('[data-testid="step-type"]', step.type)
        
        if (step.delay !== undefined) {
          await page.fill('[data-testid="step-delay"]', step.delay.toString())
        }
        
        if (step.properties) {
          for (const [key, value] of Object.entries(step.properties)) {
            await page.fill(`[data-testid="step-property-${key}"]`, value.toString())
          }
        }
      }
    }
    
    // Configure triggers if provided
    if (workflowData.triggers) {
      await page.click('[data-testid="trigger-section"]')
      for (const trigger of workflowData.triggers) {
        await page.check(`[data-testid="trigger-${trigger}"]`)
      }
    }
    
    // Set enabled state
    if (workflowData.enabled !== false) {
      await page.check('[data-testid="workflow-enabled"]')
    }
    
    // Save workflow
    await page.click('[data-testid="save-workflow-button"]')
    
    // Verify success and return workflow ID
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    const workflowId = await page.locator('[data-testid="workflow-id"]').textContent()
    return workflowId
  },

  /**
   * Edit an existing workflow
   */
  async editWorkflow(page: Page, workflowId: string, updates: {
    name?: string
    description?: string
    enabled?: boolean
  }) {
    await page.goto(`/admin/workflows/${workflowId}`)
    
    if (updates.name) {
      await page.fill('[data-testid="workflow-name"]', updates.name)
    }
    
    if (updates.description) {
      await page.fill('[data-testid="workflow-description"]', updates.description)
    }
    
    if (updates.enabled !== undefined) {
      if (updates.enabled) {
        await page.check('[data-testid="workflow-enabled"]')
      } else {
        await page.uncheck('[data-testid="workflow-enabled"]')
      }
    }
    
    await page.click('[data-testid="save-workflow-button"]')
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  },

  /**
   * Delete a workflow
   */
  async deleteWorkflow(page: Page, workflowId: string) {
    await page.goto('/admin/workflows')
    
    // Find and delete workflow
    await page.click(`[data-testid="workflow-${workflowId}"] [data-testid="workflow-menu"]`)
    await page.click('[data-testid="delete-workflow"]')
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]')
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Workflow deleted successfully')
    
    // Verify workflow is removed from list
    await expect(page.locator(`[data-testid="workflow-${workflowId}"]`)).not.toBeVisible()
  },

  /**
   * Monitor workflow execution
   */
  async monitorExecution(page: Page, workflowId: string, executionId: string) {
    await page.goto(`/admin/workflows/${workflowId}/executions/${executionId}`)
    
    // Verify execution details are visible
    await expect(page.locator('[data-testid="execution-details"]')).toBeVisible()
    await expect(page.locator('[data-testid="execution-status"]')).toBeVisible()
    await expect(page.locator('[data-testid="step-progress"]')).toBeVisible()
    
    return {
      async getStatus() {
        return await page.locator('[data-testid="execution-status"]').textContent()
      },
      
      async getProgress() {
        const completed = await page.locator('[data-testid="completed-steps"]').count()
        const total = await page.locator('[data-testid="total-steps"]').count()
        return { completed, total }
      },
      
      async waitForCompletion(timeout = 30000) {
        await expect(page.locator('[data-testid="execution-status"]')).toContainText('COMPLETED', { timeout })
      },
      
      async waitForFailure(timeout = 30000) {
        await expect(page.locator('[data-testid="execution-status"]')).toContainText('FAILED', { timeout })
      }
    }
  },

  /**
   * Enroll member in workflow
   */
  async enrollMember(page: Page, workflowId: string, memberEmail: string) {
    await page.goto(`/admin/workflows/${workflowId}`)
    await page.click('[data-testid="enrollment-tab"]')
    
    // Search and select member
    await page.click('[data-testid="enroll-member-button"]')
    await page.fill('[data-testid="member-search"]', memberEmail)
    await page.press('[data-testid="member-search"]', 'Enter')
    
    // Wait for search results
    await expect(page.locator('[data-testid="member-search-results"]')).toBeVisible()
    
    // Click on first result
    await page.click('[data-testid="member-search-results"] [data-testid^="member-"]')
    
    // Confirm enrollment
    await page.click('[data-testid="confirm-enrollment-button"]')
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Member enrolled successfully')
  },

  /**
   * Bulk enroll members
   */
  async bulkEnrollMembers(page: Page, workflowId: string, memberEmails: string[]) {
    await page.goto(`/admin/workflows/${workflowId}`)
    await page.click('[data-testid="enrollment-tab"]')
    
    // Start bulk enrollment
    await page.click('[data-testid="bulk-enroll-button"]')
    
    // Upload CSV or enter emails manually
    const emailList = memberEmails.join('\n')
    await page.fill('[data-testid="bulk-email-input"]', emailList)
    
    // Start bulk enrollment
    await page.click('[data-testid="start-bulk-enrollment"]')
    
    // Wait for completion
    await expect(page.locator('[data-testid="bulk-enrollment-complete"]')).toBeVisible({ timeout: 30000 })
    
    // Verify results
    const successCount = await page.locator('[data-testid="enrollment-success-count"]').textContent()
    const errorCount = await page.locator('[data-testid="enrollment-error-count"]').textContent()
    
    return {
      success: parseInt(successCount || '0'),
      errors: parseInt(errorCount || '0')
    }
  },

  /**
   * Test workflow with test data
   */
  async testWorkflow(page: Page, workflowId: string, testData: {
    contactEmail: string
    customProperties?: Record<string, any>
  }) {
    await page.goto(`/admin/workflows/${workflowId}`)
    await page.click('[data-testid="test-workflow-tab"]')
    
    // Configure test data
    await page.fill('[data-testid="test-contact-email"]', testData.contactEmail)
    
    if (testData.customProperties) {
      for (const [key, value] of Object.entries(testData.customProperties)) {
        await page.fill(`[data-testid="test-property-${key}"]`, value.toString())
      }
    }
    
    // Start test execution
    await page.click('[data-testid="start-test-button"]')
    
    // Wait for test to complete
    await expect(page.locator('[data-testid="test-results"]')).toBeVisible({ timeout: 60000 })
    
    // Get test results
    const status = await page.locator('[data-testid="test-status"]').textContent()
    const logs = await page.locator('[data-testid="test-logs"]').textContent()
    
    return { status, logs }
  },

  /**
   * Filter workflow executions
   */
  async filterExecutions(page: Page, workflowId: string, filters: {
    status?: string[]
    contactId?: string
    dateRange?: {
      start: string
      end: string
    }
  }) {
    await page.goto(`/admin/workflows/${workflowId}/executions`)
    
    // Apply status filters
    if (filters.status) {
      for (const status of filters.status) {
        await page.check(`[data-testid="status-filter-${status}"]`)
      }
    }
    
    // Apply contact filter
    if (filters.contactId) {
      await page.fill('[data-testid="contact-filter"]', filters.contactId)
    }
    
    // Apply date range filter
    if (filters.dateRange) {
      await page.fill('[data-testid="date-start"]', filters.dateRange.start)
      await page.fill('[data-testid="date-end"]', filters.dateRange.end)
    }
    
    // Apply filters
    await page.click('[data-testid="apply-filters-button"]')
    
    // Wait for results to update
    await expect(page.locator('[data-testid="execution-list"]')).toBeVisible()
  },

  /**
   * Export execution data
   */
  async exportExecutions(page: Page, workflowId: string, format: 'csv' | 'xlsx' = 'csv') {
    await page.goto(`/admin/workflows/${workflowId}/executions`)
    
    // Start export
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="export-executions-button"]')
    await page.selectOption('[data-testid="export-format"]', format)
    await page.click('[data-testid="confirm-export-button"]')
    
    // Wait for download
    const download = await downloadPromise
    
    return {
      filename: download.suggestedFilename(),
      path: await download.path()
    }
  },

  /**
   * Clone/duplicate workflow
   */
  async cloneWorkflow(page: Page, sourceWorkflowId: string, newName: string) {
    await page.goto('/admin/workflows')
    
    // Find source workflow and clone
    await page.click(`[data-testid="workflow-${sourceWorkflowId}"] [data-testid="workflow-menu"]`)
    await page.click('[data-testid="duplicate-workflow"]')
    
    // Modify clone settings
    await page.fill('[data-testid="workflow-name"]', newName)
    
    // Save cloned workflow
    await page.click('[data-testid="save-workflow-button"]')
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // Return new workflow ID
    const workflowId = await page.locator('[data-testid="workflow-id"]').textContent()
    return workflowId
  },

  /**
   * Verify workflow step configuration
   */
  async verifyStepConfiguration(page: Page, workflowId: string, expectedSteps: Array<{
    type: string
    delay?: number
    properties?: Record<string, any>
  }>) {
    await page.goto(`/admin/workflows/${workflowId}`)
    await page.click('[data-testid="steps-tab"]')
    
    // Verify step count
    const stepCount = await page.locator('[data-testid="workflow-step"]').count()
    expect(stepCount).toBe(expectedSteps.length)
    
    // Verify each step
    for (let i = 0; i < expectedSteps.length; i++) {
      const step = expectedSteps[i]
      const stepElement = page.locator(`[data-testid="workflow-step"]:nth-child(${i + 1})`)
      
      // Verify step type
      const stepType = await stepElement.locator('[data-testid="step-type"]').textContent()
      expect(stepType).toBe(step.type)
      
      // Verify delay if specified
      if (step.delay !== undefined) {
        const stepDelay = await stepElement.locator('[data-testid="step-delay"]').inputValue()
        expect(parseInt(stepDelay)).toBe(step.delay)
      }
      
      // Verify properties if specified
      if (step.properties) {
        for (const [key, value] of Object.entries(step.properties)) {
          const propertyValue = await stepElement.locator(`[data-testid="step-property-${key}"]`).inputValue()
          expect(propertyValue).toBe(value.toString())
        }
      }
    }
  },

  /**
   * Verify workflow analytics
   */
  async verifyWorkflowAnalytics(page: Page, workflowId: string, expectedMetrics: {
    totalExecutions?: number
    successRate?: number
    averageCompletionTime?: number
  }) {
    await page.goto(`/admin/workflows/${workflowId}/analytics`)
    
    // Wait for analytics to load
    await expect(page.locator('[data-testid="workflow-analytics"]')).toBeVisible()
    
    // Verify metrics
    if (expectedMetrics.totalExecutions !== undefined) {
      const totalExecutions = await page.locator('[data-testid="total-executions"]').textContent()
      expect(parseInt(totalExecutions || '0')).toBe(expectedMetrics.totalExecutions)
    }
    
    if (expectedMetrics.successRate !== undefined) {
      const successRate = await page.locator('[data-testid="success-rate"]').textContent()
      const rate = parseFloat(successRate?.replace('%', '') || '0')
      expect(rate).toBeCloseTo(expectedMetrics.successRate, 1)
    }
    
    if (expectedMetrics.averageCompletionTime !== undefined) {
      const avgTime = await page.locator('[data-testid="avg-completion-time"]').textContent()
      // Parse time format (e.g., "2h 30m" or "45m")
      const timeInMinutes = this.parseTimeToMinutes(avgTime || '')
      expect(timeInMinutes).toBeCloseTo(expectedMetrics.averageCompletionTime, 5)
    }
  },

  /**
   * Helper function to parse time strings to minutes
   */
  parseTimeToMinutes(timeString: string): number {
    const hourMatch = timeString.match(/(\d+)h/)
    const minuteMatch = timeString.match(/(\d+)m/)
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0
    
    return hours * 60 + minutes
  }
}