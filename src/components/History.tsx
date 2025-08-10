import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Download, Trash2, Search, Filter, Calendar, Clock, FileAudio } from 'lucide-react';
import { ttsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { cn } from '../utils/cn';

interface HistoryItem {
  id: number;
  text: string;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  format: string;
  provider: string;
  language: string;
  audio_url: string;
  file_size: number;
  created_at: string;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [currentPage]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const response = await ttsApi.getHistory(currentPage, 20);
      setHistory(response.data.history);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ttsApi.deleteHistoryItem(id);
      toast.success('Item deleted successfully');
      loadHistory();
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handlePlay = (audioUrl: string) => {
    if (playingAudio === audioUrl) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(audioUrl);
    }
  };

  const handleDownload = (audioUrl: string, format: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `tts-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!');
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.voice.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.provider.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'recent' && new Date(item.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                         (selectedFilter === 'openai' && item.provider === 'openai') ||
                         (selectedFilter === 'google' && item.provider === 'google') ||
                         (selectedFilter === 'aws' && item.provider === 'aws');
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Conversion History
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              View and manage your text-to-speech conversions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {history.length} items
            </span>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by text, voice, or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All items</option>
              <option value="recent">Last 7 days</option>
              <option value="openai">OpenAI</option>
              <option value="google">Google</option>
              <option value="aws">AWS Polly</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* History List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <FileAudio className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No conversions found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start converting text to speech to see your history here'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 truncate">
                        {item.text.length > 100 ? `${item.text.substring(0, 100)}...` : item.text}
                      </h3>
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        item.provider === 'openai' && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
                        item.provider === 'google' && "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
                        item.provider === 'aws' && "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                      )}>
                        {item.provider}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(item.created_at)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Voice: {item.voice}
                      </span>
                      <span className="flex items-center">
                        <FileAudio className="w-4 h-4 mr-1" />
                        {formatFileSize(item.file_size)}
                      </span>
                      <span className="uppercase">{item.format}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Speed: {item.speed}x</span>
                      <span>•</span>
                      <span>Pitch: {item.pitch}</span>
                      <span>•</span>
                      <span>Volume: {Math.round(item.volume * 100)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handlePlay(item.audio_url)}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Play audio"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(item.audio_url, item.format)}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Download audio"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Audio player */}
                {playingAudio === item.audio_url && (
                  <div className="mt-4">
                    <audio
                      controls
                      className="w-full"
                      onEnded={() => setPlayingAudio(null)}
                    >
                      <source src={item.audio_url} type={`audio/${item.format}`} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center space-x-2"
        >
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default History;