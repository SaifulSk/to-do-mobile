import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { Users, Plus, Trash2, Search, Briefcase, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Header } from '../components/common/Header';
import { NotificationModal } from '../components/common/NotificationModal';
import { useTasks } from '../context/TaskContext';

export const DirectoryPage: React.FC = () => {
  const { assignees, addAssignee, deleteAssignee, tasks } = useTasks();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addAssignee(name.trim(), role.trim() || 'Team Member');
    setName('');
    setRole('');
    setIsAdding(false);
  };

  const getTaskCountForAssignee = (assigneeName: string) => {
    return tasks.filter(
      (t) => t.assignedTo?.name?.toLowerCase() === assigneeName.toLowerCase() && t.status !== 'completed'
    ).length;
  };

  const filteredAssignees = assignees.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.role && a.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <IonPage>
      <Header onOpenNotifications={() => setIsNotificationModalOpen(true)} title="Directory" />

      <IonContent fullscreen className="ion-padding">
        {/* Top Header Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 14,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={20} color="var(--primary)" />
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Assignee Directory
              </h2>
            </div>
            <button
              className="submit-btn"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', borderRadius: 8 }}
              onClick={() => setIsAdding(!isAdding)}
            >
              <Plus size={15} />
              <span>{isAdding ? 'Cancel' : 'Add Member'}</span>
            </button>
          </div>

          <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time synced team members available for task assignments.
          </p>

          {/* Quick Search */}
          <div className="search-box">
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              className="search-input"
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Add Member Drawer */}
        {isAdding && (
          <form
            onSubmit={handleAdd}
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-md)',
              padding: 14,
              marginBottom: 16
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Add Team Member
            </h4>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role or Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Lead Designer, QA Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-btn" style={{ padding: '10px' }}>
              <Plus size={16} />
              <span>Save to Master Directory</span>
            </button>
          </form>
        )}

        {/* Members List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 80 }}>
          {filteredAssignees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <Users size={26} />
              </div>
              <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>No assignees found</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Add team members above to start assigning tasks.</p>
            </div>
          ) : (
            filteredAssignees.map((member) => {
              const pendingCount = getTaskCountForAssignee(member.name);
              const initials = member.name.slice(0, 2).toUpperCase();

              return (
                <div
                  key={member.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        border: '1px solid var(--primary-border)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}
                    >
                      {initials}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {member.name}
                      </h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {member.role || 'Team Member'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      className="badge-pill"
                      style={{
                        background: pendingCount > 0 ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-hover)',
                        color: pendingCount > 0 ? '#38bdf8' : 'var(--text-muted)',
                        border: `1px solid ${pendingCount > 0 ? 'rgba(56, 189, 248, 0.3)' : 'var(--border-subtle)'}`
                      }}
                      title={`${pendingCount} pending task(s)`}
                    >
                      {pendingCount} active
                    </span>

                    {deleteTargetId === member.id ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="action-btn delete"
                          onClick={() => {
                            deleteAssignee(member.id);
                            setDeleteTargetId(null);
                          }}
                          style={{ background: 'var(--priority-urgent-bg)', padding: '4px 8px' }}
                        >
                          Confirm
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => setDeleteTargetId(null)}
                          style={{ padding: '4px 6px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="icon-btn"
                        onClick={() => setDeleteTargetId(member.id)}
                        style={{ color: 'var(--priority-urgent)', border: 'none' }}
                        title="Delete assignee"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default DirectoryPage;
