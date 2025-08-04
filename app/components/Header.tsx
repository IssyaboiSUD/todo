'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Settings, Sun, Moon, Monitor, Menu } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { ViewMode } from '../types';
import SettingsModal from './Settings';

const navItems: { key: ViewMode; label: string; icon: string }[] = [
  { key: 'today', label: 'Today', icon: 'Calendar' },
  { key: 'upcoming', label: 'Upcoming', icon: 'Clock' },
  { key: 'calendar', label: 'Calendar', icon: 'Calendar' },
  { key: 'important', label: 'Important', icon: 'Star' },
  { key: 'stats', label: 'Stats', icon: 'BarChart3' },
];

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
  const { state, setViewMode, setSearchTerm, updateSettings } = useTaskContext();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setSearchTerm(value);
  };

  const toggleTheme = () => {
    const currentTheme = state.settings.theme;
    let newTheme: 'light' | 'dark' | 'system';
    
    if (currentTheme === 'light') newTheme = 'dark';
    else if (currentTheme === 'dark') newTheme = 'system';
    else newTheme = 'light';
    
    updateSettings({ theme: newTheme });
  };

  const getThemeIcon = () => {
    switch (state.settings.theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <>
      <motion.header 
        className="glass sticky top-0 z-50 border-b border-white/20 dark:border-gray-800/50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 relative">
            {/* Logo - Left */}
            <div className="flex items-center">
              <button
                onClick={onMobileMenuClick}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-xl font-semibold text-primary-500" style={{ fontFamily: 'Montserrat Alternates, sans-serif', fontWeight: 600 }}>
                Focus
              </h1>
            </div>

            {/* Navigation - Center */}
            <nav className="hidden md:flex space-x-1 absolute left-1/2 transform -translate-x-1/2">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setViewMode(item.key)}
                  className={`nav-item ${
                    state.viewMode === item.key ? 'active' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Search and Actions - Right */}
            <div className="flex items-center space-x-2 absolute right-0">
              {/* Search */}
              <div className="relative">
                {isSearchOpen ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex items-center"
                  >
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchValue}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="glass-input w-64 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      autoFocus
                      onBlur={() => setIsSearchOpen(false)}
                    />
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Toggle theme"
              >
                {getThemeIcon()}
              </button>

              {/* Settings */}
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden py-3">
            <div className="flex space-x-1 justify-center">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setViewMode(item.key)}
                  className={`mobile-nav-item ${
                    state.viewMode === item.key ? 'active' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
} 