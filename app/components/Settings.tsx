'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Monitor, Bell } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const { state, updateSettings } = useTaskContext();

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    updateSettings({ [setting]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass w-full max-w-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800/50"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Settings
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Settings Content */}
              <div className="space-y-6">
                {/* Theme Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Appearance
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        state.settings.theme === 'light'
                          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Sun className="w-5 h-5" />
                      <span>Light Mode</span>
                    </button>
                    
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        state.settings.theme === 'dark'
                          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Moon className="w-5 h-5" />
                      <span>Dark Mode</span>
                    </button>
                    
                    <button
                      onClick={() => handleThemeChange('system')}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        state.settings.theme === 'system'
                          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Monitor className="w-5 h-5" />
                      <span>System Default</span>
                    </button>
                  </div>
                </div>

                {/* Notification Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium">Enable Notifications</span>
                      </div>
                      <button
                        onClick={() => handleSettingChange('notifications', !state.settings.notifications)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          state.settings.notifications ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          state.settings.notifications ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 