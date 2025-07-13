// app/_components/ChatBox.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, MicOff, Square, Upload, Download } from 'lucide-react';
import { useVoiceRecorder } from '../_hooks/useVoiceRecorder';

const ChatBox: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your voice shopping assistant. How can I help you find products today?", sender: 'ai' },
  ]);
  
  // Use a ref to track the ID counter to avoid stale closure issues
  const messageIdCounter = useRef(2);

  const generateUniqueId = () => {
    const id = messageIdCounter.current;
    messageIdCounter.current += 1;
    return id;
  };

  const {
    isRecording,
    isProcessing,
    hasRecording,
    audioUrl,
    error: voiceError,
    status,
    startRecording,
    stopRecording,
    uploadAudio,
    clearRecording,
    isLibraryLoaded,
  } = useVoiceRecorder();

  const handleVoiceToggle = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleUploadVoice = async () => {
    if (!hasRecording) return;

    // Generate unique IDs upfront
    const userMessageId = generateUniqueId();
    const loadingId = generateUniqueId();

    try {
      // Add user message indicating voice upload
      setMessages(prev => [...prev, { 
        id: userMessageId, 
        text: "🎤 Voice message uploaded", 
        sender: 'user' 
      }]);

      setMessages(prev => [...prev, { 
        id: loadingId, 
        text: "Processing your voice message...", 
        sender: 'ai' 
      }]);

      // Upload audio and get transcription
      const result = await uploadAudio('user-123');

      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== loadingId));

      // Add transcription message
      const transcriptionId = generateUniqueId();
      setMessages(prev => [...prev, { 
        id: transcriptionId, 
        text: `I heard: "${result.transcription}"`, 
        sender: 'ai' 
      }]);

      // Add recommendations
      const recommendationsId = generateUniqueId();
      setMessages(prev => [...prev, { 
        id: recommendationsId, 
        text: result.recommendations, 
        sender: 'ai' 
      }]);

      // If there's a download URL, show download option
      if (result.downloadUrl) {
        const downloadId = generateUniqueId();
        setMessages(prev => [...prev, { 
          id: downloadId, 
          text: "📄 Transcript saved! Click to download.", 
          sender: 'ai',
          downloadUrl: result.downloadUrl
        }]);
      }

      // Clear the recording
      clearRecording();

    } catch (error) {
      console.error('Voice upload error:', error);
      
      // Remove loading message and show error
      setMessages(prev => prev.filter(msg => msg.id !== loadingId));
      const errorId = generateUniqueId();
      setMessages(prev => [...prev, { 
        id: errorId, 
        text: "Sorry, I couldn't process your voice message. Please try again.", 
        sender: 'ai' 
      }]);
    }
  };

  const handleDownloadTranscript = (downloadUrl: string) => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.click();
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = message.trim();
      const userMessageId = generateUniqueId();
      const loadingId = generateUniqueId();
      
      setMessages(prev => [...prev, { id: userMessageId, text: userMessage, sender: 'user' }]);
      setMessage('');
      
      // Show loading state
      setMessages(prev => [...prev, { 
        id: loadingId, 
        text: "I'm searching for products that match your request...", 
        sender: 'ai' 
      }]);

      try {
        // Hit the recommendations API
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            userId: 'user-123', // This would come from user authentication in real app
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Remove loading message and add AI response
        setMessages(prev => prev.filter(msg => msg.id !== loadingId));
        const responseId = generateUniqueId();
        setMessages(prev => [...prev, { 
          id: responseId, 
          text: data.message, 
          sender: 'ai' 
        }]);

      } catch (error) {
        console.error('Error calling recommendations API:', error);
        
        // Remove loading message and show error
        setMessages(prev => prev.filter(msg => msg.id !== loadingId));
        const errorId = generateUniqueId();
        setMessages(prev => [...prev, { 
          id: errorId, 
          text: "Sorry, I'm having trouble connecting to our recommendation service. Please try again.", 
          sender: 'ai' 
        }]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-800/30 rounded-2xl p-6 shadow-2xl backdrop-blur-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-purple-300">Voice Assistant</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isRecording ? 'bg-red-400 animate-pulse' : 
            isProcessing ? 'bg-yellow-400 animate-pulse' : 
            'bg-gray-600'
          }`} />
          <span className="text-sm text-purple-200">
            {isRecording ? `Recording... ${status}` : 
             isProcessing ? 'Processing...' : 
             'Ready'}
          </span>
          {voiceError && (
            <span className="text-xs text-red-400 ml-2">
              {voiceError}
            </span>
          )}
        </div>
      </div>
      
      {/* Voice Recording Controls */}
      {hasRecording && (
        <div className="mb-4 p-3 bg-purple-900/30 rounded-lg border border-purple-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-purple-200">Recording ready</span>
              <audio 
                controls 
                src={audioUrl || undefined}
                className="h-8"
                style={{ filter: 'hue-rotate(270deg)' }}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleUploadVoice}
                disabled={isProcessing}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm transition-colors"
              >
                <Upload size={14} className="inline mr-1" />
                Send Voice
              </button>
              <button
                onClick={clearRecording}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 scrollbar-thin scrollbar-thumb-purple-600 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-purple-100 border border-purple-700/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{msg.text}</span>
                {msg.downloadUrl && (
                  <button
                    onClick={() => handleDownloadTranscript(msg.downloadUrl!)}
                    className="ml-2 p-1 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                    title="Download transcript"
                  >
                    <Download size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Input Area */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleVoiceToggle}
          disabled={isProcessing || !isLibraryLoaded}
          className={`p-3 rounded-full transition-all duration-300 disabled:opacity-50 ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 animate-pulse'
              : hasRecording
              ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30'
              : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30'
          }`}
        >
          {isRecording ? <Square size={20} /> : <Mic size={20} />}
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type or speak your request..."
          className="flex-1 bg-gray-800 border border-purple-700/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        
        <button
          onClick={handleSendMessage}
          className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-lg shadow-purple-600/30"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;