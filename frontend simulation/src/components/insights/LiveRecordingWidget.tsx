import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Square, Volume2, Download } from 'lucide-react';

interface RecordingSession {
  id: string;
  timestamp: Date;
  duration: number;
  title: string;
  transcription?: string;
  insights: string[];
}

interface LiveRecordingWidgetProps {
  onRecordingComplete: (session: RecordingSession) => void;
}

const LiveRecordingWidget: React.FC<LiveRecordingWidgetProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentSession, setCurrentSession] = useState<RecordingSession | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecordingSession[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    setCurrentSession({
      id: Date.now().toString(),
      timestamp: new Date(),
      duration: 0,
      title: `Recording ${new Date().toLocaleTimeString()}`,
      insights: []
    });
  };

  const pauseRecording = () => {
    setIsPaused(!isPaused);
  };

  const stopRecording = () => {
    if (currentSession) {
      const completedSession: RecordingSession = {
        ...currentSession,
        duration: recordingTime,
        transcription: "Sample transcription: Controller discussed delay in Train 12345 due to signal failure at Junction A. Implemented AI recommendation for rerouting via Platform 3.",
        insights: [
          "Signal failure at Junction A caused 15-minute delay",
          "AI recommendation accepted for rerouting",
          "Platform 3 successfully accommodated diverted train",
          "No cascading delays to other services"
        ]
      };
      
      setRecentSessions(prev => [completedSession, ...prev.slice(0, 4)]);
      onRecordingComplete(completedSession);
    }
    
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setCurrentSession(null);
  };

  const playRecording = (sessionId: string) => {
    setIsPlaying(sessionId);
    // Simulate playback
    setTimeout(() => {
      setIsPlaying(null);
    }, 3000);
  };

  const downloadRecording = (session: RecordingSession) => {
    const data = {
      session,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording_${session.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Mic className="w-6 h-6 text-red-600" />
          <h3 className="text-xl font-semibold text-gray-900">Live Recording</h3>
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 font-medium">RECORDING</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Record operational decisions and AI interactions for analysis
        </p>
      </div>

      <div className="p-6">
        {/* Recording Controls */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Mic className="w-5 h-5" />
                <span>Start Recording</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={pauseRecording}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={stopRecording}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              </div>
            )}
          </div>

          {/* Recording Timer */}
          {isRecording && (
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
                {formatTime(recordingTime)}
              </div>
              <div className="text-sm text-gray-600">
                {isPaused ? 'Recording Paused' : 'Recording in Progress'}
              </div>
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Sessions</h4>
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900">{session.title}</h5>
                      <p className="text-sm text-gray-600">
                        {session.timestamp.toLocaleString()} • {formatTime(session.duration)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => playRecording(session.id)}
                        disabled={isPlaying === session.id}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Play recording"
                      >
                        {isPlaying === session.id ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => downloadRecording(session)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Download recording"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {session.transcription && (
                    <div className="mb-3">
                      <h6 className="text-sm font-medium text-gray-700 mb-1">Transcription</h6>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {session.transcription}
                      </p>
                    </div>
                  )}

                  {session.insights.length > 0 && (
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2">AI Insights</h6>
                      <ul className="space-y-1">
                        {session.insights.map((insight, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {recentSessions.length === 0 && !isRecording && (
          <div className="text-center py-8">
            <MicOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recordings yet</p>
            <p className="text-sm text-gray-400">Start recording to capture operational insights</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveRecordingWidget;