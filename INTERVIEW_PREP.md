# Todo App - Technical Interview Preparation Guide

## 🏗️ **Project Architecture Overview**

This is a **Next.js 15** application built with **React 19**, **TypeScript**, and **Tailwind CSS**. It follows modern React patterns with a focus on performance, accessibility, and maintainable code.

### **Tech Stack**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: React Context + useReducer
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns + chrono-node
- **Drag & Drop**: HTML5 Native API
- **Storage**: LocalStorage (client-side persistence)

---

## 🧠 **Core Architecture Patterns**

### **1. State Management Strategy**
```typescript
// Context + useReducer Pattern
const TaskContext = createContext<TaskContextType | undefined>(undefined);
const taskReducer = (state: TaskState, action: TaskAction): TaskState => { ... }
```

**Why This Pattern?**
- **Centralized State**: Single source of truth for all task data
- **Predictable Updates**: Actions flow through reducer for consistent state changes
- **Performance**: Prevents unnecessary re-renders with proper memoization
- **Scalability**: Easy to add new actions and state properties

### **2. Component Composition**
```typescript
// Smart vs Dumb Components
// Smart: TaskList (manages state, business logic)
// Dumb: TaskCard (receives props, renders UI)
```

**Benefits:**
- **Separation of Concerns**: Logic vs Presentation
- **Reusability**: TaskCard can be used in different contexts
- **Testing**: Easier to unit test individual components
- **Maintenance**: Changes to logic don't affect UI components

---

## 🔑 **Key Components Deep Dive**

### **1. TaskContext.tsx - State Management Hub**

```typescript
interface TaskState {
  tasks: Task[];
  categories: Category[];
  viewMode: ViewMode;
  searchTerm: string;
  selectedCategory: string | null;
  stats: TaskStats;
  settings: AppSettings;
}
```

**Key Features:**
- **Immutable Updates**: All state changes create new objects
- **Computed Properties**: `filteredTasks` derived from state
- **Local Storage Sync**: Automatic persistence on state changes
- **Type Safety**: Full TypeScript coverage for all state properties

**Reducer Actions:**
```typescript
type TaskAction = 
  | { type: 'ADD_TASK'; payload: string }
  | { type: 'UPDATE_TASK_STATUS'; payload: { id: string; status: TaskStatus } }
  | { type: 'TOGGLE_TASK'; payload: string }
  // ... more actions
```

**Why useReducer over useState?**
- **Complex State Logic**: Multiple related state updates
- **Predictable State Transitions**: Each action has a clear outcome
- **Testing**: Easy to test individual actions
- **Debugging**: Clear action history for troubleshooting

### **2. TaskList.tsx - Main Component Logic**

```typescript
export default function TaskList() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'done'>('all');
  const [showTip, setShowTip] = useState(true);
}
```

**State Management:**
- **Local State**: Component-specific UI state (view mode, filters)
- **Global State**: Task data from context
- **Derived State**: Filtered tasks based on current filters

**Conditional Rendering:**
```typescript
const shouldShowKanban = state.viewMode === 'today' || state.viewMode === 'upcoming';

{shouldShowKanban && viewMode === 'kanban' ? (
  <KanbanBoard />
) : (
  <ListView />
)}
```

**Why This Pattern?**
- **Performance**: Only renders what's needed
- **User Experience**: Different UIs for different contexts
- **Maintainability**: Clear separation of concerns

### **3. TaskCard.tsx - Reusable UI Component**

```typescript
interface TaskCardProps {
  task: Task;
  index: number;
}
```

**Props Design:**
- **Minimal Props**: Only essential data passed down
- **Index for Animation**: Used by Framer Motion for staggered animations
- **Task Object**: Complete task data for rendering

**Interactive Elements:**
```typescript
// Status Dropdown
const [showStatusDropdown, setShowStatusDropdown] = useState(false);

// Click Outside Handler
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
      setShowStatusDropdown(false);
    }
  };
  // ... event listener setup
}, [showStatusDropdown]);
```

**Why These Patterns?**
- **User Experience**: Intuitive interactions
- **Accessibility**: Proper focus management
- **Performance**: Event listeners cleaned up properly

