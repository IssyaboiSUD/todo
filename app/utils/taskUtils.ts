import { parse, parseDate } from 'chrono-node';
import { format, isToday, isTomorrow, isYesterday, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { Task, Category } from '../types';

// Default categories
export const defaultCategories: Category[] = [
  { id: 'personal', name: 'Personal', color: '#3b82f6', icon: 'User', taskCount: 0 },
  { id: 'work', name: 'Work', color: '#10b981', icon: 'Briefcase', taskCount: 0 },
  { id: 'shopping', name: 'Shopping', color: '#f59e0b', icon: 'ShoppingCart', taskCount: 0 },
  { id: 'health', name: 'Health', color: '#ef4444', icon: 'Heart', taskCount: 0 },
  { id: 'home', name: 'Home', color: '#8b5cf6', icon: 'Home', taskCount: 0 },
  { id: 'finance', name: 'Finance', color: '#06b6d4', icon: 'DollarSign', taskCount: 0 },
];

// Category keywords for auto-categorization
const categoryKeywords: { [key: string]: string[] } = {
  shopping: ['buy', 'purchase', 'shop', 'grocery', 'milk', 'bread', 'food', 'clothes', 'shirt', 'pants'],
  work: ['meeting', 'call', 'email', 'report', 'presentation', 'deadline', 'project', 'client', 'boss'],
  health: ['exercise', 'workout', 'gym', 'doctor', 'appointment', 'medicine', 'vitamin', 'run', 'walk'],
  home: ['clean', 'laundry', 'dishes', 'cook', 'repair', 'maintenance', 'organize', 'declutter'],
  finance: ['bill', 'payment', 'budget', 'expense', 'tax', 'investment', 'save', 'money', 'bank'],
  personal: ['call', 'visit', 'birthday', 'anniversary', 'party', 'dinner', 'lunch', 'coffee'],
};

export function parseTaskInput(input: string): {
  title: string;
  category: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  repeat?: 'daily' | 'weekly' | 'monthly' | 'yearly';
} {
  const lowerInput = input.toLowerCase();
  
  // Parse date using chrono-node
  const parsedDate = parse(input);
  const dueDate = parsedDate.length > 0 ? parsedDate[0].start.date() : undefined;
  
  // Parse repeat option
  let repeat: 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined;
  const repeatMatch = input.match(/repeat:(daily|weekly|monthly|yearly)/i);
  if (repeatMatch) {
    repeat = repeatMatch[1] as 'daily' | 'weekly' | 'monthly' | 'yearly';
  }
  
  // Auto-categorize based on keywords
  let category = 'personal'; // default
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerInput.includes(keyword))) {
      category = cat;
      break;
    }
  }
  
  // Determine priority based on keywords
  let priority: 'low' | 'medium' | 'high' = 'medium';
  if (lowerInput.includes('urgent') || lowerInput.includes('asap') || lowerInput.includes('important')) {
    priority = 'high';
  } else if (lowerInput.includes('low priority') || lowerInput.includes('sometime')) {
    priority = 'low';
  }
  
  // Extract tags (words starting with #)
  const tags = input.match(/#\w+/g)?.map(tag => tag.slice(1)) || [];
  
  // Clean title (remove date, tags, and repeat)
  let title = input;
  if (dueDate) {
    title = title.replace(parsedDate[0].text, '').trim();
  }
  if (repeatMatch) {
    title = title.replace(repeatMatch[0], '').trim();
  }
  title = title.replace(/#\w+/g, '').trim();
  
  return {
    title,
    category,
    dueDate,
    priority,
    tags,
    repeat,
  };
}

export function createTask(input: string, priority?: 'low' | 'medium' | 'high'): Omit<Task, 'id'> {
  const parsed = parseTaskInput(input);
  
  // If no date is provided, set to today
  const dueDate = parsed.dueDate || new Date();
  
  return {
    title: parsed.title,
    completed: false,
    status: 'open', // Always start with open status
    category: parsed.category,
    dueDate: dueDate,
    priority: priority || parsed.priority,
    repeat: parsed.repeat,
    tags: parsed.tags,
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function getTaskStats(tasks: Task[]): {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  weeklyCompletions: number[];
  categoryBreakdown: { [key: string]: number };
} {
  const now = new Date();
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && t.dueDate && t.dueDate < now).length,
    weeklyCompletions: [0, 0, 0, 0, 0, 0, 0], // Last 7 days
    categoryBreakdown: {} as { [key: string]: number },
  };
  
  // Calculate weekly completions
  const completedTasks = tasks.filter(t => t.completed);
  completedTasks.forEach(task => {
    const taskDate = new Date(task.updatedAt);
    const daysAgo = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Only include tasks completed in the last 7 days
    if (daysAgo < 7) {
      // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const dayOfWeek = taskDate.getDay();
      stats.weeklyCompletions[dayOfWeek]++;
    }
  });
  
  // Calculate category breakdown
  tasks.forEach(task => {
    stats.categoryBreakdown[task.category] = (stats.categoryBreakdown[task.category] || 0) + 1;
  });
  
  return stats;
}

export function filterTasks(tasks: Task[], viewMode: string, searchTerm?: string): Task[] {
  let filtered = tasks;
  
  // Filter by view mode
  switch (viewMode) {
    case 'today':
      filtered = filtered.filter(t => 
        (t.dueDate && isToday(t.dueDate)) || 
        (t.dueDate && t.dueDate < new Date())
      );
      break;
    case 'upcoming':
      filtered = filtered.filter(t => t.dueDate && t.dueDate > new Date());
      break;
    case 'important':
      filtered = filtered.filter(t => t.priority === 'high');
      break;
  }
  
  // Filter by search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term) ||
      t.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }
  
  return filtered.sort((a, b) => {
    // Sort by priority first, then by due date
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export function formatDueDate(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return format(date, 'EEEE');
  }
  
  return format(date, 'MMM d');
}

export function getCategoryColor(category: string): string {
  const cat = defaultCategories.find(c => c.id === category);
  return cat?.color || '#6b7280';
}

export function getCategoryIcon(category: string): string {
  const cat = defaultCategories.find(c => c.id === category);
  return cat?.icon || 'Circle';
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'done') {
    return false;
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
  return taskDate < today;
}

export function isTaskOverdueOrWasOverdue(task: Task): boolean {
  if (!task.dueDate) {
    return false;
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
  return taskDate < today;
}

export function sortTasksWithOverdueFirst(tasks: Task[]): Task[] {
  return tasks.sort((a, b) => {
    const aOverdue = isTaskOverdue(a);
    const bOverdue = isTaskOverdue(b);
    
    // Overdue tasks first
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    // Within overdue/non-overdue groups, sort by priority then due date
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
} 