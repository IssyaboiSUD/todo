'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, Category, ViewMode, AppSettings } from '../types';
import { defaultCategories, createTask, getTaskStats, filterTasks } from '../utils/taskUtils';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  viewMode: ViewMode;
  searchTerm: string;
  settings: AppSettings;
  stats: ReturnType<typeof getTaskStats>;
  selectedCategory: string | null;
  showArchived: boolean;
}

type TaskAction =
  | { type: 'ADD_TASK'; payload: string }
  | { type: 'ADD_TASK_WITH_PRIORITY'; payload: { input: string; priority: 'low' | 'medium' | 'high' } }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'ARCHIVE_TASK'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'LOAD_TASKS'; payload: Task[] }
  | { type: 'LOAD_CATEGORIES'; payload: Category[] }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'TOGGLE_IMPORTANT'; payload: string }
  | { type: 'SET_SHOW_ARCHIVED'; payload: boolean };

const initialState: TaskState = {
  tasks: [],
  categories: defaultCategories,
  viewMode: 'today',
  searchTerm: '',
  settings: {
    theme: 'system',
    notifications: true,
    soundEnabled: true,
    autoArchive: false,
    defaultCategory: 'personal',
  },
  stats: {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    weeklyCompletions: [0, 0, 0, 0, 0, 0, 0],
    categoryBreakdown: {},
  },
  selectedCategory: null,
  showArchived: false,
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask = createTask(action.payload);
      const updatedTasks = [...state.tasks, newTask];
      return {
        ...state,
        tasks: updatedTasks,
        stats: getTaskStats(updatedTasks),
      };
    }
    
    case 'ADD_TASK_WITH_PRIORITY': {
      const newTask = createTask(action.payload.input, action.payload.priority);
      const updatedTasks = [...state.tasks, newTask];
      return {
        ...state,
        tasks: updatedTasks,
        stats: getTaskStats(updatedTasks),
      };
    }
    
    case 'UPDATE_TASK': {
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.id ? { ...action.payload, updatedAt: new Date() } : task
      );
      return {
        ...state,
        tasks: updatedTasks,
        stats: getTaskStats(updatedTasks),
      };
    }
    
    case 'DELETE_TASK': {
      const updatedTasks = state.tasks.filter(task => task.id !== action.payload);
      return {
        ...state,
        tasks: updatedTasks,
        stats: getTaskStats(updatedTasks),
      };
    }
    
    case 'TOGGLE_TASK': {
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload
          ? { ...task, completed: !task.completed, updatedAt: new Date() }
          : task
      );
      return {
        ...state,
        tasks: updatedTasks,
        stats: getTaskStats(updatedTasks),
      };
    }
    
    case 'ARCHIVE_TASK': {
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload ? { ...task, archived: true, updatedAt: new Date() } : task
      );
      return {
        ...state,
        tasks: updatedTasks,
        stats: getTaskStats(updatedTasks),
      };
    }

    case 'TOGGLE_IMPORTANT': {
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload 
          ? { ...task, priority: task.priority === 'high' ? 'medium' : 'high' as 'low' | 'medium' | 'high', updatedAt: new Date() }
          : task
      );
      return {
        ...state,
        tasks: updatedTasks,
        stats: getTaskStats(updatedTasks),
      };
    }
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    
    case 'SET_SHOW_ARCHIVED':
      return { ...state, showArchived: action.payload };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    case 'LOAD_TASKS':
      return {
        ...state,
        tasks: action.payload,
        stats: getTaskStats(action.payload),
      };
    
    case 'LOAD_CATEGORIES':
      return { ...state, categories: action.payload };
    
    default:
      return state;
  }
}

interface TaskContextType {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  filteredTasks: Task[];
  addTask: (input: string) => void;
  addTaskWithPriority: (input: string, priority: 'low' | 'medium' | 'high') => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  archiveTask: (id: string) => void;
  toggleImportant: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setShowArchived: (show: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  
  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
      dispatch({ type: 'LOAD_TASKS', payload: tasks });
    }
    
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      dispatch({ type: 'UPDATE_SETTINGS', payload: JSON.parse(savedSettings) });
    }
  }, []);
  
  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
  }, [state.tasks]);
  
  // Save settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(state.settings));
  }, [state.settings]);
  
  // Filter tasks based on current state
  const getFilteredTasks = () => {
    let filtered = state.tasks;
    
    // Apply filters - only one filter can be active at a time
    if (state.selectedCategory) {
      // Show all tasks in selected category regardless of date
      filtered = filtered.filter(task => task.category === state.selectedCategory);
    } else if (state.showArchived) {
      // Show all archived tasks regardless of date
      filtered = filtered.filter(task => task.archived);
    } else {
      // Default: show non-archived tasks and apply view mode filtering
      filtered = filtered.filter(task => !task.archived);
      filtered = filterTasks(filtered, state.viewMode, state.searchTerm);
    }
    
    return filtered;
  };
  
  const filteredTasks = getFilteredTasks();
  
  const addTask = (input: string) => {
    dispatch({ type: 'ADD_TASK', payload: input });
  };
  
  const addTaskWithPriority = (input: string, priority: 'low' | 'medium' | 'high') => {
    dispatch({ type: 'ADD_TASK_WITH_PRIORITY', payload: { input, priority } });
  };
  
  const updateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };
  
  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };
  
  const toggleTask = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  };
  
  const archiveTask = (id: string) => {
    dispatch({ type: 'ARCHIVE_TASK', payload: id });
  };

  const toggleImportant = (id: string) => {
    dispatch({ type: 'TOGGLE_IMPORTANT', payload: id });
  };
  
  const setViewMode = (mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };
  
  const setSearchTerm = (term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  };

  const setSelectedCategory = (category: string | null) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
  };

  const setShowArchived = (show: boolean) => {
    dispatch({ type: 'SET_SHOW_ARCHIVED', payload: show });
  };
  
  const updateSettings = (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };
  
  const value: TaskContextType = {
    state,
    dispatch,
    filteredTasks,
    addTask,
    addTaskWithPriority,
    updateTask,
    deleteTask,
    toggleTask,
    archiveTask,
    toggleImportant,
    setViewMode,
    setSearchTerm,
    setSelectedCategory,
    setShowArchived,
    updateSettings,
  };
  
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
} 