---

## 🎯 **Advanced Features Implementation**

### **1. HTML5 Drag & Drop**

```typescript
const handleDragStart = (e: React.DragEvent, taskId: string) => {
  setDraggedTaskId(taskId);
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', taskId);
};

const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
  e.preventDefault();
  if (!draggedTaskId) return;
  updateTaskStatus(draggedTaskId, targetStatus);
};
```

**Why HTML5 over Libraries?**
- **Bundle Size**: No additional dependencies
- **Performance**: Native browser implementation
- **React 19 Compatibility**: Works with latest React version
- **Customization**: Full control over behavior and styling

### **2. Smart Task Filtering**

```typescript
const kanbanTasks = shouldShowKanban 
  ? state.tasks.filter(task => {
      if (state.viewMode === 'today') {
        return task.dueDate && isToday(new Date(task.dueDate));
      } else if (state.viewMode === 'upcoming') {
        return task.dueDate && new Date(task.dueDate) > new Date();
      }
      return false;
    })
  : state.tasks;
```

**Filtering Strategy:**
- **View-Based**: Different filters for different tabs
- **Performance**: Filter once, use everywhere
- **Consistency**: Same logic across components

### **3. Responsive Design with Tailwind**

```typescript
// Mobile-first approach
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Single column on mobile, three on desktop */}
</div>

// Conditional visibility
{shouldShowKanban && (
  <div className="hidden md:block">
    {/* Desktop-only content */}
  </div>
)}
```

**Responsive Patterns:**
- **Mobile First**: Design for small screens first
- **Breakpoint System**: Consistent spacing and layout
- **Progressive Enhancement**: Add features for larger screens

---

## 🎨 **Styling & Design System**

### **1. CSS Architecture**

```css
@layer base {
  /* Global styles and CSS variables */
}

@layer components {
  /* Reusable component styles */
}

@layer utilities {
  /* Utility classes */
}
```

**Why This Structure?**
- **Specificity Control**: Predictable CSS cascade
- **Maintainability**: Clear organization of styles
- **Performance**: Tailwind optimizes unused styles

### **2. Dark Mode Implementation**

```css
.dark .task-card {
  background-color: rgba(31, 41, 55, 0.8);
  border-color: rgba(55, 65, 81, 0.3);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}
```

**Dark Mode Strategy:**
- **CSS Classes**: `.dark` class for theme switching
- **Color Variables**: Consistent color palette
- **Accessibility**: Proper contrast ratios

---

## 🚀 **Performance Optimizations**

### **1. React.memo & useMemo**

```typescript
// Prevent unnecessary re-renders
const filteredTasks = useMemo(() => {
  return getFilteredTasks(state.tasks, state.viewMode, state.searchTerm);
}, [state.tasks, state.viewMode, state.searchTerm]);
```

**When to Use:**
- **Expensive Calculations**: Filtering, sorting, transformations
- **Object References**: Prevent child re-renders
- **Dependency Arrays**: Clear when to recalculate

### **2. Event Handler Optimization**

```typescript
// Stable references
const handleStatusChange = useCallback((newStatus: TaskStatus) => {
  updateTaskStatus(task.id, newStatus);
  setShowStatusDropdown(false);
}, [task.id, updateTaskStatus]);
```

**Why useCallback?**
- **Prevent Re-renders**: Child components don't re-render unnecessarily
- **Dependency Stability**: Clear when function should change
- **Performance**: Especially important for lists

---

## 🧪 **Testing Strategy**

### **1. Component Testing**

```typescript
// Test component behavior, not implementation
describe('TaskCard', () => {
  it('should call updateTaskStatus when status changes', () => {
    const mockUpdateStatus = jest.fn();
    render(<TaskCard task={mockTask} updateTaskStatus={mockUpdateStatus} />);
    
    fireEvent.click(screen.getByText('Change Status'));
    fireEvent.click(screen.getByText('In Progress'));
    
    expect(mockUpdateStatus).toHaveBeenCalledWith(mockTask.id, 'in-progress');
  });
});
```

### **2. State Management Testing**

