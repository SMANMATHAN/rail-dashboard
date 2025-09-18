import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { simulationApi, SimulationLog, SimulationMetrics, TrainInput } from '../services/simulationApi';

interface SimulationState {
  isRunning: boolean;
  logs: SimulationLog[];
  metrics: SimulationMetrics | null;
  network: any;
  currentTime: number;
  trains: TrainInput[];
  error: string | null;
}

interface SimulationContextType extends SimulationState {
  runSimulation: (trains: TrainInput[], priorityRule?: string, maxTime?: number) => Promise<void>;
  runSimulationFromGA: (gaFilePath: string, networkConfig: any, priorityRule?: string, maxTime?: number) => Promise<void>;
  clearSimulation: () => void;
  setCurrentTime: (time: number) => void;
  getTrainAtTime: (trainId: string, time: number) => SimulationLog | null;
  getTrainsAtTime: (time: number) => SimulationLog[];
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

interface SimulationProviderProps {
  children: ReactNode;
}

export const SimulationProvider: React.FC<SimulationProviderProps> = ({ children }) => {
  const [state, setState] = useState<SimulationState>({
    isRunning: false,
    logs: [],
    metrics: null,
    network: null,
    currentTime: 0,
    trains: [],
    error: null,
  });

  const runSimulation = useCallback(async (
    trains: TrainInput[], 
    priorityRule: string = 'priority', 
    maxTime: number = 3600
  ) => {
    setState(prev => ({ ...prev, isRunning: true, error: null }));
    
    try {
      const response = await simulationApi.runSimulation({
        trains,
        priority_rule: priorityRule,
        max_time: maxTime,
        time_step: 1.0
      });

      if (response.success) {
        setState(prev => ({
          ...prev,
          logs: response.logs,
          metrics: response.metrics,
          network: response.network,
          trains,
          isRunning: false,
          currentTime: 0
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'Simulation failed',
          isRunning: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isRunning: false
      }));
    }
  }, []);

  const runSimulationFromGA = useCallback(async (
    gaFilePath: string, 
    networkConfig: any, 
    priorityRule: string = 'priority', 
    maxTime: number = 3600
  ) => {
    setState(prev => ({ ...prev, isRunning: true, error: null }));
    
    try {
      const response = await simulationApi.runSimulationFromGA(gaFilePath, networkConfig, priorityRule, maxTime);

      if (response.success) {
        setState(prev => ({
          ...prev,
          logs: response.logs,
          metrics: response.metrics,
          network: response.network,
          isRunning: false,
          currentTime: 0
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'GA simulation failed',
          isRunning: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isRunning: false
      }));
    }
  }, []);

  const clearSimulation = useCallback(() => {
    setState({
      isRunning: false,
      logs: [],
      metrics: null,
      network: null,
      currentTime: 0,
      trains: [],
      error: null,
    });
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const getTrainAtTime = useCallback((trainId: string, time: number): SimulationLog | null => {
    const trainLogs = state.logs.filter(log => log.train_id === trainId);
    const logAtTime = trainLogs.find(log => Math.abs(log.time - time) < 1);
    return logAtTime || null;
  }, [state.logs]);

  const getTrainsAtTime = useCallback((time: number): SimulationLog[] => {
    const logsAtTime = state.logs.filter(log => Math.abs(log.time - time) < 1);
    return logsAtTime;
  }, [state.logs]);

  const value: SimulationContextType = {
    ...state,
    runSimulation,
    runSimulationFromGA,
    clearSimulation,
    setCurrentTime,
    getTrainAtTime,
    getTrainsAtTime,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export default SimulationContext;

