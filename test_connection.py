#!/usr/bin/env python3
"""
Test script to verify backend and frontend connectivity
"""

import requests
import time
import json

def test_backend():
    """Test backend API endpoints"""
    base_url = "http://localhost:8000"
    
    print("Testing Backend API...")
    
    try:
        # Test health endpoint
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✓ Backend health check passed")
            print(f"  Response: {response.json()}")
        else:
            print(f"✗ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to backend. Is the server running?")
        return False
    except Exception as e:
        print(f"✗ Backend error: {e}")
        return False
    
    try:
        # Test sample network endpoint
        response = requests.get(f"{base_url}/network/sample", timeout=5)
        if response.status_code == 200:
            print("✓ Sample network endpoint working")
            data = response.json()
            print(f"  Found {len(data.get('stations', []))} stations")
        else:
            print(f"✗ Sample network endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Sample network error: {e}")
    
    try:
        # Test simulation endpoint
        simulation_data = {
            "trains": [
                {
                    "id": "T001",
                    "name": "Test Train",
                    "from_station": "S1",
                    "to_station": "S2",
                    "departure_time": 0,
                    "arrival_time": 3600,
                    "priority": 1,
                    "train_type": "Express",
                    "max_speed": 120.0,
                    "length": 200.0,
                    "max_capacity": 500
                }
            ],
            "priority_rule": "priority",
            "max_time": 100,
            "time_step": 1.0
        }
        
        response = requests.post(f"{base_url}/simulate", json=simulation_data, timeout=30)
        if response.status_code == 200:
            print("✓ Simulation endpoint working")
            data = response.json()
            if data.get('success'):
                print(f"  Simulation completed with {len(data.get('logs', []))} log entries")
                print(f"  Metrics: {data.get('metrics', {})}")
            else:
                print(f"  Simulation failed: {data.get('message', 'Unknown error')}")
        else:
            print(f"✗ Simulation endpoint failed: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"✗ Simulation error: {e}")
    
    return True

def test_frontend():
    """Test frontend connectivity"""
    print("\nTesting Frontend...")
    
    try:
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print("✓ Frontend is accessible")
            return True
        else:
            print(f"✗ Frontend returned status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to frontend. Is the dev server running?")
        print("  Try running: npm run dev")
        return False
    except Exception as e:
        print(f"✗ Frontend error: {e}")
        return False

def main():
    print("Railway Simulation System - Connection Test")
    print("=" * 50)
    
    # Wait a moment for servers to start
    print("Waiting for servers to start...")
    time.sleep(2)
    
    backend_ok = test_backend()
    frontend_ok = test_frontend()
    
    print("\n" + "=" * 50)
    if backend_ok and frontend_ok:
        print("✓ All systems operational!")
        print("\nYou can now access:")
        print("  Frontend: http://localhost:5173")
        print("  Backend API: http://localhost:8000")
        print("  API Docs: http://localhost:8000/docs")
    else:
        print("✗ Some systems are not working properly")
        if not backend_ok:
            print("  - Backend server needs to be started")
        if not frontend_ok:
            print("  - Frontend dev server needs to be started")

if __name__ == "__main__":
    main()

