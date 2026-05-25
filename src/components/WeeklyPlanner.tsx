import React from 'react';
import { useTasks } from '../context/TaskContext';
import type { Task } from '../context/TaskContext';
import { isOverdue } from '../utils/date';
import { Plus, Check, Clock, Trash2, Inbox } from 'lucide-react';

interface WeeklyPlannerProps {
  onEdit: (task: Task) => void;
  onConfirmDelete: (id: string) => void;
  onQuickAdd: (dateStr: string) => void;
}

const formatDateKey = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'rgb(var(--priority-high))';
    case 'medium': return 'rgb(var(--priority-medium))';
    case 'low': return 'rgb(var(--priority-low))';
    default: return 'var(--primary-accent)';
  }
};

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  onEdit,
  onConfirmDelete,
  onQuickAdd,
}) => {
  const {
    tasks,
    searchQuery,
    selectedCategory,
    selectedPriority,
    selectedStatus,
    toggleTaskCompletion,
  } = useTasks();

  // 1. Calculate Monday of the current week
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  // 2. Generate the 7 days of the week (Mon-Sun)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const weekDayKeys = weekDays.map(formatDateKey);
  const todayKey = formatDateKey(today);

  // 3. Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Category Filter
    if (selectedCategory !== 'All' && task.category !== selectedCategory) {
      return false;
    }

    // Priority Filter
    if (selectedPriority !== 'All' && task.priority !== selectedPriority) {
      return false;
    }

    // Status Filter
    if (selectedStatus === 'active' && task.completed) {
      return false;
    }
    if (selectedStatus === 'completed' && !task.completed) {
      return false;
    }
    if (selectedStatus === 'overdue' && !isOverdue(task)) {
      return false;
    }

    // Search Query Filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc) {
        return false;
      }
    }

    return true;
  });

  // 4. Map tasks to columns
  const dayTasksMap = weekDayKeys.reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {} as Record<string, Task[]>);

  const unscheduledTasks: Task[] = [];

  filteredTasks.forEach((task) => {
    if (task.dueDate && dayTasksMap[task.dueDate] !== undefined) {
      dayTasksMap[task.dueDate].push(task);
    } else {
      unscheduledTasks.push(task);
    }
  });

  // Helper to format weekday name and short date
  const getDayDetails = (date: Date) => {
    const weekdayName = date.toLocaleDateString(undefined, { weekday: 'short' });
    const dayOfMonth = date.getDate();
    const monthName = date.toLocaleDateString(undefined, { month: 'short' });
    return { weekdayName, dateLabel: `${monthName} ${dayOfMonth}` };
  };

  const renderTaskMiniCard = (task: Task) => {
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    const totalSubtasks = task.subtasks.length;
    
    return (
      <div
        key={task.id}
        className={`weekly-task-card ${task.completed ? 'completed' : ''}`}
        style={{ '--card-accent-color': getPriorityColor(task.priority) } as React.CSSProperties}
        onClick={() => onEdit(task)}
      >
        <span className="weekly-task-title">{task.title}</span>
        
        <div className="weekly-task-meta">
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {/* Quick check button */}
            <button
              className="subtask-mini-checkbox"
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskCompletion(task.id);
              }}
              style={{
                cursor: 'pointer',
                background: task.completed ? 'var(--primary-accent)' : 'transparent',
                borderColor: task.completed ? 'var(--primary-accent)' : 'var(--text-muted)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {task.completed && <Check size={10} />}
            </button>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{task.category}</span>
          </div>

          {/* Time or Subtasks Progress */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {totalSubtasks > 0 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}
            {task.dueTime && (
              <span className="weekly-task-time">
                <Clock size={10} />
                <span>{task.dueTime}</span>
              </span>
            )}
          </div>
        </div>
        
        {/* Hover action overlays */}
        <div style={{ display: 'flex', gap: '0.25rem', position: 'absolute', right: '0.5rem', top: '0.5rem', opacity: 0 }} className="hover-actions-overlay">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirmDelete(task.id);
            }}
            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="weekly-planner-container">
      {/* Monday to Sunday Day Columns */}
      {weekDays.map((date, index) => {
        const dateKey = weekDayKeys[index];
        const isToday = dateKey === todayKey;
        const { weekdayName, dateLabel } = getDayDetails(date);
        const dayTasks = dayTasksMap[dateKey];

        return (
          <div key={dateKey} className={`weekly-column ${isToday ? 'today' : ''}`}>
            <div className="weekly-day-header">
              <span className="weekly-day-title">{weekdayName}</span>
              <span className="weekly-day-date">{dateLabel}</span>
            </div>

            <div className="weekly-tasks-list">
              {dayTasks.map(renderTaskMiniCard)}
            </div>

            <button
              className="weekly-quick-add"
              onClick={() => onQuickAdd(dateKey)}
            >
              <Plus size={12} />
              Quick Add
            </button>
          </div>
        );
      })}

      {/* Inbox Column (Unscheduled / Other Weeks) */}
      <div className="weekly-column" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="weekly-day-header">
          <span className="weekly-day-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Inbox size={16} />
            Inbox
          </span>
          <span className="weekly-day-date">Others ({unscheduledTasks.length})</span>
        </div>

        <div className="weekly-tasks-list">
          {unscheduledTasks.map(renderTaskMiniCard)}
        </div>

        <button
          className="weekly-quick-add"
          onClick={() => onQuickAdd('')}
        >
          <Plus size={12} />
          Quick Add
        </button>
      </div>
    </div>
  );
};
