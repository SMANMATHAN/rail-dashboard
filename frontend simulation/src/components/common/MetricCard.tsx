import React from 'react';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down';
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  size = 'md',
  description
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600',
    green: 'bg-green-500 text-green-600',
    orange: 'bg-orange-500 text-orange-600',
    red: 'bg-red-500 text-red-600',
    purple: 'bg-purple-500 text-purple-600',
    indigo: 'bg-indigo-500 text-indigo-600'
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${sizeClasses[size]} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`${valueSizeClasses[size]} font-bold text-gray-900 mb-2`}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              {trend.direction === 'up' ? (
                <TrendingUp className={`w-4 h-4 mr-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
              ) : (
                <TrendingDown className={`w-4 h-4 mr-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
              )}
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;