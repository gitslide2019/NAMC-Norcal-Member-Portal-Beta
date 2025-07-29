/**
 * Dashboard Helpers for E2E Tests
 * 
 * Helper functions for dashboard-related operations in end-to-end tests:
 * - Dashboard navigation and verification
 * - Widget interactions
 * - Data filtering and time range selection
 * - Export and reporting functions
 */

import { Page, expect } from '@playwright/test'

export const dashboardHelper = {
  /**
   * Navigate to analytics dashboard and verify load
   */
  async navigateToAnalytics(page: Page) {
    await page.goto('/admin/analytics')
    
    // Wait for dashboard to load
    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible()
    await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible()
    
    // Verify essential widgets are present
    await expect(page.locator('[data-testid="overview-widget"]')).toBeVisible()
    await expect(page.locator('[data-testid="workflow-performance-widget"]')).toBeVisible()
    await expect(page.locator('[data-testid="member-engagement-widget"]')).toBeVisible()
  },

  /**
   * Verify overview widget data
   */
  async verifyOverviewWidget(page: Page, expectedData: {
    totalWorkflows?: number
    activeWorkflows?: number
    totalExecutions?: number
    successRate?: string
  }) {
    const overviewWidget = page.locator('[data-testid="overview-widget"]')
    
    if (expectedData.totalWorkflows !== undefined) {
      const totalWorkflows = await overviewWidget.locator('[data-testid="total-workflows"]').textContent()
      expect(parseInt(totalWorkflows || '0')).toBe(expectedData.totalWorkflows)
    }
    
    if (expectedData.activeWorkflows !== undefined) {
      const activeWorkflows = await overviewWidget.locator('[data-testid="active-workflows"]').textContent()
      expect(parseInt(activeWorkflows || '0')).toBe(expectedData.activeWorkflows)
    }
    
    if (expectedData.totalExecutions !== undefined) {
      const totalExecutions = await overviewWidget.locator('[data-testid="total-executions"]').textContent()
      expect(parseInt(totalExecutions || '0')).toBe(expectedData.totalExecutions)
    }
    
    if (expectedData.successRate !== undefined) {
      const successRate = await overviewWidget.locator('[data-testid="success-rate"]').textContent()
      expect(successRate).toBe(expectedData.successRate)
    }
  },

  /**
   * Set time range filter
   */
  async setTimeRange(page: Page, range: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom') {
    await page.selectOption('[data-testid="time-range-select"]', range)
    
    // Wait for data to refresh
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible({ timeout: 10000 })
  },

  /**
   * Set custom date range
   */
  async setCustomDateRange(page: Page, startDate: string, endDate: string) {
    await page.selectOption('[data-testid="time-range-select"]', 'custom')
    
    // Wait for custom date inputs to appear
    await expect(page.locator('[data-testid="custom-date-range"]')).toBeVisible()
    
    // Set dates
    await page.fill('[data-testid="start-date"]', startDate)
    await page.fill('[data-testid="end-date"]', endDate)
    await page.click('[data-testid="apply-date-range"]')
    
    // Wait for data to refresh
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible({ timeout: 10000 })
  },

  /**
   * Toggle widget visibility
   */
  async toggleWidget(page: Page, widgetName: string, visible: boolean) {
    await page.click('[data-testid="dashboard-settings"]')
    await expect(page.locator('[data-testid="widget-settings"]')).toBeVisible()
    
    const checkbox = page.locator(`[data-testid="widget-toggle-${widgetName}"]`)
    
    if (visible) {
      await checkbox.check()
    } else {
      await checkbox.uncheck()
    }
    
    // Apply settings
    await page.click('[data-testid="apply-widget-settings"]')
    
    // Verify widget visibility
    const widget = page.locator(`[data-testid="${widgetName}-widget"]`)
    if (visible) {
      await expect(widget).toBeVisible()
    } else {
      await expect(widget).not.toBeVisible()
    }
  },

  /**
   * Verify workflow performance widget
   */
  async verifyWorkflowPerformance(page: Page, expectedWorkflows: Array<{
    name: string
    executions?: number
    successRate?: number
    avgCompletionTime?: string
  }>) {
    const performanceWidget = page.locator('[data-testid="workflow-performance-widget"]')
    
    for (const workflow of expectedWorkflows) {
      const workflowRow = performanceWidget.locator(`[data-testid="workflow-row"]:has-text("${workflow.name}")`)
      await expect(workflowRow).toBeVisible()
      
      if (workflow.executions !== undefined) {
        const executions = await workflowRow.locator('[data-testid="workflow-executions"]').textContent()
        expect(parseInt(executions || '0')).toBe(workflow.executions)
      }
      
      if (workflow.successRate !== undefined) {
        const successRate = await workflowRow.locator('[data-testid="workflow-success-rate"]').textContent()
        expect(parseFloat(successRate?.replace('%', '') || '0')).toBeCloseTo(workflow.successRate, 1)
      }
      
      if (workflow.avgCompletionTime !== undefined) {
        const avgTime = await workflowRow.locator('[data-testid="workflow-avg-time"]').textContent()
        expect(avgTime).toBe(workflow.avgCompletionTime)
      }
    }
  },

  /**
   * Verify member engagement widget
   */
  async verifyMemberEngagement(page: Page, expectedData: {
    newMembers?: number
    activeMembers?: number
    retentionRate?: string
    engagementScore?: number
  }) {
    const engagementWidget = page.locator('[data-testid="member-engagement-widget"]')
    
    if (expectedData.newMembers !== undefined) {
      const newMembers = await engagementWidget.locator('[data-testid="new-members"]').textContent()
      expect(parseInt(newMembers || '0')).toBe(expectedData.newMembers)
    }
    
    if (expectedData.activeMembers !== undefined) {
      const activeMembers = await engagementWidget.locator('[data-testid="active-members"]').textContent()
      expect(parseInt(activeMembers || '0')).toBe(expectedData.activeMembers)
    }
    
    if (expectedData.retentionRate !== undefined) {
      const retentionRate = await engagementWidget.locator('[data-testid="retention-rate"]').textContent()
      expect(retentionRate).toBe(expectedData.retentionRate)
    }
    
    if (expectedData.engagementScore !== undefined) {
      const engagementScore = await engagementWidget.locator('[data-testid="engagement-score"]').textContent()
      expect(parseFloat(engagementScore || '0')).toBeCloseTo(expectedData.engagementScore, 1)
    }
  },

  /**
   * Export dashboard data
   */
  async exportDashboard(page: Page, format: 'pdf' | 'csv' | 'xlsx' = 'pdf') {
    const downloadPromise = page.waitForEvent('download')
    
    await page.click('[data-testid="export-dashboard"]')
    await expect(page.locator('[data-testid="export-modal"]')).toBeVisible()
    
    await page.selectOption('[data-testid="export-format"]', format)
    await page.click('[data-testid="confirm-export"]')
    
    const download = await downloadPromise
    
    return {
      filename: download.suggestedFilename(),
      path: await download.path()
    }
  },

  /**
   * Verify sync health widget
   */
  async verifySyncHealth(page: Page, expectedData: {
    lastSyncTime?: string
    syncStatus?: 'healthy' | 'warning' | 'error'
    failedSyncs?: number
    averageSyncTime?: string
  }) {
    const syncWidget = page.locator('[data-testid="sync-health-widget"]')
    
    if (expectedData.lastSyncTime !== undefined) {
      const lastSync = await syncWidget.locator('[data-testid="last-sync-time"]').textContent()
      expect(lastSync).toContain(expectedData.lastSyncTime)
    }
    
    if (expectedData.syncStatus !== undefined) {
      const statusIndicator = syncWidget.locator(`[data-testid="sync-status-${expectedData.syncStatus}"]`)
      await expect(statusIndicator).toBeVisible()
    }
    
    if (expectedData.failedSyncs !== undefined) {
      const failedSyncs = await syncWidget.locator('[data-testid="failed-syncs"]').textContent()
      expect(parseInt(failedSyncs || '0')).toBe(expectedData.failedSyncs)
    }
    
    if (expectedData.averageSyncTime !== undefined) {
      const avgSyncTime = await syncWidget.locator('[data-testid="avg-sync-time"]').textContent()
      expect(avgSyncTime).toBe(expectedData.averageSyncTime)
    }
  },

  /**
   * Verify business impact widget
   */
  async verifyBusinessImpact(page: Page, expectedData: {
    revenueGenerated?: string
    costSavings?: string
    timeEfficiency?: string
    memberSatisfaction?: number
  }) {
    const impactWidget = page.locator('[data-testid="business-impact-widget"]')
    
    if (expectedData.revenueGenerated !== undefined) {
      const revenue = await impactWidget.locator('[data-testid="revenue-generated"]').textContent()
      expect(revenue).toBe(expectedData.revenueGenerated)
    }
    
    if (expectedData.costSavings !== undefined) {
      const savings = await impactWidget.locator('[data-testid="cost-savings"]').textContent()
      expect(savings).toBe(expectedData.costSavings)
    }
    
    if (expectedData.timeEfficiency !== undefined) {
      const efficiency = await impactWidget.locator('[data-testid="time-efficiency"]').textContent()
      expect(efficiency).toBe(expectedData.timeEfficiency)
    }
    
    if (expectedData.memberSatisfaction !== undefined) {
      const satisfaction = await impactWidget.locator('[data-testid="member-satisfaction"]').textContent()
      expect(parseFloat(satisfaction || '0')).toBeCloseTo(expectedData.memberSatisfaction, 1)
    }
  },

  /**
   * Filter workflows in performance widget
   */
  async filterWorkflows(page: Page, filters: {
    type?: string
    status?: string
    minExecutions?: number
  }) {
    const performanceWidget = page.locator('[data-testid="workflow-performance-widget"]')
    
    // Open filters
    await performanceWidget.locator('[data-testid="workflow-filters"]').click()
    await expect(performanceWidget.locator('[data-testid="filter-panel"]')).toBeVisible()
    
    if (filters.type) {
      await performanceWidget.locator('[data-testid="filter-type"]').selectOption(filters.type)
    }
    
    if (filters.status) {
      await performanceWidget.locator('[data-testid="filter-status"]').selectOption(filters.status)
    }
    
    if (filters.minExecutions !== undefined) {
      await performanceWidget.locator('[data-testid="filter-min-executions"]').fill(filters.minExecutions.toString())
    }
    
    // Apply filters
    await performanceWidget.locator('[data-testid="apply-workflow-filters"]').click()
    
    // Wait for results to update
    await expect(performanceWidget.locator('[data-testid="loading-indicator"]')).not.toBeVisible()
  },

  /**
   * Drill down into workflow details
   */
  async drillDownWorkflow(page: Page, workflowName: string) {
    const performanceWidget = page.locator('[data-testid="workflow-performance-widget"]')
    const workflowRow = performanceWidget.locator(`[data-testid="workflow-row"]:has-text("${workflowName}")`)
    
    await workflowRow.click()
    
    // Verify navigation to workflow details
    await expect(page).toHaveURL(/\/admin\/workflows\/[^\/]+$/)
    await expect(page.locator('[data-testid="workflow-details"]')).toBeVisible()
  },

  /**
   * Toggle compact view mode
   */
  async toggleCompactView(page: Page, enabled: boolean) {
    await page.click('[data-testid="dashboard-settings"]')
    await expect(page.locator('[data-testid="widget-settings"]')).toBeVisible()
    
    const compactToggle = page.locator('[data-testid="compact-view-toggle"]')
    
    if (enabled) {
      await compactToggle.check()
    } else {
      await compactToggle.uncheck()
    }
    
    await page.click('[data-testid="apply-widget-settings"]')
    
    // Verify compact view state
    const dashboard = page.locator('[data-testid="analytics-dashboard"]')
    if (enabled) {
      await expect(dashboard).toHaveClass(/compact/)
    } else {
      await expect(dashboard).not.toHaveClass(/compact/)
    }
  },

  /**
   * Set up auto-refresh
   */
  async configureAutoRefresh(page: Page, enabled: boolean, interval?: number) {
    await page.click('[data-testid="dashboard-settings"]')
    await expect(page.locator('[data-testid="refresh-settings"]')).toBeVisible()
    
    const autoRefreshToggle = page.locator('[data-testid="auto-refresh-toggle"]')
    
    if (enabled) {
      await autoRefreshToggle.check()
      
      if (interval) {
        await page.selectOption('[data-testid="refresh-interval"]', interval.toString())
      }
    } else {
      await autoRefreshToggle.uncheck()
    }
    
    await page.click('[data-testid="apply-refresh-settings"]')
    
    // Verify auto-refresh indicator
    const refreshIndicator = page.locator('[data-testid="auto-refresh-indicator"]')
    if (enabled) {
      await expect(refreshIndicator).toBeVisible()
    } else {
      await expect(refreshIndicator).not.toBeVisible()
    }
  },

  /**
   * Manual refresh dashboard
   */
  async refreshDashboard(page: Page) {
    await page.click('[data-testid="refresh-dashboard"]')
    
    // Wait for refresh to complete
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible({ timeout: 10000 })
    
    // Verify last updated timestamp changes
    const lastUpdated = await page.locator('[data-testid="last-updated"]').textContent()
    expect(lastUpdated).toBeTruthy()
  },

  /**
   * Verify widget order and layout
   */
  async verifyWidgetLayout(page: Page, expectedOrder: string[]) {
    const widgets = page.locator('[data-testid$="-widget"]')
    const widgetCount = await widgets.count()
    
    expect(widgetCount).toBe(expectedOrder.length)
    
    for (let i = 0; i < expectedOrder.length; i++) {
      const widget = widgets.nth(i)
      const widgetId = await widget.getAttribute('data-testid')
      expect(widgetId).toBe(`${expectedOrder[i]}-widget`)
    }
  },

  /**
   * Search for specific data in widgets
   */
  async searchWidgetData(page: Page, widgetName: string, searchTerm: string) {
    const widget = page.locator(`[data-testid="${widgetName}-widget"]`)
    
    // Look for search input in widget
    const searchInput = widget.locator('[data-testid="widget-search"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill(searchTerm)
      await searchInput.press('Enter')
      
      // Wait for results
      await expect(widget.locator('[data-testid="search-results"]')).toBeVisible()
    }
  },

  /**
   * Compare data across different time periods
   */
  async compareTimePeriods(page: Page, period1: string, period2: string) {
    await page.click('[data-testid="comparison-mode"]')
    await expect(page.locator('[data-testid="comparison-panel"]')).toBeVisible()
    
    // Set first period
    await page.selectOption('[data-testid="period-1-select"]', period1)
    
    // Set second period
    await page.selectOption('[data-testid="period-2-select"]', period2)
    
    // Apply comparison
    await page.click('[data-testid="apply-comparison"]')
    
    // Wait for comparison data to load
    await expect(page.locator('[data-testid="comparison-results"]')).toBeVisible()
    
    // Verify comparison indicators are shown
    await expect(page.locator('[data-testid="comparison-indicator"]')).toBeVisible()
  }
}