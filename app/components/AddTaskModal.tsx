'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Repeat, AlertCircle, Star, Clock } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { parseTaskInput } from '../utils/taskUtils';
import { format } from 'date-fns';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date | null;
}

export default function AddTaskModal({ isOpen, onClose, initialDate }: AddTaskModalProps) {
  const { addTask, addTaskWithPriority } = useTaskContext();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [useCustomDate, setUseCustomDate] = useState(false);

  const commonTasks = [
    'Buy groceries tomorrow',
    'Call mom this weekend',
    'Finish project report by Friday',
    'Schedule dentist appointment',
    'Pay electricity bill',
    'Clean the house',
    'Go to the gym',
    'Read 30 minutes',
  ];

  // Set initial date when modal opens
  useEffect(() => {
    if (isOpen && initialDate) {
      setCustomDate(format(initialDate, 'yyyy-MM-dd'));
      setUseCustomDate(true);
    } else if (isOpen) {
      setCustomDate('');
      setUseCustomDate(false);
    }
  }, [isOpen, initialDate]);

  useEffect(() => {
    if (input.length > 2) {
      const filtered = commonTasks.filter(task =>
        task.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 3));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      let taskInput = input.trim();
      
      // Add custom date if specified
      if (useCustomDate && customDate) {
        taskInput += ` ${customDate}`;
      }
      
      // Use addTaskWithPriority if important is checked, otherwise use regular addTask
      if (isImportant) {
        addTaskWithPriority(taskInput, 'high');
      } else {
        addTask(taskInput);
      }
      
      setInput('');
      setIsImportant(false);
      setCustomDate('');
      setUseCustomDate(false);
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const parsedInput = input ? parseTaskInput(input) : null;

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
                  Add New Task
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What needs to be done? (e.g., 'Buy milk tomorrow' or 'Call mom this weekend')"
                    className="glass-input w-full px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    autoFocus
                  />
                  
                  {/* Smart Preview */}
                  {parsedInput && input.length > 5 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
                    >
                      <div className="text-xs text-primary-700 dark:text-primary-300 mb-2">
                        Smart Preview:
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3" />
                          <span>Category: {parsedInput.category}</span>
                        </div>
                        {parsedInput.dueDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {parsedInput.dueDate.toLocaleDateString()}</span>
                          </div>
                        )}
                        {parsedInput.priority !== 'medium' && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            <span>Priority: {parsedInput.priority}</span>
                          </div>
                        )}
                        {parsedInput.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Tag className="w-3 h-3" />
                            <span>Tags: {parsedInput.tags.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Suggestions */}
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 glass rounded-xl shadow-lg border border-white/20 dark:border-gray-800/50 z-10"
                      >
                        <div className="p-2">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {/* Important Toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsImportant(!isImportant)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isImportant 
                          ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isImportant ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">Important</span>
                    </button>
                  </div>

                  {/* Custom Date */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setUseCustomDate(!useCustomDate)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        useCustomDate 
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Custom Date</span>
                    </button>
                    
                    {useCustomDate && (
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="glass-input px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  {commonTasks.slice(0, 4).map((task, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(task)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {task}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Press ⌘+Enter to save
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 