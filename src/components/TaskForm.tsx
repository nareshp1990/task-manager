import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import type { Task, Priority, SubTask } from '../context/TaskContext';
import { X, Plus, Trash2, RefreshCw } from 'lucide-react';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit: Task | null;
  defaultDueDate?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, taskToEdit, defaultDueDate }) => {
  const { categories, addTask, updateTask, addCategory, geminiApiKey, generateAiTask, generateSubtasks } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  
  // Subtasks building state
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);

  // AI drafting states
  const [aiInput, setAiInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isAiChecklistGenerating, setIsAiChecklistGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Previous props for synchronization
  const [prevTaskToEdit, setPrevTaskToEdit] = useState<Task | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  // Reset form to defaults
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory(categories[0] || 'Work');
    setNewCategoryName('');
    setIsAddingCategory(false);
    setDueDate('');
    setDueTime('');
    setSubtaskInput('');
    setSubtasks([]);
  };

  // Sync state with props during render
  if (taskToEdit !== prevTaskToEdit || isOpen !== prevIsOpen) {
    setPrevTaskToEdit(taskToEdit);
    setPrevIsOpen(isOpen);
    
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setDueDate(taskToEdit.dueDate || '');
      setDueTime(taskToEdit.dueTime || '');
      setSubtasks(taskToEdit.subtasks || []);
      setIsAddingCategory(false);
    } else {
      resetForm();
      if (defaultDueDate) {
        setDueDate(defaultDueDate);
      }
    }
  }

  const handleAiGenerateTask = async () => {
    const input = aiInput.trim();
    if (!input) return;

    setIsAiGenerating(true);
    setAiError('');

    try {
      const generated = await generateAiTask(input);
      
      setTitle(generated.title || '');
      setDescription(generated.description || '');
      setPriority((generated.priority as Priority) || 'medium');
      
      // Handle category inline save if it doesn't exist
      if (generated.category) {
        const catTrimmed = generated.category.trim();
        if (catTrimmed) {
          if (!categories.some(c => c.toLowerCase() === catTrimmed.toLowerCase())) {
            addCategory(catTrimmed);
          }
          setCategory(catTrimmed);
        }
      }
      
      if (generated.dueDate) {
        setDueDate(generated.dueDate);
      }
      
      if (Array.isArray(generated.subtasks)) {
        const parsedSubs: SubTask[] = generated.subtasks.map((titleStr: string, idx: number) => ({
          id: Date.now().toString() + idx + Math.random().toString(36).substr(2, 5),
          title: titleStr,
          completed: false
        }));
        setSubtasks(parsedSubs);
      }
      
      setAiInput('');
    } catch (err) {
      console.error(err);
      const errorObj = err as Error;
      setAiError(errorObj.message || 'AI Generation failed.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleAiGenerateSubtasks = async () => {
    if (!title.trim()) {
      setAiError('Please enter a task title first so the AI knows what to break down.');
      return;
    }

    setIsAiChecklistGenerating(true);
    setAiError('');

    try {
      const generatedList = await generateSubtasks(title, description);
      
      const parsedSubs: SubTask[] = generatedList.map((titleStr: string, idx: number) => ({
        id: Date.now().toString() + idx + Math.random().toString(36).substr(2, 5),
        title: titleStr,
        completed: false
      }));
      
      setSubtasks((prev) => [...prev, ...parsedSubs]);
    } catch (err) {
      console.error(err);
      const errorObj = err as Error;
      setAiError(errorObj.message || 'AI Subtask generation failed.');
    } finally {
      setIsAiChecklistGenerating(false);
    }
  };

  const handleAddSubtask = () => {
    const trimmed = subtaskInput.trim();
    if (!trimmed) return;
    
    const newSub: SubTask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      title: trimmed,
      completed: false,
    };
    
    setSubtasks((prev) => [...prev, newSub]);
    setSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((st) => st.id !== id));
  };

  const handleAddCategoryInline = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    addCategory(trimmed);
    setCategory(trimmed);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      subtasks,
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
    }

    resetForm();
    onClose();
  };

  return (
    <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2 className="drawer-title">{taskToEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn-icon-only" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* AI Drafting Tool */}
          {geminiApiKey && !taskToEdit && (
            <div className="form-group ai-draft-section">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-accent)' }}>
                <span style={{ fontSize: '1.1rem' }}>⚡</span> Draft Task with Gemini AI
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Schedule a design sync for Friday at 3pm..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  style={{ flex: 1, fontSize: '0.85rem' }}
                  disabled={isAiGenerating}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAiGenerateTask}
                  disabled={isAiGenerating || !aiInput.trim()}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                >
                  {isAiGenerating ? <RefreshCw size={14} className="spin-icon" /> : 'Generate'}
                </button>
              </div>
              {aiError && (
                <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.4rem' }}>
                  {aiError}
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Design app interface"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input-field"
              placeholder="Add details about this task..."
              rows={4}
              style={{ resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">Priority</label>
            <div className="priority-options">
              <button
                type="button"
                className={`priority-option ${priority === 'low' ? 'selected-low' : ''}`}
                onClick={() => setPriority('low')}
              >
                Low
              </button>
              <button
                type="button"
                className={`priority-option ${priority === 'medium' ? 'selected-medium' : ''}`}
                onClick={() => setPriority('medium')}
              >
                Medium
              </button>
              <button
                type="button"
                className={`priority-option ${priority === 'high' ? 'selected-high' : ''}`}
                onClick={() => setPriority('high')}
              >
                High
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            {!isAddingCategory ? (
              <div className="select-wrapper">
                <select
                  className="select-field"
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setIsAddingCategory(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__add_new__">➕ Add New Category...</option>
                </select>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="New category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  style={{ flex: 1 }}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddCategoryInline}
                  style={{ padding: '0 1rem' }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddingCategory(false)}
                  style={{ padding: '0 1rem' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Due Date & Time */}
          <div className="row-2">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="input-field"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Due Time</label>
              <input
                type="time"
                className="input-field"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Subtasks Checklist Builder */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Subtasks Checklist</label>
              {geminiApiKey && title.trim() && (
                <button
                  type="button"
                  onClick={handleAiGenerateSubtasks}
                  disabled={isAiChecklistGenerating}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary-accent)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {isAiChecklistGenerating ? (
                    <RefreshCw size={10} className="spin-icon" />
                  ) : (
                    <span>⚡ AI Breakdown</span>
                  )}
                </button>
              )}
            </div>
            <div className="subtasks-builder">
              <div className="subtask-input-row">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Add a subtask..."
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  style={{ flex: 1, fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  className="btn btn-icon-only"
                  onClick={handleAddSubtask}
                  style={{ width: '38px', height: '38px' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="subtask-builder-list">
                  {subtasks.map((st) => (
                    <div key={st.id} className="subtask-builder-item animate-fade-in">
                      <span className="subtask-builder-text">{st.title}</span>
                      <button
                        type="button"
                        className="subtask-builder-remove"
                        onClick={() => handleRemoveSubtask(st.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
