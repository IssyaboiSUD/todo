'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Repeat, Star, ChevronDown } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { parseTaskInput } from '../utils/taskUtils';
import { format } from 'date-fns';
import CalendarPicker from './CalendarPicker';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date | null;
}

export default function AddTaskModal({ isOpen, onClose, initialDate }: AddTaskModalProps) {
  const { addTask, addTaskWithPriority } = useTaskContext();
  
  // Form state
  const [title, setTitle] = useState('');
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [isImportant, setIsImportant] = useState(false);
  const [repeatOption, setRepeatOption] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | undefined>(undefined);
  
  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRepeatMenu, setShowRepeatMenu] = useState(false);

  // Smart preview
  const parsedInput = title ? parseTaskInput(title) : null;
  
  // Refs
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (initialDate) {
        setCustomDate(initialDate);
      } else {
        setCustomDate(undefined);
      }
    } else {
      // Reset all state when closing
      setTitle('');
      setCustomDate(undefined);
      setIsImportant(false);
      setRepeatOption(undefined);
      setShowDatePicker(false);
      setShowRepeatMenu(false);
    }
  }, [isOpen, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let taskInput = title.trim();
    
    // Add date - custom date takes precedence over auto-detected
    if (customDate) {
      taskInput += ` ${format(customDate, 'yyyy-MM-dd')}`;
    } else if (parsedInput?.dueDate) {
      // Use auto-detected date if no custom date is set
      taskInput += ` ${format(parsedInput.dueDate, 'yyyy-MM-dd')}`;
    }
    
    // Add repeat option if specified
    if (repeatOption) {
      taskInput += ` repeat:${repeatOption}`;
    }
    
    // Create task with appropriate priority
    if (isImportant) {
      addTaskWithPriority(taskInput, 'high');
    } else {
      addTask(taskInput);
    }
    
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const repeatOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
              {/* Task Title */}
              <div>
                <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What needs to be done?
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Type naturally - the system will automatically detect dates, categories, and priority from your text.
                </p>
                                  <textarea
                    id="task-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your task here... (e.g., 'Buy groceries tomorrow' or 'Call mom this weekend')"
                    className="glass-input w-full px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    autoFocus
                  />
                  
                  {/* Smart Preview */}
                  {parsedInput && title.length > 5 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
                    >
                      <div className="text-xs text-primary-700 dark:text-primary-300 mb-2 font-medium">
                        Smart Preview:
                      </div>
                      <div className="space-y-1 text-sm">
                        {/* Category */}
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3" />
                          <span>Category: {parsedInput.category}</span>
                        </div>
                        
                        {/* Auto-detected Date */}
                        {parsedInput.dueDate && !customDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>Auto-detected: {parsedInput.dueDate.toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {/* Custom Date (overrides auto-detected) */}
                        {customDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>Custom Date: {format(customDate, 'MMM dd, yyyy')}</span>
                            <span className="text-xs text-blue-600 dark:text-blue-400">(overrides auto-detected)</span>
                          </div>
                        )}
                        
                        {/* Priority */}
                        {parsedInput.priority !== 'medium' && (
                          <div className="flex items-center gap-2">
                            <Star className="w-3 h-3" />
                            <span>Auto Priority: {parsedInput.priority}</span>
                          </div>
                        )}
                        
                        {/* Manual Priority Override */}
                        {isImportant && (
                          <div className="flex items-center gap-2">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span>Manual Priority: High</span>
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">(overrides auto-detected)</span>
                          </div>
                        )}
                        
                        {/* Tags */}
                        {parsedInput.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Tag className="w-3 h-3" />
                            <span>Tags: {parsedInput.tags.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

              {/* Task Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Task Options
                </h3>
                
                {/* Important Toggle */}
                <button
                  type="button"
                  onClick={() => setIsImportant(!isImportant)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full ${
                    isImportant 
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-600' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isImportant ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">
                    {isImportant ? 'Important Task' : 'Mark as Important'}
                  </span>
                </button>

                {/* Custom Date */}
                <button
                  ref={dateButtonRef}
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full ${
                    customDate 
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {customDate ? format(customDate, 'MMM dd, yyyy') : 'Set Custom Date'}
                  </span>
                  <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                    showDatePicker ? 'rotate-180' : ''
                  }`} />
                </button>

                                  {/* Date Picker */}
                  {showDatePicker && (
                    <div className="mt-2">
                      <CalendarPicker
                        isOpen={showDatePicker}
                        value={customDate}
                        onChange={(date) => {
                          setCustomDate(date);
                          setShowDatePicker(false);
                        }}
                        onClose={() => setShowDatePicker(false)}
                        triggerRef={dateButtonRef}
                      />
                    </div>
                  )}

                {/* Repeat Option */}
                <button
                  type="button"
                  onClick={() => setShowRepeatMenu(!showRepeatMenu)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full ${
                    repeatOption 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-600' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {repeatOption ? `Repeat: ${repeatOption}` : 'Set Repeat'}
                  </span>
                  <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                    showRepeatMenu ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Repeat Menu */}
                {showRepeatMenu && (
                  <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-2 gap-2">
                      {repeatOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                                                     onClick={() => {
                             setRepeatOption(repeatOption === option.value ? undefined : option.value as 'daily' | 'weekly' | 'monthly' | 'yearly');
                             setShowRepeatMenu(false);
                           }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            repeatOption === option.value
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                    disabled={!title.trim()}
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
    </AnimatePresence>
  );
} 