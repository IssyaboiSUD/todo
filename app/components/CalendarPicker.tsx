'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface CalendarPickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  onClose: () => void;
  isOpen: boolean;
  triggerRef?: React.RefObject<HTMLElement | HTMLButtonElement>;
}

export default function CalendarPicker({ value, onChange, onClose, isOpen, triggerRef }: CalendarPickerProps) {
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [selectedTime, setSelectedTime] = useState<string>(
    value ? `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}` : '12:00'
  );
  const [view, setView] = useState<'calendar' | 'time'>('calendar');
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const [horizontalPosition, setHorizontalPosition] = useState<'left' | 'right'>('left');
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    if (value) {
      setCurrentDate(new Date(value));
      setSelectedDate(new Date(value));
      setSelectedTime(`${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}`);
    }
  }, [value]);

  // Calculate position for the calendar
  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const calendarHeight = 400;
      const calendarWidth = 320;
      
      let top, left;
      
      // Calculate vertical position
      if (rect.bottom + calendarHeight > viewportHeight - 20) {
        // Position above
        top = rect.top - calendarHeight - 12;
        setPosition('top');
      } else {
        // Position below
        top = rect.bottom + 12;
        setPosition('bottom');
      }
      
      // Calculate horizontal position
      if (rect.left + calendarWidth > viewportWidth - 20) {
        // Position to the right
        left = rect.right - calendarWidth;
        setHorizontalPosition('right');
      } else {
        // Position to the left
        left = rect.left;
        setHorizontalPosition('left');
      }
      
      setCalendarPosition({ top, left });
    }
  }, [isOpen, triggerRef]);

  // Click outside handler for status dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setView('time');
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const finalDate = new Date(selectedDate);
      finalDate.setHours(hours, minutes, 0, 0);
      onChange(finalDate);
      onClose();
    }
  };

  const handleClear = () => {
    onChange(undefined);
    onClose();
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const days = getDaysInMonth(currentDate);

  if (!isOpen) return null;

  // Use portal to render calendar at document body level to avoid modal clipping
  const calendarContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -10 : 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -10 : 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed z-[9999]"
        ref={calendarRef}
        style={{
          top: `${calendarPosition.top}px`,
          left: `${calendarPosition.left}px`,
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden min-w-[320px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={goToToday}
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>

          {/* Calendar Body */}
          <div className="p-4">
            {view === 'calendar' ? (
              <>
                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => date && handleDateSelect(date)}
                      disabled={!date}
                      className={`
                        w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200
                        ${!date ? 'invisible' : ''}
                        ${isToday(date) ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold' : ''}
                        ${isSelected(date) ? 'bg-primary-500 text-white font-semibold shadow-lg' : ''}
                        ${date && !isToday(date) && !isSelected(date) ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white' : ''}
                        ${date && date < new Date() ? 'text-gray-400 dark:text-gray-500' : ''}
                      `}
                    >
                      {date ? date.getDate() : ''}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Time Selection View */
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Select Time
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hour
                    </label>
                    <select
                      value={selectedTime.split(':')[0]}
                      onChange={(e) => setSelectedTime(`${e.target.value}:${selectedTime.split(':')[1]}`)}
                      className="w-20 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-lg font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-2xl font-bold text-gray-400">:</div>
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minute
                    </label>
                    <select
                      value={selectedTime.split(':')[1]}
                      onChange={(e) => setSelectedTime(`${selectedTime.split(':')[0]}:${e.target.value}`)}
                      className="w-20 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-center text-lg font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView('calendar')}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Back to Calendar
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {view === 'calendar' && (
            <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="flex-1 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Clear Date
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(calendarContent, document.body);
}
