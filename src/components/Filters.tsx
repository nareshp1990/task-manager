import React from 'react';
import { useTasks } from '../context/TaskContext';
import type { SortOption, StatusFilter } from '../context/TaskContext';
import { Search, ChevronDown } from 'lucide-react';

export const Filters: React.FC = () => {
  const {
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
  } = useTasks();

  return (
    <div className="action-bar">
      {/* Search Input */}
      <div className="search-box">
        <input
          type="text"
          className="input-field search-input"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="search-icon-pos" size={18} />
      </div>

      {/* Filter and Sorting Controls */}
      <div className="filter-controls">
        {/* Category Tabs */}
        <div className="category-tabs">
          <button
            className={`category-tab-btn ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <div className="select-wrapper">
          <select
            className="select-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <ChevronDown className="select-arrow" size={16} />
        </div>

        {/* Priority Dropdown */}
        <div className="select-wrapper">
          <select
            className="select-field"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="All">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown className="select-arrow" size={16} />
        </div>

        {/* Sort Dropdown */}
        <div className="select-wrapper">
          <select
            className="select-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="createdAt">Date Created</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
          <ChevronDown className="select-arrow" size={16} />
        </div>
      </div>
    </div>
  );
};
