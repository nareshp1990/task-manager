import React, { useState } from 'react';
import { TaskProvider, useTasks } from './context/TaskContext';
import type { Task } from './context/TaskContext';
import { Dashboard } from './components/Dashboard';
import { Filters } from './components/Filters';
import { TaskList } from './components/TaskList';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { TaskForm } from './components/TaskForm';
import { ImportExport } from './components/ImportExport';
import { GDriveSync } from './components/GDriveSync';
import { Sun, Moon, Volume2, VolumeX, Plus, Trash2, CheckCircle2, LayoutList, Calendar } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    theme,
    toggleTheme,
    soundEnabled,
    setSoundEnabled,
    toasts,
    removeToast,
    deleteTask,
    viewMode,
    setViewMode,
  } = useTasks();

  // Drawer state for TaskForm
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultDueDate, setDefaultDueDate] = useState<string | undefined>(undefined);

  // Delete confirmation modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleOpenCreateForm = () => {
    setTaskToEdit(null);
    setDefaultDueDate(undefined);
    setIsFormOpen(true);
  };

  const handleOpenQuickAdd = (dateStr: string) => {
    setTaskToEdit(null);
    setDefaultDueDate(dateStr || undefined);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (task: Task) => {
    setTaskToEdit(task);
    setDefaultDueDate(undefined);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      deleteTask(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Panel: Dashboard Stats & Categories */}
      <aside className="dashboard-sidebar">
        <Dashboard />
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <ImportExport />
        </div>
        <GDriveSync />
      </aside>

      {/* Main Task List Area */}
      <main className="main-content-panel" style={{ display: 'flex', flex: 1, flexDirection: 'column', minWidth: 0 }}>
        {/* Header Controls */}
        <header className="header-wrapper">
          <div>
            <h1 className="app-title" style={{ fontSize: '2rem', margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              My Workspace
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>

          <div className="controls-group">
            {/* Audio Toggle */}
            <button
              className="btn-icon-only"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute chimes' : 'Enable chimes'}
              aria-label="Toggle sound effects"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Dark/Light Theme Toggle */}
            <button
              className="btn-icon-only"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Create Task Button */}
            <button className="btn btn-primary" onClick={handleOpenCreateForm}>
              <Plus size={18} />
              <span style={{ display: 'inline' }}>New Task</span>
            </button>
          </div>
        </header>

        {/* View Mode Toggle */}
        <div className="view-toggle-bar">
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <LayoutList size={16} />
            <span>List View</span>
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'weekly' ? 'active' : ''}`}
            onClick={() => setViewMode('weekly')}
          >
            <Calendar size={16} />
            <span>Weekly Planner</span>
          </button>
        </div>

        {/* Search, Category tabs, sorting */}
        <Filters />

        {/* Task Cards List */}
        {viewMode === 'list' ? (
          <TaskList
            onEdit={handleOpenEditForm}
            onConfirmDelete={handleConfirmDelete}
            onOpenCreateForm={handleOpenCreateForm}
          />
        ) : (
          <WeeklyPlanner
            onEdit={handleOpenEditForm}
            onConfirmDelete={handleConfirmDelete}
            onQuickAdd={handleOpenQuickAdd}
          />
        )}
      </main>

      {/* Drawers & Modals */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        taskToEdit={taskToEdit}
        defaultDueDate={defaultDueDate}
      />

      {/* Delete Confirmation Dialog Modal */}
      {deleteTargetId !== null && (
        <div className="confirm-modal-backdrop" onClick={() => setDeleteTargetId(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ color: '#ef4444', display: 'flex', justifyContent: 'center' }}>
              <Trash2 size={48} />
            </div>
            <h3 className="confirm-title">Delete Task</h3>
            <p className="confirm-message">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="confirm-buttons">
              <button className="btn btn-danger" onClick={executeDelete} style={{ flex: 1 }}>
                Delete
              </button>
              <button className="btn btn-secondary" onClick={() => setDeleteTargetId(null)} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Popups */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast" onClick={() => removeToast(toast.id)}>
            <CheckCircle2 size={16} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
};

export default App;
