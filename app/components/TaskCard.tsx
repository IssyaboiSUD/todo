'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { 
  CheckCircle, 
  Circle, 
  Calendar, 
  Tag, 
  MoreVertical, 
  Edit, 
  Trash2,
  Clock,
  Star,
  Play,
  ChevronDown
} from 'lucide-react';
import { Task } from '../types';
import { useTaskContext } from '../contexts/TaskContext';
import { formatDueDate, getCategoryColor, getCategoryIcon } from '../utils/taskUtils';
import EditTaskModal from './EditTaskModal';

interface TaskCardProps {
  task: Task;
  index: number;
}

export default function TaskCard({ task, index }: TaskCardProps) {
  const { toggleTask, deleteTask, updateTask, toggleImportant, updateTaskStatus } = useTaskContext();
  const [showActions, setShowActions] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const priorityColors = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-green-500',
  };

  const priorityIcons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };

  const statusOptions = [
    { 
      value: 'open', 
      label: 'Open', 
      icon: Circle, 
      color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600' 
    },
    { 
      value: 'in-progress', 
      label: 'In Progress', 
      icon: Play, 
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
    },
    { 
      value: 'done', 
      label: 'Completed', 
      icon: CheckCircle, 
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' 
    },
  ];

  const currentStatus = statusOptions.find(option => option.value === task.status);

  // Click outside handler for status dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };

    if (showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      deleteTask(task.id);
    } else if (direction === 'right') {
      toggleTask(task.id);
    }
  };

  const handleStatusChange = (newStatus: 'open' | 'in-progress' | 'done') => {
    updateTaskStatus(task.id, newStatus);
    setShowStatusDropdown(false);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    trackMouse: true,
  });

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      User: <div className="w-3 h-3 rounded-full bg-blue-500" />,
      Briefcase: <div className="w-3 h-3 rounded bg-green-500" />,
      ShoppingCart: <div className="w-3 h-3 rounded bg-yellow-500" />,
      Heart: <div className="w-3 h-3 rounded bg-red-500" />,
      Home: <div className="w-3 h-3 rounded bg-purple-500" />,
      DollarSign: <div className="w-3 h-3 rounded bg-cyan-500" />,
    };
    return iconMap[iconName] || <div className="w-3 h-3 rounded bg-gray-500" />;
  };

  return (
    <>
      <motion.div
        {...swipeHandlers}
        className="task-card relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => toggleTask(task.id)}
            className="flex-shrink-0 mt-1"
          >
            {task.status === 'done' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 hover:text-primary-500" />
            )}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 
                  className={`text-sm font-medium ${
                    task.status === 'done'
                      ? 'line-through text-gray-500' 
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {task.description}
                  </p>
                )}

                {/* Status Dropdown */}
                <div className="mt-3 relative" ref={statusDropdownRef}>
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-md ${
                      currentStatus?.color || ''
                    }`}
                  >
                    {currentStatus?.icon && <currentStatus.icon className="w-3 h-3" />}
                    <span className="capitalize">
                      {currentStatus?.label || task.status}
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                      showStatusDropdown ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Status Dropdown Menu */}
                  <AnimatePresence>
                    {showStatusDropdown && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute top-full left-0 mt-2 glass rounded-xl shadow-lg border border-white/20 dark:border-gray-800/50 z-50 min-w-[160px]"
                      >
                        <div className="p-2 space-y-1">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleStatusChange(option.value as 'open' | 'in-progress' | 'done')}
                              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                option.value === task.status
                                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                              }`}
                            >
                              <option.icon className="w-3 h-3" />
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tags */}
                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Star Button */}
                <button
                  onClick={() => toggleImportant(task.id)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={task.priority === 'high' ? 'Remove from important' : 'Mark as important'}
                >
                  <Star 
                    className={`w-4 h-4 ${
                      task.priority === 'high' 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-gray-400 hover:text-yellow-500'
                    }`} 
                  />
                </button>

                {/* Priority Indicator */}
                <span className="text-xs" title={`Priority: ${task.priority}`}>
                  {priorityIcons[task.priority]}
                </span>

                {/* More Actions */}
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </button>
              </div>
            </div>

            {/* Task Meta */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              {/* Category */}
              <div className="flex items-center gap-1">
                {getIconComponent(getCategoryIcon(task.category))}
                <span className="capitalize">{task.category}</span>
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span className={task.dueDate < new Date() && task.status !== 'done' ? 'text-red-500' : ''}>
                    {formatDueDate(task.dueDate)}
                  </span>
                </div>
              )}

              {/* Repeat */}
              {task.repeat && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span className="capitalize">{task.repeat}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 glass rounded-xl shadow-lg border border-white/20 dark:border-gray-800/50 z-10"
            >
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setIsEditModalOpen(true);
                    setShowActions(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    deleteTask(task.id);
                    setShowActions(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
      />
    </>
  );
} 