import React, { useState } from 'react';
import { Play, RotateCcw, BookOpen, Trophy, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  completed: boolean;
  score?: number;
}

interface Question {
  id: string;
  scenario: string;
  situation: string;
  options: string[];
  correct: number;
  explanation: string;
}

const Training: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  const scenarios: Scenario[] = [
    {
      id: '1',
      title: 'Signal Failure Management',
      description: 'Learn to handle signal failures and reroute trains safely',
      difficulty: 'beginner',
      duration: 15,
      completed: true,
      score: 85
    },
    {
      id: '2',
      title: 'Peak Hour Traffic Control',
      description: 'Manage heavy traffic during rush hours with optimal throughput',
      difficulty: 'intermediate',
      duration: 25,
      completed: true,
      score: 92
    },
    {
      id: '3',
      title: 'Emergency Response Protocol',
      description: 'Handle emergency situations while maintaining network safety',
      difficulty: 'advanced',
      duration: 30,
      completed: false
    },
    {
      id: '4',
      title: 'Multi-Junction Coordination',
      description: 'Coordinate train movements across multiple junctions simultaneously',
      difficulty: 'advanced',
      duration: 35,
      completed: false
    },
    {
      id: '5',
      title: 'Weather Impact Management',
      description: 'Adapt schedules and routes based on weather conditions',
      difficulty: 'intermediate',
      duration: 20,
      completed: false
    },
    {
      id: '6',
      title: 'AI Override Decision Making',
      description: 'Learn when and how to override AI recommendations effectively',
      difficulty: 'intermediate',
      duration: 18,
      completed: true,
      score: 78
    }
  ];

  const sampleQuestions: Question[] = [
    {
      id: '1',
      scenario: 'Signal Failure Management',
      situation: 'Signal at Junction A has failed, and Train 12345 (Rajdhani Express) is approaching with 450 passengers. Train 67890 is scheduled to cross the same junction in 8 minutes. What is your immediate action?',
      options: [
        'Stop Train 12345 at the previous station and wait for signal repair',
        'Manually control Train 12345 through the junction and delay Train 67890',
        'Reroute Train 12345 via alternate route and maintain Train 67890 schedule',
        'Contact maintenance team and halt all traffic until signal is restored'
      ],
      correct: 2,
      explanation: 'Rerouting via alternate route is the optimal solution as it maintains passenger service, prevents delays to other trains, and ensures safety without requiring manual signal control.'
    },
    {
      id: '2',
      scenario: 'Peak Hour Traffic Control',
      situation: 'During morning rush hour, you have 5 trains scheduled to arrive at the central station within 10 minutes. The AI recommends staggering arrivals with 2-minute intervals. However, this will cause a 6-minute delay to the last train. What do you decide?',
      options: [
        'Accept AI recommendation to ensure smooth platform operations',
        'Override and try to accommodate all trains with 1-minute intervals',
        'Accept for 4 trains and reroute the 5th to alternate platform',
        'Delay all trains by 2 minutes to create more buffer time'
      ],
      correct: 0,
      explanation: 'The AI recommendation prioritizes safety and operational efficiency. A 6-minute delay to one train is preferable to potential conflicts or overcrowding that could affect all trains.'
    },
    {
      id: '3',
      scenario: 'Emergency Response',
      situation: 'A medical emergency is reported on Train 11111 approaching Station B. The train needs immediate platform access, but Platform 1 is occupied by Train 22222 performing passenger boarding. What is your response?',
      options: [
        'Direct Train 11111 to Platform 2 and coordinate with medical team',
        'Expedite Train 22222 departure and clear Platform 1',
        'Hold Train 11111 at signal until Platform 1 is naturally available',
        'Coordinate parallel medical response at Platform 2 while expediting Platform 1'
      ],
      correct: 3,
      explanation: 'Emergency situations require quick coordination. Preparing medical response at Platform 2 while expediting Platform 1 clearance provides maximum flexibility and fastest response time.'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentQuestion(sampleQuestions[0]);
    setQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;
    
    if (selectedAnswer === currentQuestion.correct) {
      setScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (questionIndex < sampleQuestions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setCurrentQuestion(sampleQuestions[questionIndex + 1]);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Complete scenario
      setCurrentQuestion(null);
      const finalScore = Math.round((score / sampleQuestions.length) * 100);
      setSelectedScenario(prev => prev ? { ...prev, completed: true, score: finalScore } : null);
    }
  };

  const resetScenario = () => {
    setSelectedScenario(null);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuestionIndex(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Training & Skill Development</h2>
        {selectedScenario && (
          <button
            onClick={resetScenario}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Exit Training</span>
          </button>
        )}
      </div>

      {!selectedScenario ? (
        <>
          {/* Training Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-blue-600">12</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Total Scenarios</h3>
              <p className="text-sm text-gray-600">Available training modules</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
              <p className="text-sm text-gray-600">Scenarios finished</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-purple-600">85%</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Average Score</h3>
              <p className="text-sm text-gray-600">Performance rating</p>
            </div>
          </div>

          {/* Scenario List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Training Scenarios</h3>
              <p className="text-sm text-gray-600 mt-1">Practice real-world traffic control situations</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{scenario.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                      </div>
                      {scenario.completed && (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                        {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {scenario.duration} min
                      </span>
                      {scenario.completed && scenario.score && (
                        <span className="text-sm text-green-600 font-medium">
                          Score: {scenario.score}%
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => startScenario(scenario)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>{scenario.completed ? 'Replay' : 'Start'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : currentQuestion ? (
        /* Question Interface */
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{selectedScenario.title}</h3>
                <span className="text-sm text-gray-600">
                  Question {questionIndex + 1} of {sampleQuestions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${((questionIndex + 1) / sampleQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-xl font-medium text-gray-900 mb-4">Situation:</h4>
                <p className="text-gray-700 leading-relaxed">{currentQuestion.situation}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <h4 className="text-lg font-medium text-gray-900">What would you do?</h4>
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !showExplanation && handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      showExplanation
                        ? index === currentQuestion.correct
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : index === selectedAnswer && index !== currentQuestion.correct
                          ? 'border-red-500 bg-red-50 text-red-900'
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                        : selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        showExplanation
                          ? index === currentQuestion.correct
                            ? 'border-green-500 bg-green-500'
                            : index === selectedAnswer && index !== currentQuestion.correct
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                          : selectedAnswer === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {showExplanation && index === currentQuestion.correct && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                        {showExplanation && index === selectedAnswer && index !== currentQuestion.correct && (
                          <XCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {showExplanation && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                  <p className="text-blue-800">{currentQuestion.explanation}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Current Score: {score}/{questionIndex + (showExplanation ? 1 : 0)}
                </div>
                
                {!showExplanation ? (
                  <button
                    onClick={submitAnswer}
                    disabled={selectedAnswer === null}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    <span>Submit Answer</span>
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <span>{questionIndex < sampleQuestions.length - 1 ? 'Next Question' : 'Complete'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Scenario Complete */
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mb-6">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Scenario Complete!</h3>
              <p className="text-gray-600">{selectedScenario.title}</p>
            </div>
            
            <div className="mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {Math.round((score / sampleQuestions.length) * 100)}%
              </div>
              <p className="text-gray-600">Your Score</p>
              <p className="text-sm text-gray-500 mt-1">
                {score} out of {sampleQuestions.length} correct answers
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => startScenario(selectedScenario)}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={resetScenario}
                className="w-full px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
              >
                Back to Scenarios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;