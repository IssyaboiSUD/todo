'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Circle, Play, CheckCircle } from 'lucide-react';

interface StatusSelectorProps {
  value: 'open' | 'in-progress' | 'done';
  onChange: (status: 'open' | 'in-progress' | 'done') => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

type StatusValue = 'open' | 'in-progress' | 'done';

const statusOptions: Array<{
  value: StatusValue;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  { value: 'open', label: 'Open', icon: Circle, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
  { value: 'in-progress', label: 'In Progress', icon: Play, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
  { value: 'done', label: 'Completed', icon: CheckCircle, color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' },
];

export default function StatusSelector({ value, onChange, size = 'md', disabled = false }: StatusSelectorProps) {
  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`inline-flex rounded-lg p-1 bg-gray-200 dark:bg-gray-700 ${sizeClasses[size]} transition-all duration-200`}>
      {statusOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={`
              relative flex items-center gap-2 px-3 rounded-md font-medium transition-all duration-200
              ${sizeClasses[size]}
              ${isSelected 
                ? 'text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {isSelected && (
              <motion.div
                layoutId="status-selector-bg"
                className={`absolute inset-0 rounded-md ${option.color}`}
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <motion.div
              className="relative z-10"
              animate={{ scale: isSelected ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className={iconSizes[size]} />
            </motion.div>
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
