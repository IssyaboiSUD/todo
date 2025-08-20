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
- **Routing**: Dynamic routes with Next.js App Router

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

### **3. Dynamic Routing Architecture**
```typescript
// App Router with dynamic segments
app/task/[id]/page.tsx  // Individual task detail pages
app/page.tsx            // Main task list
```

**Benefits:**
- **SEO Friendly**: Each task has its own URL
- **Bookmarkable**: Users can save specific task URLs
- **Shareable**: Easy to share individual tasks
- **Better UX**: No modal conflicts or z-index issues

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
- **Enhanced Task Properties**: Added `notes` field for detailed task information

**Reducer Actions:**
```typescript
type TaskAction = 
  | { type: 'ADD_TASK'; payload: string }
  | { type: 'UPDATE_TASK_STATUS'; payload: { id: string; status: TaskStatus } }
  | { type: 'UPDATE_TASK'; payload: Task }
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

### **3. TaskCard.tsx - Enhanced Interactive Component**

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

// Task Detail Navigation
const router = useRouter();
const handleTaskClick = () => router.push(`/task/${task.id}`);
```

**New Features:**
- **Clickable Task Titles**: Navigate to dedicated detail pages
- **Visual Feedback**: Hover effects and animations
- **Enhanced Actions**: View details, edit, delete options

**Why These Patterns?**
- **User Experience**: Intuitive interactions and navigation
- **Accessibility**: Proper focus management and keyboard support
- **Performance**: Event listeners cleaned up properly
- **Modern UX**: Follows current web app design patterns

### **4. Task Detail Page - `/task/[id]/page.tsx`**

```typescript
export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { state, updateTask, updateTaskStatus } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
}
```

**Key Features:**
- **Dynamic Routing**: Uses Next.js App Router with dynamic segments
- **Full Task Editing**: Inline editing for title, notes, status, category, priority
- **Enhanced UX**: Sticky header, card-based layout, smooth animations
- **Responsive Design**: Mobile-first approach with desktop enhancements

**State Management:**
```typescript
// Local editing state
const [isEditing, setIsEditing] = useState(false);
const [editedTask, setEditedTask] = useState<Task | null>(null);

// Save changes to global state
const handleSave = () => {
  if (editedTask) {
    updateTask({
      ...editedTask,
      updatedAt: new Date()
    });
    setIsEditing(false);
  }
};
```

**Why This Architecture?**
- **Better UX**: No modal conflicts or z-index issues
- **SEO Friendly**: Each task has its own URL
- **Scalable**: Easy to add more features and metadata
- **Maintainable**: Clean separation of concerns

### **5. CalendarPicker.tsx - Custom Date Selection Component**

```typescript
interface CalendarPickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  onClose: () => void;
  isOpen: boolean;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}
```

**Advanced Features:**
- **Portal-Based Rendering**: Breaks out of modal boundaries
- **Smart Positioning**: Automatically positions above/below, left/right
- **Two-Step Selection**: Date selection → Time selection
- **Responsive Design**: Adapts to available viewport space

**Technical Implementation:**
```typescript
// Portal rendering for modal boundary breaking
return createPortal(calendarContent, document.body);

// Smart positioning calculation
useEffect(() => {
  if (isOpen && triggerRef?.current) {
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Calculate optimal position
    if (rect.bottom + calendarHeight > viewportHeight - 20) {
      setPosition('top');
      top = rect.top - calendarHeight - 12;
    } else {
      setPosition('bottom');
      top = rect.bottom + 12;
    }
  }
}, [isOpen, triggerRef]);
```

**Why This Approach?**
- **Modal Compatibility**: Works in any container without clipping
- **User Experience**: Calendar appears in optimal location
- **Performance**: No layout thrashing or positioning issues
- **Accessibility**: Proper focus management and keyboard support

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

### **3. Enhanced Task Creation & Editing**

```typescript
// AddTaskModal with custom calendar
const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
const [useCustomDate, setUseCustomDate] = useState(false);
const [showCalendarPicker, setShowCalendarPicker] = useState(false);
const dateButtonRef = useRef<HTMLButtonElement>(null);

// Calendar integration
<CalendarPicker
  isOpen={showCalendarPicker}
  value={customDate}
  onChange={(date) => {
    setCustomDate(date);
    setShowCalendarPicker(false);
  }}
  onClose={() => setShowCalendarPicker(false)}
  triggerRef={dateButtonRef}
/>
```

