import React from 'react';
import { Clock, TrendingUp, Target, Award } from 'lucide-react';

interface PunctualityData {
  overall: number;
  byCategory: {
    express: number;
    passenger: number;
    freight: number;
    suburban: number;
  };
  monthly: {
    month: string;
    percentage: number;
  }[];
  targets: {
    express: number;
    passenger: number;
    freight: number;
    suburban: number;
  };
}

interface PunctualityMetricsProps {
  data: PunctualityData;
}

const PunctualityMetrics: React.FC<PunctualityMetricsProps> = ({ data }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'express': return 'bg-blue-500';
      case 'passenger': return 'bg-green-500';
      case 'freight': return 'bg-orange-500';
      case 'suburban': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'express': return '🚄';
      case 'passenger': return '🚂';
      case 'freight': return '🚛';
      case 'suburban': return '🚇';
      default: return '🚂';
    }
  };

  const getPerformanceColor = (actual: number, target: number) => {
    const percentage = (actual / target) * 100;
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 85) return 'text-orange-600';
    return 'text-red-600';
  };

  const categories = [
    { key: 'express', name: 'Express Trains', icon: '🚄' },
    { key: 'passenger', name: 'Passenger Trains', icon: '🚂' },
    { key: 'freight', name: 'Freight Trains', icon: '🚛' },
    { key: 'suburban', name: 'Suburban Trains', icon: '🚇' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-900">Punctuality Metrics</h3>
        </div>
      </div>

      <div className="p-6">
        {/* Overall Punctuality */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-green-600 mb-2">{data.overall}%</div>
            <p className="text-gray-600">Overall On-Time Performance</p>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${data.overall}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0%</span>
            <span>Target: 95%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Performance by Category</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => {
              const actual = data.byCategory[category.key as keyof typeof data.byCategory];
              const target = data.targets[category.key as keyof typeof data.targets];
              const achievement = (actual / target) * 100;
              
              return (
                <div key={category.key} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getPerformanceColor(actual, target)}`}>
                        {actual}%
                      </div>
                      <div className="text-xs text-gray-500">Target: {target}%</div>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Achievement</span>
                      <span className={`font-medium ${getPerformanceColor(actual, target)}`}>
                        {Math.round(achievement)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getCategoryColor(category.key)}`}
                        style={{ width: `${Math.min(achievement, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {achievement >= 95 && (
                    <div className="flex items-center space-x-1 text-green-600 text-sm">
                      <Award className="w-4 h-4" />
                      <span>Target Achieved</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trend */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Monthly Trend</h4>
          <div className="space-y-3">
            {data.monthly.map((month, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm font-medium text-gray-700">{month.month}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          month.percentage >= 95 ? 'bg-green-500' :
                          month.percentage >= 85 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${month.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12">
                      {month.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">95%</div>
              <div className="text-sm text-gray-600">Target OTP</div>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-600">+2.3%</div>
              <div className="text-sm text-gray-600">vs Last Month</div>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">3/4</div>
              <div className="text-sm text-gray-600">Categories on Target</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PunctualityMetrics;