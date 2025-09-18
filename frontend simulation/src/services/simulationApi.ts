import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface TrainInput {
  id: string;
  name: string;
  from_station: string;
  to_station: string;
  departure_time: number;
  arrival_time: number;
  priority: number;
  train_type: string;
  max_speed: number;
  length: number;
  max_capacity: number;
}

export interface SimulationRequest {
  trains: TrainInput[];
  network_config?: any;
  priority_rule: string;
  max_time: number;
  time_step: number;
}

export interface SimulationLog {
  time: number;
  train_id: string;
  current_block?: string;
  current_station?: string;
  status: string;
  delay: number;
  speed: number;
  position?: [number, number];
}

export interface SimulationMetrics {
  total_delays: number;
  max_delay: number;
  average_delay: number;
  total_throughput: number;
  conflict_count: number;
  simulation_time: number;
}

export interface SimulationResponse {
  success: boolean;
  logs: SimulationLog[];
  metrics: SimulationMetrics;
  network: any;
  message?: string;
}

export const simulationApi = {
  // Health check
  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await api.get('/health');
    return response.data;
  },

  // Get sample network configuration
  async getSampleNetwork(): Promise<any> {
    const response = await api.get('/network/sample');
    return response.data;
  },

  // Run simulation
  async runSimulation(request: SimulationRequest): Promise<SimulationResponse> {
    const response = await api.post('/simulate', request);
    return response.data;
  },

  // Run simulation from GA output file
  async runSimulationFromGA(gaFilePath: string, networkConfig: any, priorityRule: string = 'priority', maxTime: number = 3600): Promise<SimulationResponse> {
    const response = await api.post('/simulate/ga', {
      ga_file_path: gaFilePath,
      network_config: networkConfig,
      priority_rule: priorityRule,
      max_time: maxTime,
      time_step: 1.0
    });
    return response.data;
  },

  // Export metrics
  async exportMetrics(simulationId: string, format: string = 'json'): Promise<any> {
    const response = await api.get(`/metrics/export/${simulationId}?format=${format}`);
    return response.data;
  }
};

export default simulationApi;