**Enhanced Features:**
- **Custom Date Picker**: Beautiful calendar interface
- **Priority Selection**: High, medium, low with visual indicators
- **Category Management**: Auto-categorization with manual override
- **Smart Input Parsing**: Natural language date and priority detection

### **4. Responsive Design with Tailwind**

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

// Task detail page responsive layout
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Responsive grid layout */}
  </div>
</div>
```

**Responsive Patterns:**
- **Mobile First**: Design for small screens first
- **Breakpoint System**: Consistent spacing and layout
- **Progressive Enhancement**: Add features for larger screens
- **Touch Friendly**: Proper button sizes and spacing

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

### **3. Enhanced Visual Design**

```typescript
// Apple-like design principles
<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
  {/* Clean, modern card design */}
</div>

// Smooth animations and transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
>
  {/* Smooth spring animations */}
</motion.div>
```

**Design Principles:**
- **Clean Typography**: Proper hierarchy and spacing
- **Consistent Spacing**: 8px grid system
- **Subtle Shadows**: Depth without overwhelming
- **Smooth Transitions**: 200-300ms for interactions

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

### **3. Portal-Based Rendering**

```typescript
// Calendar picker uses portal for modal boundary breaking
const calendarContent = (
  <AnimatePresence>
    <motion.div className="fixed z-[9999]" style={{ top, left }}>
      {/* Calendar content */}
    </motion.div>
  </AnimatePresence>
);

