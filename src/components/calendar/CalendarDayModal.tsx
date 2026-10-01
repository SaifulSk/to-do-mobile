import React from 'react';
import { IonModal } from '@ionic/react';
import { Calendar, Plus, X, Check, Flame, AlertTriangle, Clock, ArrowDown } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { Task, Priority } from '../../types';
import { useTasks } from '../../context/TaskContext';

interface CalendarDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  items: Array<{ type: 'due' | 'created'; task: Task }>;
  onOpenNewTask: (dateStr: string) => void;
  onEditTask: (task: Task) => void;
}

export const CalendarDayModal: React.FC<CalendarDayModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  items,
  onOpenNewTask,
  onEditTask
}) => {
  const { toggleTaskComplete } = useTasks();

  if (!selectedDate) return null;

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const formattedTitle = format(selectedDate, 'EEEE, MMMM d, yyyy');

  const getPriorityIcon = (p: Priority) => {
    switch (p) {
      case 'urgent': return <Flame size={12} />;
      case 'high': return <AlertTriangle size={12} />;
      case 'medium': return <Clock size={12} />;
      case 'low': return <ArrowDown size={12} />;
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      breakpoints={[0, 0.6, 0.9]}
      initialBreakpoint={0.6}
      className="modal-bottom-sheet"
    >
      <div className="sheet-handle" />
      <div className="modal-sheet-content">
        <div className="modal-sheet-header">
          <div>
            <h2 className="modal-sheet-title" style={{ fontSize: '1.05rem' }}>
              <Calendar size={18} color="var(--primary)" />
              {formattedTitle}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {items.length} task{items.length === 1 ? '' : 's'} on this date
            </span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Quick Add Button */}
        <button
          className="submit-btn"
          style={{ marginBottom: 16, padding: '10px 14px', fontSize: '0.85rem' }}
          onClick={() => {
            onClose();
            onOpenNewTask(dateStr);
          }}
        >
          <Plus size={16} />
          <span>Add Task for this Day</span>
        </button>

        {/* Task Items */}
        {items.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 0' }}>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>No tasks scheduled or created on this day.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(({ type, task }, idx) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={`${task.id}_${type}_${idx}`}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <div
                    className={`custom-checkbox-mobile ${isCompleted ? 'checked' : ''}`}
                    onClick={() => toggleTaskComplete(task.id)}
                    style={{ margin: 0 }}
                  >
                    {isCompleted && <Check size={14} strokeWidth={3} />}
                  </div>

                  <div
                    style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                    onClick={() => {
                      onClose();
                      onEditTask(task);
                    }}
                  >
                    <h4
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        textDecoration: isCompleted ? 'line-through' : 'none'
                      }}
                    >
                      {task.title}
                    </h4>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span
                        className={`badge-pill badge-${task.priority}`}
                        style={{ padding: '2px 6px', fontSize: '0.68rem' }}
                      >
                        {getPriorityIcon(task.priority)}
                        <span style={{ textTransform: 'capitalize' }}>{task.priority}</span>
                      </span>
                      <span
                        className="badge-pill"
                        style={{
                          background: type === 'due' ? 'var(--marker-due-bg)' : 'var(--marker-created-bg)',
                          color: type === 'due' ? 'var(--marker-due)' : 'var(--marker-created)',
                          padding: '2px 6px',
                          fontSize: '0.68rem'
                        }}
                      >
                        {type === 'due' ? 'Due' : 'Created'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </IonModal>
  );
};