```typescript
// Test reducer logic
describe('taskReducer', () => {
  it('should handle UPDATE_TASK_STATUS correctly', () => {
    const initialState = { tasks: [mockTask] };
    const action = { type: 'UPDATE_TASK_STATUS', payload: { id: '1', status: 'done' } };
    
    const newState = taskReducer(initialState, action);
    
    expect(newState.tasks[0].status).toBe('done');
    expect(newState.tasks[0].completed).toBe(true);
  });
});
```

---

## 🔧 **Common Interview Questions & Answers**

### **Q: Why did you choose React Context over Redux?**
**A:** "For this application, React Context with useReducer provides the right balance of simplicity and power. The state is not overly complex, and Context gives us built-in React integration without external dependencies. If the app grows, we can easily migrate to Redux or Zustand."

### **Q: How do you handle performance in this app?**
**A:** "I use several strategies: React.memo for expensive components, useMemo for derived state calculations, useCallback for stable event handlers, and proper dependency arrays. The drag and drop uses native HTML5 APIs for better performance than third-party libraries."

### **Q: Explain your state management architecture**
**A:** "I use a single Context with useReducer for global state, local useState for component-specific UI state, and derived state for computed values. This creates a clear data flow: actions → reducer → context → components → UI updates."

### **Q: How do you ensure code maintainability?**
**A:** "I follow several principles: single responsibility for components, clear separation of concerns, consistent naming conventions, TypeScript for type safety, and proper error boundaries. Each component has a single purpose and clear interfaces."

### **Q: What challenges did you face with React 19?**
**A:** "The main challenge was compatibility with drag and drop libraries. I solved this by implementing native HTML5 drag and drop, which actually gave us better performance and more control. I also had to ensure all hooks and patterns were compatible with the new React version."

---

## 📚 **Key Concepts to Master**

### **React Patterns**
- **Custom Hooks**: Encapsulate reusable logic
- **Render Props**: Flexible component composition
- **Higher-Order Components**: Cross-cutting concerns
- **Compound Components**: Related components working together

### **TypeScript Features**
- **Generic Types**: Flexible, reusable type definitions
- **Union Types**: Handle multiple possible values
- **Utility Types**: Transform existing types
- **Type Guards**: Runtime type checking

### **Performance Concepts**
- **Virtualization**: Handle large lists efficiently
- **Code Splitting**: Load only what's needed
- **Lazy Loading**: Defer non-critical resources
- **Memoization**: Cache expensive calculations

### **State Management**
- **Immutability**: Never mutate state directly
- **Normalization**: Efficient data structures
- **Selectors**: Compute derived state
- **Middleware**: Handle side effects

---

## 🎯 **Interview Tips**

### **Before the Interview**
1. **Review the code**: Understand every component and function
2. **Practice explaining**: Walk through the architecture out loud
3. **Prepare examples**: Have specific code examples ready
4. **Know the trade-offs**: Why you made certain decisions

### **During the Interview**
1. **Start high-level**: Explain the overall architecture first
2. **Use concrete examples**: Point to specific code sections
3. **Discuss alternatives**: Show you considered other approaches
4. **Be honest**: Admit if you're unsure about something

### **Common Follow-up Questions**
- "How would you scale this for 10,000 tasks?"
- "What if you needed real-time collaboration?"
- "How would you add offline support?"
- "What's your testing strategy?"

---

## 🚀 **Next Steps & Improvements**

### **Immediate Improvements**
- **Error Boundaries**: Handle component errors gracefully
- **Loading States**: Better UX during async operations
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance Monitoring**: Track real-world performance

### **Future Features**
- **Real-time Sync**: WebSocket integration
- **Offline Support**: Service Worker + IndexedDB
- **Collaboration**: Multi-user task sharing
- **Analytics**: User behavior tracking

### **Technical Debt**
- **Testing Coverage**: Add more unit and integration tests
- **Error Handling**: Comprehensive error management
- **Performance**: Bundle analysis and optimization
- **Documentation**: API documentation and examples

---

This guide covers the essential aspects of your todo app that interviewers will likely ask about. Focus on understanding the "why" behind your decisions, not just the "how" of implementation. Good luck with your interviews! 🎉
