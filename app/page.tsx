'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskContext } from './contexts/TaskContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import Stats from './components/Stats';
import Calendar from './components/Calendar';
import AuthGuard from './components/AuthGuard';

export default function Home() {
  const { state, setViewMode } = useTaskContext();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
            setViewMode('important');
            break;
          case '5':
            e.preventDefault();
            setViewMode('stats');
            break;
          case 'n':
            e.preventDefault();
            // This will be handled by the TaskList component
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setViewMode]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
        
        <div className="flex">
          <Sidebar 
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />
          
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

        {/* Keyboard shortcuts help - hidden on mobile */}
        <div className="fixed bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 hidden md:block">
          <div className="flex items-center gap-4">
            <span>⌘1: Today</span>
            <span>⌘2: Upcoming</span>
            <span>⌘3: Calendar</span>
            <span>⌘4: Important</span>
            <span>⌘5: Stats</span>
            <span>⌘N: New Task</span>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
