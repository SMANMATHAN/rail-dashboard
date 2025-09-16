import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Languages, Volume2, Download, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  language: string;
}

const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant for railway traffic control. I can help you with train schedules, traffic analysis, delay management, and answer any questions about operations. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date(),
      language: 'en'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const getAIResponse = (userMessage: string, language: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simulate language-specific responses
    if (language === 'hi') {
      if (lowerMessage.includes('delay') || lowerMessage.includes('देरी')) {
        return 'वर्तमान ट्रैफिक विश्लेषण के आधार पर, ट्रेन 12345 में सिग्नल रखरखाव के कारण 15 मिनट की देरी है। मैं प्लेटफॉर्म 3 के माध्यम से पुनर्निर्देशन की सिफारिश करता हूं।';
      }
      return 'मैं रेलवे ट्रैफिक नियंत्रण में आपकी सहायता के लिए यहाँ हूँ। कृपया अपना प्रश्न पूछें।';
    }
    
    // English responses
    if (lowerMessage.includes('delay') || lowerMessage.includes('late')) {
      return 'Based on current traffic analysis, Train 12345 has a 15-minute delay due to signal maintenance at Junction A. I recommend rerouting via Platform 3 to minimize impact on connecting services. Would you like me to simulate this rerouting?';
    } else if (lowerMessage.includes('train') && (lowerMessage.includes('101') || lowerMessage.includes('12345'))) {
      return 'Train 12345 (Rajdhani Express) is currently at Junction A, scheduled to arrive at Central Station at 14:30. It\'s carrying 450 passengers and has priority status. Current status: On time. Next decision point: Junction B in 8 minutes.';
    } else if (lowerMessage.includes('what if') || lowerMessage.includes('scenario')) {
      return 'I can run what-if scenarios for you. Please specify: 1) Which train? 2) What delay or change? 3) Time period to analyze? For example: "What if Train 67890 is delayed 20 minutes starting now?"';
    } else if (lowerMessage.includes('conflict') || lowerMessage.includes('collision')) {
      return 'Current conflict status: No active conflicts detected. All trains are maintaining safe separation distances. Next potential conflict point: Junction C at 15:45 between Trains 11111 and 22222 - AI has already optimized timing to prevent issues.';
    } else if (lowerMessage.includes('analytics') || lowerMessage.includes('performance')) {
      return 'Today\'s performance metrics: On-time performance: 94.2%, Average delay reduction: 18.5 minutes, AI acceptance rate: 87.3%, Network throughput: 247 trains/hour. Would you like detailed analysis of any specific metric?';
    } else if (lowerMessage.includes('weather') || lowerMessage.includes('rain')) {
      return 'Current weather impact: Light rain reported in Sector 3. Speed restrictions active on Routes A and B. Estimated delays: 5-8 minutes. I\'ve preemptively adjusted 12 train schedules to maintain optimal flow.';
    } else if (lowerMessage.includes('platform') || lowerMessage.includes('station')) {
      return 'Station status: Platform 1: Train 12345 arriving 14:30, Platform 2: Available, Platform 3: Train 67890 departing 14:25, Platform 4: Under maintenance until 16:00. Next available slot: Platform 2 at 14:35.';
    } else if (lowerMessage.includes('emergency')) {
      return 'Emergency protocols are active. I\'ve alerted all relevant personnel and initiated safety procedures. Current priority: Ensure all trains maintain safe distances. Emergency services have been notified. How can I assist with the emergency response?';
    } else if (lowerMessage.includes('override') || lowerMessage.includes('manual')) {
      return 'Override request noted. Please confirm: 1) Which AI recommendation are you overriding? 2) Your alternative decision? 3) Reason for override? This will be logged for analysis and system learning.';
    } else {
      return 'I understand you\'re asking about railway operations. I can help with train schedules, delays, conflicts, analytics, emergency protocols, and operational decisions. Please provide more specific details about what you\'d like to know or what situation you\'re dealing with.';
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'user',
        timestamp: new Date(),
        language: selectedLanguage
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      setIsTyping(true);
      
      // Simulate AI processing time
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: getAIResponse(inputText, selectedLanguage),
          sender: 'ai',
          timestamp: new Date(),
          language: selectedLanguage
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // In a real app, this would integrate with speech recognition API
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setInputText('What is the current status of Train 12345?');
      }, 3000);
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const exportConversation = () => {
    const conversation = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.sender.toUpperCase()}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `railway_ai_conversation_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearConversation = () => {
    setMessages([{
      id: '1',
      text: 'Hello! I\'m your AI assistant for railway traffic control. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date(),
      language: selectedLanguage
    }]);
  };

  return (
    <div className="h-screen flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">AI</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Railway AI Assistant</h2>
              <p className="text-sm text-gray-600">Intelligent Traffic Control Support</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={exportConversation}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export conversation"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={clearConversation}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
                <div className={`flex items-center mt-2 space-x-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.sender === 'ai' && (
                    <button
                      onClick={() => speakMessage(message.text)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-3xl">
                <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedLanguage === 'hi' ? 'अपना प्रश्न यहाँ लिखें...' : 'Type your question about railway operations...'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                disabled={isListening}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={toggleVoiceInput}
                className={`p-3 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {isListening && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                Listening... Speak your question now
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Questions:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            'What is the current network status?',
            'Show me delayed trains',
            'Any conflicts in the next hour?',
            'Platform availability status'
          ].map((question, index) => (
            <button
              key={index}
              onClick={() => setInputText(question)}
              className="text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assistant;