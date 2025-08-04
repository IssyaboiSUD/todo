'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek } from 'date-fns';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';

export default function Calendar() {
  const { state } = useTaskContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDate = (date: Date) => {
    return state.tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date) && !task.archived
    );
  };

  const getTasksForToday = () => {
    return state.tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), new Date()) && !task.archived
    );
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDateModalOpen(true);
  };

  const handleAddTaskForDate = (date: Date) => {
    setSelectedDate(date);
    setIsAddModalOpen(true);
  };

  const todayTasks = getTasksForToday();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Calendar View
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View your tasks organized by date
        </p>
      </motion.div>

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 sm:p-6"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-500" />
            Today's Tasks ({todayTasks.length})
          </h2>
          <div className="space-y-3">
            {todayTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Calendar Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-4 sm:p-6"
      >
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {daysInMonth.map((day, index) => {
            const tasksForDay = getTasksForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.01 }}
                className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative ${
                  isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                } ${isCurrentDay ? 'ring-2 ring-primary-500' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span className={`text-xs sm:text-sm font-medium ${
                    isCurrentDay 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : isCurrentMonth 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {tasksForDay.length > 0 && (
                    <span className="text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-1 py-0.5 rounded-full">
                      {tasksForDay.length}
                    </span>
                  )}
                </div>
                
                {/* Tasks for this day */}
                <div className="space-y-0.5 sm:space-y-1">
                  {tasksForDay.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className={`text-xs p-0.5 sm:p-1 rounded truncate ${
                        task.completed 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 line-through' 
                          : task.priority === 'high'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {tasksForDay.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      +{tasksForDay.length - 2} more
                    </div>
                  )}
                </div>

                {/* Add Task Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTaskForDate(day);
                  }}
                  className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 p-1 rounded-full bg-primary-500 hover:bg-primary-600 text-white opacity-0 hover:opacity-100 transition-opacity"
                  title={`Add task for ${format(day, 'MMM d, yyyy')}`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Upcoming Tasks */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-4 sm:p-6"
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Upcoming Tasks
        </h2>
        <div className="space-y-3">
          {state.tasks
            .filter(task => task.dueDate && new Date(task.dueDate) > new Date() && !task.archived)
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 5)
            .map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
        </div>
      </motion.div>

      {/* Date Tasks Modal */}
      <AnimatePresence>
        {isDateModalOpen && selectedDate && (
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
              onClick={() => setIsDateModalOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass w-full max-w-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800/50"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <button
                    onClick={() => setIsDateModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {getTasksForDate(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getTasksForDate(selectedDate).map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No tasks for this date</p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setIsDateModalOpen(false);
                      handleAddTaskForDate(selectedDate);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task for {format(selectedDate, 'MMM d')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialDate={selectedDate}
      />
    </div>
  );
} 