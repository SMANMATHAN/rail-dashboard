import React, { useState, useEffect } from 'react';
import { Train, Clock, AlertTriangle, CheckCircle, X, Play, Pause } from 'lucide-react';

interface TrainSchedule {
  id: string;
  name: string;
  status: 'on_time' | 'delayed' | 'critical';
  currentLocation: string;
  nextStation: string;
  eta: string;
  platform: string;
  passengers: number;
  delay: number;
}

interface AIRecommendation {
  id: string;
  trainId: string;
  type: 'reroute' | 'halt' | 'priority' | 'platform_change';
  message: string;
  confidence: number;
  alternatives: string[];
  impact: string;
}

const LiveOperations: React.FC = () => {
  const [trains, setTrains] = useState<TrainSchedule[]>([
    {
      id: '12345',
      name: 'Rajdhani Express',
      status: 'on_time',
      currentLocation: 'Junction A',
      nextStation: 'Central Station',
      eta: '10:45',
      platform: 'P1',
      passengers: 450,
      delay: 0
    },
    {
      id: '67890',
      name: 'Shatabdi Express',
      status: 'delayed',
      currentLocation: 'Signal B',
      nextStation: 'North Station',
      eta: '11:25',
      platform: 'P3',
      passengers: 320,
      delay: 5
    },
    {
      id: '11111',
      name: 'Duronto Express',
      status: 'critical',
      currentLocation: 'Maintenance Zone',
      nextStation: 'East Station',
      eta: '12:15',
      platform: 'P2',
      passengers: 380,
      delay: 20
    }
  ]);

  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([
    {
      id: '1',
      trainId: '67890',
      type: 'reroute',
      message: 'Reroute Train 67890 via Junction C to reduce delay by 3 minutes',
      confidence: 92,
      alternatives: ['Wait at current signal', 'Platform change to P4'],
      impact: 'Reduces overall network delay by 8 minutes'
    },
    {
      id: '2',
      trainId: '11111',
      type: 'priority',
      message: 'Grant priority to Train 11111 at next junction due to passenger load',
      confidence: 87,
      alternatives: ['Normal scheduling', 'Delay by 5 minutes'],
      impact: 'Affects 2 connecting trains, saves 380 passenger minutes'
    }
  ]);

  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (isPlaying) {
        setTrains(prev => prev.map(train => ({
          ...train,
          eta: updateETA(train.eta),
          delay: Math.max(0, train.delay + (Math.random() > 0.8 ? 1 : 0))
        })));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const updateETA = (currentETA: string): string => {
    // Simple ETA update simulation
    const [hours, minutes] = currentETA.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const newTotalMinutes = totalMinutes + 1;
    const newHours = Math.floor(newTotalMinutes / 60);
    const newMinutes = newTotalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_time': return 'text-green-600 bg-green-100';
      case 'delayed': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleAcceptRecommendation = (recommendation: AIRecommendation) => {
    // Simulate accepting recommendation
    setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
    // Update train status based on recommendation
    setTrains(prev => prev.map(train => 
      train.id === recommendation.trainId 
        ? { ...train, status: 'on_time' as const, delay: Math.max(0, train.delay - 5) }
        : train
    ));
    setSelectedRecommendation(null);
  };

  const handleRejectRecommendation = (recommendation: AIRecommendation) => {
    setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
    setSelectedRecommendation(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Live Operations</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isPlaying ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
            } text-white transition-colors`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>
          <div className="text-sm text-gray-600">
            Last Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System Normal</span>
            </div>
            <div className="text-sm text-gray-600">
              Network Capacity: <span className="font-medium">78%</span>
            </div>
            <div className="text-sm text-gray-600">
              Active Conflicts: <span className="font-medium text-red-600">0</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            AI Confidence: <span className="font-medium">94%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Train Timeline */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Live Train Schedule</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {trains.map((train) => (
                <div key={train.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Train className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{train.name}</h4>
                        <p className="text-sm text-gray-600">Train {train.id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(train.status)}`}>
                      {train.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current Location</p>
                      <p className="font-medium">{train.currentLocation}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Next Station</p>
                      <p className="font-medium">{train.nextStation}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">ETA</p>
                      <p className="font-medium">{train.eta}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Platform</p>
                      <p className="font-medium">{train.platform}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {train.passengers} passengers
                    </span>
                    {train.delay > 0 && (
                      <span className="text-sm text-red-600 font-medium">
                        +{train.delay} min delay
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <div key={recommendation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-xs font-medium text-gray-600">
                        Train {recommendation.trainId}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {recommendation.confidence}% confidence
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 mb-3">{recommendation.message}</p>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-gray-600 font-medium">Impact:</p>
                    <p className="text-xs text-gray-600">{recommendation.impact}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptRecommendation(recommendation)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => setSelectedRecommendation(recommendation)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                    >
                      Alternatives
                    </button>
                    <button
                      onClick={() => handleRejectRecommendation(recommendation)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {recommendations.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">All systems optimal</p>
                  <p className="text-xs text-gray-500">No recommendations at this time</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Options Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Alternative Options</h3>
              <button
                onClick={() => setSelectedRecommendation(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current Recommendation:</p>
              <p className="text-sm font-medium">{selectedRecommendation.message}</p>
            </div>
            
            <div className="space-y-2 mb-6">
              <p className="text-sm font-medium text-gray-900">Alternatives:</p>
              {selectedRecommendation.alternatives.map((alt, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="radio" name="alternative" id={`alt-${index}`} className="w-4 h-4 text-blue-600" />
                  <label htmlFor={`alt-${index}`} className="text-sm text-gray-700">{alt}</label>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleAcceptRecommendation(selectedRecommendation)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Apply Selected
              </button>
              <button
                onClick={() => setSelectedRecommendation(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveOperations;