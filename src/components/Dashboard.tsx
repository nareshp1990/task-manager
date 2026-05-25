import React from 'react';
import { useTasks } from '../context/TaskContext';
import { ClipboardList } from 'lucide-react';
import { isOverdue } from '../utils/date';

export const Dashboard: React.FC = () => {
  const { tasks, categories } = useTasks();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const overdueTasks = tasks.filter((t) => isOverdue(t)).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // SVG progress ring calculations
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  // Calculate statistics per category
  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const catTotal = catTasks.length;
    const catCompleted = catTasks.filter((t) => t.completed).length;
    const catPercent = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;
    return { name: cat, total: catTotal, percent: catPercent };
  }).filter((c) => c.total > 0); // Only display active categories with tasks

  return (
    <div className="dashboard-sidebar">
      {/* Brand Header */}
      <div className="logo-container">
        <div className="logo-icon">
          <ClipboardList size={22} />
        </div>
        <span className="app-title">Task Manager</span>
      </div>

      {/* Progress Circle Card */}
      <div className="glass-panel stats-circle-container">
        <svg width="150" height="150">
          {/* Background circle */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="transparent"
            stroke="var(--border-card)"
            strokeWidth={strokeWidth}
          />
          {/* Glowing foreground circle */}
          <circle
            className="progress-ring-circle"
            cx="75"
            cy="75"
            r={radius}
            fill="transparent"
            stroke="var(--primary-accent)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="progress-text">
          <span className="progress-pct">{completionRate}%</span>
          <span className="progress-lbl">Done</span>
        </div>
      </div>

      {/* Numerical Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--text-primary)' }}>{totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--primary-accent)' }}>{pendingTasks}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: '#10b981' }}>{completedTasks}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: overdueTasks > 0 ? '#ef4444' : 'var(--text-muted)' }}>
            {overdueTasks}
          </div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      {/* Category breakdown (if tasks exist) */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>
          Category Progress
        </h3>
        
        {categoryStats.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
            Add tasks and assign categories to see progress distribution.
          </div>
        ) : (
          <div className="category-progress-list">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="category-progress-item">
                <div className="category-header">
                  <span className="category-name">{cat.name}</span>
                  <span className="category-count">
                    {cat.percent}% ({cat.total} {cat.total === 1 ? 'task' : 'tasks'})
                  </span>
                </div>
                <div className="category-bar-bg">
                  <div
                    className="category-bar-fill"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
