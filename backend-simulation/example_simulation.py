#!/usr/bin/env python3
"""
Example Railway Simulation Script

This script demonstrates how to use the comprehensive railway simulation backend
to run simulations with different scenarios and configurations.
"""

import json
import asyncio
from datetime import datetime, timedelta
from simulation.data_loader import DataLoader
from simulation.engine import SimulationEngine
from simulation.data import TrainStatus


def create_sample_network():
    """Create a sample railway network for testing"""
    return {
        "stations": [
            {
                "id": "S1",
                "name": "Central Station",
                "code": "CEN",
                "position": {"x": 100, "y": 100},
                "platforms": [
                    {"id": "p1", "number": "1", "occupied": False, "dwell_time": 120.0},
                    {"id": "p2", "number": "2", "occupied": False, "dwell_time": 120.0},
                    {"id": "p3", "number": "3", "occupied": False, "dwell_time": 120.0}
                ],
                "signals": [
                    {"id": "sg1", "position": "N", "status": "Green"},
                    {"id": "sg2", "position": "S", "status": "Green"}
                ],
                "connected_blocks": ["B1", "B2"],
                "capacity": 200
            },
            {
                "id": "S2",
                "name": "North Station",
                "code": "NOR",
                "position": {"x": 100, "y": 300},
                "platforms": [
                    {"id": "p4", "number": "1", "occupied": False, "dwell_time": 90.0},
                    {"id": "p5", "number": "2", "occupied": False, "dwell_time": 90.0}
                ],
                "signals": [
                    {"id": "sg3", "position": "S", "status": "Green"}
                ],
                "connected_blocks": ["B1", "B3"],
                "capacity": 150
            },
            {
                "id": "S3",
                "name": "East Station",
                "code": "EAS",
                "position": {"x": 300, "y": 100},
                "platforms": [
                    {"id": "p6", "number": "1", "occupied": False, "dwell_time": 90.0},
                    {"id": "p7", "number": "2", "occupied": False, "dwell_time": 90.0}
                ],
                "signals": [
                    {"id": "sg4", "position": "W", "status": "Green"}
                ],
                "connected_blocks": ["B2", "B4"],
                "capacity": 150
            },
            {
                "id": "S4",
                "name": "Junction Station",
                "code": "JUN",
                "position": {"x": 300, "y": 300},
                "platforms": [
                    {"id": "p8", "number": "1", "occupied": False, "dwell_time": 60.0},
                    {"id": "p9", "number": "2", "occupied": False, "dwell_time": 60.0}
                ],
                "signals": [
                    {"id": "sg5", "position": "N", "status": "Green"},
                    {"id": "sg6", "position": "W", "status": "Green"}
                ],
                "connected_blocks": ["B3", "B4", "B5"],
                "capacity": 100
            },
            {
                "id": "S5",
                "name": "Terminal Station",
                "code": "TER",
                "position": {"x": 500, "y": 300},
                "platforms": [
                    {"id": "p10", "number": "1", "occupied": False, "dwell_time": 180.0}
                ],
                "signals": [
                    {"id": "sg7", "position": "W", "status": "Green"}
                ],
                "connected_blocks": ["B5"],
                "capacity": 100
            }
        ],
        "blocks": [
            {
                "id": "B1",
                "name": "Central-North Block",
                "length": 2000.0,
                "max_speed": 120.0,
                "status": "free",
                "connected_blocks": ["B2", "B3"],
                "position": {"x": 100, "y": 200}
            },
            {
                "id": "B2",
                "name": "Central-East Block",
                "length": 2000.0,
                "max_speed": 140.0,
                "status": "free",
                "connected_blocks": ["B1", "B4"],
                "position": {"x": 200, "y": 100}
            },
            {
                "id": "B3",
                "name": "North-Junction Block",
                "length": 2000.0,
                "max_speed": 100.0,
                "status": "free",
                "connected_blocks": ["B1", "B4", "B5"],
                "position": {"x": 200, "y": 300}
            },
            {
                "id": "B4",
                "name": "East-Junction Block",
                "length": 2000.0,
                "max_speed": 100.0,
                "status": "free",
                "connected_blocks": ["B2", "B3", "B5"],
                "position": {"x": 300, "y": 200}
            },
            {
                "id": "B5",
                "name": "Junction-Terminal Block",
                "length": 2000.0,
                "max_speed": 160.0,
                "status": "free",
                "connected_blocks": ["B3", "B4"],
                "position": {"x": 400, "y": 300}
            }
        ],
        "junctions": [
            {
                "id": "J1",
                "name": "Central Junction",
                "position": {"x": 100, "y": 100},
                "connected_blocks": ["B1", "B2"],
                "switching_time": 30.0
            },
            {
                "id": "J2",
                "name": "Junction Station Switch",
                "position": {"x": 300, "y": 300},
                "connected_blocks": ["B3", "B4", "B5"],
                "switching_time": 45.0
            }
        ]
    }


