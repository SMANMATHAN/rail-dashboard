# from fastapi import FastAPI
# from pydantic import BaseModel
# from typing import List

# from simulation.data import Station, Train
# from simulation.data_loader import initialize_trains
# from simulation.engine import run_simulation

# app = FastAPI(title="Rail Simulation API")


# class ScenarioInput(BaseModel):
#     train_id: str
#     train_name: str
#     delay: int = 0


# class SimulationResponse(BaseModel):
#     stations: List[Station]
#     trains: List[Train]


# @app.get("/health")
# async def health():
#     return {"status": "ok"}


# @app.post("/simulate", response_model=SimulationResponse)
# async def simulate(scenario: ScenarioInput):
#     stations = Station.sample_network()
#     trains = initialize_trains(stations, scenario.train_id, scenario.train_name, scenario.delay)
#     updated_stations, updated_trains = run_simulation(stations, trains, steps=50)
#     return {"stations": updated_stations, "trains": updated_trains}
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json

from simulation.data import Station, RailwayNetwork, TrainStatus
from simulation.data_loader import DataLoader
from simulation.engine import SimulationEngine

app = FastAPI(title="Railway Simulation API", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data loader
data_loader = DataLoader()

# --------- Schemas ---------
class TrainInput(BaseModel):
    id: str
    name: str
    from_station: str
    to_station: str
    departure_time: int = 0  # seconds from now
    arrival_time: int = 3600  # seconds from now
    priority: int = 1
    train_type: str = "Express"
    max_speed: float = 120.0
    length: float = 200.0
    max_capacity: int = 500


class NetworkConfig(BaseModel):
    stations: List[Dict[str, Any]]
    blocks: List[Dict[str, Any]]
    junctions: List[Dict[str, Any]] = []


class SimulationRequest(BaseModel):
    trains: List[TrainInput]
    network_config: Optional[NetworkConfig] = None
    priority_rule: str = "priority"
    max_time: int = 3600
    time_step: float = 1.0


class SimulationResponse(BaseModel):
    success: bool
    logs: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    network: Dict[str, Any]
    message: Optional[str] = None


class GAOutputRequest(BaseModel):
    ga_file_path: str
    network_config: NetworkConfig
    priority_rule: str = "priority"
    max_time: int = 3600
    time_step: float = 1.0


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}


@app.get("/network/sample")
async def get_sample_network():
    """Get sample network configuration"""
    return {
        "stations": [
            {
                "id": "S1",
                "name": "Alpha Station",
                "code": "ALP",
                "position": {"x": 60, "y": 80},
                "platforms": [
                    {"id": "p1", "number": "1", "occupied": False, "dwell_time": 60.0},
                    {"id": "p2", "number": "2", "occupied": False, "dwell_time": 60.0}
                ],
                "signals": [{"id": "sg1", "position": "N", "status": "Green"}],
                "connected_blocks": ["B1", "B2"],
                "capacity": 100
            },
            {
                "id": "S2",
                "name": "Beta Station",
                "code": "BET",
                "position": {"x": 220, "y": 150},
                "platforms": [
                    {"id": "p3", "number": "1", "occupied": False, "dwell_time": 60.0},
                    {"id": "p4", "number": "2", "occupied": False, "dwell_time": 60.0}
                ],
                "signals": [{"id": "sg2", "position": "E", "status": "Green"}],
                "connected_blocks": ["B2", "B3"],
                "capacity": 100
            }
        ],
        "blocks": [
            {
                "id": "B1",
                "name": "Block Alpha-Beta",
                "length": 1000.0,
                "max_speed": 120.0,
                "status": "free",
                "connected_blocks": ["B2"],
                "position": {"x": 140, "y": 115}
            },
            {
                "id": "B2",
                "name": "Block Beta-Gamma",
                "length": 800.0,
                "max_speed": 100.0,
                "status": "free",
                "connected_blocks": ["B1", "B3"],
                "position": {"x": 310, "y": 120}
            },
            {
                "id": "B3",
                "name": "Block Gamma-Delta",
                "length": 1200.0,
                "max_speed": 140.0,
                "status": "free",
                "connected_blocks": ["B2"],
                "position": {"x": 490, "y": 125}
            }
        ],
        "junctions": []
    }


