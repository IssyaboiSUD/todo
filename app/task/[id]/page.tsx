'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  Calendar, 
  Clock, 
  CheckCircle,
  Circle,
  Play,
  ChevronDown
} from 'lucide-react';
import { Task, Category } from '../../types';
import { useTaskContext } from '../../contexts/TaskContext';
import { formatDueDate, getCategoryIcon, defaultCategories } from '../../utils/taskUtils';
import CalendarPicker from '../../components/CalendarPicker';

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { state, updateTask, updateTaskStatus } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  const taskId = params.id as string;
  const task = state.tasks.find(t => t.id === taskId);

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

  const repeatOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' },
  ];

  useEffect(() => {
    if (task) {
      setEditedTask(task);
    }
  }, [task]);

  // Redirect if task not found
  useEffect(() => {
    if (!task && state.tasks.length > 0) {
      router.push('/');
    }
  }, [task, state.tasks.length, router]);

  if (!task || !editedTask) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading task...</p>
        </div>
      </div>
    );
  }

  const currentStatus = statusOptions.find(option => option.value === editedTask.status);
  const currentCategory = defaultCategories.find(cat => cat.id === editedTask.category);
  const currentRepeat = repeatOptions.find(option => option.value === editedTask.repeat);

  const handleSave = () => {
    if (editedTask) {
      updateTask({
        ...editedTask,
        updatedAt: new Date()
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: 'open' | 'in-progress' | 'done') => {
    if (editedTask) {
      const updatedTask = {
        ...editedTask,
        status: newStatus,
        completed: newStatus === 'done',
        updatedAt: new Date()
      };
      setEditedTask(updatedTask);
      updateTaskStatus(task.id, newStatus);
      setShowStatusDropdown(false);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        category: newCategory,
        updatedAt: new Date()
      });
      setShowCategoryDropdown(false);
    }
  };

  const handlePriorityChange = (newPriority: 'low' | 'medium' | 'high') => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        priority: newPriority,
        updatedAt: new Date()
      });
      setShowPriorityDropdown(false);
    }
  };

  const handleRepeatChange = (newRepeat: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom') => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        repeat: newRepeat,
        updatedAt: new Date()
      });
    }
  };

  const handleDueDateChange = (dateString: string) => {
    if (editedTask) {
      const newDate = dateString ? new Date(dateString) : undefined;
      setEditedTask({
        ...editedTask,
        dueDate: newDate,
        updatedAt: new Date()
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Task Details
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Title Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="w-full px-4 py-3 text-2xl font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter task title..."
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {editedTask.title}
                </h1>
              )}
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md ${
                    currentStatus?.color || ''
                  }`}
                >
                  {currentStatus?.icon && <currentStatus.icon className="w-4 h-4" />}
                  <span className="capitalize">
                    {currentStatus?.label || editedTask.status}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    showStatusDropdown ? 'rotate-180' : ''
                  }`} />
                </button>

                {showStatusDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 min-w-[200px]">
                    <div className="p-2 space-y-1">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(option.value as 'open' | 'in-progress' | 'done')}
                          className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            option.value === editedTask.status
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                          }`}
                        >
                          <option.icon className="w-4 h-4" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes
              </label>
              {isEditing ? (
                <textarea
                  value={editedTask.notes || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Add notes, thoughts, or additional details about this task..."
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl min-h-[120px]">
                  {editedTask.notes ? (
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap text-lg leading-relaxed">
                      {editedTask.notes}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic text-lg">
                      No notes added yet
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Task Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                {isEditing ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-left hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <div className="flex items-center gap-3">
                        {getIconComponent(getCategoryIcon(editedTask.category))}
                        <span className="text-gray-900 dark:text-white capitalize text-lg font-medium">
                          {currentCategory?.name || editedTask.category}
                        </span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        showCategoryDropdown ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {showCategoryDropdown && (
                      <div className="absolute top-full left-0 mt-3 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 z-50 overflow-hidden">
                        <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                          {defaultCategories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryChange(category.id)}
                              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                category.id === editedTask.category
                                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-200 dark:border-primary-700 shadow-sm'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:shadow-sm'
                              }`}
                            >
                              {getIconComponent(category.icon)}
                              <span className="capitalize">{category.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    {getIconComponent(getCategoryIcon(editedTask.category))}
                    <span className="text-gray-900 dark:text-white capitalize text-lg font-medium">
                      {currentCategory?.name || editedTask.category}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Priority */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority
                </label>
                {isEditing ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-left hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{priorityIcons[editedTask.priority]}</span>
                        <span className={`font-bold capitalize text-lg ${priorityColors[editedTask.priority]}`}>
                          {editedTask.priority}
                        </span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        showPriorityDropdown ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {showPriorityDropdown && (
                      <div className="absolute top-full left-0 mt-3 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 z-50 overflow-hidden">
                        <div className="p-2 space-y-1">
                          {Object.entries(priorityIcons).map(([priority, icon]) => (
                            <button
                              key={priority}
                              onClick={() => handlePriorityChange(priority as 'low' | 'medium' | 'high')}
                              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                priority === editedTask.priority
                                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-200 dark:border-primary-700 shadow-sm'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:shadow-sm'
                              }`}
                            >
                              <span className="text-2xl">{icon}</span>
                              <span className={`font-bold capitalize ${priorityColors[priority as keyof typeof priorityColors]}`}>
                                {priority}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="text-2xl">{priorityIcons[editedTask.priority]}</span>
                    <span className={`font-bold capitalize text-lg ${priorityColors[editedTask.priority]}`}>
                      {editedTask.priority}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Date
                </label>
                {isEditing ? (
                  <div className="relative">
                    <button
                      ref={dateButtonRef}
                      onClick={() => setShowCalendarPicker(!showCalendarPicker)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        {editedTask.dueDate ? (
                          <span className="text-gray-900 dark:text-white text-lg font-medium">
                            {formatDueDate(editedTask.dueDate)}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-lg">
                            Select date and time
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        showCalendarPicker ? 'rotate-180' : ''
                      }`} />
                    </button>

                                            <CalendarPicker
                          isOpen={showCalendarPicker}
                          value={editedTask.dueDate}
                          onChange={handleDueDateChange}
                          onClose={() => setShowCalendarPicker(false)}
                          triggerRef={dateButtonRef}
                        />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    {editedTask.dueDate ? (
                      <span className={`text-gray-900 dark:text-white text-lg font-medium ${
                        editedTask.dueDate < new Date() && editedTask.status !== 'done' ? 'text-red-500' : ''
                      }`}>
                        {formatDueDate(editedTask.dueDate)}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-lg">
                        No due date set
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Repeat */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Repeat
                </label>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={editedTask.repeat || ''}
                      onChange={(e) => handleRepeatChange(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom')}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="">No repeat</option>
                      {repeatOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900 dark:text-white capitalize text-lg font-medium">
                      {editedTask.repeat ? currentRepeat?.label : 'No repeat'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {editedTask.tags.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tags
                </label>
                <div className="flex flex-wrap gap-3">
                  {editedTask.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-full text-lg bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</span>
                <p className="text-gray-900 dark:text-white text-lg">
                  {formatDate(editedTask.createdAt)}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</span>
                <p className="text-gray-900 dark:text-white text-lg">
                  {formatDate(editedTask.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
