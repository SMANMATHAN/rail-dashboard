import React from 'react';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'on-time' | 'delayed' | 'critical' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  size = 'md', 
  showText = true 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'on-time':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: 'On Time',
          dotColor: 'bg-green-500'
        };
      case 'delayed':
        return {
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          text: 'Delayed',
          dotColor: 'bg-orange-500'
        };
      case 'critical':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: 'Critical',
          dotColor: 'bg-red-500'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: 'Cancelled',
          dotColor: 'bg-gray-500'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: 'Unknown',
          dotColor: 'bg-gray-500'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`${config.dotColor} ${dotSizeClasses[size]} rounded-full animate-pulse`}></div>
      <Icon className={`${sizeClasses[size]} ${config.color}`} />
      {showText && (
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;