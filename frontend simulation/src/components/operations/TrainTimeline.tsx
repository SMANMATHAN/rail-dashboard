import React, { useState } from 'react';
import { Train, Clock, MapPin, Users, AlertTriangle } from 'lucide-react';
import StatusIndicator from '../common/StatusIndicator';

interface TrainTimelineItem {
  id: string;
  trainNumber: string;
  trainName: string;
  route: string;
  currentLocation: string;
  nextStation: string;
  scheduledTime: string;
  actualTime: string;
  status: 'on-time' | 'delayed' | 'critical' | 'cancelled';
  delay: number;
  passengers: number;
  platform: string;
  progress: number; // 0-100
}

interface TrainTimelineProps {
  trains: TrainTimelineItem[];
  selectedTimeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const TrainTimeline: React.FC<TrainTimelineProps> = ({
  trains,
  selectedTimeRange,
  onTimeRangeChange
}) => {
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);

  const timeRanges = [
    { value: '1h', label: 'Next Hour' },
    { value: '4h', label: 'Next 4 Hours' },
    { value: '8h', label: 'Next 8 Hours' },
    { value: '24h', label: 'Next 24 Hours' }
  ];

  const getDelayColor = (delay: number) => {
    if (delay === 0) return 'text-green-600';
    if (delay <= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'bg-green-500';
      case 'delayed': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Train className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Live Train Timeline</h3>
          </div>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={selectedTimeRange}
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
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {trains.map((train) => (
            <div
              key={train.id}
              className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                selectedTrain === train.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTrain(selectedTrain === train.id ? null : train.id)}
            >
              {/* Train Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Train className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {train.trainNumber} - {train.trainName}
                      </h4>
                      <p className="text-sm text-gray-600">{train.route}</p>
                    </div>
                  </div>
                </div>
                <StatusIndicator status={train.status} />
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Journey Progress</span>
                  <span className="text-sm text-gray-600">{train.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(train.status)}`}
                    style={{ width: `${train.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Train Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-gray-600">Current</p>
                    <p className="font-medium text-gray-900">{train.currentLocation}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-gray-600">Next Station</p>
                    <p className="font-medium text-gray-900">{train.nextStation}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-gray-600">ETA</p>
                    <p className="font-medium text-gray-900">{train.actualTime}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-gray-600">Passengers</p>
                    <p className="font-medium text-gray-900">{train.passengers}</p>
                  </div>
                </div>
              </div>

              {/* Delay Information */}
              {train.delay > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className={`text-sm font-medium ${getDelayColor(train.delay)}`}>
                      Delayed by {train.delay} minutes
                    </span>
                    <span className="text-sm text-gray-500">
                      • Platform {train.platform}
                    </span>
                  </div>
                </div>
              )}

              {/* Expanded Details */}
              {selectedTrain === train.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Scheduled Time</p>
                      <p className="text-gray-600">{train.scheduledTime}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Platform</p>
                      <p className="text-gray-600">{train.platform}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Route Details</p>
                      <p className="text-gray-600">{train.route}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {trains.length === 0 && (
          <div className="text-center py-12">
            <Train className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No trains in selected time range</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or time range</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainTimeline;