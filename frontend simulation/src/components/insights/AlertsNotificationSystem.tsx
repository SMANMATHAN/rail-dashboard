import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, X, Settings, Volume2, VolumeX } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  acknowledged: boolean;
  priority: 'high' | 'medium' | 'low';
  actions?: {
    label: string;
    action: () => void;
  }[];
}

interface AlertsNotificationSystemProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  onClearAll: () => void;
}

const AlertsNotificationSystem: React.FC<AlertsNotificationSystemProps> = ({
  alerts,
  onAcknowledge,
  onDismiss,
  onClearAll
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [newAlertCount, setNewAlertCount] = useState(0);

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const criticalAlerts = alerts.filter(alert => alert.type === 'critical' && !alert.acknowledged);

  useEffect(() => {
    setNewAlertCount(unacknowledgedAlerts.length);
  }, [unacknowledgedAlerts.length]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50 text-red-800';
      case 'warning': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'info': return 'border-blue-500 bg-blue-50 text-blue-800';
      case 'success': return 'border-green-500 bg-green-50 text-green-800';
      default: return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterType === 'all') return true;
    if (filterType === 'unacknowledged') return !alert.acknowledged;
    return alert.type === filterType;
  });

  const playNotificationSound = () => {
    if (soundEnabled) {
      // In a real app, this would play an actual sound
      console.log('🔔 Alert notification sound');
    }
  };

  useEffect(() => {
    if (criticalAlerts.length > 0) {
      playNotificationSound();
    }
  }, [criticalAlerts.length]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {newAlertCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {newAlertCount > 9 ? '9+' : newAlertCount}
          </span>
        )}
      </button>

      {/* Critical Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          {criticalAlerts.slice(0, 3).map((alert) => {
            const Icon = getAlertIcon(alert.type);
            return (
              <div
                key={alert.id}
                className="mb-2 p-4 bg-red-600 text-white rounded-lg shadow-lg border-l-4 border-red-800 animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Icon className="w-5 h-5 mt-0.5" />
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm opacity-90">{alert.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="text-white hover:bg-red-700 p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alerts Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-40">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                  title={soundEnabled ? 'Disable sound' : 'Enable sound'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'unacknowledged', label: 'New' },
                { key: 'critical', label: 'Critical' },
                { key: 'warning', label: 'Warning' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    filterType === filter.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">No alerts</p>
                <p className="text-sm text-gray-400">All systems operating normally</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredAlerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type);
                  return (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border-l-4 ${getAlertColor(alert.type)} ${
                        !alert.acknowledged ? 'shadow-sm' : 'opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start space-x-2">
                          <Icon className="w-4 h-4 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-sm">{alert.title}</h4>
                              <span className={`px-1 py-0.5 text-xs rounded ${getPriorityColor(alert.priority)}`}>
                                {alert.priority}
                              </span>
                            </div>
                            <p className="text-sm opacity-90">{alert.message}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs opacity-75">
                                {alert.source} • {alert.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onDismiss(alert.id)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 mt-2">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => onAcknowledge(alert.id)}
                            className="text-xs bg-white bg-opacity-50 hover:bg-opacity-75 px-2 py-1 rounded transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                        {alert.actions?.map((action, index) => (
                          <button
                            key={index}
                            onClick={action.action}
                            className="text-xs bg-white bg-opacity-50 hover:bg-opacity-75 px-2 py-1 rounded transition-colors"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {filteredAlerts.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={onClearAll}
                className="w-full text-sm text-gray-600 hover:text-gray-800 py-2"
              >
                Clear All Alerts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertsNotificationSystem;