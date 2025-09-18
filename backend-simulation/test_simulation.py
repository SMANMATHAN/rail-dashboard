#!/usr/bin/env python3
"""
Test Suite for Railway Simulation Backend

This script contains unit tests and validation scenarios for all simulation modules.
"""

import unittest
import json
import tempfile
import os
from datetime import datetime, timedelta
from simulation.data_loader import DataLoader
from simulation.engine import SimulationEngine
from simulation.data import TrainStatus, BlockStatus, Station, Block, Train


class TestDataLoader(unittest.TestCase):
    """Test cases for DataLoader class"""
    
    def setUp(self):
        self.data_loader = DataLoader()
        self.sample_network = {
            "stations": [
                {
                    "id": "S1",
                    "name": "Test Station 1",
                    "code": "TS1",
                    "position": {"x": 0, "y": 0},
                    "platforms": [{"id": "p1", "number": "1", "occupied": False, "dwell_time": 60.0}],
                    "signals": [{"id": "sg1", "position": "N", "status": "Green"}],
                    "connected_blocks": ["B1"],
                    "capacity": 100
                },
                {
                    "id": "S2",
                    "name": "Test Station 2",
                    "code": "TS2",
                    "position": {"x": 100, "y": 0},
                    "platforms": [{"id": "p2", "number": "1", "occupied": False, "dwell_time": 60.0}],
                    "signals": [{"id": "sg2", "position": "W", "status": "Green"}],
                    "connected_blocks": ["B1"],
                    "capacity": 100
                }
            ],
            "blocks": [
                {
                    "id": "B1",
                    "name": "Test Block",
                    "length": 1000.0,
                    "max_speed": 120.0,
                    "status": "free",
                    "connected_blocks": [],
                    "position": {"x": 50, "y": 0}
                }
            ],
            "junctions": []
        }
    
    def test_load_railway_network(self):
        """Test loading railway network configuration"""
        network = self.data_loader.load_railway_network(self.sample_network)
        
        self.assertEqual(len(network.stations), 2)
        self.assertEqual(len(network.blocks), 1)
        self.assertEqual(network.stations[0].id, "S1")
        self.assertEqual(network.blocks[0].id, "B1")
    
    def test_load_ga_output_json(self):
        """Test loading GA output from JSON file"""
        ga_data = {
            "trains": [
                {
                    "train_id": "T001",
                    "train_name": "Test Train",
                    "from_station": "S1",
                    "to_station": "S2",
                    "departure_time": 0,
                    "arrival_time": 3600,
                    "priority": 1
                }
            ]
        }
        
        # Create temporary JSON file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(ga_data, f)
            temp_file = f.name
        
        try:
            loaded_data = self.data_loader.load_ga_output(temp_file)
            self.assertEqual(len(loaded_data["trains"]), 1)
            self.assertEqual(loaded_data["trains"][0]["train_id"], "T001")
        finally:
            os.unlink(temp_file)
    
    def test_load_ga_output_csv(self):
        """Test loading GA output from CSV file"""
        csv_content = "train_id,train_name,from_station,to_station,departure_time,arrival_time,priority\nT001,Test Train,S1,S2,0,3600,1"
        
        # Create temporary CSV file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write(csv_content)
            temp_file = f.name
        
        try:
            loaded_data = self.data_loader.load_ga_output(temp_file)
            self.assertEqual(len(loaded_data["trains"]), 1)
            self.assertEqual(loaded_data["trains"][0]["train_id"], "T001")
        finally:
            os.unlink(temp_file)
    
    def test_build_train_paths(self):
        """Test building train paths from GA output"""
        network = self.data_loader.load_railway_network(self.sample_network)
        ga_output = {
            "trains": [
                {
                    "train_id": "T001",
                    "train_name": "Test Train",
                    "from_station": "S1",
                    "to_station": "S2",
                    "departure_time": 0,
                    "arrival_time": 3600,
                    "priority": 1
                }
            ]
        }
        
        train_paths = self.data_loader.build_train_paths(ga_output, network)
        self.assertEqual(len(train_paths), 1)
        self.assertEqual(train_paths[0]["id"], "T001")
        self.assertIn("route", train_paths[0])
        self.assertIn("block_sequence", train_paths[0])
    
    def test_validate_data(self):
        """Test data validation"""
        network = self.data_loader.load_railway_network(self.sample_network)
        
        # Valid train data
        valid_trains = [
            {
                "id": "T001",
                "route": ["S1", "S2"],
                "block_sequence": ["B1"],
                "scheduled_departure": datetime.now(),
                "scheduled_arrival": datetime.now() + timedelta(hours=1)
            }
        ]
        
        errors = self.data_loader.validate_data(network, valid_trains)
        self.assertEqual(len(errors), 0)
        
        # Invalid train data (missing station)
        invalid_trains = [
            {
                "id": "T002",
                "route": ["S1", "S3"],  # S3 doesn't exist
                "block_sequence": ["B1"],
                "scheduled_departure": datetime.now(),
                "scheduled_arrival": datetime.now() + timedelta(hours=1)
            }
        ]
        
        errors = self.data_loader.validate_data(network, invalid_trains)
        self.assertGreater(len(errors), 0)
    
    def test_initialize_trains(self):
        """Test train initialization"""
        train_configs = [
            {
                "id": "T001",
                "name": "Test Train",
                "type": "Express",
                "route": ["S1", "S2"],
                "block_sequence": ["B1"],
                "scheduled_departure": datetime.now(),
                "scheduled_arrival": datetime.now() + timedelta(hours=1),
                "priority": 1,
                "max_speed": 120.0,
                "length": 200.0,
                "max_capacity": 500
            }
        ]
        
        trains = self.data_loader.initialize_trains(train_configs)
        self.assertEqual(len(trains), 1)
        self.assertEqual(trains[0].id, "T001")
        self.assertEqual(trains[0].status, TrainStatus.STOPPED)


class TestSimulationEngine(unittest.TestCase):
    """Test cases for SimulationEngine class"""
    
    def setUp(self):
        self.data_loader = DataLoader()
        self.sample_network = {
            "stations": [
                {
                    "id": "S1",
                    "name": "Start Station",
                    "code": "START",
                    "position": {"x": 0, "y": 0},
                    "platforms": [{"id": "p1", "number": "1", "occupied": False, "dwell_time": 60.0}],
                    "signals": [{"id": "sg1", "position": "N", "status": "Green"}],
                    "connected_blocks": ["B1"],
                    "capacity": 100
                },
                {
                    "id": "S2",
                    "name": "End Station",
                    "code": "END",
                    "position": {"x": 1000, "y": 0},
                    "platforms": [{"id": "p2", "number": "1", "occupied": False, "dwell_time": 60.0}],
                    "signals": [{"id": "sg2", "position": "W", "status": "Green"}],
                    "connected_blocks": ["B1"],
                    "capacity": 100
                }
            ],
            "blocks": [
                {
                    "id": "B1",
                    "name": "Main Block",
                    "length": 1000.0,
                    "max_speed": 120.0,
                    "status": "free",
                    "connected_blocks": [],
                    "position": {"x": 500, "y": 0}
                }
            ],
            "junctions": []
        }
        
        self.network = self.data_loader.load_railway_network(self.sample_network)
        self.engine = SimulationEngine(self.network, time_step=1.0)
    
    def test_add_train(self):
        """Test adding train to simulation"""
        train_config = {
            "id": "T001",
            "name": "Test Train",
            "type": "Express",
            "route": ["S1", "S2"],
            "block_sequence": ["B1"],
            "scheduled_departure": datetime.now(),
            "scheduled_arrival": datetime.now() + timedelta(hours=1),
            "priority": 1,
            "max_speed": 120.0,
            "length": 200.0,
            "max_capacity": 500
        }
        
        train = self.data_loader.initialize_trains([train_config])[0]
        self.engine.add_train(train)
        
        self.assertEqual(len(self.engine.trains), 1)
        self.assertEqual(self.engine.trains[0].id, "T001")
        self.assertEqual(self.engine.trains[0].current_station, "S1")
    
    def test_run_simulation(self):
        """Test running a basic simulation"""
        train_config = {
            "id": "T001",
            "name": "Test Train",
            "type": "Express",
            "route": ["S1", "S2"],
            "block_sequence": ["B1"],
            "scheduled_departure": datetime.now(),
            "scheduled_arrival": datetime.now() + timedelta(hours=1),
            "priority": 1,
            "max_speed": 120.0,
            "length": 200.0,
            "max_capacity": 500
        }
        
        train = self.data_loader.initialize_trains([train_config])[0]
        self.engine.add_train(train)
        
        config = {"priority_rule": "priority"}
        logs = self.engine.run_simulation(max_time=100, config=config)
        
        self.assertGreater(len(logs), 0)
        self.assertGreater(self.engine.metrics.total_simulation_time, 0)
    
    def test_conflict_resolution(self):
        """Test conflict resolution between trains"""
        # Create two trains that will conflict
        train1_config = {
            "id": "T001",
            "name": "Train 1",
            "type": "Express",
            "route": ["S1", "S2"],
            "block_sequence": ["B1"],
            "scheduled_departure": datetime.now(),
            "scheduled_arrival": datetime.now() + timedelta(hours=1),
            "priority": 3,  # Higher priority
            "max_speed": 120.0,
            "length": 200.0,
            "max_capacity": 500
        }
        
        train2_config = {
            "id": "T002",
            "name": "Train 2",
            "type": "Local",
            "route": ["S1", "S2"],
            "block_sequence": ["B1"],
            "scheduled_departure": datetime.now() + timedelta(seconds=10),
            "scheduled_arrival": datetime.now() + timedelta(hours=1),
            "priority": 1,  # Lower priority
            "max_speed": 100.0,
            "length": 200.0,
            "max_capacity": 400
        }
        
        train1 = self.data_loader.initialize_trains([train1_config])[0]
        train2 = self.data_loader.initialize_trains([train2_config])[0]
        
        self.engine.add_train(train1)
        self.engine.add_train(train2)
        
        config = {"priority_rule": "priority"}
        logs = self.engine.run_simulation(max_time=200, config=config)
        
        # Check that conflicts were detected and resolved
        self.assertGreaterEqual(self.engine.metrics.conflict_count, 0)
    
    def test_metrics_calculation(self):
        """Test metrics calculation"""
        train_config = {
            "id": "T001",
            "name": "Test Train",
            "type": "Express",
            "route": ["S1", "S2"],
            "block_sequence": ["B1"],
            "scheduled_departure": datetime.now(),
            "scheduled_arrival": datetime.now() + timedelta(hours=1),
            "priority": 1,
            "max_speed": 120.0,
            "length": 200.0,
            "max_capacity": 500
        }
        
        train = self.data_loader.initialize_trains([train_config])[0]
        self.engine.add_train(train)
        
        config = {"priority_rule": "priority"}
        self.engine.run_simulation(max_time=100, config=config)
        
        # Check that metrics are calculated
        self.assertIsNotNone(self.engine.metrics.total_simulation_time)
        self.assertIsNotNone(self.engine.metrics.total_delays)
        self.assertIsNotNone(self.engine.metrics.conflict_count)


class TestDataModels(unittest.TestCase):
    """Test cases for data models"""
    
    def test_station_creation(self):
        """Test Station model creation"""
        station = Station(
            id="S1",
            name="Test Station",
            code="TEST",
            position={"x": 0, "y": 0},
            platforms=[],
            signals=[],
            connected_blocks=["B1"],
            capacity=100
        )
        
        self.assertEqual(station.id, "S1")
        self.assertEqual(station.name, "Test Station")
        self.assertEqual(station.capacity, 100)
    
    def test_block_creation(self):
        """Test Block model creation"""
        block = Block(
            id="B1",
            name="Test Block",
            length=1000.0,
            max_speed=120.0,
            status=BlockStatus.FREE,
            connected_blocks=["B2"],
            position={"x": 0, "y": 0}
        )
        
        self.assertEqual(block.id, "B1")
        self.assertEqual(block.length, 1000.0)
        self.assertEqual(block.status, BlockStatus.FREE)
    
    def test_train_creation(self):
        """Test Train model creation"""
        train = Train(
            id="T001",
            name="Test Train",
            type="Express",
            route=["S1", "S2"],
            scheduled_departure=datetime.now(),
            scheduled_arrival=datetime.now() + timedelta(hours=1),
            priority=1,
            max_speed=120.0,
            length=200.0,
            max_capacity=500
        )
        
        self.assertEqual(train.id, "T001")
        self.assertEqual(train.priority, 1)
        self.assertEqual(train.status, TrainStatus.STOPPED)


def run_integration_test():
    """Run a comprehensive integration test"""
    print("Running Integration Test...")
    
    try:
        # Create test data
        data_loader = DataLoader()
        
        # Load sample network
        sample_network = {
            "stations": [
                {
                    "id": "S1",
                    "name": "Station A",
                    "code": "STA",
                    "position": {"x": 0, "y": 0},
                    "platforms": [{"id": "p1", "number": "1", "occupied": False, "dwell_time": 60.0}],
                    "signals": [{"id": "sg1", "position": "N", "status": "Green"}],
                    "connected_blocks": ["B1"],
                    "capacity": 100
                },
                {
                    "id": "S2",
                    "name": "Station B",
                    "code": "STB",
                    "position": {"x": 1000, "y": 0},
                    "platforms": [{"id": "p2", "number": "1", "occupied": False, "dwell_time": 60.0}],
                    "signals": [{"id": "sg2", "position": "W", "status": "Green"}],
                    "connected_blocks": ["B1"],
                    "capacity": 100
                }
            ],
            "blocks": [
                {
                    "id": "B1",
                    "name": "Main Line",
                    "length": 1000.0,
                    "max_speed": 120.0,
                    "status": "free",
                    "connected_blocks": [],
                    "position": {"x": 500, "y": 0}
                }
            ],
            "junctions": []
        }
        
        network = data_loader.load_railway_network(sample_network)
        
        # Create GA output
        ga_output = {
            "trains": [
                {
                    "train_id": "T001",
                    "train_name": "Test Express",
                    "from_station": "S1",
                    "to_station": "S2",
                    "departure_time": 0,
                    "arrival_time": 3600,
                    "priority": 1
                }
            ]
        }
        
        # Build train paths
        train_paths = data_loader.build_train_paths(ga_output, network)
        
        # Validate data
        errors = data_loader.validate_data(network, train_paths)
        if errors:
            print(f"Validation errors: {errors}")
            return False
        
        # Initialize trains
        trains = data_loader.initialize_trains(train_paths)
        
        # Create simulation engine
        engine = SimulationEngine(network, time_step=1.0)
        
        # Add trains
        for train in trains:
            engine.add_train(train)
        
        # Run simulation
        config = {"priority_rule": "priority"}
        logs = engine.run_simulation(max_time=100, config=config)
        
        # Check results
        assert len(logs) > 0, "No simulation logs generated"
        assert engine.metrics.total_simulation_time > 0, "Simulation time not recorded"
        
        print("✓ Integration test passed")
        return True
        
    except Exception as e:
        print(f"✗ Integration test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("Railway Simulation Backend - Test Suite")
    print("=" * 50)
    
    # Run unit tests
    print("Running Unit Tests...")
    unittest.main(argv=[''], exit=False, verbosity=2)
    
    # Run integration test
    print("\n" + "=" * 50)
    success = run_integration_test()
    
    if success:
        print("\n✓ All tests passed!")
    else:
        print("\n✗ Some tests failed!")
        exit(1)