def create_sample_ga_output():
    """Create sample GA output for testing"""
    return {
        "trains": [
            {
                "train_id": "T001",
                "train_name": "Express Alpha",
                "from_station": "S1",
                "to_station": "S5",
                "departure_time": 0,
                "arrival_time": 1800,  # 30 minutes
                "priority": 3,
                "type": "Express",
                "max_speed": 160.0,
                "length": 250.0,
                "max_capacity": 600
            },
            {
                "train_id": "T002",
                "train_name": "Local Beta",
                "from_station": "S1",
                "to_station": "S2",
                "departure_time": 300,  # 5 minutes delay
                "arrival_time": 900,   # 15 minutes
                "priority": 1,
                "type": "Local",
                "max_speed": 100.0,
                "length": 200.0,
                "max_capacity": 400
            },
            {
                "train_id": "T003",
                "train_name": "Freight Gamma",
                "from_station": "S2",
                "to_station": "S5",
                "departure_time": 600,  # 10 minutes delay
                "arrival_time": 2400,  # 40 minutes
                "priority": 0,
                "type": "Freight",
                "max_speed": 80.0,
                "length": 500.0,
                "max_capacity": 0
            },
            {
                "train_id": "T004",
                "train_name": "Express Delta",
                "from_station": "S3",
                "to_station": "S5",
                "departure_time": 120,  # 2 minutes delay
                "arrival_time": 1200,  # 20 minutes
                "priority": 2,
                "type": "Express",
                "max_speed": 140.0,
                "length": 220.0,
                "max_capacity": 500
            }
        ]
    }


def run_basic_simulation():
    """Run a basic simulation example"""
    print("=== Basic Railway Simulation Example ===\n")
    
    # Initialize data loader
    data_loader = DataLoader()
    
    # Load network configuration
    network_config = create_sample_network()
    network = data_loader.load_railway_network(network_config)
    print(f"Loaded network with {len(network.stations)} stations and {len(network.blocks)} blocks")
    
    # Load GA output
    ga_output = create_sample_ga_output()
    print(f"Loaded GA output with {len(ga_output['trains'])} trains")
    
    # Build train paths
    train_paths = data_loader.build_train_paths(ga_output, network)
    print(f"Built paths for {len(train_paths)} trains")
    
    # Validate data
    errors = data_loader.validate_data(network, train_paths)
    if errors:
        print(f"Data validation errors: {errors}")
        return
    else:
        print("Data validation passed ✓")
    
    # Initialize trains
    trains = data_loader.initialize_trains(train_paths)
    print(f"Initialized {len(trains)} trains")
    
    # Create simulation engine
    engine = SimulationEngine(network, time_step=1.0)
    
    # Add trains to simulation
    for train in trains:
        engine.add_train(train)
    
    print("\n=== Running Simulation ===")
    print("Time\tTrain\tStatus\t\tStation\t\tDelay\tSpeed")
    print("-" * 70)
    
    # Run simulation with different priority rules
    priority_rules = ["priority", "first_come", "fifo"]
    
    for rule in priority_rules:
        print(f"\n--- Testing Priority Rule: {rule} ---")
        
        # Reset simulation
        engine.current_time = 0.0
        engine.logs = []
        engine.metrics = engine.metrics.__class__()
        engine.block_occupancy = {}
        
        # Reinitialize trains
        for train in trains:
            train.status = TrainStatus.STOPPED
            train.speed = 0.0
            train.current_delay = 0
            train.time_elapsed = 0.0
            train.current_station = train.route[0] if train.route else None
            train.next_station = train.route[1] if len(train.route) > 1 else None
        
        # Run simulation
        config = {"priority_rule": rule}
        logs = engine.run_simulation(max_time=3600, config=config)  # 1 hour simulation
        
        # Print summary
        print(f"Simulation completed in {engine.metrics.total_simulation_time:.1f} seconds")
        print(f"Total delays: {engine.metrics.total_delays} seconds")
        print(f"Max delay: {engine.metrics.max_delay} seconds")
        print(f"Average delay: {engine.metrics.average_delay:.1f} seconds")
        print(f"Conflicts resolved: {engine.metrics.conflict_count}")
        print(f"Trains completed: {engine.metrics.total_throughput}/{len(trains)}")
        
        # Show final train status
        print("\nFinal Train Status:")
        for train in trains:
            status_icon = "✓" if train.status == TrainStatus.ARRIVED else "○"
            print(f"  {status_icon} {train.name}: {train.status.value} (Delay: {train.current_delay}s)")


