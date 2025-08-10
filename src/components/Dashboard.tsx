import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  History,
  Settings,
  Sparkles,
  TrendingUp,
  Clock,
  FileAudio,
  Users,
  Globe,
  Zap,
  ArrowRight,
  Play,
  Download,
  Share2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Conversions',
      value: '1,234',
      change: '+12%',
      icon: Mic,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Audio Files',
      value: '856',
      change: '+8%',
      icon: FileAudio,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Languages',
      value: '12',
      change: '+2',
      icon: Globe,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Active Users',
      value: '2.1k',
      change: '+15%',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  const quickActions = [
    {
      title: 'Convert Text',
      description: 'Transform your text into natural-sounding speech',
      icon: Mic,
      href: '/convert',
      color: 'from-blue-600 to-purple-600',
    },
    {
      title: 'View History',
      description: 'Access your previous conversions and audio files',
      icon: History,
      href: '/history',
      color: 'from-green-600 to-emerald-600',
    },
    {
      title: 'Settings',
      description: 'Customize your TTS preferences and account settings',
      icon: Settings,
      href: '/settings',
      color: 'from-purple-600 to-pink-600',
    },
  ];

  const recentConversions = [
    {
      id: 1,
      text: 'Welcome to our amazing text-to-speech platform...',
      voice: 'Nova',
      duration: '0:45',
      date: '2 hours ago',
      provider: 'OpenAI',
    },
    {
      id: 2,
      text: 'This is a sample text for demonstration purposes...',
      voice: 'Echo',
      duration: '1:12',
      date: '4 hours ago',
      provider: 'Google',
    },
    {
      id: 3,
      text: 'The quick brown fox jumps over the lazy dog...',
      voice: 'Alloy',
      duration: '0:28',
      date: '6 hours ago',
      provider: 'OpenAI',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to transform your text into amazing speech? Let's get started!
            </p>
          </div>
          <div className="hidden lg:block">
            <Sparkles className="w-24 h-24 text-white/20" />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('w-6 h-6', stat.color)} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  {stat.change}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
                  from last month
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              className="group bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className={cn('w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center mb-4', action.color)}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {action.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {action.description}
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-medium">Get started</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          );
        })}
      </motion.div>

      {/* Recent Conversions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Recent Conversions
            </h2>
            <Link
              to="/history"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {recentConversions.map((conversion) => (
            <div key={conversion.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-slate-900 dark:text-slate-100 font-medium mb-1">
                    {conversion.text.length > 60 ? `${conversion.text.substring(0, 60)}...` : conversion.text}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center">
                      <Mic className="w-4 h-4 mr-1" />
                      {conversion.voice}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {conversion.duration}
                    </span>
                    <span className="flex items-center">
                      <Zap className="w-4 h-4 mr-1" />
                      {conversion.provider}
                    </span>
                    <span>{conversion.date}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Play className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
            🎯 Why Choose Our TTS?
          </h3>
          <ul className="space-y-2 text-slate-700 dark:text-slate-300">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Multiple AI providers for best quality
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              Natural-sounding voices in 12+ languages
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Advanced customization options
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
              Cross-platform compatibility
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
            🚀 Getting Started
          </h3>
          <ol className="space-y-3 text-slate-700 dark:text-slate-300">
            <li className="flex items-start">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
              <span>Enter or paste your text in the converter</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
              <span>Choose your preferred voice and settings</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
              <span>Click convert and download your audio file</span>
            </li>
          </ol>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;