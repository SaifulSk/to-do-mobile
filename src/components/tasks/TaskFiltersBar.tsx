import React, { useState } from 'react';
import { Search, X, Flame, AlertTriangle, Clock, ArrowDown, HelpCircle, ArrowUpDown } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export const TaskFiltersBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    filterNeedHelp,
    setFilterNeedHelp,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  } = useTasks();

  const [showSortSheet, setShowSortSheet] = useState(false);

  const toggleSort = (newSort: string) => {
    if (sortBy === newSort) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSort);
      setSortOrder('asc');
    }
    setShowSortSheet(false);
  };

  return (
    <div className="search-filter-wrapper">
      {/* Search Input */}
      <div className="search-box">
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          className="search-input"
          placeholder="Search tasks, assignees, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Horizontal Filter Chips */}
      <div className="filter-chips-row">
        {/* Status: All */}
        <button
          className={`filter-chip ${filterStatus === 'all' && !filterNeedHelp && filterPriority === 'all' ? 'active' : ''}`}
          onClick={() => {
            setFilterStatus('all');
            setFilterNeedHelp(false);
            setFilterPriority('all');
          }}
        >
          All
        </button>

        {/* Status: To Do */}
        <button
          className={`filter-chip ${filterStatus === 'todo' && !filterNeedHelp ? 'active' : ''}`}
          onClick={() => {
            setFilterStatus(filterStatus === 'todo' ? 'all' : 'todo');
            setFilterNeedHelp(false);
          }}
        >
          To Do
        </button>

        {/* Status: In Progress */}
        <button
          className={`filter-chip ${filterStatus === 'in_progress' ? 'active' : ''}`}
          onClick={() => {
            setFilterStatus(filterStatus === 'in_progress' ? 'all' : 'in_progress');
            setFilterNeedHelp(false);
          }}
        >
          In Progress
        </button>

        {/* Status: Completed */}
        <button
          className={`filter-chip ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => {
            setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed');
            setFilterNeedHelp(false);
          }}
        >
          Completed
        </button>

        {/* Filter: Need Help */}
        <button
          className={`filter-chip ${filterNeedHelp ? 'active' : ''}`}
          onClick={() => {
            setFilterNeedHelp(!filterNeedHelp);
            setFilterStatus('all');
          }}
          style={filterNeedHelp ? { borderColor: 'var(--help-accent)', color: 'var(--help-accent)', background: 'var(--help-accent-bg)' } : {}}
        >
          <HelpCircle size={13} />
          Need Help
        </button>

        {/* Priority: Urgent */}
        <button
          className={`filter-chip ${filterPriority === 'urgent' ? 'active' : ''}`}
          onClick={() => setFilterPriority(filterPriority === 'urgent' ? 'all' : 'urgent')}
          style={filterPriority === 'urgent' ? { borderColor: 'var(--priority-urgent)', color: 'var(--priority-urgent)', background: 'var(--priority-urgent-bg)' } : {}}
        >
          <Flame size={12} />
          Urgent
        </button>

        {/* Priority: High */}
        <button
          className={`filter-chip ${filterPriority === 'high' ? 'active' : ''}`}
          onClick={() => setFilterPriority(filterPriority === 'high' ? 'all' : 'high')}
          style={filterPriority === 'high' ? { borderColor: 'var(--priority-high)', color: 'var(--priority-high)', background: 'var(--priority-high-bg)' } : {}}
        >
          <AlertTriangle size={12} />
          High
        </button>

        {/* Sort Pill */}
        <button
          className="filter-chip"
          onClick={() => setShowSortSheet(!showSortSheet)}
          style={{ marginLeft: 'auto' }}
        >
          <ArrowUpDown size={12} />
          <span style={{ textTransform: 'capitalize' }}>{sortBy} ({sortOrder})</span>
        </button>
      </div>

      {/* Sort Options Drawer / Sheet if toggled */}
      {showSortSheet && (
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 10,
          margin: '0 16px 10px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 6
        }}>
          {[
            { id: 'dueDate', label: 'Due Date' },
            { id: 'priority', label: 'Priority' },
            { id: 'createdAt', label: 'Date Created' },
            { id: 'title', label: 'Title (A-Z)' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => toggleSort(item.id)}
              style={{
                background: sortBy === item.id ? 'var(--primary-light)' : 'transparent',
                border: `1px solid ${sortBy === item.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                color: sortBy === item.id ? 'var(--primary)' : 'var(--text-secondary)',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              {item.label} {sortBy === item.id ? `(${sortOrder.toUpperCase()})` : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
