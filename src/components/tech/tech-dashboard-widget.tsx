/**
 * TECH Clean California Dashboard Widget
 * 
 * Dashboard widget component for displaying TECH program metrics and status
 * within the NAMC member portal. Provides quick overview of projects,
 * incentives, and important deadlines.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Calendar,
  Users,
  BarChart3,
  ArrowRight,
  Zap
} from 'lucide-react';

interface TechDashboardData {
  summary: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalIncentives: number;
    averageProcessingTime: number;
    successRate: number;
  };
  projectsByStatus: Record<string, number>;
  projectsByUtility: Record<string, number>;
  recentActivity: Array<{
    id: string;
    projectId: string;
    status: string;
    updatedAt: string;
    type: string;
  }>;
  upcomingDeadlines: Array<{
    type: string;
    projectId: string;
    description: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  performanceMetrics: {
    complianceScore: number;
    customerSatisfaction: number;
    documentationScore: number;
    timeToCompletion: number;
  };
}

interface TechDashboardWidgetProps {
  className?: string;
  showFullDetails?: boolean;
}

const statusColors = {
  'inquiry': 'bg-blue-100 text-blue-800',
  'agreement_pending': 'bg-yellow-100 text-yellow-800',
  'agreement_signed': 'bg-green-100 text-green-800',
  'installation_scheduled': 'bg-purple-100 text-purple-800',
  'installation_in_progress': 'bg-orange-100 text-orange-800',
  'installation_complete': 'bg-teal-100 text-teal-800',
  'documentation_pending': 'bg-amber-100 text-amber-800',
  'documentation_complete': 'bg-emerald-100 text-emerald-800',
  'quality_review': 'bg-indigo-100 text-indigo-800',
  'incentive_submitted': 'bg-cyan-100 text-cyan-800',
  'incentive_approved': 'bg-lime-100 text-lime-800',
  'payment_processed': 'bg-green-100 text-green-800',
  'project_complete': 'bg-green-200 text-green-900',
  'cancelled': 'bg-red-100 text-red-800',
  'on_hold': 'bg-gray-100 text-gray-800'
};

const utilityNames = {
  'pge': 'PG&E',
  'sce': 'SCE',
  'sdge': 'SDG&E',
  'smud': 'SMUD',
  'ladwp': 'LADWP',
  'other': 'Other'
};

export function TechDashboardWidget({ className = '', showFullDetails = false }: TechDashboardWidgetProps) {
  const [data, setData] = useState<TechDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tech/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">TECH Program Dashboard</h3>
          <p className="text-gray-600">No TECH program data available.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">TECH Clean California</h2>
            <p className="text-sm text-gray-600">Heat Pump Incentive Program</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalProjects}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600">{data.summary.activeProjects} active</span>
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-gray-600">{data.summary.completedProjects} complete</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Incentives</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalIncentives)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">
              Avg: {formatCurrency(data.summary.totalProjects > 0 ? data.summary.totalIncentives / data.summary.totalProjects : 0)}
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Processing</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.averageProcessingTime}d</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-2">
            <Progress value={Math.max(0, 100 - (data.summary.averageProcessingTime / 60) * 100)} className="h-2" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.successRate.toFixed(1)}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2">
            <Progress value={data.summary.successRate} className="h-2" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
          <div className="space-y-3">
            {Object.entries(data.projectsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={(statusColors as any)[status] || 'bg-gray-100 text-gray-800'}>
                    {getStatusLabel(status)}
                  </Badge>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {data.upcomingDeadlines.length > 0 ? (
              data.upcomingDeadlines.slice(0, 5).map((deadline, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getPriorityColor(deadline.priority)}`}>
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {deadline.projectId}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {deadline.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {formatDate(deadline.dueDate)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No upcoming deadlines</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Compliance Score</span>
              <span className="text-sm font-bold text-gray-900">
                {(data.performanceMetrics.complianceScore * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={data.performanceMetrics.complianceScore * 100} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Customer Satisfaction</span>
              <span className="text-sm font-bold text-gray-900">
                {data.performanceMetrics.customerSatisfaction.toFixed(1)}/5.0
              </span>
            </div>
            <Progress value={(data.performanceMetrics.customerSatisfaction / 5) * 100} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Documentation Score</span>
              <span className="text-sm font-bold text-gray-900">
                {(data.performanceMetrics.documentationScore * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={data.performanceMetrics.documentationScore * 100} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Avg Completion</span>
              <span className="text-sm font-bold text-gray-900">
                {data.performanceMetrics.timeToCompletion}d
              </span>
            </div>
            <Progress value={Math.max(0, 100 - (data.performanceMetrics.timeToCompletion / 60) * 100)} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start h-auto p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">New Project</p>
                <p className="text-sm text-gray-600">Start TECH project</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
          
          <Button variant="outline" className="justify-start h-auto p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Enroll in TECH</p>
                <p className="text-sm text-gray-600">Join the program</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
          
          <Button variant="outline" className="justify-start h-auto p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">View Analytics</p>
                <p className="text-sm text-gray-600">Detailed reports</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
        </div>
      </Card>
    </div>
  );
}