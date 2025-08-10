import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  Play,
  Pause,
  Download,
  Volume2,
  Settings,
  Mic,
  FileText,
  Sparkles,
  Loader2,
  Copy,
  Share2,
  Heart,
  Clock,
  FileAudio
} from 'lucide-react';
import { ttsApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import VoiceSelector from './VoiceSelector';
import AudioPlayer from './AudioPlayer';
import SettingsPanel from './SettingsPanel';
import { cn } from '../utils/cn';

interface TTSFormData {
  text: string;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  format: string;
  provider: string;
  language: string;
}

interface TTSResult {
  audioUrl: string;
  fileSize: number;
  duration: number;
  format: string;
  provider: string;
  voice: string;
  text: string;
}

const TTSConverter: React.FC = () => {
  const { user } = useAuth();
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<TTSResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TTSFormData>({
    defaultValues: {
      text: '',
      voice: 'alloy',
      speed: 1.0,
      pitch: 0,
      volume: 1.0,
      format: 'mp3',
      provider: 'openai',
      language: 'en',
    },
  });

  const watchedText = watch('text');
  const watchedSpeed = watch('speed');

  // Update character and word count
  useEffect(() => {
    setCharCount(watchedText.length);
    setWordCount(watchedText.trim() ? watchedText.trim().split(/\s+/).length : 0);
    
    // Estimate duration (average speaking rate: 150 words per minute)
    const words = watchedText.trim() ? watchedText.trim().split(/\s+/).length : 0;
    const baseDuration = (words / 150) * 60; // in seconds
    setEstimatedDuration(Math.round(baseDuration / watchedSpeed));
  }, [watchedText, watchedSpeed]);

  const onSubmit = async (data: TTSFormData) => {
    if (!data.text.trim()) {
      toast.error('Please enter some text to convert');
      return;
    }

    if (data.text.length > 5000) {
      toast.error('Text is too long. Maximum 5000 characters allowed.');
      return;
    }

    setIsConverting(true);
    setResult(null);

    try {
      const response = await ttsApi.convert(data);
      setResult(response.data);
      toast.success('Text converted successfully!');
    } catch (error) {
      console.error('TTS conversion error:', error);
      toast.error('Failed to convert text to speech');
    } finally {
      setIsConverting(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result.audioUrl;
      link.download = `tts-${Date.now()}.${result.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(watchedText);
    toast.success('Text copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share && result) {
      try {
        await navigator.share({
          title: 'TTS Audio',
          text: 'Check out this text-to-speech audio I created!',
          url: result.audioUrl,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(result?.audioUrl || '');
      toast.success('Audio URL copied to clipboard!');
    }
  };

  const handleVoiceChange = (voice: string) => {
    setValue('voice', voice);
  };

  const handleProviderChange = (provider: string) => {
    setValue('provider', provider);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Text-to-Speech Converter</h1>
                <p className="text-blue-100">Transform your text into natural-sounding speech</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enter your text
                </label>
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <span>{charCount} characters</span>
                  <span>{wordCount} words</span>
                  <span>~{estimatedDuration}s</span>
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  {...register('text', { required: 'Text is required' })}
                  placeholder="Type or paste your text here... (max 5000 characters)"
                  className={cn(
                    "w-full h-48 p-4 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600",
                    "text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                  )}
                  maxLength={5000}
                />
                {errors.text && (
                  <p className="text-red-500 text-sm mt-1">{errors.text.message}</p>
                )}
                
                {/* Text Actions */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="p-1.5 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                    title="Copy text"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Voice and Provider Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VoiceSelector
                onVoiceChange={handleVoiceChange}
                onProviderChange={handleProviderChange}
                currentVoice={watch('voice')}
                currentProvider={watch('provider')}
              />
            </div>

            {/* Convert Button */}
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isConverting || !watchedText.trim()}
              className={cn(
                "w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200",
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center space-x-2"
              )}
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Convert to Speech</span>
                </>
              )}
            </button>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-1"
              >
                <SettingsPanel
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Result Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-700/50"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Generated Audio
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{result.duration}s</span>
                    <FileAudio className="w-4 h-4" />
                    <span>{(result.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                <AudioPlayer
                  audioUrl={result.audioUrl}
                  isPlaying={isPlaying}
                  onPlay={handlePlay}
                  audioRef={audioRef}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <span>Voice: {result.voice}</span>
                    <span>•</span>
                    <span>Provider: {result.provider}</span>
                    <span>•</span>
                    <span>Format: {result.format.toUpperCase()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownload}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Download audio"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                      title="Share audio"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                      title="Save to favorites"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TTSConverter;