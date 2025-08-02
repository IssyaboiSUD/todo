'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, CheckCircle, X, Clock, Target } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { Task } from '../types';

export default function FocusMode() {
  const { state, filteredTasks, toggleTask, toggleFocusMode } = useTaskContext();
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(state.focusMode.sessionDuration * 60);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const pendingTasks = filteredTasks.filter(task => !task.completed);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining]);

  const startSession = () => {
    setIsTimerRunning(true);
    setSessionStartTime(new Date());
    setTimeRemaining(state.focusMode.sessionDuration * 60);
  };

  const pauseSession = () => {
    setIsTimerRunning(false);
  };

  const completeTask = () => {
    if (pendingTasks[currentTaskIndex]) {
      toggleTask(pendingTasks[currentTaskIndex].id);
    }
  };

  const skipTask = () => {
    if (currentTaskIndex < pendingTasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    }
  };

  const exitFocusMode = () => {
    toggleFocusMode();
    setIsTimerRunning(false);
    setCurrentTaskIndex(0);
    setTimeRemaining(state.focusMode.sessionDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTask = pendingTasks[currentTaskIndex];

  if (!currentTask) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800"
      >
        <div className="text-center">
          <Target className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No tasks to focus on
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            All your tasks are completed! Great job!
          </p>
          <button
            onClick={exitFocusMode}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
          >
            Exit Focus Mode
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl">
        {/* Timer */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-2xl p-8 mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Clock className="w-6 h-6 text-primary-500" />
            <span className="text-4xl font-mono font-bold text-gray-900 dark:text-white">
              {formatTime(timeRemaining)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4">
            {!isTimerRunning ? (
              <button
                onClick={startSession}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
              >
                <Play className="w-5 h-5" />
                Start Session
              </button>
            ) : (
              <button
                onClick={pauseSession}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-colors"
              >
                <Pause className="w-5 h-5" />
                Pause
              </button>
            )}

            <button
              onClick={exitFocusMode}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
              Exit
            </button>
          </div>
        </motion.div>

        {/* Current Task */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass rounded-2xl p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Focus on this task:
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Task {currentTaskIndex + 1} of {pendingTasks.length}
            </p>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {currentTask.title}
            </h3>
            {currentTask.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {currentTask.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={completeTask}
              className="flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors text-lg font-medium"
            >
              <CheckCircle className="w-6 h-6" />
              Complete
            </button>

            <button
              onClick={skipTask}
              disabled={currentTaskIndex >= pendingTasks.length - 1}
              className="flex items-center gap-2 px-8 py-4 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors text-lg font-medium"
            >
              <SkipForward className="w-6 h-6" />
              Skip
            </button>
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span>
              {pendingTasks.length - currentTaskIndex - 1} tasks remaining
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 