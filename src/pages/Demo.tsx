import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Mic, Send, Volume2, Settings } from 'lucide-react';

const Demo: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant' as const,
      content: 'Hello! I\'m your AI assistant powered by GPT-OSS-20B. I can help you with questions, writing, analysis, and more. Try asking me something!',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `I understand you said: "${inputText.trim()}". This is a demo response. In the full application, I would connect to the GPT-OSS-20B model via Hugging Face's inference API to provide real AI-powered responses. I can also handle voice input and text-to-speech output!`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Assistant Demo</h1>
              <p className="text-sm text-gray-500">Powered by GPT-OSS-20B</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Demo Mode
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-blue-500' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                {message.role === 'user' ? (
                  <span className="text-white text-sm font-bold">U</span>
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div className={`rounded-lg px-4 py-3 max-w-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-900 shadow-sm border border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-1">
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white text-gray-900 shadow-sm border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border-t border-blue-200 px-6 py-4">
        <div className="text-center">
          <h3 className="text-sm font-medium text-blue-900 mb-2">🚀 Full Features Available</h3>
          <p className="text-sm text-blue-700 mb-3">
            This demo shows the UI. To enable full AI functionality:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-blue-600">
            <div className="bg-white rounded-lg p-3">
              <div className="font-medium mb-1">🎤 Voice Recognition</div>
              <div>Real-time speech-to-text</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="font-medium mb-1">🤖 AI Responses</div>
              <div>GPT-OSS-20B powered</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="font-medium mb-1">🔊 Text-to-Speech</div>
              <div>AI-powered voice output</div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message (demo mode - will show simulated response)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Voice Input Button (Demo) */}
            <button
              type="button"
              disabled
              className="p-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
              title="Voice input requires full setup"
            >
              <Mic className="w-5 h-5" />
            </button>
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Demo;