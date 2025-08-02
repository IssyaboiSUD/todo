# Focus - Modern Todo App

A beautiful, Apple-inspired todo application built with Next.js, React, and TailwindCSS. Features intelligent task management, smart categorization, focus mode, and comprehensive analytics.

## ✨ Features

### Core Functionality
- **Smart Task Creation**: Natural language input with automatic categorization
- **Intelligent Date Parsing**: Uses chrono-node for smart date recognition
- **Auto-categorization**: Tasks are automatically categorized based on keywords
- **Priority Detection**: Automatically detects urgency and importance
- **Tag Support**: Add tags using #hashtag syntax

### Focus Mode
- **Distraction-free Interface**: Show one task at a time
- **Pomodoro Timer**: Built-in timer for focused work sessions
- **Session Tracking**: Track your focus sessions and progress
- **Task Navigation**: Skip or complete tasks in focus mode

### Modern UI/UX
- **Glassmorphism Design**: Beautiful blur effects and transparency
- **Dark/Light Mode**: Automatic theme switching with system preference
- **Responsive Design**: Works perfectly on desktop and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Swipe Gestures**: Swipe to complete or archive tasks on mobile

### Analytics & Insights
- **Task Statistics**: Comprehensive overview of your productivity
- **Weekly Charts**: Visual representation of task completion patterns
- **Category Breakdown**: See how you spend your time across categories
- **Progress Tracking**: Real-time completion rates and trends

### Keyboard Shortcuts
- `⌘1` - Switch to Today view
- `⌘2` - Switch to Upcoming view  
- `⌘3` - Enter Focus Mode
- `⌘4` - View Statistics
- `⌘+Enter` - Submit task in modal

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd todo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

### Adding Tasks
Simply type natural language descriptions like:
- "Buy milk tomorrow"
- "Call mom this weekend" 
- "Finish project report by Friday"
- "Schedule dentist appointment #health"

The app will automatically:
- Parse the due date
- Categorize the task
- Set appropriate priority
- Extract tags

### Smart Categorization
Tasks are automatically categorized based on keywords:
- **Shopping**: buy, purchase, shop, grocery, milk, bread, food
- **Work**: meeting, call, email, report, presentation, deadline
- **Health**: exercise, workout, gym, doctor, appointment
- **Home**: clean, laundry, dishes, cook, repair
- **Finance**: bill, payment, budget, expense, tax
- **Personal**: call, visit, birthday, party, dinner

### Focus Mode
1. Click "Focus" in the navigation
2. Choose a task to focus on
3. Start the timer and work distraction-free
4. Complete or skip tasks as needed

### View Modes
- **Today**: Tasks due today
- **Upcoming**: Future tasks
- **Focus**: Distraction-free single task view
- **Stats**: Analytics and progress tracking

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Parsing**: chrono-node
- **Date Utilities**: date-fns
- **State Management**: React Context + useReducer
- **Local Storage**: Automatic task persistence

## 🎨 Design System

### Colors
- **Primary**: Blue (#0ea5e9)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Neutral**: Gray scale

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Glassmorphism**: Blur effects with transparency
- **Rounded Corners**: 2xl (16px) radius
- **Shadows**: Subtle elevation system
- **Transitions**: Smooth 200ms animations

## 📱 Mobile Features

- **Touch Gestures**: Swipe to complete/archive
- **Responsive Layout**: Adaptive sidebar and navigation
- **Touch-friendly**: Large touch targets
- **Mobile-first**: Optimized for small screens

## 🔧 Customization

### Adding Categories
Edit `taskUtils.ts` to add new categories and keywords:

```typescript
const categoryKeywords: { [key: string]: string[] } = {
  // Add your custom categories here
  custom: ['keyword1', 'keyword2', 'keyword3'],
};
```

### Theme Customization
Modify `tailwind.config.js` to customize colors and design tokens.

## 📊 Data Persistence

Tasks are automatically saved to localStorage and persist between sessions. No external database required.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Deploy automatically on push
3. Environment variables handled automatically

### Other Platforms
The app is a standard Next.js application and can be deployed to any platform that supports Node.js.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Inspired by Apple Reminders and Things 3
- Built with modern web technologies
- Designed for productivity and focus

---

**Focus** - Stay focused, get things done. ✨
