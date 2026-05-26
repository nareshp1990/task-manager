/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

interface GoogleAuthResponse {
  access_token: string;
  error?: string;
  error_description?: string;
}

interface CloudBackupData {
  tasks: Task[];
  categories: string[];
  deletedTaskIds: string[];
}

interface GISWindow extends Window {
  google?: {
    accounts: {
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: GoogleAuthResponse) => void;
        }) => {
          requestAccessToken: (options: { prompt: string }) => void;
        };
      };
    };
  };
}

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
  modifiedAt: string; // ISO String
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
  
  // Google Drive Sync
  googleClientId: string;
  setGoogleClientId: (id: string) => void;
  googleSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncedTime: string | null;
  connectGoogleDrive: (clientId: string) => void;
  syncWithGoogleDrive: () => Promise<void>;
  disconnectGoogleDrive: () => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'modifiedAt' | 'completed'>) => void;
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

  // Load tombstones for deleted tasks
  const [deletedTaskIds, setDeletedTaskIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('zentask_deleted_ids');
    return saved ? JSON.parse(saved) : [];
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

  // Google Drive Sync States
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return localStorage.getItem('zentask_google_client_id') || '';
  });

  const [googleSyncStatus, setGoogleSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(() => {
    return localStorage.getItem('zentask_last_synced_time');
  });

  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Synchronize Tasks
  useEffect(() => {
    localStorage.setItem('zentask_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Synchronize Categories
  useEffect(() => {
    localStorage.setItem('zentask_categories', JSON.stringify(categories));
  }, [categories]);

  // Synchronize Deleted IDs
  useEffect(() => {
    localStorage.setItem('zentask_deleted_ids', JSON.stringify(deletedTaskIds));
  }, [deletedTaskIds]);

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

  // Synchronize Client ID
  useEffect(() => {
    localStorage.setItem('zentask_google_client_id', googleClientId);
  }, [googleClientId]);

  // Synchronize Last Synced Time
  useEffect(() => {
    if (lastSyncedTime) {
      localStorage.setItem('zentask_last_synced_time', lastSyncedTime);
    } else {
      localStorage.removeItem('zentask_last_synced_time');
    }
  }, [lastSyncedTime]);

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

  // Google OAuth Access Token Fetcher
  const getGoogleAccessToken = (clientIdToUse: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (accessToken) {
        resolve(accessToken);
        return;
      }
      const gisWindow = window as unknown as GISWindow;
      if (typeof gisWindow.google === 'undefined') {
        reject(new Error('Google Identity Services SDK not loaded yet. Refresh and try again.'));
        return;
      }

      try {
        const client = gisWindow.google.accounts.oauth2.initTokenClient({
          client_id: clientIdToUse,
          scope: 'https://www.googleapis.com/auth/drive.appdata',
          callback: (response: GoogleAuthResponse) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
            } else {
              setAccessToken(response.access_token);
              resolve(response.access_token);
            }
          },
        });
        client.requestAccessToken({ prompt: 'consent' });
      } catch {
        reject(new Error('Failed to initialize Google Auth Client. Check Client ID.'));
      }
    });
  };

  // Google Drive Helper API Calls
  const findBackupFile = async (token: string): Promise<string | null> => {
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name="zentask_db.json" and trashed=false&fields=files(id)',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (!response.ok) {
      throw new Error(`Google Drive API Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  };

  const downloadBackupFile = async (token: string, fileId: string): Promise<CloudBackupData> => {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (!response.ok) {
      throw new Error(`Google Drive Download Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data as CloudBackupData;
  };

  const createBackupFile = async (token: string, content: CloudBackupData): Promise<string> => {
    const metadata = {
      name: 'zentask_db.json',
      parents: ['appDataFolder']
    };
    
    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append(
      'file',
      new Blob([JSON.stringify(content)], { type: 'application/json' })
    );

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      }
    );
    if (!response.ok) {
      throw new Error(`Google Drive Create Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.id;
  };

  const updateBackupFile = async (token: string, fileId: string, content: CloudBackupData): Promise<void> => {
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      }
    );
    if (!response.ok) {
      throw new Error(`Google Drive Update Error: ${response.statusText}`);
    }
  };

  // Connect Google Drive Action
  const connectGoogleDrive = async (clientId: string) => {
    const trimmedId = clientId.trim();
    if (!trimmedId) {
      addToast('Please enter a valid Client ID');
      return;
    }
    setGoogleClientId(trimmedId);
    setGoogleSyncStatus('syncing');
    
    try {
      const token = await getGoogleAccessToken(trimmedId);
      await performSync(token);
    } catch (err) {
      console.error(err);
      setGoogleSyncStatus('error');
      const errorObj = err as Error;
      addToast(errorObj.message || 'Failed to connect Google Drive');
    }
  };

  // Disconnect Google Drive Action
  const disconnectGoogleDrive = () => {
    setGoogleClientId('');
    setAccessToken(null);
    setLastSyncedTime(null);
    setGoogleSyncStatus('idle');
    localStorage.removeItem('zentask_google_client_id');
    localStorage.removeItem('zentask_last_synced_time');
    addToast('Google Drive disconnected');
  };

  // Perform Sync Operations (Merge local and cloud)
  const performSync = async (token: string) => {
    try {
      const fileId = await findBackupFile(token);
      
      const localData = {
        tasks,
        categories,
        deletedTaskIds
      };

      if (!fileId) {
        // Create first backup file on cloud
        await createBackupFile(token, localData);
        setLastSyncedTime(new Date().toLocaleTimeString());
        setGoogleSyncStatus('success');
        addToast('Created first cloud backup');
        return;
      }

      // Download and merge
      const cloudData = await downloadBackupFile(token, fileId);
      
      // Combine deleted lists
      const cloudDeleted = cloudData.deletedTaskIds || [];
      const combinedDeletedIds = Array.from(new Set([...deletedTaskIds, ...cloudDeleted]));
      
      // Merge tasks
      const cloudTasks: Task[] = cloudData.tasks || [];
      const mergedTasksMap: Record<string, Task> = {};
      
      // Add local tasks
      tasks.forEach(t => {
        if (!combinedDeletedIds.includes(t.id)) {
          mergedTasksMap[t.id] = {
            ...t,
            modifiedAt: t.modifiedAt || t.createdAt || new Date().toISOString()
          };
        }
      });
      
      // Merge cloud tasks
      cloudTasks.forEach(t => {
        if (!combinedDeletedIds.includes(t.id)) {
          const localTask = mergedTasksMap[t.id];
          const cloudTask = {
            ...t,
            modifiedAt: t.modifiedAt || t.createdAt || new Date().toISOString()
          };
          if (!localTask) {
            mergedTasksMap[t.id] = cloudTask;
          } else {
            const localTime = new Date(localTask.modifiedAt).getTime();
            const cloudTime = new Date(cloudTask.modifiedAt).getTime();
            mergedTasksMap[t.id] = cloudTime > localTime ? cloudTask : localTask;
          }
        }
      });

      const mergedTasksList = Object.values(mergedTasksMap);
      const mergedCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories, ...(cloudData.categories || [])]));

      // Update Local State
      setTasks(mergedTasksList);
      setCategories(mergedCategories);
      setDeletedTaskIds(combinedDeletedIds);

      // Upload merged state back to cloud
      const mergedData = {
        tasks: mergedTasksList,
        categories: mergedCategories,
        deletedTaskIds: combinedDeletedIds
      };
      
      await updateBackupFile(token, fileId, mergedData);
      
      setLastSyncedTime(new Date().toLocaleTimeString());
      setGoogleSyncStatus('success');
      addToast('Sync completed');
    } catch (err) {
      console.error(err);
      setGoogleSyncStatus('error');
      throw err;
    }
  };

  // Sync Action
  const syncWithGoogleDrive = async () => {
    if (!googleClientId) {
      addToast('Sync failed: No Client ID configured.');
      return;
    }
    setGoogleSyncStatus('syncing');
    try {
      const token = await getGoogleAccessToken(googleClientId);
      await performSync(token);
    } catch (err) {
      console.error(err);
      setGoogleSyncStatus('error');
      const errorObj = err as Error;
      addToast(errorObj.message || 'Sync failed.');
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

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'modifiedAt' | 'completed'>) => {
    const now = new Date().toISOString();
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
      createdAt: now,
      modifiedAt: now,
    };
    setTasks((prev) => [task, ...prev]);
    addToast('Task added successfully');
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        
        const updated = {
          ...task,
          ...updatedFields,
          modifiedAt: new Date().toISOString()
        };
        
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
    setDeletedTaskIds((prev) => [...prev, id]);
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
          modifiedAt: new Date().toISOString()
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
          modifiedAt: new Date().toISOString()
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
        googleClientId,
        setGoogleClientId,
        googleSyncStatus,
        lastSyncedTime,
        connectGoogleDrive,
        syncWithGoogleDrive,
        disconnectGoogleDrive,
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
