import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, Train, Users, AlertTriangle } from 'lucide-react';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const kpiData = [
    {
      title: 'On-Time Performance',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: Clock,
      color: 'text-green-600'
    },
    {
      title: 'Average Delay Reduction',
      value: '18.5min',
      change: '-3.2min',
      trend: 'up',
      icon: TrendingDown,
      color: 'text-blue-600'
    },
    {
      title: 'AI Acceptance Rate',
      value: '87.3%',
      change: '+5.4%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Network Throughput',
      value: '247/hr',
      change: '+12%',
      trend: 'up',
      icon: Train,
      color: 'text-orange-600'
    },
    {
      title: 'Passenger Impact',
      value: '12.5k',
      change: '+8.7%',
      trend: 'up',
      icon: Users,
      color: 'text-indigo-600'
    },
    {
      title: 'Critical Alerts',
      value: '3',
      change: '-67%',
      trend: 'up',
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  const trafficData = [
    { hour: '06:00', trains: 15, delays: 2 },
    { hour: '07:00', trains: 28, delays: 4 },
    { hour: '08:00', trains: 42, delays: 6 },
    { hour: '09:00', trains: 35, delays: 3 },
    { hour: '10:00', trains: 31, delays: 2 },
    { hour: '11:00', trains: 29, delays: 1 },
    { hour: '12:00', trains: 33, delays: 3 },
    { hour: '13:00', trains: 38, delays: 5 },
    { hour: '14:00', trains: 45, delays: 7 },
    { hour: '15:00', trains: 41, delays: 4 },
    { hour: '16:00', trains: 39, delays: 3 },
    { hour: '17:00', trains: 44, delays: 6 },
    { hour: '18:00', trains: 48, delays: 8 },
    { hour: '19:00', trains: 42, delays: 5 },
    { hour: '20:00', trains: 36, delays: 3 },
    { hour: '21:00', trains: 28, delays: 2 }
  ];

  const trainTypeData = [
    { type: 'Express', count: 145, onTime: 96, delayed: 49 },
    { type: 'Passenger', count: 89, onTime: 82, delayed: 7 },
    { type: 'Freight', count: 67, onTime: 58, delayed: 9 },
    { type: 'Suburban', count: 234, onTime: 221, delayed: 13 }
  ];

  const delayReasons = [
    { reason: 'Signal Failure', count: 23, percentage: 35 },
    { reason: 'Track Maintenance', count: 18, percentage: 27 },
    { reason: 'Weather', count: 12, percentage: 18 },
    { reason: 'Technical Issues', count: 8, percentage: 12 },
    { reason: 'Other', count: 5, percentage: 8 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                  <div className="flex items-center mt-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change} vs last period
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Traffic Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Hourly Traffic & Delays</h3>
            <p className="text-sm text-gray-600 mt-1">Train volume and delay patterns throughout the day</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {trafficData.map((data, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 text-sm text-gray-600 font-mono">{data.hour}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{data.trains} trains</span>
                      <span className="text-sm text-red-600">{data.delays} delayed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(data.trains / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Train Type Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Performance by Train Type</h3>
            <p className="text-sm text-gray-600 mt-1">On-time performance across different train categories</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {trainTypeData.map((data, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{data.type}</span>
                    <span className="text-sm text-gray-600">{data.count} trains</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500"
                        style={{ width: `${(data.onTime / data.count) * 100}%` }}
                      ></div>
                      <div
                        className="bg-red-500"
                        style={{ width: `${(data.delayed / data.count) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-600">
                    <span>{Math.round((data.onTime / data.count) * 100)}% on-time</span>
                    <span>{Math.round((data.delayed / data.count) * 100)}% delayed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delay Reasons */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Delay Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">Root causes of delays in the network</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {delayReasons.map((reason, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-32 text-sm font-medium text-gray-900">{reason.reason}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{reason.count} incidents</span>
                      <span className="text-sm font-medium">{reason.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${reason.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Performance Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">AI Performance</h3>
            <p className="text-sm text-gray-600 mt-1">System optimization metrics</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Decision Accuracy</span>
                <span className="text-lg font-bold text-green-600">94.8%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.8%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Response Time</span>
                <span className="text-lg font-bold text-blue-600">1.2s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Conflict Prevention</span>
                <span className="text-lg font-bold text-purple-600">99.1%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '99.1%' }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Last 24 Hours:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Recommendations</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accepted</span>
                  <span className="font-medium text-green-600">136</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Modified</span>
                  <span className="font-medium text-orange-600">15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejected</span>
                  <span className="font-medium text-red-600">5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Health & Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <h4 className="font-medium text-gray-900">AI Engine</h4>
              <p className="text-sm text-green-600">Optimal</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <h4 className="font-medium text-gray-900">Database</h4>
              <p className="text-sm text-green-600">Connected</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <h4 className="font-medium text-gray-900">Real-time Data</h4>
              <p className="text-sm text-green-600">Syncing</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
              <h4 className="font-medium text-gray-900">Signal Network</h4>
              <p className="text-sm text-orange-600">Maintenance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;