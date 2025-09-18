import React, { useState } from 'react';
import { Filter, Download, Search, Clock, User, CheckCircle, XCircle } from 'lucide-react';

interface AuditRecord {
  id: string;
  timestamp: Date;
  controller: string;
  trainId: string;
  trainName: string;
  aiRecommendation: string;
  controllerDecision: 'accepted' | 'overridden' | 'modified';
  reason?: string;
  outcome: string;
  impactScore: number;
}

const AuditLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDecision, setFilterDecision] = useState('all');
  const [filterTrain, setFilterTrain] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const auditData: AuditRecord[] = [
    {
      id: '1',
      timestamp: new Date('2024-01-15 10:30:00'),
      controller: 'Rajesh Kumar',
      trainId: '12345',
      trainName: 'Rajdhani Express',
      aiRecommendation: 'Reroute via Junction C to reduce 5-minute delay',
      controllerDecision: 'accepted',
      outcome: 'Delay reduced to 2 minutes, no conflicts',
      impactScore: 8.5
    },
    {
      id: '2',
      timestamp: new Date('2024-01-15 11:45:00'),
      controller: 'Priya Singh',
      trainId: '67890',
      trainName: 'Shatabdi Express',
      aiRecommendation: 'Grant priority at Junction B',
      controllerDecision: 'overridden',
      reason: 'VIP passenger train had higher priority',
      outcome: 'Alternative solution implemented, 3-minute delay',
      impactScore: 7.2
    },
    {
      id: '3',
      timestamp: new Date('2024-01-15 14:20:00'),
      controller: 'Amit Patel',
      trainId: '11111',
      trainName: 'Duronto Express',
      aiRecommendation: 'Platform change from P2 to P4',
      controllerDecision: 'modified',
      reason: 'Changed to P3 due to maintenance work on P4',
      outcome: 'Successful platform change, on-time arrival',
      impactScore: 9.0
    },
    {
      id: '4',
      timestamp: new Date('2024-01-15 16:10:00'),
      controller: 'Sunita Mehta',
      trainId: '22222',
      trainName: 'Garib Rath',
      aiRecommendation: 'Hold at Signal X for 3 minutes',
      controllerDecision: 'accepted',
      outcome: 'Conflict avoided, smooth traffic flow maintained',
      impactScore: 8.8
    },
    {
      id: '5',
      timestamp: new Date('2024-01-15 18:30:00'),
      controller: 'Rajesh Kumar',
      trainId: '33333',
      trainName: 'Jan Shatabdi',
      aiRecommendation: 'Emergency reroute due to signal failure',
      controllerDecision: 'accepted',
      outcome: 'Quick resolution, minimal passenger impact',
      impactScore: 9.5
    }
  ];

  const filteredData = auditData.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.trainId.includes(searchTerm) || 
      record.trainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.controller.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDecision = filterDecision === 'all' || record.controllerDecision === filterDecision;
    const matchesTrain = filterTrain === '' || record.trainId === filterTrain;
    
    const matchesDate = (!dateRange.start || record.timestamp >= new Date(dateRange.start)) &&
      (!dateRange.end || record.timestamp <= new Date(dateRange.end));
    
    return matchesSearch && matchesDecision && matchesTrain && matchesDate;
  });

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overridden': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'modified': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return null;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'overridden': return 'bg-red-100 text-red-800';
      case 'modified': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportData = () => {
    const csv = [
      ['Timestamp', 'Controller', 'Train ID', 'Train Name', 'AI Recommendation', 'Decision', 'Reason', 'Outcome', 'Impact Score'].join(','),
      ...filteredData.map(record => [
        record.timestamp.toISOString(),
        record.controller,
        record.trainId,
        record.trainName,
        `"${record.aiRecommendation}"`,
        record.controllerDecision,
        `"${record.reason || ''}"`,
        `"${record.outcome}"`,
        record.impactScore
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Decision Audit Log</h2>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Train ID, name, or controller"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Decision Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Decisions</option>
              <option value="accepted">Accepted</option>
              <option value="overridden">Overridden</option>
              <option value="modified">Modified</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Decision History</h3>
            <span className="text-sm text-gray-600">{filteredData.length} records found</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Controller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Train
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Recommendation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Decision
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{record.timestamp.toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{record.timestamp.toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{record.controller}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.trainName}</div>
                    <div className="text-xs text-gray-500">ID: {record.trainId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={record.aiRecommendation}>
                      {record.aiRecommendation}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getDecisionIcon(record.controllerDecision)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDecisionColor(record.controllerDecision)}`}>
                        {record.controllerDecision.charAt(0).toUpperCase() + record.controllerDecision.slice(1)}
                      </span>
                    </div>
                    {record.reason && (
                      <div className="text-xs text-gray-500 mt-1" title={record.reason}>
                        {record.reason.length > 30 ? `${record.reason.substring(0, 30)}...` : record.reason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={record.outcome}>
                      {record.outcome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{record.impactScore}/10</div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            record.impactScore >= 8 ? 'bg-green-500' :
                            record.impactScore >= 6 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${record.impactScore * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No records found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Acceptance Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round((filteredData.filter(r => r.controllerDecision === 'accepted').length / filteredData.length) * 100)}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Impact Score</p>
              <p className="text-2xl font-bold text-blue-600">
                {(filteredData.reduce((sum, r) => sum + r.impactScore, 0) / filteredData.length).toFixed(1)}/10
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Decisions</p>
              <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
            </div>
            <User className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;