def run_conflict_scenario():
    """Run a scenario designed to test conflict resolution"""
    print("\n\n=== Conflict Resolution Test ===\n")
    
    # Create a scenario with trains that will conflict
    conflict_ga_output = {
        "trains": [
            {
                "train_id": "C001",
                "train_name": "High Priority Train",
                "from_station": "S1",
                "to_station": "S4",
                "departure_time": 0,
                "arrival_time": 1200,
                "priority": 5,  # High priority
                "type": "Express",
                "max_speed": 160.0
            },
            {
                "train_id": "C002",
                "train_name": "Low Priority Train",
                "from_station": "S1",
                "to_station": "S4",
                "departure_time": 60,  # 1 minute later
                "arrival_time": 1200,
                "priority": 1,  # Low priority
                "type": "Local",
                "max_speed": 100.0
            }
        ]
    }
    
    data_loader = DataLoader()
    network_config = create_sample_network()
    network = data_loader.load_railway_network(network_config)
    
    train_paths = data_loader.build_train_paths(conflict_ga_output, network)
    trains = data_loader.initialize_trains(train_paths)
    
    engine = SimulationEngine(network, time_step=1.0)
    for train in trains:
        engine.add_train(train)
    
    print("Running conflict scenario...")
    config = {"priority_rule": "priority"}
    logs = engine.run_simulation(max_time=1800, config=config)
    
    print(f"Conflicts resolved: {engine.metrics.conflict_count}")
    print("Final delays:")
    for train in trains:
        print(f"  {train.name}: {train.current_delay}s delay")


def export_simulation_data():
    """Export simulation data for analysis"""
    print("\n\n=== Exporting Simulation Data ===\n")
    
    data_loader = DataLoader()
    network_config = create_sample_network()
    network = data_loader.load_railway_network(network_config)
    
    ga_output = create_sample_ga_output()
    train_paths = data_loader.build_train_paths(ga_output, network)
    trains = data_loader.initialize_trains(train_paths)
    
    engine = SimulationEngine(network, time_step=5.0)  # 5-second time steps
    for train in trains:
        engine.add_train(train)
    
    config = {"priority_rule": "priority"}
    logs = engine.run_simulation(max_time=3600, config=config)
    
    # Export logs as JSON
    export_data = {
        "simulation_info": {
            "total_time": engine.metrics.total_simulation_time,
            "time_step": engine.time_step,
            "priority_rule": config["priority_rule"]
        },
        "metrics": {
            "total_delays": engine.metrics.total_delays,
            "max_delay": engine.metrics.max_delay,
            "average_delay": engine.metrics.average_delay,
            "conflict_count": engine.metrics.conflict_count,
            "total_throughput": engine.metrics.total_throughput
        },
        "logs": [
            {
                "time": log.time,
                "train_id": log.train_id,
                "current_station": log.current_station,
                "status": log.status.value,
                "delay": log.delay,
                "speed": log.speed,
                "position": log.position
            }
            for log in logs
        ]
    }
    
    # Save to file
    with open("simulation_results.json", "w") as f:
        json.dump(export_data, f, indent=2)
    
    print("Simulation data exported to 'simulation_results.json'")
    print(f"Total log entries: {len(logs)}")
    print(f"Simulation duration: {engine.metrics.total_simulation_time:.1f} seconds")


if __name__ == "__main__":
    print("Railway Simulation Backend - Example Script")
    print("=" * 50)
    
    try:
        # Run basic simulation
        run_basic_simulation()
        
        # Run conflict scenario
        run_conflict_scenario()
        
        # Export data
        export_simulation_data()
        
        print("\n" + "=" * 50)
        print("All examples completed successfully!")
        
    except Exception as e:
        print(f"Error running simulation: {e}")
        import traceback
        traceback.print_exc()

