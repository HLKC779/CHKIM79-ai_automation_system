import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mic, Sparkles, Zap, Cloud, Globe } from 'lucide-react';
import { ttsApi } from '../services/api';
import { cn } from '../utils/cn';

interface Voice {
  id: string;
  name: string;
  gender: string;
  language: string;
}

interface VoiceSelectorProps {
  onVoiceChange: (voice: string) => void;
  onProviderChange: (provider: string) => void;
  currentVoice: string;
  currentProvider: string;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  onVoiceChange,
  onProviderChange,
  currentVoice,
  currentProvider,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const providers = [
    { id: 'openai', name: 'OpenAI', icon: Sparkles, color: 'text-green-600' },
    { id: 'google', name: 'Google', icon: Cloud, color: 'text-blue-600' },
    { id: 'aws', name: 'AWS Polly', icon: Zap, color: 'text-orange-600' },
  ];

  useEffect(() => {
    loadVoices(currentProvider);
  }, [currentProvider]);

  const loadVoices = async (provider: string) => {
    setIsLoading(true);
    try {
      const response = await ttsApi.getVoices(provider);
      setVoices(response.data);
    } catch (error) {
      console.error('Failed to load voices:', error);
      // Fallback voices
      setVoices([
        { id: 'alloy', name: 'Alloy', gender: 'neutral', language: 'en' },
        { id: 'echo', name: 'Echo', gender: 'male', language: 'en' },
        { id: 'fable', name: 'Fable', gender: 'male', language: 'en' },
        { id: 'onyx', name: 'Onyx', gender: 'male', language: 'en' },
        { id: 'nova', name: 'Nova', gender: 'female', language: 'en' },
        { id: 'shimmer', name: 'Shimmer', gender: 'female', language: 'en' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderChange = (provider: string) => {
    onProviderChange(provider);
    setIsOpen(false);
  };

  const handleVoiceChange = (voice: string) => {
    onVoiceChange(voice);
    setIsOpen(false);
  };

  const currentProviderData = providers.find(p => p.id === currentProvider);
  const currentVoiceData = voices.find(v => v.id === currentVoice);

  return (
    <div className="space-y-4">
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          AI Provider
        </label>
        <div className="grid grid-cols-3 gap-2">
          {providers.map((provider) => {
            const Icon = provider.icon;
            return (
              <button
                key={provider.id}
                onClick={() => handleProviderChange(provider.id)}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-1",
                  currentProvider === provider.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                )}
              >
                <Icon className={cn("w-5 h-5", provider.color)} />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {provider.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Voice
        </label>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-full p-3 text-left bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg",
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "flex items-center justify-between"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {currentVoiceData?.name || currentVoice}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {currentVoiceData?.gender} • {currentVoiceData?.language}
                </div>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {isLoading ? (
                  <div className="p-4 text-center text-slate-500">
                    Loading voices...
                  </div>
                ) : (
                  <div className="py-1">
                    {voices.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => handleVoiceChange(voice.id)}
                        className={cn(
                          "w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors",
                          "flex items-center space-x-3",
                          currentVoice === voice.id && "bg-blue-50 dark:bg-blue-900/20"
                        )}
                      >
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-600 rounded-lg">
                          <Mic className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {voice.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {voice.gender} • {voice.language}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Provider Info */}
      <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
          {currentProviderData && (
            <>
              <currentProviderData.icon className="w-4 h-4" />
              <span>Using {currentProviderData.name}</span>
            </>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
          {currentProvider === 'openai' && 'High-quality, natural-sounding voices'}
          {currentProvider === 'google' && 'Fast and reliable text-to-speech'}
          {currentProvider === 'aws' && 'Professional-grade speech synthesis'}
        </p>
      </div>
    </div>
  );
};

export default VoiceSelector;