@app.post("/simulate", response_model=SimulationResponse)
async def simulate(req: SimulationRequest):
    """Run railway simulation with given parameters"""
    try:
        # Load network configuration
        if req.network_config:
            network = data_loader.load_railway_network(req.network_config.dict())
        else:
            # Use sample network
            sample_config = await get_sample_network()
            network = data_loader.load_railway_network(sample_config)
        
        # Build train configurations
        train_configs = []
        for train_input in req.trains:
            config = {
                "id": train_input.id,
                "name": train_input.name,
                "type": train_input.train_type,
                "from_station": train_input.from_station,
                "to_station": train_input.to_station,
                "departure_time": train_input.departure_time,
                "arrival_time": train_input.arrival_time,
                "priority": train_input.priority,
                "max_speed": train_input.max_speed,
                "length": train_input.length,
                "max_capacity": train_input.max_capacity
            }
            train_configs.append(config)
        
        # Build train paths
        ga_output = {"trains": train_configs}
        train_paths = data_loader.build_train_paths(ga_output, network)
        
        # Validate data
        errors = data_loader.validate_data(network, train_paths)
        if errors:
            return SimulationResponse(
                success=False,
                logs=[],
                metrics={},
                network={},
                message=f"Data validation errors: {', '.join(errors)}"
            )
        
        # Initialize trains
        trains = data_loader.initialize_trains(train_paths)
        
        # Create simulation engine
        engine = SimulationEngine(network, time_step=req.time_step)
        
        # Add trains to simulation
        for train in trains:
            engine.add_train(train)
        
        # Run simulation
        config = {"priority_rule": req.priority_rule}
        logs = engine.run_simulation(req.max_time, config)
        
        # Convert logs to dict format
        log_dicts = []
        for log in logs:
            log_dict = {
                "time": log.time,
                "train_id": log.train_id,
                "current_block": log.current_block,
                "current_station": log.current_station,
                "status": log.status.value,
                "delay": log.delay,
                "speed": log.speed,
                "position": log.position
            }
            log_dicts.append(log_dict)
        
        # Prepare metrics
        metrics = {
            "total_delays": engine.metrics.total_delays,
            "max_delay": engine.metrics.max_delay,
            "average_delay": engine.metrics.average_delay,
            "total_throughput": engine.metrics.total_throughput,
            "conflict_count": engine.metrics.conflict_count,
            "simulation_time": engine.metrics.total_simulation_time
        }
        
        # Prepare network data
        network_data = {
            "stations": [station.dict() for station in network.stations],
            "blocks": [block.dict() for block in network.blocks],
            "junctions": [junction.dict() for junction in network.junctions]
        }
        
        return SimulationResponse(
            success=True,
            logs=log_dicts,
            metrics=metrics,
            network=network_data,
            message="Simulation completed successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@app.post("/simulate/ga", response_model=SimulationResponse)
async def simulate_from_ga(req: GAOutputRequest):
    """Run simulation from GA output file"""
    try:
        # Load GA output
        ga_output = data_loader.load_ga_output(req.ga_file_path)
        
        # Load network configuration
        network = data_loader.load_railway_network(req.network_config.dict())
        
        # Build train paths
        train_paths = data_loader.build_train_paths(ga_output, network)
        
        # Validate data
        errors = data_loader.validate_data(network, train_paths)
        if errors:
            return SimulationResponse(
                success=False,
                logs=[],
                metrics={},
                network={},
                message=f"Data validation errors: {', '.join(errors)}"
            )
        
        # Initialize trains
        trains = data_loader.initialize_trains(train_paths)
        
        # Create simulation engine
        engine = SimulationEngine(network, time_step=req.time_step)
        
        # Add trains to simulation
        for train in trains:
            engine.add_train(train)
        
        # Run simulation
        config = {"priority_rule": req.priority_rule}
        logs = engine.run_simulation(req.max_time, config)
        
        # Convert logs to dict format
        log_dicts = []
        for log in logs:
            log_dict = {
                "time": log.time,
                "train_id": log.train_id,
                "current_block": log.current_block,
                "current_station": log.current_station,
                "status": log.status.value,
                "delay": log.delay,
                "speed": log.speed,
                "position": log.position
            }
            log_dicts.append(log_dict)
        
        # Prepare metrics
        metrics = {
            "total_delays": engine.metrics.total_delays,
            "max_delay": engine.metrics.max_delay,
            "average_delay": engine.metrics.average_delay,
            "total_throughput": engine.metrics.total_throughput,
            "conflict_count": engine.metrics.conflict_count,
            "simulation_time": engine.metrics.total_simulation_time
        }
        
        # Prepare network data
        network_data = {
            "stations": [station.dict() for station in network.stations],
            "blocks": [block.dict() for block in network.blocks],
            "junctions": [junction.dict() for junction in network.junctions]
        }
        
        return SimulationResponse(
            success=True,
            logs=log_dicts,
            metrics=metrics,
            network=network_data,
            message="GA simulation completed successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GA simulation failed: {str(e)}")


@app.get("/metrics/export/{simulation_id}")
async def export_metrics(simulation_id: str, format: str = "json"):
    """Export simulation metrics in specified format"""
    # This would typically load from a database
    # For now, return a placeholder
    return {
        "simulation_id": simulation_id,
        "format": format,
        "message": "Export functionality to be implemented"
    }


