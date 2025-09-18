'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, Category, ViewMode, AppSettings } from '../types';
import { defaultCategories, createTask, getTaskStats, filterTasks } from '../utils/taskUtils';
import { useAuth } from './AuthContext';
import { 
  getUserTasks, 
  addTask as addTaskToFirestore, 
  updateTask as updateTaskInFirestore, 
  deleteTask as deleteTaskFromFirestore,
  subscribeToUserTasks,
  getUserSettings,
  updateUserSettings
} from '../lib/firebaseService';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  viewMode: ViewMode;
  searchTerm: string;
  settings: AppSettings;
  stats: ReturnType<typeof getTaskStats>;
  selectedCategory: string | null;
}

type TaskAction =
  | { type: 'ADD_TASK'; payload: string }
  | { type: 'ADD_TASK_WITH_PRIORITY'; payload: { input: string; priority: 'low' | 'medium' | 'high' } }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'UPDATE_TASK_STATUS'; payload: { id: string; status: 'open' | 'in-progress' | 'done' } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'LOAD_TASKS'; payload: Task[] }
  | { type: 'LOAD_CATEGORIES'; payload: Category[] }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'TOGGLE_IMPORTANT'; payload: string };

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
    
    case 'UPDATE_TASK_STATUS': {
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.id 
          ? { 
              ...task, 
              status: action.payload.status, 
              completed: action.payload.status === 'done', // Auto-complete when status is done
              updatedAt: new Date() 
            } 
          : task
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
          ? { 
              ...task, 
              completed: !task.completed, 
              // Only change status if it's currently "done" and we're uncompleting it
              status: (!task.completed && task.status === 'done') ? 'open' : task.status,
              updatedAt: new Date() 
            }
          : task
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
  addTask: (input: string) => Promise<void>;
  addTaskWithPriority: (input: string, priority: 'low' | 'medium' | 'high') => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  updateTaskStatus: (id: string, status: 'open' | 'in-progress' | 'done') => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  toggleImportant: (id: string) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string | null) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { user } = useAuth();
  
  // Load tasks from Firebase when user logs in
  useEffect(() => {
    if (!user) {
      // Clear tasks when user logs out
      dispatch({ type: 'LOAD_TASKS', payload: [] });
      return;
    }

    // Subscribe to real-time updates for user's tasks
    const unsubscribe = subscribeToUserTasks(user.uid, (tasks) => {
      dispatch({ type: 'LOAD_TASKS', payload: tasks });
    });

    return () => unsubscribe();
  }, [user]);

  // Load user settings from Firebase
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      const settings = await getUserSettings(user.uid);
      if (settings) {
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      }
    };

    loadSettings();
  }, [user]);

  // Save settings to Firebase whenever settings change (with user check)
  useEffect(() => {
    if (!user || !state.settings) return;
    
    updateUserSettings(user.uid, state.settings);
  }, [state.settings, user]);
  
  // Filter tasks based on current state
  const getFilteredTasks = () => {
    let filtered = state.tasks;
    
    // Apply filters - only one filter can be active at a time
    if (state.selectedCategory) {
      // Show all tasks in selected category regardless of date
      filtered = filtered.filter(task => task.category === state.selectedCategory);
    } else {
      // Default: apply view mode filtering
      filtered = filterTasks(filtered, state.viewMode, state.searchTerm);
    }
    
    return filtered;
  };
  
  const filteredTasks = getFilteredTasks();
  
  const addTask = async (input: string) => {
    if (!user) return;
    
    const newTask = createTask(input);
    const { id, ...taskData } = newTask;
    
    // Add to Firestore
    const firestoreId = await addTaskToFirestore(user.uid, taskData);
    if (firestoreId) {
      // The real-time listener will update the local state
      console.log('Task added successfully');
    }
  };
  
  const addTaskWithPriority = async (input: string, priority: 'low' | 'medium' | 'high') => {
    if (!user) return;
    
    const newTask = createTask(input, priority);
    const { id, ...taskData } = newTask;
    
    // Add to Firestore
    const firestoreId = await addTaskToFirestore(user.uid, taskData);
    if (firestoreId) {
      // The real-time listener will update the local state
      console.log('Task with priority added successfully');
    }
  };
  
  const updateTask = async (task: Task) => {
    if (!user) return;
    
    const success = await updateTaskInFirestore(task.id, task);
    if (success) {
      // The real-time listener will update the local state
      console.log('Task updated successfully');
    }
  };

  const updateTaskStatus = async (id: string, status: 'open' | 'in-progress' | 'done') => {
    if (!user) return;
    
    const success = await updateTaskInFirestore(id, { 
      status, 
      completed: status === 'done',
      updatedAt: new Date()
    });
    if (success) {
      // The real-time listener will update the local state
      console.log('Task status updated successfully');
    }
  };
  
  const deleteTask = async (id: string) => {
    if (!user) return;
    
    const success = await deleteTaskFromFirestore(id);
    if (success) {
      // The real-time listener will update the local state
      console.log('Task deleted successfully');
    }
  };
  
  const toggleTask = async (id: string) => {
    if (!user) return;
    
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    
    const success = await updateTaskInFirestore(id, { 
      completed: !task.completed,
      status: !task.completed ? 'done' : 'open',
      updatedAt: new Date()
    });
    if (success) {
      console.log('Task toggled successfully');
    }
  };
  
  const toggleImportant = async (id: string) => {
    if (!user) return;
    
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    
    const success = await updateTaskInFirestore(id, { 
      priority: task.priority === 'high' ? 'medium' : 'high',
      updatedAt: new Date()
    });
    if (success) {
      console.log('Task importance toggled successfully');
    }
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
    updateTaskStatus,
    deleteTask,
    toggleTask,
    toggleImportant,
    setViewMode,
    setSearchTerm,
    setSelectedCategory,
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