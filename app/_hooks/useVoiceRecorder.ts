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

      // Create MediaRecorder with WAV format for better compatibility
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // Will be converted to WAV
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
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
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `voice-recording-${timestamp}.wav`;
      
      // Create a File object from the blob with .wav extension
      const audioFile = new File([audioBlobRef.current], fileName, {
        type: 'audio/wav',
        lastModified: Date.now(),
      });
      
      formData.append('file', audioFile);

      // Get the FastAPI URL from environment (you'll need to expose this)
      const audioTranscribeUrl = process.env.NEXT_PUBLIC_AUDIO_TRANSCRIBE_URL || 'http://127.0.0.1:8000';

      // Call FastAPI directly
      const response = await fetch(`${audioTranscribeUrl}/transcribe/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const transcriptionText = await response.text();
      setIsProcessing(false);
      
      // Save transcript locally (optional - for user download)
      const blob = new Blob([transcriptionText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript-${timestamp}.txt`;
      
      return {
        transcription: transcriptionText,
        recommendations: `Based on your voice message: "${transcriptionText}", here are some product recommendations.`,
        downloadUrl: url
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
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
    isLibraryLoaded: true,
  };
};