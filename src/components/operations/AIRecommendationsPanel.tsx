import React, { useState } from 'react';
import { Brain, CheckCircle, XCircle, Clock, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface AIRecommendation {
  id: string;
  trainId: string;
  trainName: string;
  type: 'reroute' | 'halt' | 'priority' | 'platform_change' | 'speed_adjustment';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reason: string;
  impact: string;
  confidence: number;
  estimatedDelay: number;
  alternatives: string[];
  timestamp: Date;
}

interface chan {
  recommendations: AIRecommendation[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onViewAlternatives: (id: string) => void;
}

const AIRecommendationsPanel: React.FC<AIRecommendationsPanelProps> = ({
  recommendations,
  onAccept,
  onReject,
  onViewAlternatives
}) => {
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reroute': return '🔄';
      case 'halt': return '⏸️';
      case 'priority': return '⚡';
      case 'platform_change': return '🚉';
      case 'speed_adjustment': return '⚡';
      default: return '📋';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-semibold leading-tight text-gray-900">AI Recommendations</h3>
          <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
            {recommendations.length} Active
          </span>
        </div>
      </div>

      <div className="p-6">
        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 text-lg font-medium">All systems optimal</p>
            <p className="text-gray-500 text-sm">No AI recommendations at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Recommendation Header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="text-2xl">{getTypeIcon(recommendation.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{recommendation.title}</h4>
                        <span className={`px-2 py-1 text-xxs md:text-xs font-semibold rounded-full border whitespace-nowrap ${getPriorityColor(recommendation.priority)}`}>
                          {recommendation.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1 truncate">
                        Train {recommendation.trainId} - {recommendation.trainName}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">{recommendation.description}</p>
                    </div>
                  </div>
                  <div className="text-right self-center shrink-0">
                    <div className={`text-sm font-semibold ${getConfidenceColor(recommendation.confidence)}`}>
                      {recommendation.confidence}% confidence
                    </div>
                    <div className="text-xs text-gray-500">
                      {recommendation.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Impact:</span>
                    <span className="font-semibold text-gray-900 truncate">
                      {recommendation.estimatedDelay > 0 
                        ? `+${recommendation.estimatedDelay}min delay`
                        : `${Math.abs(recommendation.estimatedDelay)}min saved`
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {recommendation.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center flex-wrap gap-2">
                  <button
                    onClick={() => setExpandedRecommendation(
                      expandedRecommendation === recommendation.id ? null : recommendation.id
                    )}
                    className="inline-flex h-9 items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <span>View Details</span>
                    {expandedRecommendation === recommendation.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => onViewAlternatives(recommendation.id)}
                      className="inline-flex h-9 items-center px-3 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      Alternatives
                    </button>
                    <button
                      onClick={() => onReject(recommendation.id)}
                      className="inline-flex h-9 items-center space-x-1 px-3 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => onAccept(recommendation.id)}
                      className="inline-flex h-9 items-center space-x-1 px-3 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRecommendation === recommendation.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">Reasoning</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{recommendation.reason}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">Expected Impact</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{recommendation.impact}</p>
                      </div>
                      {recommendation.alternatives.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Alternative Options</h5>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {recommendation.alternatives.map((alt, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                <span className="break-words">{alt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendationsPanel;