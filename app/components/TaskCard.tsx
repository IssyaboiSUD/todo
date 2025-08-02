'use client';

import React, { useState } from 'react';
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
  Archive,
  Clock,
  Star
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
  const { toggleTask, deleteTask, archiveTask, updateTask, toggleImportant } = useTaskContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      archiveTask(task.id);
    } else if (direction === 'right') {
      toggleTask(task.id);
    }
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
        className="task-card"
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
            {task.completed ? (
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
                    task.completed 
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
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
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
                  <span className={task.dueDate < new Date() && !task.completed ? 'text-red-500' : ''}>
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
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    archiveTask(task.id);
                    setShowActions(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
                <button
                  onClick={() => {
                    deleteTask(task.id);
                    setShowActions(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm"
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