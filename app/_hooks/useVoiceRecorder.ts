// app/_hooks/useVoiceRecorder.ts
'use client';

import { useState, useRef, useCallback } from 'react';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);

  const startRecording = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    try {
      setError(null);
      setIsProcessing(true);

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // Most widely supported
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        
        audioBlobRef.current = audioBlob;
        setAudioUrl(url);
        setHasRecording(true);
        setIsRecording(false);
        setIsProcessing(false);

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed');
        setIsRecording(false);
        setIsProcessing(false);
      };

      // Start recording
      mediaRecorder.start(100);
      setIsRecording(true);
      setIsProcessing(false);

    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please check microphone permissions.');
      setIsRecording(false);
      setIsProcessing(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      setIsProcessing(true);
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const uploadAudio = useCallback(async (userId: string = 'anonymous') => {
    if (!audioBlobRef.current) {
      throw new Error('No audio recording available');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      const timestamp = new Date().toISOString();
      const fileName = `voice-recording-${timestamp}.wav`;
      
      formData.append('audio', audioBlobRef.current, fileName);
      formData.append('userId', userId);
      formData.append('timestamp', timestamp);

      const response = await fetch('/api/voice-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setIsProcessing(false);
      
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      setIsProcessing(false);
      throw error;
    }
  }, []);

  const clearRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setHasRecording(false);
    setError(null);
    audioBlobRef.current = null;
    audioChunksRef.current = [];
  }, [audioUrl]);

  return {
    isRecording,
    isProcessing,
    hasRecording,
    audioUrl,
    error,
    status: isRecording ? 'recording' : hasRecording ? 'stopped' : 'idle',
    startRecording,
    stopRecording,
    uploadAudio,
    clearRecording,
    isLibraryLoaded: true, // Always true for this implementation
  };
};