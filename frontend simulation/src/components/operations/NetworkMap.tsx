import React, { useEffect, useState } from 'react';
import { Station, Train } from '../../types/railway';

interface NetworkMapProps {
  stations: Station[];
  trains: Train[];
  isSimulating: boolean;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({
  stations,
  trains,
  isSimulating
}) => {
  const [trainPositions, setTrainPositions] = useState<{[key: string]: {x: number, y: number}}>({});

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTrainPositions(prev => {
        const newPositions = { ...prev };
        
        trains.forEach(train => {
          const currentStationIndex = stations.findIndex(s => s.id === train.currentStation);
          const nextStationIndex = stations.findIndex(s => s.id === train.nextStation);
          
          if (currentStationIndex >= 0 && nextStationIndex >= 0) {
            const currentStation = stations[currentStationIndex];
            const nextStation = stations[nextStationIndex];
            
            // Calculate movement between stations
            const progress = (Date.now() % 10000) / 10000; // 10 second cycle
            const x = currentStation.position.x + (nextStation.position.x - currentStation.position.x) * progress;
            const y = currentStation.position.y + (nextStation.position.y - currentStation.position.y) * progress;
            
            newPositions[train.id] = { x, y };
          } else if (currentStationIndex >= 0) {
            // Train is at station
            newPositions[train.id] = stations[currentStationIndex].position;
          }
        });
        
        return newPositions;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isSimulating, trains, stations]);

  const getTrainTypeColor = (type: string) => {
    switch (type) {
      case 'Express': return '#DC2626';
      case 'Local': return '#059669';
      case 'Freight': return '#D97706';
      default: return '#6B7280';
    }
  };

  // Reserved for future status-based styling

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Network Map</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Express</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Local</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Freight</span>
            </div>
          </div>
        </div>
        
        <div className="relative h-80 bg-gray-50 rounded-lg overflow-hidden">
          <svg className="w-full h-full">
            {/* Draw railway lines */}
            {stations.map((station, index) => (
              index < stations.length - 1 && (
                <line
                  key={`line-${index}`}
                  x1={station.position.x}
                  y1={station.position.y}
                  x2={stations[index + 1].position.x}
                  y2={stations[index + 1].position.y}
                  stroke="#374151"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
              )
            ))}
            
            {/* Draw stations */}
            {stations.map((station) => (
              <g key={station.id}>
                <circle
                  cx={station.position.x}
                  cy={station.position.y}
                  r="12"
                  fill="#1E40AF"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
                <text
                  x={station.position.x}
                  y={station.position.y - 20}
                  textAnchor="middle"
                  className="fill-gray-700 text-sm font-medium"
                >
                  {station.code}
                </text>
                <text
                  x={station.position.x}
                  y={station.position.y + 35}
                  textAnchor="middle"
                  className="fill-gray-500 text-xs"
                >
                  {station.platforms.filter(p => p.occupied).length}/{station.platforms.length}
                </text>
              </g>
            ))}
            
            {/* Draw trains */}
            {trains.map((train) => {
              const position = isSimulating && trainPositions[train.id] 
                ? trainPositions[train.id] 
                : stations.find(s => s.id === train.currentStation)?.position || { x: 0, y: 0 };
              
              return (
                <g key={train.id}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="8"
                    fill={getTrainTypeColor(train.type)}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className={isSimulating ? 'transition-all duration-100' : ''}
                  />
                  <text
                    x={position.x}
                    y={position.y + 25}
                    textAnchor="middle"
                    className="fill-gray-700 text-xs font-medium"
                  >
                    {train.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Platform Status */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stations.map((station) => (
            <div key={station.id} className="text-center">
              <h3 className="font-medium text-gray-900 mb-1">{station.code}</h3>
              <div className="flex justify-center space-x-1">
                {station.platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className={`w-3 h-3 rounded-full ${
                      platform.occupied ? 'bg-red-400' : 'bg-green-400'
                    }`}
                    title={`Platform ${platform.number} - ${platform.occupied ? 'Occupied' : 'Available'}`}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {station.signals.filter(s => s.status === 'Green').length} Green
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;