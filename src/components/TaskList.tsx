import React from 'react';
import { useTasks } from '../context/TaskContext';
import type { Task } from '../context/TaskContext';
import { TaskItem } from './TaskItem';
import { isOverdue } from '../utils/date';
import { PlusCircle, Info } from 'lucide-react';

interface TaskListProps {
  onEdit: (task: Task) => void;
  onConfirmDelete: (id: string) => void;
  onOpenCreateForm: () => void;
}

const priorityWeight = { high: 3, medium: 2, low: 1 };

export const TaskList: React.FC<TaskListProps> = ({ onEdit, onConfirmDelete, onOpenCreateForm }) => {
  const {
    tasks,
    searchQuery,
    selectedCategory,
    selectedPriority,
    selectedStatus,
    sortBy,
  } = useTasks();

  // Apply filters
  const filteredTasks = tasks.filter((task) => {
    // 1. Category Filter
    if (selectedCategory !== 'All' && task.category !== selectedCategory) {
      return false;
    }

    // 2. Priority Filter
    if (selectedPriority !== 'All' && task.priority !== selectedPriority) {
      return false;
    }

    // 3. Status Filter
    if (selectedStatus === 'active' && task.completed) {
      return false;
    }
    if (selectedStatus === 'completed' && !task.completed) {
      return false;
    }
    if (selectedStatus === 'overdue' && !isOverdue(task)) {
      return false;
    }

    // 4. Search Query Filter
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

  // Apply sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'priority') {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      
      const dateA = new Date(a.dueDate + (a.dueTime ? `T${a.dueTime}` : 'T23:59:59'));
      const dateB = new Date(b.dueDate + (b.dueTime ? `T${b.dueTime}` : 'T23:59:59'));
      return dateA.getTime() - dateB.getTime();
    }
    return 0;
  });

  return (
    <div className="tasks-list-container">
      {sortedTasks.length === 0 ? (
        <div className="empty-state">
          <Info size={40} style={{ color: 'var(--text-muted)' }} />
          <span className="empty-title">No tasks found</span>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '300px' }}>
            {tasks.length === 0
              ? 'Get started by creating your very first task checklist!'
              : 'Try clearing your filters or changing your search terms.'}
          </p>
          {tasks.length === 0 && (
            <button className="btn btn-primary" onClick={onOpenCreateForm} style={{ marginTop: '0.5rem' }}>
              <PlusCircle size={16} />
              Add First Task
            </button>
          )}
        </div>
      ) : (
        sortedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onEdit={onEdit}
            onConfirmDelete={onConfirmDelete}
          />
        ))
      )}
    </div>
  );
};
