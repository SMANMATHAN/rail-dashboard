import React from 'react';
import { Train, Clock, AlertTriangle, CheckCircle, TrendingUp, Users, Activity, BarChart3 } from 'lucide-react';
import MetricCard from '../components/common/MetricCard';
import FilterBar from '../components/common/FilterBar';
import TrainTimeline from '../components/operations/TrainTimeline';
import AIRecommendationsPanel from '../components/operations/AIRecommendationsPanel';
import NetworkCapacityWidget from '../components/operations/NetworkCapacityWidget';
import DelayAnalysisChart from '../components/analytics/DelayAnalysisChart';
import PunctualityMetrics from '../components/analytics/PunctualityMetrics';
import DataExportPanel from '../components/export/DataExportPanel';
import LiveRecordingWidget from '../components/insights/LiveRecordingWidget';
import AlertsNotificationSystem from '../components/insights/AlertsNotificationSystem';

const Dashboard: React.FC = () => {
  // Sample data - in real app, this would come from API
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('4h');
  const [delayTimeRange, setDelayTimeRange] = React.useState('7d');

  const kpiData = [
    {
      title: 'Active Trains',
      value: '247',
      icon: Train,
      color: 'blue' as const,
      trend: {
        value: '+12',
        direction: 'up' as const,
        isPositive: true
      }
    },
    {
      title: 'On-Time Performance',
      value: '94.2%',
      icon: Clock,
      color: 'green' as const,
      trend: {
        value: '+2.1%',
        direction: 'up' as const,
        isPositive: true
      }
    },
    {
      title: 'Active Alerts',
      value: '3',
      icon: AlertTriangle,
      color: 'orange' as const,
      trend: {
        value: '-2',
        direction: 'down' as const,
        isPositive: true
      }
    },
    {
      title: 'AI Recommendations',
      value: '156',
      icon: CheckCircle,
      color: 'purple' as const,
      trend: {
        value: '+23',
        direction: 'up' as const,
        isPositive: true
      }
    },
    {
      title: 'Network Throughput',
      value: '247/hr',
      icon: Activity,
      color: 'indigo' as const,
      trend: {
        value: '+8%',
        direction: 'up' as const,
        isPositive: true
      }
    },
    {
      title: 'Avg Delay Reduction',
      value: '18.5min',
      icon: TrendingUp,
      color: 'blue' as const,
      trend: {
        value: '-3.2min',
        direction: 'down' as const,
        isPositive: true
      }
    }
  ];

  const locationOptions = [
    { value: 'all', label: 'All Zones' },
    { value: 'zone-a', label: 'Zone A - Central' },
    { value: 'zone-b', label: 'Zone B - North' },
    { value: 'zone-c', label: 'Zone C - South' },
    { value: 'zone-d', label: 'Zone D - East' },
    { value: 'zone-e', label: 'Zone E - West' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'on-time', label: 'On Time' },
    { value: 'delayed', label: 'Delayed' },
    { value: 'critical', label: 'Critical' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const trainTimelineData = [
    {
      id: '1',
      trainNumber: '12345',
      trainName: 'Rajdhani Express',
      route: 'New Delhi - Mumbai Central',
      currentLocation: 'Junction A',
      nextStation: 'Central Station',
      scheduledTime: '14:30',
      actualTime: '14:30',
      status: 'on-time' as const,
      delay: 0,
      passengers: 450,
      platform: 'P1',
      progress: 65
    },
    {
      id: '2',
      trainNumber: '67890',
      trainName: 'Shatabdi Express',
      route: 'New Delhi - Chandigarh',
      currentLocation: 'Signal B',
      nextStation: 'North Station',
      scheduledTime: '11:20',
      actualTime: '11:25',
      status: 'delayed' as const,
      delay: 5,
      passengers: 320,
      platform: 'P3',
      progress: 45
    },
    {
      id: '3',
      trainNumber: '11111',
      trainName: 'Duronto Express',
      route: 'Mumbai - Kolkata',
      currentLocation: 'Maintenance Zone',
      nextStation: 'East Station',
      scheduledTime: '11:55',
      actualTime: '12:15',
      status: 'critical' as const,
      delay: 20,
      passengers: 380,
      platform: 'P2',
      progress: 30
    }
  ];

  const aiRecommendations = [
    {
      id: '1',
      trainId: '67890',
      trainName: 'Shatabdi Express',
      type: 'reroute' as const,
      priority: 'medium' as const,
      title: 'Reroute via Junction C',
      description: 'Reroute Train 67890 via Junction C to reduce delay by 3 minutes',
      reason: 'Signal failure at Junction B is causing delays. Alternative route via Junction C is clear and will reduce overall delay.',
      impact: 'Reduces delay from 8 minutes to 5 minutes, prevents cascading delays to 2 connecting trains',
      confidence: 92,
      estimatedDelay: -3,
      alternatives: ['Wait at current signal', 'Platform change to P4'],
      timestamp: new Date()
    },
    {
      id: '2',
      trainId: '11111',
      trainName: 'Duronto Express',
      type: 'priority' as const,
      priority: 'high' as const,
      title: 'Grant Priority Access',
      description: 'Grant priority to Train 11111 at next junction due to passenger load',
      reason: 'High passenger load (380 passengers) and connecting services at destination require priority handling.',
      impact: 'Affects 2 connecting trains with 5-minute delays but saves 380 passenger-minutes',
      confidence: 87,
      estimatedDelay: 0,
      alternatives: ['Normal scheduling', 'Delay by 5 minutes'],
      timestamp: new Date()
    }
  ];

  const networkCapacityData = {
    overall: 78,
    zones: [
      {
        id: 'zone-a',
        name: 'Zone A - Central',
        capacity: 85,
        activeTrains: 34,
        maxTrains: 40,
        status: 'busy' as const
      },
      {
        id: 'zone-b',
        name: 'Zone B - North',
        capacity: 65,
        activeTrains: 26,
        maxTrains: 40,
        status: 'optimal' as const
      },
      {
        id: 'zone-c',
        name: 'Zone C - South',
        capacity: 92,
        activeTrains: 37,
        maxTrains: 40,
        status: 'congested' as const
      }
    ],
    alerts: [
      {
        id: '1',
        zone: 'Zone C - South',
        message: 'Approaching capacity limit - consider rerouting new trains',
        severity: 'medium' as const
      }
    ]
  };

  const delayAnalysisData = [
    {
      category: 'Signal Failure',
      count: 23,
      percentage: 35,
      averageDelay: 12,
      trend: 'down' as const,
      color: '#ef4444'
    },
    {
      category: 'Track Maintenance',
      count: 18,
      percentage: 27,
      averageDelay: 8,
      trend: 'stable' as const,
      color: '#f97316'
    },
    {
      category: 'Weather',
      count: 12,
      percentage: 18,
      averageDelay: 15,
      trend: 'up' as const,
      color: '#3b82f6'
    },
    {
      category: 'Technical Issues',
      count: 8,
      percentage: 12,
      averageDelay: 20,
      trend: 'down' as const,
      color: '#8b5cf6'
    },
    {
      category: 'Other',
      count: 5,
      percentage: 8,
      averageDelay: 6,
      trend: 'stable' as const,
      color: '#6b7280'
    }
  ];

  const punctualityData = {
    overall: 94.2,
    byCategory: {
      express: 96.5,
      passenger: 92.8,
      freight: 88.3,
      suburban: 97.1
    },
    monthly: [
      { month: 'Jan', percentage: 92.1 },
      { month: 'Feb', percentage: 93.5 },
      { month: 'Mar', percentage: 94.2 },
      { month: 'Apr', percentage: 95.1 },
      { month: 'May', percentage: 94.8 },
      { month: 'Jun', percentage: 94.2 }
    ],
    targets: {
      express: 95,
      passenger: 90,
      freight: 85,
      suburban: 95
    }
  };

  const alertsData = [
    {
      id: '1',
      type: 'warning' as const,
      title: 'Signal Failure',
      message: 'Signal failure at Junction B - Train 12345 delayed 10 mins',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      source: 'Signal Control',
      acknowledged: false,
      priority: 'high' as const
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'AI Recommendation',
      message: 'AI recommends Platform 3 for Train 67890 arrival',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      source: 'AI System',
      acknowledged: false,
      priority: 'medium' as const
    }
  ];

  const handleClearFilters = () => {
    setSearchValue('');
    setSelectedLocation('all');
    setSelectedStatus('all');
    setDateRange({ start: '', end: '' });
  };

  const handleAcceptRecommendation = (id: string) => {
    console.log('Accepting recommendation:', id);
  };

  const handleRejectRecommendation = (id: string) => {
    console.log('Rejecting recommendation:', id);
  };

  const handleViewAlternatives = (id: string) => {
    console.log('Viewing alternatives for:', id);
  };

  const handleExport = async (options: any) => {
    console.log('Exporting data with options:', options);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleRecordingComplete = (session: any) => {
    console.log('Recording completed:', session);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    console.log('Acknowledging alert:', alertId);
  };

  const handleDismissAlert = (alertId: string) => {
    console.log('Dismissing alert:', alertId);
  };

  const handleClearAllAlerts = () => {
    console.log('Clearing all alerts');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Train Management Dashboard</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <AlertsNotificationSystem
            alerts={alertsData}
            onAcknowledge={handleAcknowledgeAlert}
            onDismiss={handleDismissAlert}
            onClearAll={handleClearAllAlerts}
          />
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span>System Online</span>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        locationOptions={locationOptions}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        statusOptions={statusOptions}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onClearFilters={handleClearFilters}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => (
          <MetricCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* OPERATIONS Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">Operations</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Train Timeline - Takes 2 columns */}
          <div className="lg:col-span-2">
            <TrainTimeline
              trains={trainTimelineData}
              selectedTimeRange={selectedTimeRange}
              onTimeRangeChange={setSelectedTimeRange}
            />
          </div>

          {/* AI Recommendations Panel */}
          <div>
            <AIRecommendationsPanel
              recommendations={aiRecommendations}
              onAccept={handleAcceptRecommendation}
              onReject={handleRejectRecommendation}
              onViewAlternatives={handleViewAlternatives}
            />
          </div>
        </div>

        {/* Network Capacity */}
        <NetworkCapacityWidget data={networkCapacityData} />
      </div>

      {/* ANALYTICS Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">Analytics</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delay Analysis Chart */}
          <DelayAnalysisChart
            data={delayAnalysisData}
            timeRange={delayTimeRange}
            onTimeRangeChange={setDelayTimeRange}
          />
          
          {/* Punctuality Metrics */}
          <PunctualityMetrics data={punctualityData} />
        </div>
      </div>

      {/* AI INSIGHTS & DATA EXPORT Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">AI Insights & Data Export</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Recording Widget */}
          <LiveRecordingWidget onRecordingComplete={handleRecordingComplete} />
          
          {/* Data Export Panel */}
          <DataExportPanel onExport={handleExport} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;