return createPortal(calendarContent, document.body);
```

**Performance Benefits:**
- **No Layout Thrashing**: Calendar doesn't affect parent layout
- **Z-Index Management**: Always appears above other content
- **Modal Compatibility**: Works in any container

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

### **3. Integration Testing**

```typescript
// Test task creation flow
describe('Task Creation Flow', () => {
  it('should create task with custom date', async () => {
    render(<AddTaskModal isOpen={true} onClose={jest.fn()} />);
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'Buy groceries' }
    });
    
    // Enable custom date
    fireEvent.click(screen.getByText('Custom Date'));
    
    // Select date from calendar
    fireEvent.click(screen.getByText('15')); // December 15
    
    // Submit
    fireEvent.click(screen.getByText('Add Task'));
    
    expect(mockAddTask).toHaveBeenCalledWith('Buy groceries Dec 15, 2024');
  });
});
```

---

## 🔧 **Common Interview Questions & Answers**

### **Q: Why did you choose React Context over Redux?**
**A:** "For this application, React Context with useReducer provides the right balance of simplicity and power. The state is not overly complex, and Context gives us built-in React integration without external dependencies. If the app grows, we can easily migrate to Redux or Zustand."

### **Q: How do you handle performance in this app?**
**A:** "I use several strategies: React.memo for expensive components, useMemo for derived state calculations, useCallback for stable event handlers, and proper dependency arrays. The drag and drop uses native HTML5 APIs for better performance than third-party libraries. I also implemented portal-based rendering for the calendar to avoid modal clipping issues."

### **Q: Explain your state management architecture**
**A:** "I use a single Context with useReducer for global state, local useState for component-specific UI state, and derived state for computed values. This creates a clear data flow: actions → reducer → context → components → UI updates. I've also enhanced the Task interface to include notes and better metadata management."

### **Q: How do you ensure code maintainability?**
**A:** "I follow several principles: single responsibility for components, clear separation of concerns, consistent naming conventions, TypeScript for type safety, and proper error boundaries. Each component has a single purpose and clear interfaces. I've also implemented a dedicated task detail page architecture instead of complex modals."

### **Q: What challenges did you face with React 19?**
**A:** "The main challenge was compatibility with drag and drop libraries. I solved this by implementing native HTML5 drag and drop, which actually gave us better performance and more control. I also had to ensure all hooks and patterns were compatible with the new React version. Additionally, I implemented portal-based rendering for better modal compatibility."

### **Q: How did you solve the calendar positioning issue in modals?**
**A:** "I implemented a custom calendar picker using React portals to render at the document body level, breaking out of modal boundaries. I also added smart positioning logic that calculates the optimal location based on the trigger element and available viewport space. This ensures the calendar is always fully visible and accessible."

### **Q: Explain your routing strategy for task details**
**A:** "I chose to use Next.js App Router with dynamic segments (`/task/[id]`) instead of modals for several reasons: better SEO, bookmarkable URLs, no z-index conflicts, and improved accessibility. Each task gets its own page with full editing capabilities, making the app more scalable and user-friendly."

---

## 📚 **Key Concepts to Master**

### **React Patterns**
- **Custom Hooks**: Encapsulate reusable logic
- **Render Props**: Flexible component composition
- **Higher-Order Components**: Cross-cutting concerns
- **Compound Components**: Related components working together
- **Portals**: Render outside parent DOM hierarchy

### **TypeScript Features**
- **Generic Types**: Flexible, reusable type definitions
- **Union Types**: Handle multiple possible values
- **Utility Types**: Transform existing types
- **Type Guards**: Runtime type checking
- **Ref Types**: Proper typing for DOM references

### **Performance Concepts**
- **Virtualization**: Handle large lists efficiently
- **Code Splitting**: Load only what's needed
- **Lazy Loading**: Defer non-critical resources
- **Memoization**: Cache expensive calculations
- **Portal Rendering**: Avoid layout thrashing

### **State Management**
- **Immutability**: Never mutate state directly
- **Normalization**: Efficient data structures
- **Selectors**: Compute derived state
- **Middleware**: Handle side effects
- **Context Optimization**: Prevent unnecessary re-renders

### **Next.js App Router**
- **Dynamic Segments**: Route parameters for dynamic content
- **Layout System**: Shared UI across routes
- **Loading States**: Built-in loading management
- **Error Boundaries**: Graceful error handling
- **SEO Optimization**: Server-side rendering benefits

---

## 🎯 **Interview Tips**

### **Before the Interview**
1. **Review the code**: Understand every component and function
2. **Practice explaining**: Walk through the architecture out loud
3. **Prepare examples**: Have specific code examples ready
4. **Know the trade-offs**: Why you made certain decisions
5. **Understand the new features**: Task details, calendar picker, enhanced editing

### **During the Interview**
1. **Start high-level**: Explain the overall architecture first
2. **Use concrete examples**: Point to specific code sections
3. **Discuss alternatives**: Show you considered other approaches
4. **Be honest**: Admit if you're unsure about something
5. **Highlight innovations**: Portal-based calendar, dynamic routing, enhanced UX

### **Common Follow-up Questions**
- "How would you scale this for 10,000 tasks?"
- "What if you needed real-time collaboration?"
- "How would you add offline support?"
- "What's your testing strategy?"
- "How did you solve the modal positioning issue?"
- "Why did you choose pages over modals for task details?"

---

## 🚀 **Next Steps & Improvements**

### **Immediate Improvements**
- **Error Boundaries**: Handle component errors gracefully
- **Loading States**: Better UX during async operations
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance Monitoring**: Track real-world performance
- **Mobile Optimization**: Touch gestures and mobile-specific features

### **Future Features**
- **Real-time Sync**: WebSocket integration
- **Offline Support**: Service Worker + IndexedDB
- **Collaboration**: Multi-user task sharing
- **Analytics**: User behavior tracking
- **Advanced Calendar**: Recurring tasks, calendar view
- **Task Templates**: Predefined task structures

### **Technical Debt**
- **Testing Coverage**: Add more unit and integration tests
- **Error Handling**: Comprehensive error management
- **Performance**: Bundle analysis and optimization
- **Documentation**: API documentation and examples
- **Accessibility**: Screen reader support and keyboard navigation

---

## 🌟 **Key Achievements & Innovations**

### **1. Enhanced User Experience**
- **Dedicated Task Pages**: Each task has its own URL and full editing interface
- **Custom Calendar Picker**: Beautiful, responsive date selection with smart positioning
- **Inline Editing**: Edit tasks without leaving the detail view
- **Enhanced Task Properties**: Notes, priority, category, and due date management

### **2. Technical Solutions**
- **Portal-Based Rendering**: Calendar breaks out of modal boundaries
- **Smart Positioning**: Automatic optimal placement based on viewport
- **Dynamic Routing**: SEO-friendly URLs with Next.js App Router
- **Type Safety**: Full TypeScript coverage with proper ref typing

### **3. Performance & Scalability**
- **No Modal Conflicts**: Calendar works in any container
- **Efficient State Management**: Context + useReducer for predictable updates
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Accessibility**: Proper focus management and keyboard support

---

This guide covers the essential aspects of your enhanced todo app that interviewers will likely ask about. Focus on understanding the "why" behind your decisions, not just the "how" of implementation. The new features demonstrate advanced React patterns, problem-solving skills, and user experience thinking. Good luck with your interviews! 🎉
