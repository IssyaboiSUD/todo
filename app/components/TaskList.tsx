'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Search, X, Circle, Play, CheckCircle } from 'lucide-react';
import { isToday } from 'date-fns';
import { useTaskContext } from '../contexts/TaskContext';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import { sortTasksWithOverdueFirst } from '../utils/taskUtils';

const statusConfig = [
  { 
    key: 'open', 
    label: 'Open', 
    icon: Circle, 
    color: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300'
  },
  { 
    key: 'in-progress', 
    label: 'In Progress', 
    icon: Play, 
    color: 'bg-blue-100 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-300'
  },
  { 
    key: 'done', 
    label: 'Completed', 
    icon: CheckCircle, 
    color: 'bg-green-100 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-300'
  },
];

export default function TaskList() {
  const { 
    state, 
    filteredTasks, 
    addTask, 
    setSearchTerm, 
    setSelectedCategory, 
    updateTaskStatus
  } = useTaskContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'done'>('all');
  const [showTip, setShowTip] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setIsAddModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine if we should show Kanban board
  const shouldShowKanban = state.viewMode === 'today' || state.viewMode === 'upcoming';
  
  // For Kanban board, filter tasks based on view mode
  // For list view, use filteredTasks (which respects view mode)
  const kanbanTasks = shouldShowKanban 
    ? state.tasks.filter(task => {
        if (state.viewMode === 'today') {
          // Today: show tasks due today OR overdue tasks (including completed overdue tasks)
          return (task.dueDate && isToday(new Date(task.dueDate))) || 
                 (task.dueDate && new Date(task.dueDate) < new Date());
        } else if (state.viewMode === 'upcoming') {
          // Upcoming: show tasks due after today
          return task.dueDate && new Date(task.dueDate) > new Date();
        }
        return false;
      })
    : state.tasks;
  const listTasks = filteredTasks;

  // Group tasks by status for Kanban board and sort with overdue first
  const tasksByStatus = {
    open: sortTasksWithOverdueFirst(kanbanTasks.filter(task => task.status === 'open')),
    'in-progress': sortTasksWithOverdueFirst(kanbanTasks.filter(task => task.status === 'in-progress')),
    done: sortTasksWithOverdueFirst(kanbanTasks.filter(task => task.status === 'done')),
  };

  // Debug logging
  console.log('Tasks by status:', {
    open: tasksByStatus.open.length,
    'in-progress': tasksByStatus['in-progress'].length,
    done: tasksByStatus.done.length,
    total: kanbanTasks.length
  });

  // Filter tasks by status if status filter is active
  const getFilteredTasksByStatus = () => {
    if (statusFilter === 'all') return tasksByStatus;
    
    // For Kanban board, always show all columns to maintain drag and drop functionality
    // The status filter will highlight the relevant column
    return tasksByStatus;
  };

  const filteredTasksByStatus = getFilteredTasksByStatus();

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    console.log('Drag started for task:', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent, targetStatus: 'open' | 'in-progress' | 'done') => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (!draggedTaskId) return;
    
    console.log('Drop event:', { draggedTaskId, targetStatus });
    
    // Update the task status
    updateTaskStatus(draggedTaskId, targetStatus);
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    // Remove drag-over class from all drop zones
    document.querySelectorAll('.drop-zone').forEach(zone => {
      zone.classList.remove('drag-over');
    });
  };

  const getFilterStatus = () => {
    const filters = [];
    if (state.selectedCategory) {
      const categoryName = state.categories.find(c => c.id === state.selectedCategory)?.name || state.selectedCategory;
      filters.push(categoryName);
    }
    return filters;
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setStatusFilter('all');
  };

  const filters = getFilterStatus();

  // Get the appropriate title based on active filters
  const getTitle = () => {
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
            {shouldShowKanban ? kanbanTasks.length : listTasks.length} tasks
            {!shouldShowKanban && tasksByStatus.done.length > 0 && ` • ${tasksByStatus.done.length} completed`}
            {shouldShowKanban && state.viewMode === 'today' && ` • Due today & overdue`}
            {shouldShowKanban && state.viewMode === 'upcoming' && ` • Upcoming`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle - only show for today/upcoming tabs */}
          {shouldShowKanban && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                List
              </button>
            </div>
          )}
          
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
                {statusFilter !== 'all' && (
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
                    Status: {statusFilter === 'in-progress' ? 'In Progress' : statusFilter === 'done' ? 'Completed' : statusFilter}
                  </span>
                )}
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

      {/* Status Filter - only show for Kanban view */}
      {shouldShowKanban && viewMode === 'kanban' && (
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</span>
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('open')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  statusFilter === 'open'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setStatusFilter('in-progress')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  statusFilter === 'in-progress'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter('done')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  statusFilter === 'done'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content based on view mode and tab */}
      <div className="space-y-4 mb-8">
        {shouldShowKanban && viewMode === 'kanban' ? (
          /* Kanban Board with HTML5 Drag and Drop */
          <>
            {/* Instructions */}
            {showTip && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 relative">
                <button
                  onClick={() => setShowTip(false)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                >
                  <X className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </button>
                <p className="text-sm text-blue-700 dark:text-blue-300 text-center pr-8">
                  💡 <strong>Tip:</strong> Drag and drop tasks between columns to change their status
                </p>
              </div>
            )}
            
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
              layout="position"
            >
              {statusConfig
                .filter(status => statusFilter === 'all' || statusFilter === status.key)
                .map((status) => {
                const Icon = status.icon;
                const tasks = filteredTasksByStatus[status.key as keyof typeof filteredTasksByStatus] || [];
                
                return (
                  <motion.div 
                    key={status.key} 
                    className="kanban-column"
                    layout="position"
                  >
                    {/* Status Header */}
                    <div className={`status-header flex items-center gap-3 p-4 rounded-xl mb-4 ${status.color} ${
                      statusFilter !== 'all' && statusFilter === status.key ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
                    }`}>
                      <Icon className={`w-5 h-5 ${status.textColor}`} />
                      <h3 className={`font-semibold ${status.textColor}`}>
                        {status.key === 'done' ? 'Completed' : status.label}
                      </h3>
                      <span className={`ml-auto px-2 py-1 text-xs rounded-full ${status.textColor} bg-white/50 dark:bg-black/20`}>
                        {tasks.length}
                      </span>
                    </div>

                    {/* Tasks in this status */}
                    <div
                      className="drop-zone space-y-3 min-h-[200px] transition-all duration-200"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, status.key as 'open' | 'in-progress' | 'done')}
                    >
                      <AnimatePresence mode="popLayout">
                        {tasks.length === 0 ? (
                          <motion.div
                            key="empty-state"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm"
                          >
                            <div className="w-12 h-12 bg-gray-100 dark:text-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Icon className="w-6 h-6 text-gray-400" />
                            </div>
                            Drop here
                          </motion.div>
                        ) : (
                          tasks.map((task, index) => (
                            <motion.div
                              key={task.id}
                              layoutId={task.id}
                              initial={false}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9, y: -20 }}
                              transition={{ 
                                type: "spring", 
                                damping: 25, 
                                stiffness: 300,
                                duration: 0.2
                              }}
                              className="origin-center"
                              style={{ 
                                // Ensure stable positioning during animations
                                position: 'relative',
                                zIndex: draggedTaskId === task.id ? 10 : 1
                              }}
                            >
                              <div
                                draggable
                                onDragStart={(e: React.DragEvent) => handleDragStart(e, task.id)}
                                onDragEnd={() => handleDragEnd()}
                                className={`draggable-task ${
                                  draggedTaskId === task.id ? 'opacity-50' : ''
                                }`}
                              >
                                <TaskCard task={task} index={index} />
                              </div>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        ) : (
          /* Traditional List View - for important tab and list mode */
          <div className="space-y-4">
            <AnimatePresence>
              {listTasks.filter(task => statusFilter === 'all' || task.status === statusFilter).length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {filters.length > 0 || statusFilter !== 'all' ? 'No tasks match your filters' : 'No tasks yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {filters.length > 0 || statusFilter !== 'all'
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
                sortTasksWithOverdueFirst(listTasks
                  .filter(task => statusFilter === 'all' || task.status === statusFilter))
                  .map((task, index) => (
                    <TaskCard key={task.id} task={task} index={index} />
                  ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
} 