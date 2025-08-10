import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Key, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { cn } from '../utils/cn';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newApiKeyName, setNewApiKeyName] = useState('');

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  useEffect(() => {
    loadSettings();
    loadApiKeys();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await userApi.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadApiKeys = async () => {
    try {
      const response = await userApi.getApiKeys();
      setApiKeys(response.data);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await userApi.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    try {
      await userApi.createApiKey(newApiKeyName);
      setNewApiKeyName('');
      loadApiKeys();
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Failed to create API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const handleDeleteApiKey = async (id: number) => {
    try {
      await userApi.deleteApiKey(id);
      loadApiKeys();
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const handleToggleApiKey = async (id: number) => {
    try {
      await userApi.toggleApiKey(id);
      loadApiKeys();
      toast.success('API key status updated');
    } catch (error) {
      console.error('Failed to toggle API key:', error);
      toast.error('Failed to update API key status');
    }
  };

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
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your account preferences and settings
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  General Settings
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Default Voice
                    </label>
                    <select
                      value={settings.default_voice || 'alloy'}
                      onChange={(e) => setSettings({ ...settings, default_voice: e.target.value })}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="alloy">Alloy</option>
                      <option value="echo">Echo</option>
                      <option value="fable">Fable</option>
                      <option value="onyx">Onyx</option>
                      <option value="nova">Nova</option>
                      <option value="shimmer">Shimmer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Default Speed
                    </label>
                    <input
                      type="range"
                      min="0.25"
                      max="4.0"
                      step="0.25"
                      value={settings.default_speed || 1.0}
                      onChange={(e) => setSettings({ ...settings, default_speed: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <span>Slow</span>
                      <span>{settings.default_speed || 1.0}x</span>
                      <span>Fast</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Default Output Format
                    </label>
                    <select
                      value={settings.default_format || 'mp3'}
                      onChange={(e) => setSettings({ ...settings, default_format: e.target.value })}
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="mp3">MP3</option>
                      <option value="wav">WAV</option>
                      <option value="ogg">OGG</option>
                      <option value="flac">FLAC</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Account Settings
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Account Type
                    </label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-slate-900 dark:text-slate-100">
                        {user?.is_premium ? 'Premium' : 'Free'} Account
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Monthly Usage
                    </label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-slate-900 dark:text-slate-100">
                        {settings.monthly_usage || 0} / {settings.monthly_limit || 1000} characters
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Notification Settings
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">Email Notifications</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Receive email updates about your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.email_notifications || false}
                        onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">Usage Alerts</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Get notified when approaching usage limits</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.usage_alerts || false}
                        onChange={(e) => setSettings({ ...settings, usage_alerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Security Settings
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Change Password</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Update your password to keep your account secure
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Change Password
                    </button>
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Delete Account</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Permanently delete your account and all associated data
                    </p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  API Keys
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Create New API Key</h3>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter API key name"
                        value={newApiKeyName}
                        onChange={(e) => setNewApiKeyName(e.target.value)}
                        className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleCreateApiKey}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Your API Keys</h3>
                    <div className="space-y-2">
                      {apiKeys.map((key) => (
                        <div
                          key={key.id}
                          className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{key.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{key.key}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleApiKey(key.id)}
                              className={cn(
                                "px-3 py-1 rounded text-sm",
                                key.is_active
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                              )}
                            >
                              {key.is_active ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteApiKey(key.id)}
                              className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;