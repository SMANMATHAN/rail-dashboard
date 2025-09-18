import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface NetworkCapacityData {
  overall: number;
  zones: {
    id: string;
    name: string;
    capacity: number;
    activeTrains: number;
    maxTrains: number;
    status: 'optimal' | 'busy' | 'congested' | 'critical';
  }[];
  alerts: {
    id: string;
    zone: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

interface NetworkCapacityWidgetProps {
  data: NetworkCapacityData;
}

const NetworkCapacityWidget: React.FC<NetworkCapacityWidgetProps> = ({ data }) => {
  const getCapacityColor = (capacity: number) => {
    if (capacity <= 60) return 'bg-green-500';
    if (capacity <= 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-orange-600 bg-orange-100';
      case 'congested': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return CheckCircle;
      case 'busy': return Clock;
      case 'congested': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Activity;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-orange-500 bg-orange-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Network Capacity</h3>
        </div>
      </div>

      <div className="p-6">
        {/* Overall Capacity */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Network Utilization</span>
            <span className="text-lg font-bold text-gray-900">{data.overall}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getCapacityColor(data.overall)}`}
              style={{ width: `${data.overall}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Zone Details */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Zone Status</h4>
          <div className="space-y-3">
            {data.zones.map((zone) => {
              const StatusIcon = getStatusIcon(zone.status);
              return (
                <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className="w-5 h-5 text-gray-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">{zone.name}</h5>
                      <p className="text-sm text-gray-600">
                        {zone.activeTrains}/{zone.maxTrains} trains active
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(zone.status)}`}>
                      {zone.status.toUpperCase()}
                    </span>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {zone.capacity}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Alerts */}
        {data.alerts.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Capacity Alerts</h4>
            <div className="space-y-2">
              {data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border-l-4 p-3 rounded-r-lg ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{alert.zone}</p>
                      <p className="text-sm text-gray-700">{alert.message}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.alerts.length === 0 && (
          <div className="text-center py-6">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No capacity alerts</p>
            <p className="text-xs text-gray-500">All zones operating within normal parameters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkCapacityWidget;