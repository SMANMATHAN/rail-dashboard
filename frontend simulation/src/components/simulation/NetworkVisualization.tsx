import React, { useMemo } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { Train, MapPin, Circle, ArrowRight } from 'lucide-react';

interface NetworkVisualizationProps {
  className?: string;
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ className = '' }) => {
  const { logs, network, currentTime, getTrainsAtTime } = useSimulation();

  const trainsAtCurrentTime = useMemo(() => {
    return getTrainsAtTime(currentTime);
  }, [getTrainsAtTime, currentTime]);

  const networkData = useMemo(() => {
    if (!network) return null;

    const stations = network.stations || [];
    const blocks = network.blocks || [];

    // Calculate bounds for scaling
    const allPositions = [
      ...stations.map((s: any) => s.position),
      ...blocks.map((b: any) => b.position)
    ];

    if (allPositions.length === 0) return null;

    const minX = Math.min(...allPositions.map(p => p.x));
    const maxX = Math.max(...allPositions.map(p => p.x));
    const minY = Math.min(...allPositions.map(p => p.y));
    const maxY = Math.max(...allPositions.map(p => p.y));

    const padding = 50;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    return {
      stations,
      blocks,
      bounds: { minX, maxY, width, height },
      padding
    };
  }, [network]);

  const getTrainColor = (status: string) => {
    switch (status) {
      case 'moving': return 'text-green-600';
      case 'stopped': return 'text-blue-600';
      case 'waiting': return 'text-yellow-600';
      case 'delayed': return 'text-red-600';
      case 'arrived': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getTrainIcon = (status: string) => {
    switch (status) {
      case 'moving': return <ArrowRight className="w-4 h-4" />;
      case 'stopped': return <Circle className="w-4 h-4" />;
      case 'waiting': return <Circle className="w-4 h-4" />;
      case 'delayed': return <Circle className="w-4 h-4" />;
      case 'arrived': return <Circle className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  if (!networkData) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No network data available</p>
          <p className="text-sm">Run a simulation to see the network visualization</p>
        </div>
      </div>
    );
  }

  const { stations, blocks, bounds, padding } = networkData;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Network Visualization</h3>
        <p className="text-sm text-gray-600">Real-time train positions and network status</p>
      </div>

      <div className="p-4">
        <div className="relative overflow-hidden rounded-lg bg-gray-50" style={{ height: '400px' }}>
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${bounds.width} ${bounds.height}`}
            className="absolute inset-0"
          >
            {/* Render blocks */}
            {blocks.map((block: any) => (
              <g key={block.id}>
                <rect
                  x={block.position.x - minX + padding - 10}
                  y={block.position.y - minY + padding - 5}
                  width="20"
                  height="10"
                  fill="#e5e7eb"
                  stroke="#9ca3af"
                  strokeWidth="1"
                  rx="2"
                />
                <text
                  x={block.position.x - minX + padding}
                  y={block.position.y - minY + padding + 2}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {block.name}
                </text>
              </g>
            ))}

            {/* Render stations */}
            {stations.map((station: any) => (
              <g key={station.id}>
                <circle
                  cx={station.position.x - minX + padding}
                  cy={station.position.y - minY + padding}
                  r="12"
                  fill="#3b82f6"
                  stroke="#1d4ed8"
                  strokeWidth="2"
                />
                <text
                  x={station.position.x - minX + padding}
                  y={station.position.y - minY + padding - 20}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-900"
                >
                  {station.name}
                </text>
                <text
                  x={station.position.x - minX + padding}
                  y={station.position.y - minY + padding + 30}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {station.code}
                </text>
              </g>
            ))}

            {/* Render trains */}
            {trainsAtCurrentTime.map((trainLog) => {
              if (!trainLog.position) return null;

              const [x, y] = trainLog.position;
              const svgX = x - minX + padding;
              const svgY = y - minY + padding;

              return (
                <g key={trainLog.train_id}>
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r="8"
                    fill="#ef4444"
                    stroke="#dc2626"
                    strokeWidth="2"
                  />
                  <text
                    x={svgX}
                    y={svgY + 3}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white"
                  >
                    T
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Train Status Legend */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Active Trains</h4>
          <div className="space-y-2">
            {trainsAtCurrentTime.length === 0 ? (
              <p className="text-sm text-gray-500">No trains active at current time</p>
            ) : (
              trainsAtCurrentTime.map((trainLog) => (
                <div
                  key={trainLog.train_id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`${getTrainColor(trainLog.status)}`}>
                      {getTrainIcon(trainLog.status)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {trainLog.train_id}
                    </span>
                    <span className="text-xs text-gray-600">
                      {trainLog.current_station || 'In Transit'}
                    </span>
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    <div>Speed: {trainLog.speed.toFixed(1)} km/h</div>
                    {trainLog.delay > 0 && (
                      <div className="text-red-600">Delay: {trainLog.delay}s</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Network Statistics */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Stations:</span>
              <span className="ml-2 font-medium">{stations.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Blocks:</span>
              <span className="ml-2 font-medium">{blocks.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Active Trains:</span>
              <span className="ml-2 font-medium">{trainsAtCurrentTime.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Current Time:</span>
              <span className="ml-2 font-medium">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkVisualization;

