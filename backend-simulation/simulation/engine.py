import math
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, deque

from .data import (
    Train, Station, Block, Junction, RailwayNetwork, 
    TrainStatus, BlockStatus, SimulationEvent, SimulationLog, SimulationMetrics
)


class SimulationEngine:
    """Comprehensive railway simulation engine"""
    
    def __init__(self, network: RailwayNetwork, time_step: float = 1.0):
        self.network = network
        self.time_step = time_step  # seconds
        self.current_time = 0.0
        self.trains: List[Train] = []
        self.events: deque = deque()
        self.logs: List[SimulationLog] = []
        self.metrics = SimulationMetrics()
        self.block_occupancy: Dict[str, str] = {}  # block_id -> train_id
        self.conflict_resolution_rules = {
            "priority": self._resolve_by_priority,
            "first_come": self._resolve_by_first_come,
            "fifo": self._resolve_by_fifo
        }
    
    def add_train(self, train: Train) -> None:
        """Add a train to the simulation"""
        self.trains.append(train)
        self._initialize_train_position(train)
    
    def _initialize_train_position(self, train: Train) -> None:
        """Initialize train at starting position"""
        if train.route:
            train.current_station = train.route[0]
            train.next_station = train.route[1] if len(train.route) > 1 else None
            
            # Find starting block
            if train.block_sequence:
                train.current_block = train.block_sequence[0]
                train.next_block = train.block_sequence[1] if len(train.block_sequence) > 1 else None
            
            # Set initial position
            station = self._find_station_by_id(train.current_station)
            if station:
                train.position = (station.position["x"], station.position["y"])
            
            train.status = TrainStatus.STOPPED
            train.speed = 0.0
    
    def _find_station_by_id(self, station_id: str) -> Optional[Station]:
        """Find station by ID"""
        for station in self.network.stations:
            if station.id == station_id:
                return station
        return None
    
    def _find_block_by_id(self, block_id: str) -> Optional[Block]:
        """Find block by ID"""
        for block in self.network.blocks:
            if block.id == block_id:
                return block
        return None
    
    def run_simulation(self, max_time: float, config: Dict[str, Any] = None) -> List[SimulationLog]:
        """Run the simulation for specified time"""
        if config is None:
            config = {}
        
        self.current_time = 0.0
        self.logs = []
        self.metrics = SimulationMetrics()
        self.block_occupancy = {}
        
        # Initialize all trains
        for train in self.trains:
            self._initialize_train_position(train)
        
        # Precompute events
        self._precompute_events()
        
        # Run simulation steps
        while self.current_time < max_time:
            self._simulation_step(config)
            self.current_time += self.time_step
        
        # Calculate final metrics
        self._calculate_metrics()
        
        return self.logs
    
    def _simulation_step(self, config: Dict[str, Any]) -> None:
        """Execute one simulation step"""
        # Process events at current time
        self._process_events()
        
        # Update train positions
        for train in self.trains:
            if train.status != TrainStatus.ARRIVED:
                self._update_train_position(train, config)
        
        # Check for conflicts
        self._check_conflicts(config)
        
        # Log current state
        self._log_current_state()
    
    def _update_train_position(self, train: Train, config: Dict[str, Any]) -> None:
        """Update train position and status"""
        if train.status == TrainStatus.ARRIVED:
            return
        
        # Update time elapsed
        train.time_elapsed += self.time_step
        
        # Check if train should depart
        if train.status == TrainStatus.STOPPED and train.current_station:
            if self._should_depart(train):
                train.status = TrainStatus.MOVING
                self._add_event(SimulationEvent(
                    timestamp=self.current_time,
                    event_type="departure",
                    train_id=train.id,
                    location=train.current_station
                ))
        
        # Update speed and position
        if train.status == TrainStatus.MOVING:
            self._update_train_speed(train)
            self._update_train_location(train)
        
        # Check for arrival
        if self._should_arrive(train):
            self._handle_arrival(train)
    
    def _should_depart(self, train: Train) -> bool:
        """Check if train should depart from current station"""
        if not train.current_station:
            return False
        
        # Check if scheduled departure time has passed
        if train.scheduled_departure and self.current_time >= train.scheduled_departure.timestamp():
            return True
        
        # Check dwell time
        if train.dwell_time_remaining <= 0:
            return True
        
        return False
    
    def _should_arrive(self, train: Train) -> bool:
        """Check if train should arrive at next station"""
        if not train.next_station or not train.current_station:
            return False
        
        # Simple distance-based arrival check
        current_station = self._find_station_by_id(train.current_station)
        next_station = self._find_station_by_id(train.next_station)
        
        if not current_station or not next_station:
            return False
        
        # Calculate distance
        dx = next_station.position["x"] - current_station.position["x"]
        dy = next_station.position["y"] - current_station.position["y"]
        distance = math.sqrt(dx*dx + dy*dy)
        
        # Estimate travel time based on distance and speed
        if train.speed > 0:
            travel_time = distance / (train.speed * 1000 / 3600)  # Convert km/h to m/s
            return train.time_elapsed >= travel_time
        
        return False
    
    def _update_train_speed(self, train: Train) -> None:
        """Update train speed based on physics"""
        if train.status != TrainStatus.MOVING:
            return
        
        # Simple speed control - accelerate towards max speed
        if train.speed < train.max_speed:
            acceleration = train.acceleration * self.time_step  # m/s
            train.speed = min(train.max_speed, train.speed + acceleration * 3.6)  # Convert to km/h
        
        # Apply speed limits based on current block
        if train.current_block:
            block = self._find_block_by_id(train.current_block)
            if block and train.speed > block.max_speed:
                train.speed = block.max_speed
    
    def _update_train_location(self, train: Train) -> None:
        """Update train's current location and position"""
        if not train.current_station or not train.next_station:
            return
        
        current_station = self._find_station_by_id(train.current_station)
        next_station = self._find_station_by_id(train.next_station)
        
        if not current_station or not next_station:
            return
        
        # Calculate progress towards next station
        total_distance = math.sqrt(
            (next_station.position["x"] - current_station.position["x"])**2 +
            (next_station.position["y"] - current_station.position["y"])**2
        )
        
        if total_distance > 0:
            # Calculate distance traveled this step
            speed_ms = train.speed * 1000 / 3600  # Convert km/h to m/s
            distance_traveled = speed_ms * self.time_step
            
            # Update position
            progress = min(1.0, distance_traveled / total_distance)
            x = current_station.position["x"] + (next_station.position["x"] - current_station.position["x"]) * progress
            y = current_station.position["y"] + (next_station.position["y"] - current_station.position["y"]) * progress
            
            train.position = (x, y)
    
    def _handle_arrival(self, train: Train) -> None:
        """Handle train arrival at station"""
        if not train.next_station:
            return
        
        # Update train state
        train.current_station = train.next_station
        train.status = TrainStatus.STOPPED
        train.speed = 0.0
        
        # Set next station
        if train.route:
            try:
                current_idx = train.route.index(train.current_station)
                train.next_station = train.route[current_idx + 1] if current_idx + 1 < len(train.route) else None
            except ValueError:
                train.next_station = None
        
        # Set dwell time
        station = self._find_station_by_id(train.current_station)
        if station and station.platforms:
            # Find available platform
            for platform in station.platforms:
                if not platform.occupied:
                    platform.occupied = True
                    platform.trainId = train.id
                    train.dwell_time_remaining = platform.dwell_time
                    break
        
        # Add arrival event
        self._add_event(SimulationEvent(
            timestamp=self.current_time,
            event_type="arrival",
            train_id=train.id,
            location=train.current_station
        ))
        
        # Check if train has reached final destination
        if not train.next_station:
            train.status = TrainStatus.ARRIVED
            train.actual_arrival = datetime.fromtimestamp(self.current_time)
    
    def _check_conflicts(self, config: Dict[str, Any]) -> None:
        """Check for block occupancy conflicts"""
        # Check for trains trying to enter same block
        block_requests = {}
        
        for train in self.trains:
            if train.status == TrainStatus.MOVING and train.next_block:
                if train.next_block not in block_requests:
                    block_requests[train.next_block] = []
                block_requests[train.next_block].append(train)
        
        # Resolve conflicts
        for block_id, requesting_trains in block_requests.items():
            if len(requesting_trains) > 1:
                self._resolve_block_conflict(block_id, requesting_trains, config)
    
    def _resolve_block_conflict(self, block_id: str, trains: List[Train], config: Dict[str, Any]) -> None:
        """Resolve conflict for block access"""
        priority_rule = config.get("priority_rule", "priority")
        
        if priority_rule in self.conflict_resolution_rules:
            selected_train = self.conflict_resolution_rules[priority_rule](trains)
        else:
            selected_train = self._resolve_by_priority(trains)
        
        # Grant access to selected train
        for train in trains:
            if train == selected_train:
                self._grant_block_access(train, block_id)
            else:
                self._delay_train(train, block_id)
    
    def _resolve_by_priority(self, trains: List[Train]) -> Train:
        """Resolve conflict by train priority"""
        return max(trains, key=lambda t: t.priority)
    
    def _resolve_by_first_come(self, trains: List[Train]) -> Train:
        """Resolve conflict by first come first served"""
        return min(trains, key=lambda t: t.time_elapsed)
    
    def _resolve_by_fifo(self, trains: List[Train]) -> Train:
        """Resolve conflict by FIFO order"""
        return trains[0]  # First in list
    
    def _grant_block_access(self, train: Train, block_id: str) -> None:
        """Grant block access to train"""
        block = self._find_block_by_id(block_id)
        if block:
            block.status = BlockStatus.OCCUPIED
            block.occupied_by = train.id
            self.block_occupancy[block_id] = train.id
            
            # Update train's current block
            train.current_block = block_id
            
            # Add block entry event
            self._add_event(SimulationEvent(
                timestamp=self.current_time,
                event_type="block_enter",
                train_id=train.id,
                location=block_id
            ))
    
    def _delay_train(self, train: Train, block_id: str) -> None:
        """Delay train due to conflict"""
        train.status = TrainStatus.WAITING
        train.current_delay += int(self.time_step)
        
        # Add delay event
        self._add_event(SimulationEvent(
            timestamp=self.current_time,
            event_type="delay",
            train_id=train.id,
            location=block_id,
            details={"reason": "block_conflict", "block_id": block_id}
        ))
        
        self.metrics.conflict_count += 1
    
    def _precompute_events(self) -> None:
        """Precompute scheduled events"""
        for train in self.trains:
            # Add departure events
            if train.scheduled_departure:
                self.events.append(SimulationEvent(
                    timestamp=train.scheduled_departure.timestamp(),
                    event_type="scheduled_departure",
                    train_id=train.id,
                    location=train.current_station or ""
                ))
            
            # Add arrival events
            if train.scheduled_arrival:
                self.events.append(SimulationEvent(
                    timestamp=train.scheduled_arrival.timestamp(),
                    event_type="scheduled_arrival",
                    train_id=train.id,
                    location=train.route[-1] if train.route else ""
                ))
        
        # Sort events by timestamp
        self.events = deque(sorted(self.events, key=lambda e: e.timestamp))
    
    def _process_events(self) -> None:
        """Process events at current time"""
        while self.events and self.events[0].timestamp <= self.current_time:
            event = self.events.popleft()
            # Events are handled in the main simulation loop
            pass
    
    def _add_event(self, event: SimulationEvent) -> None:
        """Add event to simulation"""
        # Events are processed immediately in this implementation
        pass
    
    def _log_current_state(self) -> None:
        """Log current simulation state"""
        for train in self.trains:
            log_entry = SimulationLog(
                time=self.current_time,
                train_id=train.id,
                current_block=train.current_block,
                current_station=train.current_station,
                status=train.status,
                delay=train.current_delay,
                speed=train.speed,
                position=train.position
            )
            self.logs.append(log_entry)
    
    def _calculate_metrics(self) -> None:
        """Calculate simulation metrics"""
        if not self.trains:
            return
        
        delays = [train.current_delay for train in self.trains]
        self.metrics.total_delays = sum(delays)
        self.metrics.max_delay = max(delays) if delays else 0
        self.metrics.average_delay = sum(delays) / len(delays) if delays else 0
        self.metrics.total_throughput = len([t for t in self.trains if t.status == TrainStatus.ARRIVED])
        self.metrics.total_simulation_time = self.current_time


# Legacy functions for backward compatibility
def update_position(train, t, stations):
    """Legacy function - use SimulationEngine instead"""
    if t < train.get("actual_start_time", 0):
        return None

    path = train.get("path", [])
    if not path:
        return None

    progress = min(1.0, (t - train.get("actual_start_time", 0)) / max(1, train.get("planned_arrival", 1) - train.get("planned_departure", 0)))
    current_station = path[0]
    next_station = path[-1]

    if current_station in stations and next_station in stations:
    x1, y1 = stations[current_station]
    x2, y2 = stations[next_station]
    x = x1 + (x2 - x1) * progress
    y = y1 + (y2 - y1) * progress
    return (x, y)
    
    return None


def run_simulation(stations, trains, config, max_time=200):
    """Legacy function - use SimulationEngine instead"""
    logs = []
    for t in range(max_time):
        for train in trains:
            pos = update_position(train, t, stations)
            if pos:
                logs.append({
                    "time": t,
                    "train": train["id"],
                    "pos": pos
                })
    return logs

