'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Trash2, X } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { getCategoryColor, getCategoryIcon } from '../utils/taskUtils';
import AddTaskModal from './AddTaskModal';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const { state, setSelectedCategory } = useTaskContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getCategoryCount = (categoryId: string) => {
    return state.tasks.filter(task => 
      task.category === categoryId && !task.completed
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
    }
    // Close mobile sidebar when category is selected
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleAddTaskClick = () => {
    setIsAddModalOpen(true);
    // Close mobile sidebar when add task is clicked
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <div className="p-6 h-full overflow-y-auto">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
        <button
          onClick={onMobileClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

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
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="w-64 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-r border-white/20 dark:border-gray-800/50 hidden lg:block"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={onMobileClose}
            />
            
            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-white/20 dark:border-gray-800/50 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
} 