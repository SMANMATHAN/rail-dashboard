import json
import csv
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path

from .data import (
    Station, Train, Block, Junction, RailwayNetwork, 
    TrainStatus, BlockStatus, SimulationEvent
)


class DataLoader:
    """Comprehensive data loader for railway simulation"""
    
    def __init__(self):
        self.network: Optional[RailwayNetwork] = None
        self.ga_output: Optional[Dict[str, Any]] = None
    
    def load_ga_output(self, file_path: str) -> Dict[str, Any]:
        """Load GA output from JSON or CSV files"""
        file_path = Path(file_path)
        
        if file_path.suffix.lower() == '.json':
            with open(file_path, 'r') as f:
                self.ga_output = json.load(f)
        elif file_path.suffix.lower() == '.csv':
            self.ga_output = self._load_csv_ga_output(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_path.suffix}")
        
        return self.ga_output
    
    def _load_csv_ga_output(self, file_path: Path) -> Dict[str, Any]:
        """Load GA output from CSV file"""
        ga_data = {"trains": [], "paths": [], "schedules": []}
        
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                ga_data["trains"].append({
                    "train_id": row.get("train_id", ""),
                    "train_name": row.get("train_name", ""),
                    "from_station": row.get("from_station", ""),
                    "to_station": row.get("to_station", ""),
                    "departure_time": int(row.get("departure_time", 0)),
                    "arrival_time": int(row.get("arrival_time", 0)),
                    "priority": int(row.get("priority", 1)),
                    "path": row.get("path", "").split(",") if row.get("path") else []
                })
        
        return ga_data
    
    def load_railway_network(self, network_config: Dict[str, Any]) -> RailwayNetwork:
        """Load railway network data including stations, blocks, and junctions"""
        stations = []
        blocks = []
        junctions = []
        
        # Load stations
        for station_data in network_config.get("stations", []):
            station = Station(
                id=station_data["id"],
                name=station_data["name"],
                code=station_data["code"],
                position=station_data["position"],
                platforms=[
                    {
                        "id": p["id"],
                        "number": p["number"],
                        "occupied": p.get("occupied", False),
                        "trainId": p.get("trainId"),
                        "capacity": p.get("capacity", 2),
                        "dwell_time": p.get("dwell_time", 60.0)
                    }
                    for p in station_data.get("platforms", [])
                ],
                signals=[
                    {
                        "id": s["id"],
                        "position": s["position"],
                        "status": s.get("status", "Green")
                    }
                    for s in station_data.get("signals", [])
                ],
                connected_blocks=station_data.get("connected_blocks", []),
                capacity=station_data.get("capacity", 100)
            )
            stations.append(station)
        
        # Load blocks
        for block_data in network_config.get("blocks", []):
            block = Block(
                id=block_data["id"],
                name=block_data["name"],
                length=block_data["length"],
                max_speed=block_data["max_speed"],
                status=BlockStatus(block_data.get("status", "free")),
                connected_blocks=block_data.get("connected_blocks", []),
                position=block_data["position"]
            )
            blocks.append(block)
        
        # Load junctions
        for junction_data in network_config.get("junctions", []):
            junction = Junction(
                id=junction_data["id"],
                name=junction_data["name"],
                position=junction_data["position"],
                connected_blocks=junction_data.get("connected_blocks", []),
                switching_time=junction_data.get("switching_time", 30.0)
            )
            junctions.append(junction)
        
        # Build adjacency mapping
        adjacency_map = {}
        for block in blocks:
            adjacency_map[block.id] = block.connected_blocks
        
        self.network = RailwayNetwork(
            stations=stations,
            blocks=blocks,
            junctions=junctions,
            adjacency_map=adjacency_map
        )
        
        return self.network
    
    def build_train_paths(self, ga_output: Dict[str, Any], network: RailwayNetwork) -> List[Dict[str, Any]]:
        """Build train paths from GA output and network layout"""
        trains = []
        
        for train_data in ga_output.get("trains", []):
            # Find stations in network
            from_station = self._find_station_by_id(network.stations, train_data["from_station"])
            to_station = self._find_station_by_id(network.stations, train_data["to_station"])
            
            if not from_station or not to_station:
                print(f"Warning: Station not found for train {train_data['train_id']}")
                continue
            
            # Build route through stations
            route = self._find_shortest_path(network, from_station.id, to_station.id)
            
            # Build block sequence
            block_sequence = self._build_block_sequence(network, route)
            
            # Calculate timing
            departure_time = datetime.now() + timedelta(seconds=train_data["departure_time"])
            arrival_time = datetime.now() + timedelta(seconds=train_data["arrival_time"])
            
            train_info = {
                "id": train_data["train_id"],
                "name": train_data["train_name"],
                "type": train_data.get("type", "Express"),
                "route": route,
                "block_sequence": block_sequence,
                "scheduled_departure": departure_time,
                "scheduled_arrival": arrival_time,
                "priority": train_data.get("priority", 1),
                "max_speed": train_data.get("max_speed", 120.0),
                "length": train_data.get("length", 200.0),
                "max_capacity": train_data.get("max_capacity", 500)
            }
            
            trains.append(train_info)
        
        return trains
    
    def _find_station_by_id(self, stations: List[Station], station_id: str) -> Optional[Station]:
        """Find station by ID"""
        for station in stations:
            if station.id == station_id:
                return station
        return None
    
    def _find_shortest_path(self, network: RailwayNetwork, from_station: str, to_station: str) -> List[str]:
        """Find shortest path between stations using BFS"""
        if from_station == to_station:
            return [from_station]
        
        # Simple path finding - in real implementation, use proper graph algorithms
        station_ids = [s.id for s in network.stations]
        if from_station in station_ids and to_station in station_ids:
            # For now, return direct path or use adjacency
            return [from_station, to_station]
        
        return [from_station, to_station]  # Fallback
    
    def _build_block_sequence(self, network: RailwayNetwork, route: List[str]) -> List[str]:
        """Build block sequence for train path"""
        block_sequence = []
        
        for i in range(len(route) - 1):
            current_station = route[i]
            next_station = route[i + 1]
            
            # Find blocks connecting these stations
            station = self._find_station_by_id(network.stations, current_station)
            if station:
                block_sequence.extend(station.connected_blocks)
        
        return list(set(block_sequence))  # Remove duplicates
    
    def validate_data(self, network: RailwayNetwork, trains: List[Dict[str, Any]]) -> List[str]:
        """Validate data for inconsistencies"""
        errors = []
        
        # Check for overlapping block occupancy
        block_occupancy = {}
        for train in trains:
            for block_id in train.get("block_sequence", []):
                if block_id in block_occupancy:
                    errors.append(f"Block {block_id} occupied by multiple trains")
                block_occupancy[block_id] = train["id"]
        
        # Check for missing stations
        station_ids = {s.id for s in network.stations}
        for train in trains:
            for station_id in train.get("route", []):
                if station_id not in station_ids:
                    errors.append(f"Station {station_id} not found in network for train {train['id']}")
        
        # Check for invalid timing
        for train in trains:
            if train["scheduled_departure"] >= train["scheduled_arrival"]:
                errors.append(f"Invalid timing for train {train['id']}")
        
        return errors
    
    def initialize_trains(self, train_configs: List[Dict[str, Any]]) -> List[Train]:
        """Initialize train objects with proper state"""
        trains = []
        
        for config in train_configs:
            train = Train(
                id=config["id"],
                name=config["name"],
                type=config.get("type", "Express"),
                route=config["route"],
                block_sequence=config.get("block_sequence", []),
                scheduled_departure=config["scheduled_departure"],
                scheduled_arrival=config["scheduled_arrival"],
                priority=config.get("priority", 1),
                max_speed=config.get("max_speed", 120.0),
                length=config.get("length", 200.0),
                max_capacity=config.get("max_capacity", 500),
                current_station=config["route"][0] if config["route"] else None,
                next_station=config["route"][1] if len(config["route"]) > 1 else None,
                status=TrainStatus.STOPPED,
                speed=0.0,
                time_elapsed=0.0
            )
            
            trains.append(train)
        
        return trains


# Legacy functions for backward compatibility
def build_train_paths(stations: List[Station]) -> List[str]:
    """Legacy function - use DataLoader.build_train_paths instead"""
    return [s.id for s in stations]


def initialize_trains(stations: List[Station], train_id: str, train_name: str, delay: int) -> List[Train]:
    """Legacy function - use DataLoader.initialize_trains instead"""
    path = build_train_paths(stations)
    now = datetime.now()

    trains: List[Train] = [
        Train(
            id=train_id,
            name=train_name,
            type="Express",
            route=path,
            scheduled_departure=now,
            scheduled_arrival=now + timedelta(minutes=30),
            current_delay=delay,
            priority=1,
            status=TrainStatus.MOVING,
            current_station=path[0] if path else None,
            next_station=path[1] if len(path) > 1 else None,
        )
    ]

    return trains


