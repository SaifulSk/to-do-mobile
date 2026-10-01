import React, { useState, useMemo } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isToday 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Header } from '../components/common/Header';
import { CalendarDayModal } from '../components/calendar/CalendarDayModal';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { NotificationModal } from '../components/common/NotificationModal';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types';

export const CalendarPage: React.FC = () => {
  const { tasks } = useTasks();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskDate, setDefaultTaskDate] = useState<string | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Month days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Tasks map by date string (yyyy-MM-dd)
  const tasksByDateMap = useMemo(() => {
    const map: Record<string, Array<{ type: 'due' | 'created'; task: Task }>> = {};

    tasks.forEach((task) => {
      if (task.createdAt) {
        const createdKey = task.createdAt.split('T')[0];
        if (!map[createdKey]) map[createdKey] = [];
        map[createdKey].push({ type: 'created', task });
      }

      if (task.dueDate) {
        const dueKey = task.dueDate.split('T')[0];
        if (!map[dueKey]) map[dueKey] = [];
        map[dueKey].push({ type: 'due', task });
      }
    });

    return map;
  }, [tasks]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setIsDayModalOpen(true);
  };

  const handleOpenNewTaskForDate = (dateStr: string) => {
    setDefaultTaskDate(dateStr);
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const selectedDayKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null;
  const selectedDayItems = selectedDayKey ? tasksByDateMap[selectedDayKey] || [] : [];

  return (
    <IonPage>
      <Header onOpenNotifications={() => setIsNotificationModalOpen(true)} title="Calendar" />

      <IonContent fullscreen className="ion-padding">
        {/* Month Navigation Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Tasks by Due Date & Created Date
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="icon-btn" onClick={handleToday} title="Jump to Today" style={{ width: 'auto', padding: '0 10px', fontSize: '0.75rem', fontWeight: 700 }}>
              Today
            </button>
            <button className="icon-btn" onClick={handlePrevMonth} title="Previous Month">
              <ChevronLeft size={16} />
            </button>
            <button className="icon-btn" onClick={handleNextMonth} title="Next Month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 12, paddingLeft: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--marker-due)' }} />
            <span>Tasks Due</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--marker-created)' }} />
            <span>Tasks Created</span>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginBottom: 6
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} style={{ padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 6
        }}>
          {calendarDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const inCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            const dayItems = tasksByDateMap[dayKey] || [];
            const hasDue = dayItems.some((i) => i.type === 'due');
            const hasCreated = dayItems.some((i) => i.type === 'created');

            return (
              <div
                key={dayKey}
                onClick={() => handleDayClick(day)}
                style={{
                  minHeight: 52,
                  background: isCurrentDay
                    ? 'var(--primary-light)'
                    : inCurrentMonth
                    ? 'var(--bg-surface)'
                    : 'transparent',
                  border: `1px solid ${
                    isCurrentDay
                      ? 'var(--primary)'
                      : inCurrentMonth
                      ? 'var(--border-subtle)'
                      : 'transparent'
                  }`,
                  borderRadius: 10,
                  padding: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: inCurrentMonth ? 'pointer' : 'default',
                  opacity: inCurrentMonth ? 1 : 0.35,
                  transition: 'all 0.15s ease'
                }}
              >
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: isCurrentDay ? 800 : 600,
                    color: isCurrentDay ? 'var(--primary)' : 'var(--text-main)'
                  }}
                >
                  {format(day, 'd')}
                </span>

                {/* Markers */}
                <div style={{ display: 'flex', gap: 4, height: 6 }}>
                  {hasDue && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--marker-due)',
                        boxShadow: '0 0 4px var(--marker-due)'
                      }}
                      title="Task due"
                    />
                  )}
                  {hasCreated && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--marker-created)'
                      }}
                      title="Task created"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modals */}
        <CalendarDayModal
          isOpen={isDayModalOpen}
          onClose={() => setIsDayModalOpen(false)}
          selectedDate={selectedDay}
          items={selectedDayItems}
          onOpenNewTask={handleOpenNewTaskForDate}
          onEditTask={handleEditTask}
        />

        <TaskFormModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
            setDefaultTaskDate(null);
          }}
          initialTask={editingTask}
          defaultDate={defaultTaskDate}
        />

        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default CalendarPage;
