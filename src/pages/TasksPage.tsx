import React, { useState } from 'react';
import { 
  IonPage, 
  IonContent, 
  IonRefresher, 
  IonRefresherContent 
} from '@ionic/react';
import { Plus, CheckSquare } from 'lucide-react';
import { Header } from '../components/common/Header';
import { StatsCards } from '../components/tasks/StatsCards';
import { TaskFiltersBar } from '../components/tasks/TaskFiltersBar';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { NotificationModal } from '../components/common/NotificationModal';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types';

export const TasksPage: React.FC = () => {
  const { filteredTasks, refreshTasks, loading } = useTasks();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleRefresh = (event: CustomEvent) => {
    refreshTasks();
    setTimeout(() => {
      event.detail.complete();
    }, 600);
  };

  return (
    <IonPage>
      <Header onOpenNotifications={() => setIsNotificationModalOpen(true)} />

      <IonContent fullscreen className="ion-padding-top">
        {/* Pull to Refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingIcon="lines" refreshingSpinner="crescent" />
        </IonRefresher>

        {/* Stats Carousel */}
        <StatsCards />

        {/* Filter and Search Bar */}
        <TaskFiltersBar />

        {/* Tasks Container */}
        <div className="tasks-container">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <CheckSquare size={28} />
              </div>
              <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem' }}>
                No tasks found
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                Create a task with the + button below or try resetting your filters.
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
              />
            ))
          )}
        </div>

        {/* Floating Action Button (FAB) */}
        <button
          className="mobile-fab"
          onClick={handleOpenNewTask}
          title="Create New Task"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        {/* Modals */}
        <TaskFormModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          initialTask={editingTask}
        />

        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default TasksPage;
