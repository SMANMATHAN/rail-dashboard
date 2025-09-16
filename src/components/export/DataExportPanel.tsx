import React, { useState } from 'react';
import { Download, Calendar, Filter } from 'lucide-react';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  format: 'csv' | 'json' | 'pdf' | 'excel';
  icon: string;
}

interface DataExportPanelProps {
  onExport: (options: ExportOptions) => void;
}

interface ExportOptions {
  type: string;
  format: string;
  dateRange: {
    start: string;
    end: string;
  };
  includeRecommendations: boolean;
  includeDescriptions: boolean;
  filters: {
    trainTypes: string[];
    zones: string[];
    statuses: string[];
  };
}

const DataExportPanel: React.FC<DataExportPanelProps> = ({ onExport }) => {
  const [selectedExportType, setSelectedExportType] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeDescriptions, setIncludeDescriptions] = useState(true);
  const [selectedTrainTypes, setSelectedTrainTypes] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions: ExportOption[] = [
    {
      id: 'operations',
      name: 'Operations Data',
      description: 'Train schedules, delays, and real-time status',
      format: 'csv',
      icon: '🚂'
    },
    {
      id: 'recommendations',
      name: 'AI Recommendations',
      description: 'AI suggestions and controller decisions',
      format: 'json',
      icon: '🤖'
    },
    {
      id: 'analytics',
      name: 'Analytics Report',
      description: 'Performance metrics and trend analysis',
      format: 'pdf',
      icon: '📊'
    },
    {
      id: 'audit',
      name: 'Audit Log',
      description: 'Complete decision history and explanations',
      format: 'excel',
      icon: '📋'
    },
    {
      id: 'scenarios',
      name: 'What-If Scenarios',
      description: 'Scenario details and simulation results',
      format: 'json',
      icon: '🔮'
    }
  ];

  const formats = [
    { value: 'csv', label: 'CSV', icon: '📄' },
    { value: 'json', label: 'JSON', icon: '📝' },
    { value: 'pdf', label: 'PDF', icon: '📕' },
    { value: 'excel', label: 'Excel', icon: '📊' }
  ];

  const trainTypes = ['Express', 'Passenger', 'Freight', 'Suburban'];
  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];
  const statuses = ['On Time', 'Delayed', 'Critical', 'Cancelled'];

  const handleExport = async () => {
    if (!selectedExportType) return;

    setIsExporting(true);
    
    const exportOptions: ExportOptions = {
      type: selectedExportType,
      format: selectedFormat,
      dateRange,
      includeRecommendations,
      includeDescriptions,
      filters: {
        trainTypes: selectedTrainTypes,
        zones: selectedZones,
        statuses: selectedStatuses
      }
    };

    try {
      await onExport(exportOptions);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleArraySelection = (
    array: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Download className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold leading-tight text-gray-900">Data Export</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Export train management data with detailed descriptions and AI insights
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Export Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Data Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedExportType(option.id)}
                className={`p-4 text-left border rounded-lg transition-all ${
                  selectedExportType === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2 min-w-0">
                  <span className="text-2xl shrink-0">{option.icon}</span>
                  <h4 className="font-medium text-gray-900 truncate">{option.name}</h4>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedExportType && (
          <>
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Export Format
              </label>
              <div className="flex flex-wrap gap-3">
                {formats.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    className={`inline-flex h-10 items-center gap-2 px-4 border rounded-lg transition-all ${
                      selectedFormat === format.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{format.icon}</span>
                    <span className="text-sm font-medium">{format.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Content Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Content Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeRecommendations}
                    onChange={(e) => setIncludeRecommendations(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include AI Recommendations</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeDescriptions}
                    onChange={(e) => setIncludeDescriptions(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include Detailed Descriptions</span>
                </label>
              </div>
            </div>

            {/* Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Filter className="w-4 h-4 inline mr-1" />
                Filters (Optional)
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Train Types */}
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Train Types</label>
                  <div className="space-y-2">
                    {trainTypes.map((type) => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTrainTypes.includes(type)}
                          onChange={() => toggleArraySelection(selectedTrainTypes, setSelectedTrainTypes, type)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Zones */}
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Zones</label>
                  <div className="space-y-2">
                    {zones.map((zone) => (
                      <label key={zone} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedZones.includes(zone)}
                          onChange={() => toggleArraySelection(selectedZones, setSelectedZones, zone)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{zone}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Statuses */}
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Status</label>
                  <div className="space-y-2">
                    {statuses.map((status) => (
                      <label key={status} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={() => toggleArraySelection(selectedStatuses, setSelectedStatuses, status)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full inline-flex h-11 items-center justify-center gap-2 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataExportPanel;