import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import type { Task } from '../context/TaskContext';
import { isOverdue } from '../utils/date';
import { Calendar, CheckSquare, Edit3, Trash2, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onConfirmDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onConfirmDelete }) => {
  const { toggleTaskCompletion, toggleSubtaskCompletion } = useTasks();
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine priority color variable
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'rgb(var(--priority-high))';
      case 'medium': return 'rgb(var(--priority-medium))';
      case 'low': return 'rgb(var(--priority-low))';
      default: return 'var(--primary-accent)';
    }
  };

  // Format date readable representation
  const formatDueDate = () => {
    if (!task.dueDate) return '';
    const dateObj = new Date(task.dueDate + 'T00:00:00');
    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Determine due date urgency class
  const getDueDateUrgency = () => {
    if (task.completed) return '';
    if (isOverdue(task)) return 'overdue';
    
    // Check if due today
    const todayStr = new Date().toISOString().split('T')[0];
    if (task.dueDate === todayStr) return 'today';
    
    return '';
  };

  const getDueDateLabel = () => {
    const urgency = getDueDateUrgency();
    if (urgency === 'overdue') return 'Overdue';
    if (urgency === 'today') return 'Today';
    return '';
  };

  // Calculate subtasks progress
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const subtasksProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div
      className={`glass-panel task-card animate-fade-in ${task.completed ? 'completed' : ''}`}
      style={{ '--card-accent-color': getPriorityColor() } as React.CSSProperties}
    >
      <div className="task-card-summary">
        {/* Checkbox and Meta Info */}
        <div className="task-card-left">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTaskCompletion(task.id)}
            />
            <span className="checkbox-checkmark">
              <CheckSquare size={16} />
            </span>
          </label>

          <div className="task-meta-info" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer', flex: 1 }}>
            <span className="task-item-title">{task.title}</span>
            
            <div className="badges-row">
              {/* Priority badge */}
              <span className={`badge badge-priority-${task.priority}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>

              {/* Category badge */}
              <span className="badge badge-category">{task.category}</span>

              {/* Due Date badge */}
              {task.dueDate && (
                <span className={`badge badge-due ${getDueDateUrgency()}`}>
                  <Calendar size={12} />
                  <span>{formatDueDate()}</span>
                  {task.dueTime && (
                    <>
                      <Clock size={12} style={{ marginLeft: '4px' }} />
                      <span>{task.dueTime}</span>
                    </>
                  )}
                  {getDueDateLabel() && (
                    <span style={{ fontWeight: 800, marginLeft: '4px', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      ({getDueDateLabel()})
                    </span>
                  )}
                </span>
              )}

              {/* Subtasks Progress badge */}
              {totalSubtasks > 0 && (
                <span className="badge badge-category" style={{ fontSize: '0.7rem' }}>
                  {completedSubtasks}/{totalSubtasks} Subtasks ({subtasksProgress}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="task-card-right">
          <button
            className="btn-icon-only"
            onClick={() => onEdit(task)}
            title="Edit task"
            style={{ width: '32px', height: '32px' }}
          >
            <Edit3 size={14} />
          </button>
          <button
            className="btn-icon-only btn-danger"
            onClick={() => onConfirmDelete(task.id)}
            title="Delete task"
            style={{ width: '32px', height: '32px' }}
          >
            <Trash2 size={14} />
          </button>
          <button
            className="btn-icon-only"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
            style={{ width: '32px', height: '32px' }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded subtasks / description view */}
      {isExpanded && (
        <div className="task-expanded-section animate-scale-up">
          {/* Description */}
          {task.description && (
            <div className="task-description">{task.description}</div>
          )}

          {/* Subtasks Checklist */}
          {totalSubtasks > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="subtasks-checklist-header">Subtasks Checklist</div>
              <div className="subtasks-checklist-list">
                {task.subtasks.map((st) => (
                  <div
                    key={st.id}
                    className={`subtask-checklist-item ${st.completed ? 'completed' : ''}`}
                    onClick={() => toggleSubtaskCompletion(task.id, st.id)}
                  >
                    <div className="subtask-mini-checkbox">
                      {st.completed && <CheckSquare size={10} />}
                    </div>
                    <span>{st.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Created on: {new Date(task.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
        </div>
      )}
    </div>
  );
};
