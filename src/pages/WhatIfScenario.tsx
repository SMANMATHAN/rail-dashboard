import React, { useState } from 'react';
import { Play, RotateCcw, Download, AlertTriangle } from 'lucide-react';

interface Scenario {
  trainId: string;
  trainName: string;
  delay: number;
  reroute: string;
  platformChange: string;
}

interface SimulationResult {
  impactedTrains: number;
  totalDelay: number;
  conflictsDetected: number;
  recommendation: string;
  cascadeEffects: Array<{
    trainId: string;
    trainName: string;
    additionalDelay: number;
    reason: string;
  }>;
}

const WhatIfScenario: React.FC = () => {
  const [scenario, setScenario] = useState<Scenario>({
    trainId: '',
    trainName: '',
    delay: 0,
    reroute: '',
    platformChange: ''
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const trainOptions = [
    { id: '12345', name: 'Rajdhani Express' },
    { id: '67890', name: 'Shatabdi Express' },
    { id: '11111', name: 'Duronto Express' },
    { id: '22222', name: 'Garib Rath' },
    { id: '33333', name: 'Jan Shatabdi' }
  ];

  const platformOptions = ['P1', 'P2', 'P3', 'P4', 'P5'];
  const routeOptions = ['Route A', 'Route B', 'Route C', 'Bypass Route'];

  const runSimulation = async () => {
    if (!scenario.trainId) return;
    
    setIsSimulating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock simulation results
    const mockResult: SimulationResult = {
      impactedTrains: Math.floor(Math.random() * 5) + 1,
      totalDelay: scenario.delay + Math.floor(Math.random() * 10),
      conflictsDetected: Math.floor(Math.random() * 3),
      recommendation: `Optimize ${scenario.trainName} scheduling with ${scenario.delay > 15 ? 'priority routing' : 'standard protocol'}`,
      cascadeEffects: [
        {
          trainId: '67890',
          trainName: 'Shatabdi Express',
          additionalDelay: Math.floor(Math.random() * 8) + 2,
          reason: 'Platform conflict resolved by delay'
        },
        {
          trainId: '11111',
          trainName: 'Duronto Express',
          additionalDelay: Math.floor(Math.random() * 5) + 1,
          reason: 'Junction priority adjustment'
        }
      ]
    };
    
    setSimulationResult(mockResult);
    setIsSimulating(false);
  };

  const resetScenario = () => {
    setScenario({
      trainId: '',
      trainName: '',
      delay: 0,
      reroute: '',
      platformChange: ''
    });
    setSimulationResult(null);
  };

  const exportResults = () => {
    if (!simulationResult) return;
    
    const data = {
      scenario,
      results: simulationResult,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario_${scenario.trainId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">What-If Scenario Planning</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={resetScenario}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          {simulationResult && (
            <button
              onClick={exportResults}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Scenario Configuration</h3>
            <p className="text-sm text-gray-600 mt-1">Configure disruption parameters and simulate impact</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Train Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Train</label>
              <select
                value={scenario.trainId}
                onChange={(e) => {
                  const selectedTrain = trainOptions.find(t => t.id === e.target.value);
                  setScenario(prev => ({
                    ...prev,
                    trainId: e.target.value,
                    trainName: selectedTrain?.name || ''
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a train...</option>
                {trainOptions.map(train => (
                  <option key={train.id} value={train.id}>
                    {train.id} - {train.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Delay Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delay (minutes)</label>
              <input
                type="number"
                min="0"
                max="120"
                value={scenario.delay}
                onChange={(e) => setScenario(prev => ({ ...prev, delay: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter delay in minutes"
              />
            </div>

            {/* Reroute Option */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reroute Option</label>
              <select
                value={scenario.reroute}
                onChange={(e) => setScenario(prev => ({ ...prev, reroute: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No reroute</option>
                {routeOptions.map(route => (
                  <option key={route} value={route}>{route}</option>
                ))}
              </select>
            </div>

            {/* Platform Change */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Change</label>
              <select
                value={scenario.platformChange}
                onChange={(e) => setScenario(prev => ({ ...prev, platformChange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No change</option>
                {platformOptions.map(platform => (
                  <option key={platform} value={platform}>Platform {platform}</option>
                ))}
              </select>
            </div>

            <button
              onClick={runSimulation}
              disabled={!scenario.trainId || isSimulating}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {isSimulating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Simulation Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Simulation Results</h3>
            {simulationResult && (
              <p className="text-sm text-gray-600 mt-1">Analysis for {scenario.trainName}</p>
            )}
          </div>
          
          <div className="p-6">
            {simulationResult ? (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{simulationResult.impactedTrains}</div>
                    <div className="text-sm text-blue-700">Trains Impacted</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-900">{simulationResult.totalDelay}m</div>
                    <div className="text-sm text-orange-700">Total System Delay</div>
                  </div>
                </div>

                {/* Conflicts */}
                {simulationResult.conflictsDetected > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-900">
                        {simulationResult.conflictsDetected} Conflicts Detected
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Recommendation */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">AI Recommendation</h4>
                  <p className="text-sm text-green-800">{simulationResult.recommendation}</p>
                </div>

                {/* Cascade Effects */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cascade Effects</h4>
                  <div className="space-y-3">
                    {simulationResult.cascadeEffects.map((effect, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{effect.trainName}</span>
                          <span className="text-sm text-orange-600">+{effect.additionalDelay}m</span>
                        </div>
                        <div className="text-sm text-gray-600">Train {effect.trainId}</div>
                        <div className="text-sm text-gray-500 mt-1">{effect.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Configure a scenario and run simulation to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulation Preview Chart */}
      {simulationResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Timeline Impact Visualization</h3>
          </div>
          <div className="p-6">
            <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-8">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Interactive timeline chart would be displayed here</p>
                <p className="text-sm text-gray-500">
                  Showing before/after train schedules, conflict points, and optimization suggestions
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIfScenario;