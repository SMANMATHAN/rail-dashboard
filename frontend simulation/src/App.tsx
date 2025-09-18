import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SimulationProvider } from './contexts/SimulationContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LiveOperations from './pages/LiveOperations';
import WhatIfScenario from './pages/WhatIfScenario';
import AuditLog from './pages/AuditLog';
import Analytics from './pages/Analytics';
import Training from './pages/Training';
import Assistant from './pages/Assistant';

function App() {
  return (
    <SimulationProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/live" element={<LiveOperations />} />
            <Route path="/what-if" element={<WhatIfScenario />} />
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/training" element={<Training />} />
            <Route path="/assistant" element={<Assistant />} />
          </Routes>
        </Layout>
      </Router>
    </SimulationProvider>
  );
}

export default App;