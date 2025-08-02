'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTaskContext } from './contexts/TaskContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import FocusMode from './components/FocusMode';
import Stats from './components/Stats';
import Calendar from './components/Calendar';

export default function Home() {
  const { state, setViewMode } = useTaskContext();

  // Handle theme changes
  useEffect(() => {
    const theme = state.settings.theme;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.theme]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setViewMode('today');
            break;
          case '2':
            e.preventDefault();
            setViewMode('upcoming');
            break;
          case '3':
            e.preventDefault();
            setViewMode('calendar');
            break;
          case '4':
            e.preventDefault();
            setViewMode('focus');
            break;
          case '5':
            e.preventDefault();
            setViewMode('stats');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setViewMode]);

  // Show focus mode if active
  if (state.focusMode.isActive) {
    return <FocusMode />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 lg:ml-0">
          {state.viewMode === 'stats' ? (
            <Stats />
          ) : state.viewMode === 'calendar' ? (
            <Calendar />
          ) : (
            <TaskList />
          )}
        </main>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="flex items-center gap-4">
          <span>⌘1: Today</span>
          <span>⌘2: Upcoming</span>
          <span>⌘3: Calendar</span>
          <span>⌘4: Focus</span>
          <span>⌘5: Stats</span>
        </div>
      </div>
    </div>
  );
}
