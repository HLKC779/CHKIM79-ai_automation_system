import { useState, useCallback, useRef } from 'react';
import aiService from '../services/aiService';

interface UseTextToSpeechProps {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  speak: (text: string, useAITTS?: boolean) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  rate: number;
  pitch: number;
  volume: number;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
}

export const useTextToSpeech = ({
  onStart,
  onEnd,
  onError,
}: UseTextToSpeechProps = {}): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (speechRef.current) {
      window.speechSynthesis.cancel();
      speechRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    if (speechRef.current) {
      window.speechSynthesis.pause();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (speechRef.current) {
      window.speechSynthesis.resume();
    }
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, []);

  const speak = useCallback(async (text: string, useAITTS = false) => {
    try {
      stop(); // Stop any current speech

      if (useAITTS) {
        // Use AI-powered text-to-speech
        setIsSpeaking(true);
        onStart?.();

        const audioBlob = await aiService.textToSpeech(text);
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.volume = volume;
        audio.playbackRate = rate;
        
        audio.onended = () => {
          setIsSpeaking(false);
          onEnd?.();
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          onError?.('Failed to play AI-generated speech');
          URL.revokeObjectURL(audioUrl);
        };
        
        audioRef.current = audio;
      } else {
        // Use browser's built-in text-to-speech
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = rate;
          utterance.pitch = pitch;
          utterance.volume = volume;
          
          utterance.onstart = () => {
            setIsSpeaking(true);
            onStart?.();
          };
          
          utterance.onend = () => {
            setIsSpeaking(false);
            onEnd?.();
          };
          
          utterance.onerror = (event) => {
            setIsSpeaking(false);
            onError?.(`Speech synthesis error: ${event.error}`);
          };
          
          speechRef.current = utterance;
          window.speechSynthesis.speak(utterance);
        } else {
          throw new Error('Speech synthesis is not supported in this browser');
        }
      }
    } catch (error) {
      setIsSpeaking(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMessage);
    }
  }, [rate, pitch, volume, stop, onStart, onEnd, onError]);

  return {
    isSpeaking,
    speak,
    stop,
    pause,
    resume,
    rate,
    pitch,
    volume,
    setRate,
    setPitch,
    setVolume,
  };
};