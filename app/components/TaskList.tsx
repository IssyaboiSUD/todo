'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Search, X } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';

export default function TaskList() {
  const { 
    state, 
    filteredTasks, 
    addTask, 
    setSearchTerm, 
    setSelectedCategory, 
    setShowArchived 
  } = useTaskContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const completedTasks = state.tasks.filter(task => task.completed && !task.archived);
  const pendingTasks = filteredTasks.filter(task => !task.completed);
  const archivedTasks = state.tasks.filter(task => task.archived);

  const getFilterStatus = () => {
    const filters = [];
    if (state.selectedCategory) {
      const categoryName = state.categories.find(c => c.id === state.selectedCategory)?.name || state.selectedCategory;
      filters.push(categoryName);
    }
    if (state.showArchived) {
      filters.push('Archived');
    }
    return filters;
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setShowArchived(false);
  };

  const filters = getFilterStatus();
  const displayTasks = state.showArchived ? archivedTasks : pendingTasks;

  // Get the appropriate title based on active filters
  const getTitle = () => {
    // Default view mode titles
    switch (state.viewMode) {
      case 'today':
        return 'Today';
      case 'upcoming':
        return 'Upcoming';
      case 'calendar':
        return 'Calendar';
      case 'important':
        return 'Important Tasks';
      case 'stats':
        return 'Statistics';
      default:
        return 'Tasks';
    }
  };

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {getTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {displayTasks.length} {state.showArchived ? 'archived' : 'pending'} tasks
            {!state.showArchived && completedTasks.length > 0 && ` • ${completedTasks.length} completed`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {showCompleted ? 'Hide' : 'Show'} Completed
          </button>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="floating-button"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 glass rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Filters:
              </span>
              <div className="flex items-center gap-2">
                {filters.map((filter, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full"
                  >
                    {filter}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
        </motion.div>
      )}

      {/* Task List */}
      <div className="space-y-4">
        <AnimatePresence>
          {displayTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {filters.length > 0 ? 'No tasks match your filters' : 'No tasks yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filters.length > 0 
                  ? 'Try adjusting your filters or add a new task'
                  : 'Start by adding your first task'
                }
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
              >
                Add Your First Task
              </button>
            </motion.div>
          ) : (
            displayTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Completed Tasks */}
      <AnimatePresence>
        {showCompleted && completedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Completed ({completedTasks.length})
              </h3>
            </div>
            
            <div className="space-y-3 opacity-60">
              {completedTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
} 