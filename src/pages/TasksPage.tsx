import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonContent, 
  IonRefresher, 
  IonRefresherContent 
} from '@ionic/react';
import { Plus, CheckSquare, List, Table as TableIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { StatsCards } from '../components/tasks/StatsCards';
import { TaskFiltersBar } from '../components/tasks/TaskFiltersBar';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskTableView } from '../components/tasks/TaskTableView';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { NotificationModal } from '../components/common/NotificationModal';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { Task } from '../types';

interface TasksPageProps {
  initialView?: 'list' | 'table';
}

export const TasksPage: React.FC<TasksPageProps> = ({ initialView }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { defaultView } = useTheme();
  const { filteredTasks, refreshTasks } = useTasks();

  const isTableRoute = location.pathname === '/table';
  const isTasksRoute = location.pathname === '/tasks';

  const [viewMode, setViewMode] = useState<'list' | 'table'>(() => {
    if (isTableRoute) return 'table';
    if (isTasksRoute) return 'list';
    if (initialView) return initialView;
    if (defaultView === 'table') return 'table';
    return 'list';
  });

  // Keep viewMode synchronized when navigating between routes
  useEffect(() => {
    if (location.pathname === '/table') {
      setViewMode('table');
    } else if (location.pathname === '/tasks') {
      setViewMode('list');
    }
  }, [location.pathname]);

  const handleSwitchView = (newView: 'list' | 'table') => {
    setViewMode(newView);
    if (newView === 'table' && location.pathname !== '/table') {
      navigate('/table');
    } else if (newView === 'list' && location.pathname !== '/tasks') {
      navigate('/tasks');
    }
  };

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

        {/* View Switcher: List vs Table */}
        <div className="view-switcher-bar">
          <div className="view-tabs-segmented">
            <button
              className={`view-tab-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleSwitchView('list')}
              title="List View"
            >
              <List size={15} />
              <span>List</span>
            </button>
            <button
              className={`view-tab-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => handleSwitchView('table')}
              title="Table View"
            >
              <TableIcon size={15} />
              <span>Table</span>
            </button>
          </div>
          <span className="view-tasks-count">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {/* Filter and Search Bar */}
        <TaskFiltersBar />

        {/* Tasks View: List vs Table */}
        {viewMode === 'list' ? (
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
        ) : (
          <TaskTableView
            onEditTask={handleEditTask}
            onOpenNewTask={handleOpenNewTask}
          />
        )}

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
