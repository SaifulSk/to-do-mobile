import React, { useState } from 'react';
import { 
  Check, 
  Flame, 
  AlertTriangle, 
  Clock, 
  ArrowDown, 
  Repeat, 
  Banknote, 
  Users, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  Plus, 
  X,
  CheckCircle2 
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { Task, Priority } from '../../types';
import { useTasks } from '../../context/TaskContext';

interface TaskTableViewProps {
  onEditTask: (task: Task) => void;
  onOpenNewTask: () => void;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({ onEditTask, onOpenNewTask }) => {
  const { 
    filteredTasks, 
    tasks, 
    toggleTaskComplete, 
    toggleTaskInProgress, 
    cycleTaskPriority,
    deleteTask, 
    searchQuery,
    filterPriority,
    filterStatus,
    filterNeedHelp,
    setSearchQuery,
    setFilterPriority,
    setFilterStatus,
    setFilterNeedHelp
  } = useTasks();

  const [deleteTargetTask, setDeleteTargetTask] = useState<Task | null>(null);

  const isFiltering = Boolean(searchQuery || filterPriority !== 'all' || filterStatus !== 'all' || filterNeedHelp);

  const getDueDateDisplay = (dateString?: string | null, isCompleted?: boolean) => {
    if (!dateString) return null;
    try {
      const parsed = parseISO(dateString);
      if (isNaN(parsed.getTime())) return { text: dateString, class: 'normal' };
      if (isToday(parsed)) return { text: 'Today', class: 'today' };
      if (isTomorrow(parsed)) return { text: 'Tomorrow', class: 'tomorrow' };
      if (isPast(parsed) && !isCompleted) return { text: `Overdue (${format(parsed, 'MMM d')})`, class: 'overdue' };
      return { text: format(parsed, 'MMM d, yyyy'), class: 'normal' };
    } catch {
      return { text: dateString, class: 'normal' };
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return <Flame size={12} />;
      case 'high': return <AlertTriangle size={12} />;
      case 'medium': return <Clock size={12} />;
      case 'low': return <ArrowDown size={12} />;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon-wrap">
          <Check size={28} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            No tasks yet
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Get started by creating your first task.
          </p>
        </div>
        <button 
          className="submit-btn" 
          style={{ width: 'auto', padding: '10px 18px', marginTop: 8 }} 
          onClick={onOpenNewTask}
        >
          <Plus size={16} />
          <span>Create Task</span>
        </button>
      </div>
    );
  }

  if (filteredTasks.length === 0 && isFiltering) {
    return (
      <div className="empty-state">
        <div className="empty-icon-wrap" style={{ background: 'var(--priority-urgent-bg)', color: 'var(--priority-urgent)' }}>
          <AlertCircle size={28} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            No matching tasks
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Try adjusting your search query, priority, or filters.
          </p>
        </div>
        <button 
          className="submit-btn" 
          style={{ 
            width: 'auto', 
            padding: '10px 18px', 
            background: 'transparent', 
            border: '1px solid var(--border-subtle)', 
            color: 'var(--text-main)', 
            boxShadow: 'none',
            marginTop: 8
          }} 
          onClick={() => {
            setSearchQuery('');
            setFilterPriority('all');
            setFilterStatus('all');
            setFilterNeedHelp(false);
          }}
        >
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="task-table-wrapper">
      <div className="task-table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th style={{ width: '48px', textAlign: 'center' }}>Done</th>
              <th style={{ minWidth: '200px' }}>Task</th>
              <th style={{ width: '100px' }}>Status</th>
              <th style={{ width: '96px' }}>Priority</th>
              <th style={{ width: '130px' }}>Due Date</th>
              <th style={{ width: '100px' }}>Recurrence</th>
              <th style={{ width: '90px' }}>Amount</th>
              <th style={{ width: '140px' }}>Assignee</th>
              <th style={{ width: '110px' }}>Tags</th>
              <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const isInProgress = task.status === 'in_progress';
              const dueInfo = getDueDateDisplay(task.dueDate, isCompleted);

              return (
                <tr key={task.id} className={isCompleted ? 'completed' : ''}>
                  {/* Done Checkbox */}
                  <td style={{ textAlign: 'center' }}>
                    <div 
                      className={`custom-checkbox-mobile ${isCompleted ? 'checked' : ''}`}
                      onClick={() => toggleTaskComplete(task.id)}
                      title={isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
                      style={{ margin: '0 auto' }}
                    >
                      {isCompleted && <Check size={14} strokeWidth={3} />}
                    </div>
                  </td>

                  {/* Title & Description */}
                  <td>
                    <div className="table-task-title">{task.title}</div>
                    {task.description && (
                      <div className="table-task-desc" title={task.description}>
                        {task.description}
                      </div>
                    )}
                  </td>

                  {/* Status Toggle */}
                  <td>
                    {isCompleted ? (
                      <span className="badge-pill badge-done">
                        <Check size={11} strokeWidth={2.5} />
                        <span>Done</span>
                      </span>
                    ) : isInProgress ? (
                      <span 
                        className="badge-pill badge-in-progress"
                        onClick={() => toggleTaskInProgress(task.id)}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle To Do"
                      >
                        <span className="pulse-dot" />
                        <span>In Progress</span>
                      </span>
                    ) : (
                      <span 
                        className="badge-pill"
                        onClick={() => toggleTaskInProgress(task.id)}
                        style={{ 
                          cursor: 'pointer',
                          background: 'var(--bg-hover)', 
                          color: 'var(--text-muted)', 
                          borderColor: 'var(--border-subtle)' 
                        }}
                        title="Click to toggle In Progress"
                      >
                        <span>To Do</span>
                      </span>
                    )}
                  </td>

                  {/* Priority (Click to cycle) */}
                  <td>
                    <span 
                      className={`badge-pill badge-${task.priority} priority-clickable`}
                      onClick={(e) => {
                        e.stopPropagation();
                        cycleTaskPriority(task.id);
                      }}
                      title="Tap to cycle priority"
                    >
                      {getPriorityIcon(task.priority)}
                      <span style={{ textTransform: 'capitalize' }}>{task.priority}</span>
                    </span>
                  </td>

                  {/* Due Date & Completion Date */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
                      {dueInfo ? (
                        <span className={`badge-pill badge-date ${dueInfo.class}`}>
                          {dueInfo.text}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                      )}

                      {task.completedAt && (
                        <span 
                          className="badge-pill badge-done" 
                          title={`Completed on ${task.completedAt}`}
                          style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                        >
                          <CheckCircle2 size={10} />
                          <span>Done {format(parseISO(task.completedAt), 'MMM d')}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Recurrence */}
                  <td>
                    {task.recurrence && task.recurrence !== 'none' ? (
                      <span className="badge-pill badge-date">
                        <Repeat size={11} />
                        <span style={{ textTransform: 'capitalize' }}>{task.recurrence}</span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>

                  {/* Amount */}
                  <td>
                    {task.amount !== undefined && task.amount !== null && !isNaN(Number(task.amount)) ? (
                      <span className="badge-pill badge-amount">
                        <Banknote size={12} />
                        <span>{task.currency || '$'}{Number(task.amount).toLocaleString()}</span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>

                  {/* Assignee / Helper */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {task.assignedTo && task.assignedTo.name ? (
                        <div className="badge-pill badge-assignee">
                          <span>{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Unassigned</span>
                      )}

                      {task.needHelpFrom && task.needHelpFrom.name && (
                        <div className="badge-pill badge-helper">
                          <Users size={10} />
                          <span>{task.needHelpFrom.name}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Tags */}
                  <td>
                    {task.tags && task.tags.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {task.tags.map((tag, idx) => (
                          <span key={idx} className="badge-pill badge-tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button 
                        className="icon-btn" 
                        style={{ width: '28px', height: '28px', borderRadius: '6px' }} 
                        onClick={() => onEditTask(task)}
                        title="Edit Task"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button 
                        className="icon-btn" 
                        style={{ width: '28px', height: '28px', borderRadius: '6px', color: 'var(--priority-urgent)' }} 
                        onClick={() => setDeleteTargetTask(task)}
                        title="Delete Task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetTask && (
        <div 
          className="modal-backdrop" 
          onClick={() => setDeleteTargetTask(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div 
            style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-lg)', 
              width: '100%', 
              maxWidth: '380px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-modal)' 
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--priority-urgent)', fontWeight: 700, fontSize: '0.95rem' }}>
                <AlertTriangle size={18} color="var(--priority-urgent)" />
                <span>Confirm Delete</span>
              </div>
              <button 
                className="icon-btn" 
                style={{ width: 28, height: 28 }} 
                onClick={() => setDeleteTargetTask(null)}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '18px 20px' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: '0 0 8px 0', lineHeight: 1.45 }}>
                Are you sure you want to delete <strong style={{ color: 'var(--text-main)' }}>"{deleteTargetTask.title}"</strong>?
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                This action cannot be undone and will permanently remove this task.
              </p>
            </div>

            <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border-subtle)' }}>
              <button 
                type="button" 
                className="submit-btn" 
                style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', boxShadow: 'none', padding: '8px 14px', fontSize: '0.82rem' }} 
                onClick={() => setDeleteTargetTask(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="submit-btn" 
                style={{ width: 'auto', background: 'var(--priority-urgent)', padding: '8px 14px', fontSize: '0.82rem', boxShadow: 'none' }} 
                onClick={() => {
                  deleteTask(deleteTargetTask.id);
                  setDeleteTargetTask(null);
                }}
              >
                <Trash2 size={13} />
                <span>Delete Task</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
