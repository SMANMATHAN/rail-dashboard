export interface Train {
    id: string;
    name: string;
    type: 'Express' | 'Local' | 'Freight';
    route: string[];
    scheduledDeparture: string;
    currentDelay: number;
    priority: number;
    passengers?: number;
    platform?: string;
    status: 'On Time' | 'Delayed' | 'Cancelled' | 'Running';
    currentStation?: string;
    nextStation?: string;
    estimatedArrival?: string;
  }
  
  export interface Station {
    id: string;
    name: string;
    code: string;
    platforms: Platform[];
    position: { x: number; y: number };
    signals: Signal[];
  }
  
  export interface Platform {
    id: string;
    number: string;
    occupied: boolean;
    trainId?: string;
    capacity: number;
  }
  
  export interface Signal {
    id: string;
    position: string;
    status: 'Red' | 'Yellow' | 'Green';
    controlledBy?: string;
  }
  
  export interface Schedule {
    id: string;
    trainId: string;
    stationSequence: ScheduleEntry[];
    totalDelay: number;
    conflicts: Conflict[];
    score: number;
  }
  
  export interface ScheduleEntry {
    stationId: string;
    arrivalTime: string;
    departureTime: string;
    platform: string;
    waitTime: number;
    precedence: number;
  }
  
  export interface Conflict {
    type: 'Platform' | 'Track' | 'Signal';
    description: string;
    severity: 'Low' | 'Medium' | 'High';
    affectedTrains: string[];
  }
  
  export interface OptimizationResult {
    schedules: Schedule[];
    metrics: PerformanceMetrics;
    recommendations: Recommendation[];
  }
  
  export interface PerformanceMetrics {
    totalDelay: number;
    delayReduction: number;
    throughput: number;
    utilization: number;
    conflictsResolved: number;
    onTimePerformance: number;
  }
  
  export interface Recommendation {
    id: string;
    type: 'Priority' | 'Platform' | 'Delay' | 'Route';
    description: string;
    impact: string;
    confidence: number;
    trainId: string;
  }
  
  export interface DPSResult {
    trainId: string;
    score: number;
    factors: {
      typeWeight: number;
      delayPenalty: number;
      sectionImpact: number;
      passengerLoad: number;
    };
  }