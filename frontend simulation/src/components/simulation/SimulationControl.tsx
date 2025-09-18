import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw, Settings, AlertCircle } from 'lucide-react';
import { useSimulation } from '../../contexts/SimulationContext';
import { TrainInput } from '../../services/simulationApi';

interface SimulationControlProps {
  className?: string;
}

const SimulationControl: React.FC<SimulationControlProps> = ({ className = '' }) => {
  const {
    isRunning,
    logs,
    metrics,
    currentTime,
    trains,
    error,
    runSimulation,
    clearSimulation,
    setCurrentTime
  } = useSimulation();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [maxTime, setMaxTime] = useState(3600);
  const [priorityRule, setPriorityRule] = useState('priority');

  // Auto-play simulation logs
  useEffect(() => {
    if (isPlaying && logs.length > 0) {
      const maxLogTime = Math.max(...logs.map(log => log.time));
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const nextTime = prev + (playbackSpeed * 10); // 10 second increments
          if (nextTime >= maxLogTime) {
            setIsPlaying(false);
            return maxLogTime;
          }
          return nextTime;
        });
      }, 1000 / playbackSpeed);

      return () => clearInterval(interval);
    }
  }, [isPlaying, logs, playbackSpeed, setCurrentTime]);

  const handlePlay = () => {
    if (logs.length === 0) {
      // Run a sample simulation if no logs exist
      const sampleTrains: TrainInput[] = [
        {
          id: 'T001',
          name: 'Express Alpha',
          from_station: 'S1',
          to_station: 'S2',
          departure_time: 0,
          arrival_time: 1800,
          priority: 1,
          train_type: 'Express',
          max_speed: 120,
          length: 200,
          max_capacity: 500
        },
        {
          id: 'T002',
          name: 'Local Beta',
          from_station: 'S1',
          to_station: 'S2',
          departure_time: 300,
          arrival_time: 2400,
          priority: 2,
          train_type: 'Local',
          max_speed: 100,
          length: 180,
          max_capacity: 400
        }
      ];
      runSimulation(sampleTrains, priorityRule, maxTime);
    } else {
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    clearSimulation();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const maxLogTime = logs.length > 0 ? Math.max(...logs.map(log => log.time)) : 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Simulation Control</h3>
        {error && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={handlePlay}
          disabled={isRunning}
          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4 mr-1" />
          {logs.length === 0 ? 'Start' : 'Play'}
        </button>

        <button
          onClick={handlePause}
          disabled={!isPlaying}
          className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Pause className="w-4 h-4 mr-1" />
          Pause
        </button>

        <button
          onClick={handleStop}
          disabled={logs.length === 0}
          className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Square className="w-4 h-4 mr-1" />
          Stop
        </button>

        <button
          onClick={handleReset}
          className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </button>
      </div>

      {/* Time Display */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Current Time</span>
          <span>{formatTime(currentTime)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: maxLogTime > 0 ? `${(currentTime / maxLogTime) * 100}%` : '0%'
            }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>0:00:00</span>
          <span>{formatTime(maxLogTime)}</span>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block text-gray-600 mb-1">Playback Speed</label>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-600 mb-1">Priority Rule</label>
          <select
            value={priorityRule}
            onChange={(e) => setPriorityRule(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="priority">Priority</option>
            <option value="first_come">First Come</option>
            <option value="fifo">FIFO</option>
          </select>
        </div>
      </div>

      {/* Simulation Status */}
      {metrics && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Delays:</span>
              <span className="ml-2 font-medium">{metrics.total_delays}s</span>
            </div>
            <div>
              <span className="text-gray-600">Max Delay:</span>
              <span className="ml-2 font-medium">{metrics.max_delay}s</span>
            </div>
            <div>
              <span className="text-gray-600">Throughput:</span>
              <span className="ml-2 font-medium">{metrics.total_throughput}</span>
            </div>
            <div>
              <span className="text-gray-600">Conflicts:</span>
              <span className="ml-2 font-medium">{metrics.conflict_count}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationControl;

