import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Crown, Edit, Save, X, Camera, Shield, Key } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { cn } from '../utils/cn';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUser(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const stats = [
    {
      label: 'Total Conversions',
      value: '1,234',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Audio Files',
      value: '856',
      icon: User,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Languages Used',
      value: '8',
      icon: User,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Account Status',
      value: user?.is_premium ? 'Premium' : 'Free',
      icon: Crown,
      color: user?.is_premium ? 'text-yellow-600' : 'text-slate-600',
      bgColor: user?.is_premium ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-slate-50 dark:bg-slate-900/20',
    },
  ];

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
              Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your account information and preferences
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || user?.email.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-700 rounded-full border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                  <Camera className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* User Info */}
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {user?.name || 'User'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                {user?.email}
              </p>

              {/* Account Type Badge */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Crown className={cn(
                  "w-4 h-4",
                  user?.is_premium ? "text-yellow-500" : "text-slate-400"
                )} />
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  user?.is_premium
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300"
                )}>
                  {user?.is_premium ? 'Premium' : 'Free'} Account
                </span>
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Profile Information */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Profile Information
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isLoading ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-slate-100">
                    {user?.name || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-slate-100">
                    {user?.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Account Type
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Crown className={cn(
                      "w-4 h-4",
                      user?.is_premium ? "text-yellow-500" : "text-slate-400"
                    )} />
                    <span className="text-slate-900 dark:text-slate-100">
                      {user?.is_premium ? 'Premium' : 'Free'} Account
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
              Usage Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3", stat.bgColor)}>
                      <Icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center space-x-3 p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Shield className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Security Settings
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Manage password and security
                  </div>
                </div>
              </button>

              <button className="flex items-center space-x-3 p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Key className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    API Keys
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Manage your API access
                  </div>
                </div>
              </button>

              <button className="flex items-center space-x-3 p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <User className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Account Settings
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Manage preferences
                  </div>
                </div>
              </button>

              <button className="flex items-center space-x-3 p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Crown className="w-5 h-5 text-yellow-600" />
                <div className="text-left">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Upgrade Plan
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Get premium features
                  </div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;