import React from 'react';
import { CheckCircle2, Play, Clock, HelpCircle, Layers } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export const StatsCards: React.FC = () => {
  const { stats, filterStatus, setFilterStatus, filterNeedHelp, setFilterNeedHelp } = useTasks();

  return (
    <div className="stats-scroll">
      {/* Total Tasks */}
      <div
        className={`stat-chip ${filterStatus === 'all' && !filterNeedHelp ? 'active' : ''}`}
        onClick={() => {
          setFilterStatus('all');
          setFilterNeedHelp(false);
        }}
      >
        <div className="stat-chip-header">
          <span className="stat-chip-label">Total</span>
          <Layers size={14} color="var(--primary)" />
        </div>
        <div className="stat-chip-val">{stats.total}</div>
      </div>

      {/* In Progress */}
      <div
        className={`stat-chip ${filterStatus === 'in_progress' ? 'active' : ''}`}
        onClick={() => {
          setFilterNeedHelp(false);
          setFilterStatus(filterStatus === 'in_progress' ? 'all' : 'in_progress');
        }}
      >
        <div className="stat-chip-header">
          <span className="stat-chip-label">Active</span>
          <Play size={14} color="#38bdf8" />
        </div>
        <div className="stat-chip-val" style={{ color: '#38bdf8' }}>{stats.inProgress}</div>
      </div>

      {/* Completion Rate */}
      <div
        className={`stat-chip ${filterStatus === 'completed' ? 'active' : ''}`}
        onClick={() => {
          setFilterNeedHelp(false);
          setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed');
        }}
      >
        <div className="stat-chip-header">
          <span className="stat-chip-label">Done</span>
          <CheckCircle2 size={14} color="var(--success)" />
        </div>
        <div className="stat-chip-val" style={{ color: 'var(--success)' }}>
          {stats.completionRate}%
        </div>
      </div>

      {/* Due Soon */}
      <div className="stat-chip">
        <div className="stat-chip-header">
          <span className="stat-chip-label">Due Soon</span>
          <Clock size={14} color="var(--priority-high)" />
        </div>
        <div className="stat-chip-val" style={{ color: 'var(--priority-high)' }}>
          {stats.dueSoon}
        </div>
      </div>

      {/* Need Help */}
      {stats.needHelp > 0 && (
        <div
          className={`stat-chip ${filterNeedHelp ? 'active' : ''}`}
          onClick={() => {
            setFilterNeedHelp(!filterNeedHelp);
            setFilterStatus('all');
          }}
        >
          <div className="stat-chip-header">
            <span className="stat-chip-label">Help Req</span>
            <HelpCircle size={14} color="var(--help-accent)" />
          </div>
          <div className="stat-chip-val" style={{ color: 'var(--help-accent)' }}>
            {stats.needHelp}
          </div>
        </div>
      )}
    </div>
  );
};
