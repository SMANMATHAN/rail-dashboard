import React, { useState } from 'react';
import { BarChart3, TrendingDown, Clock, AlertTriangle } from 'lucide-react';

interface DelayData {
  category: string;
  count: number;
  percentage: number;
  averageDelay: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface DelayAnalysisChartProps {
  data: DelayData[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const DelayAnalysisChart: React.FC<DelayAnalysisChartProps> = ({
  data,
  timeRange,
  onTimeRangeChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingDown className="w-4 h-4 text-red-500 rotate-180" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-900">Delay Analysis</h3>
          </div>
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6">
        {/* Chart */}
        <div className="space-y-4 mb-6">
          {data.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedCategory === item.category
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory(
                selectedCategory === item.category ? null : item.category
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <h4 className="font-medium text-gray-900">{item.category}</h4>
                  {getTrendIcon(item.trend)}
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{item.count}</span>
                  <span className="text-sm text-gray-600 ml-1">incidents</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Frequency</span>
                  <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(item.count / maxCount) * 100}%`,
                      backgroundColor: item.color 
                    }}
                  ></div>
                </div>
              </div>

              {/* Average Delay */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Average Delay</span>
                <span className="font-medium text-gray-900">{item.averageDelay} minutes</span>
              </div>

              {/* Expanded Details */}
              {selectedCategory === item.category && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Total Impact</p>
                      <p className="font-medium text-gray-900">
                        {(item.count * item.averageDelay).toLocaleString()} minutes
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Trend</p>
                      <p className={`font-medium ${
                        item.trend === 'up' ? 'text-red-600' :
                        item.trend === 'down' ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        {item.trend === 'up' ? 'Increasing' :
                         item.trend === 'down' ? 'Decreasing' :
                         'Stable'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {data.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Incidents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(data.reduce((sum, item) => sum + item.averageDelay, 0) / data.length)}
            </div>
            <div className="text-sm text-gray-600">Avg Delay (min)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {data.reduce((sum, item) => sum + (item.count * item.averageDelay), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Impact (min)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelayAnalysisChart;