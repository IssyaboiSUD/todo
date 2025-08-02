'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Folder, Star, Archive, Trash2 } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { getCategoryColor, getCategoryIcon } from '../utils/taskUtils';
import AddTaskModal from './AddTaskModal';

export default function Sidebar() {
  const { state, setSelectedCategory, setShowImportant, setShowArchived } = useTaskContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getCategoryCount = (categoryId: string) => {
    return state.tasks.filter(task => 
      task.category === categoryId && !task.archived && !task.completed
    ).length;
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      User: <div className="w-4 h-4 rounded-full bg-blue-500" />,
      Briefcase: <div className="w-4 h-4 rounded bg-green-500" />,
      ShoppingCart: <div className="w-4 h-4 rounded bg-yellow-500" />,
      Heart: <div className="w-4 h-4 rounded bg-red-500" />,
      Home: <div className="w-4 h-4 rounded bg-purple-500" />,
      DollarSign: <div className="w-4 h-4 rounded bg-cyan-500" />,
    };
    return iconMap[iconName] || <div className="w-4 h-4 rounded bg-gray-500" />;
  };

  const handleCategoryClick = (categoryId: string) => {
    if (state.selectedCategory === categoryId) {
      setSelectedCategory(null); // Deselect if already selected
    } else {
      setSelectedCategory(categoryId);
      setShowImportant(false); // Clear other filters
      setShowArchived(false);
    }
  };

  const handleImportantClick = () => {
    setShowImportant(!state.showImportant);
    setSelectedCategory(null); // Clear category filter
    setShowArchived(false); // Clear archive filter
  };

  const handleArchiveClick = () => {
    setShowArchived(!state.showArchived);
    setSelectedCategory(null); // Clear category filter
    setShowImportant(false); // Clear important filter
  };

  const handleAddTaskClick = () => {
    setIsAddModalOpen(true);
  };

  return (
    <>
      <motion.aside
        className="w-64 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-r border-white/20 dark:border-gray-800/50 hidden lg:block"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button 
                onClick={handleAddTaskClick}
                className="sidebar-item w-full"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
              <button 
                onClick={handleImportantClick}
                className={`sidebar-item w-full ${state.showImportant ? 'active' : ''}`}
              >
                <Star className="w-4 h-4" />
                <span>Important</span>
                {state.tasks.filter(task => task.priority === 'high' && !task.archived).length > 0 && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full ml-auto">
                    {state.tasks.filter(task => task.priority === 'high' && !task.archived).length}
                  </span>
                )}
              </button>
              <button 
                onClick={handleArchiveClick}
                className={`sidebar-item w-full ${state.showArchived ? 'active' : ''}`}
              >
                <Archive className="w-4 h-4" />
                <span>Archive</span>
                {state.tasks.filter(task => task.archived).length > 0 && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full ml-auto">
                    {state.tasks.filter(task => task.archived).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
              Categories
            </h3>
            <div className="space-y-2">
              {state.categories.map((category) => {
                const count = getCategoryCount(category.id);
                const isSelected = state.selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`sidebar-item w-full justify-between ${isSelected ? 'active' : ''}`}
                    style={{ '--category-color': category.color } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-3">
                      {getIconComponent(getCategoryIcon(category.id))}
                      <span className="text-sm">{category.name}</span>
                    </div>
                    {count > 0 && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
              Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Tasks</span>
                <span className="font-medium">{state.stats.total}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
                <span className="font-medium text-green-600">{state.stats.completed}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Pending</span>
                <span className="font-medium text-orange-600">{state.stats.pending}</span>
              </div>
              {state.stats.overdue > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Overdue</span>
                  <span className="font-medium text-red-600">{state.stats.overdue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {state.stats.total > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium">
                  {Math.round((state.stats.completed / state.stats.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-primary-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(state.stats.completed / state.stats.total) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
} 