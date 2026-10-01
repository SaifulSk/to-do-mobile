import React, { useState, useEffect } from 'react';
import { IonModal } from '@ionic/react';
import { 
  X, 
  Check, 
  Plus, 
  Calendar, 
  Flame, 
  AlertTriangle, 
  Clock, 
  ArrowDown, 
  Users, 
  Repeat, 
  DollarSign, 
  HelpCircle, 
  Tag 
} from 'lucide-react';
import { format } from 'date-fns';
import { Task, Priority, Recurrence } from '../../types';
import { useTasks } from '../../context/TaskContext';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Task | null;
  defaultDate?: string | null;
  onOpenAssigneeDirectory?: () => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  initialTask,
  defaultDate,
  onOpenAssigneeDirectory
}) => {
  const { addTask, updateTask, assignees } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('$');

  const [assignedName, setAssignedName] = useState('');
  const [hasHelper, setHasHelper] = useState(false);
  const [helperName, setHelperName] = useState('');
  const [helperTopic, setHelperTopic] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Populate form on open
  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title || '');
        setDescription(initialTask.description || '');
        setPriority(initialTask.priority || 'medium');
        setDueDate(initialTask.dueDate ? initialTask.dueDate.split('T')[0] : '');
        setRecurrence(initialTask.recurrence || 'none');
        setAmount(initialTask.amount !== undefined && initialTask.amount !== null ? String(initialTask.amount) : '');
        setCurrency(initialTask.currency || '$');
        setAssignedName(initialTask.assignedTo?.name || '');

        if (initialTask.needHelpFrom?.name) {
          setHasHelper(true);
          setHelperName(initialTask.needHelpFrom.name);
          setHelperTopic(initialTask.needHelpFrom.topic || '');
        } else {
          setHasHelper(false);
          setHelperName('');
          setHelperTopic('');
        }

        setTagsInput(initialTask.tags ? initialTask.tags.join(', ') : '');
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate(defaultDate || '');
        setRecurrence('none');
        setAmount('');
        setCurrency('$');
        setAssignedName('');
        setHasHelper(false);
        setHelperName('');
        setHelperTopic('');
        setTagsInput('');
      }
    }
  }, [isOpen, initialTask, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status: initialTask?.status || ('todo' as const),
      dueDate: dueDate || null,
      createdAt: initialTask?.createdAt || format(new Date(), 'yyyy-MM-dd'),
      recurrence: recurrence !== 'none' ? recurrence : null,
      amount: amount !== '' && !isNaN(Number(amount)) ? Number(amount) : null,
      currency: amount !== '' ? currency : null,
      assignedTo: assignedName.trim()
        ? {
            name: assignedName.trim(),
            avatar: assignedName.trim().slice(0, 2).toUpperCase()
          }
        : null,
      needHelpFrom: hasHelper && helperName.trim()
        ? {
            name: helperName.trim(),
            topic: helperTopic.trim() || ''
          }
        : null,
      tags
    };

    onClose();

    if (initialTask) {
      await updateTask(initialTask.id, taskPayload);
    } else {
      await addTask(taskPayload);
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      breakpoints={[0, 0.85, 1]}
      initialBreakpoint={0.85}
      className="modal-bottom-sheet"
    >
      <div className="sheet-handle" />
      <div className="modal-sheet-content">
        {/* Header */}
        <div className="modal-sheet-header">
          <h2 className="modal-sheet-title">
            <Plus size={20} color="var(--primary)" />
            {initialTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Redesign mobile navigation..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Add key context, links, or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Priority Segment */}
          <div className="form-group">
            <label className="form-label">Priority</label>
            <div className="priority-selector">
              {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  className={`priority-btn ${p} ${priority === p ? `selected ${p}` : ''}`}
                  onClick={() => setPriority(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Recurrence Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="form-group">
            <div>
              <label className="form-label">
                <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
                Due Date
              </label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">
                <Repeat size={13} style={{ display: 'inline', marginRight: 4 }} />
                Recurrence
              </label>
              <select
                className="form-select"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as Recurrence)}
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Budget Amount */}
          <div className="form-group">
            <label className="form-label">
              <DollarSign size={13} style={{ display: 'inline', marginRight: 4 }} />
              Estimated Budget / Amount (Optional)
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="form-input"
                style={{ width: 60, textAlign: 'center' }}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>
                <Users size={13} style={{ display: 'inline', marginRight: 4 }} />
                Assignee
              </label>
              {onOpenAssigneeDirectory && (
                <button
                  type="button"
                  onClick={onOpenAssigneeDirectory}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Manage Directory
                </button>
              )}
            </div>
            <select
              className="form-select"
              value={assignedName}
              onChange={(e) => setAssignedName(e.target.value)}
            >
              <option value="">Unassigned</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name} {a.role ? `(${a.role})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Collaboration / Need Help Toggle */}
          <div className="form-group" style={{ background: 'var(--bg-surface-elevated)', padding: 12, borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.85rem', color: 'var(--help-accent)' }}>
                <HelpCircle size={15} />
                Request Assistance
              </label>
              <input
                type="checkbox"
                checked={hasHelper}
                onChange={(e) => setHasHelper(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--help-accent)', cursor: 'pointer' }}
              />
            </div>

            {hasHelper && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Helper's Name (e.g. Alex, Sarah)..."
                  value={helperName}
                  onChange={(e) => setHelperName(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Topic or question for helper..."
                  value={helperTopic}
                  onChange={(e) => setHelperTopic(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">
              <Tag size={13} style={{ display: 'inline', marginRight: 4 }} />
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. mobile, frontend, sprint-3"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          {/* Submit button */}
          <button type="submit" className="submit-btn" style={{ marginTop: 10 }}>
            <Check size={18} />
            <span>{initialTask ? 'Save Changes' : 'Create Task'}</span>
          </button>
        </form>
      </div>
    </IonModal>
  );
};
