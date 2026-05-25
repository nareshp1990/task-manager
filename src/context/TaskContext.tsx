/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate?: string; // Format: YYYY-MM-DD
  dueTime?: string; // Format: HH:MM
  createdAt: string; // ISO String
  subtasks: SubTask[];
}

export type SortOption = 'dueDate' | 'priority' | 'createdAt';
export type StatusFilter = 'all' | 'active' | 'completed' | 'overdue';
export type ViewMode = 'list' | 'weekly';

export interface Toast {
  id: string;
  message: string;
}

interface TaskContextType {
  tasks: Task[];
  categories: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;
  selectedStatus: StatusFilter;
  setSelectedStatus: (status: StatusFilter) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toasts: Toast[];
  addToast: (message: string) => void;
  removeToast: (id: string) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updatedFields: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  addCategory: (category: string) => void;
  importData: (tasks: Task[], categories: string[]) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health'];

const completionAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav');
completionAudio.volume = 0.3; // subtle chime

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load tasks from LocalStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('zentask_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Load categories
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('zentask_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  // Filters & UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  
  // Preferences
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('zentask_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });
  
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('zentask_sound');
    return saved ? JSON.parse(saved) : true;
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('zentask_viewmode');
    return (saved === 'list' || saved === 'weekly') ? saved : 'list';
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Synchronize Tasks
  useEffect(() => {
    localStorage.setItem('zentask_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Synchronize Categories
  useEffect(() => {
    localStorage.setItem('zentask_categories', JSON.stringify(categories));
  }, [categories]);

  // Synchronize Preferences
  useEffect(() => {
    localStorage.setItem('zentask_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('zentask_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('zentask_viewmode', viewMode);
  }, [viewMode]);

  // Toast notifications manager
  const addToast = (message: string) => {
    // eslint-disable-next-line react-hooks/purity
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const playCompletionSound = () => {
    if (soundEnabled) {
      completionAudio.currentTime = 0;
      completionAudio.play().catch(() => {
        // Handle blocked auto-plays silently
      });
    }
  };

  // Actions
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addCategory = (category: string) => {
    const trimmed = category.trim();
    if (trimmed && !categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCategories((prev) => [...prev, trimmed]);
      addToast(`Category "${trimmed}" created`);
    }
  };

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
    addToast('Task added successfully');
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        
        const updated = { ...task, ...updatedFields };
        
        // Play sound if task was marked completed just now
        if (updatedFields.completed && !task.completed) {
          playCompletionSound();
        }
        
        return updated;
      })
    );
    addToast('Task updated');
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
    addToast(taskToDelete ? `Deleted "${taskToDelete.title}"` : 'Task deleted');
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        
        const nextCompleted = !task.completed;
        
        if (nextCompleted) {
          playCompletionSound();
        }

        // Also toggle all subtasks to match parent state
        const updatedSubtasks = task.subtasks.map((st) => ({
          ...st,
          completed: nextCompleted,
        }));
        
        return {
          ...task,
          completed: nextCompleted,
          subtasks: updatedSubtasks,
        };
      })
    );
    addToast('Task updated');
  };

  const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        
        const updatedSubtasks = task.subtasks.map((st) => {
          if (st.id !== subtaskId) return st;
          return { ...st, completed: !st.completed };
        });

        // If all subtasks are now completed and task wasn't completed, mark it completed
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
        // Play sound if this action results in task completion
        const shouldPlaySound = allCompleted && !task.completed;
        
        if (shouldPlaySound) {
          playCompletionSound();
        }

        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allCompleted ? true : task.completed,
        };
      })
    );
  };

  const importData = (importedTasks: Task[], importedCategories: string[]) => {
    setTasks(importedTasks);
    // Combine imported categories with defaults to ensure we don't drop preset categories
    const combinedCats = Array.from(new Set([...DEFAULT_CATEGORIES, ...importedCategories]));
    setCategories(combinedCats);
    addToast('Backup imported successfully');
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedPriority,
        setSelectedPriority,
        selectedStatus,
        setSelectedStatus,
        sortBy,
        setSortBy,
        theme,
        toggleTheme,
        soundEnabled,
        setSoundEnabled,
        viewMode,
        setViewMode,
        toasts,
        addToast,
        removeToast,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        toggleSubtaskCompletion,
        addCategory,
        importData,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
