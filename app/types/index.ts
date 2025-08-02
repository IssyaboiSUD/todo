export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  category: string;
  priority: 'low' | 'medium' | 'high';
  repeat?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  taskCount: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  weeklyCompletions: number[];
  categoryBreakdown: { [key: string]: number };
}

export interface FocusMode {
  isActive: boolean;
  currentTask?: Task;
  sessionStart?: Date;
  sessionDuration: number; // in minutes
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  soundEnabled: boolean;
  autoArchive: boolean;
  defaultCategory: string;
}

export type ViewMode = 'today' | 'upcoming' | 'calendar' | 'focus' | 'stats' | 'all';

export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
} 