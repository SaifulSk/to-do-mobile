import React, { useState } from 'react';
import { 
  Check, 
  Flame, 
  AlertTriangle, 
  Clock, 
  ArrowDown, 
  Calendar, 
  Repeat, 
  DollarSign, 
  HelpCircle, 
  User, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Tag
} from 'lucide-react';
import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns';
import { Task, Priority } from '../../types';
import { useTasks } from '../../context/TaskContext';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { toggleTaskComplete, toggleTaskInProgress, cycleTaskPriority, deleteTask } = useTasks();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  // Format Due Date
  const getDueDateInfo = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const parsed = parseISO(dateStr);
      if (isNaN(parsed.getTime())) return { text: dateStr, class: 'normal' };
      if (isToday(parsed)) return { text: 'Today', class: 'today' };
      if (isTomorrow(parsed)) return { text: 'Tomorrow', class: 'tomorrow' };
      if (isPast(parsed) && !isCompleted) return { text: `Overdue (${format(parsed, 'MMM d')})`, class: 'overdue' };
      return { text: format(parsed, 'MMM d'), class: 'normal' };
    } catch {
      return { text: dateStr, class: 'normal' };
    }
  };

  const dueInfo = getDueDateInfo(task.dueDate);

  const getPriorityIcon = (p: Priority) => {
    switch (p) {
      case 'urgent': return <Flame size={12} />;
      case 'high': return <AlertTriangle size={12} />;
      case 'medium': return <Clock size={12} />;
      case 'low': return <ArrowDown size={12} />;
    }
  };

  return (
    <div className={`task-card-mobile priority-${task.priority} ${isCompleted ? 'completed' : ''} ${isInProgress ? 'in-progress' : ''}`}>
      {/* Top Row: Checkbox + Title + Description */}
      <div className="task-main-row">
        <div
          className={`custom-checkbox-mobile ${isCompleted ? 'checked' : ''}`}
          onClick={() => toggleTaskComplete(task.id)}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
        >
          {isCompleted && <Check size={14} strokeWidth={3} />}
        </div>

        <div className="task-info">
          <h3 className="task-title-text">{task.title}</h3>
          {task.description && <p className="task-desc-text">{task.description}</p>}
        </div>
      </div>

      {/* Badges Row */}
      <div className="task-badges-row">
        {/* Status Badge: Click to toggle In Progress */}
        {isCompleted ? (
          <span className="badge-pill badge-done">
            <CheckCircle2 size={11} />
            <span>Done</span>
          </span>
        ) : isInProgress ? (
          <span
            className="badge-pill badge-in-progress"
            onClick={() => toggleTaskInProgress(task.id)}
            style={{ cursor: 'pointer' }}
            title="In Progress. Tap to set To Do"
          >
            <span className="pulse-dot" />
            <span>In Progress</span>
          </span>
        ) : (
          <span
            className="badge-pill badge-date"
            onClick={() => toggleTaskInProgress(task.id)}
            style={{ cursor: 'pointer' }}
            title="To Do. Tap to set In Progress"
          >
            <span>To Do</span>
          </span>
        )}

        {/* Priority Badge: Click to cycle instantly */}
        <span
          className={`badge-pill badge-${task.priority}`}
          onClick={() => cycleTaskPriority(task.id)}
          style={{ cursor: 'pointer' }}
          title={`Priority: ${task.priority.toUpperCase()}. Tap to cycle.`}
        >
          {getPriorityIcon(task.priority)}
          <span style={{ textTransform: 'capitalize' }}>{task.priority}</span>
        </span>

        {/* Due Date */}
        {dueInfo && (
          <span className={`badge-pill badge-date ${dueInfo.class}`}>
            <Calendar size={11} />
            <span>{dueInfo.text}</span>
          </span>
        )}

        {/* Recurrence */}
        {task.recurrence && task.recurrence !== 'none' && (
          <span className="badge-pill badge-date" title={`Recurs ${task.recurrence}`}>
            <Repeat size={11} />
            <span style={{ textTransform: 'capitalize' }}>{task.recurrence}</span>
          </span>
        )}

        {/* Amount */}
        {task.amount !== undefined && task.amount !== null && (
          <span className="badge-pill badge-amount">
            <DollarSign size={11} />
            <span>{task.currency || '$'}{task.amount}</span>
          </span>
        )}

        {/* Assignee */}
        {task.assignedTo && task.assignedTo.name && (
          <span className="badge-pill badge-assignee">
            <User size={11} />
            <span>{task.assignedTo.name}</span>
          </span>
        )}

        {/* Need Help From */}
        {task.needHelpFrom && task.needHelpFrom.name && (
          <span className="badge-pill badge-helper" title={task.needHelpFrom.topic ? `Help topic: ${task.needHelpFrom.topic}` : ''}>
            <HelpCircle size={11} />
            <span>Help: {task.needHelpFrom.name}</span>
          </span>
        )}

        {/* Tags */}
        {task.tags && task.tags.map((tag, idx) => (
          <span key={idx} className="badge-pill badge-tag">
            <Tag size={10} />
            <span>#{tag}</span>
          </span>
        ))}
      </div>

      {/* Card Actions Bottom Row */}
      <div className="card-actions-row">
        {showDeleteConfirm ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--priority-urgent)', fontWeight: 600 }}>Delete?</span>
            <button
              className="action-btn delete"
              onClick={() => deleteTask(task.id)}
              style={{ background: 'var(--priority-urgent-bg)', padding: '2px 8px' }}
            >
              Yes
            </button>
            <button
              className="action-btn"
              onClick={() => setShowDeleteConfirm(false)}
              style={{ padding: '2px 8px' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button className="action-btn" onClick={() => onEdit(task)}>
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
            <button className="action-btn delete" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
