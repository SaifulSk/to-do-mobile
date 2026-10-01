import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { 
  listOutline,
  gridOutline,
  calendarOutline, 
  peopleOutline, 
  personOutline 
} from 'ionicons/icons';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables and Zenith design system */
import './theme/variables.css';
import './theme/mobile.css';

/* Contexts */
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { TaskProvider } from './context/TaskContext';

/* Components & Pages */
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import DirectoryPage from './pages/DirectoryPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import { NotificationToast } from './components/common/NotificationToast';

setupIonicReact({
  mode: 'ios' // Sleek, modern iOS style components across all platforms
});

const MainTabs: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        color: 'var(--text-muted)',
        gap: 12
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'var(--primary)',
          boxShadow: '0 0 16px var(--primary-glow)',
          animation: 'pulse-ring 1.5s infinite'
        }} />
        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Loading Zenith Mobile...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/tasks" element={<TasksPage initialView="list" />} />
        <Route path="/table" element={<TasksPage initialView="table" />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<Navigate to="/tasks" replace />} />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="tasks" href="/tasks">
          <IonIcon aria-hidden="true" icon={listOutline} />
          <IonLabel>List</IonLabel>
        </IonTabButton>

        <IonTabButton tab="table" href="/table">
          <IonIcon aria-hidden="true" icon={gridOutline} />
          <IonLabel>Table</IonLabel>
        </IonTabButton>

        <IonTabButton tab="calendar" href="/calendar">
          <IonIcon aria-hidden="true" icon={calendarOutline} />
          <IonLabel>Calendar</IonLabel>
        </IonTabButton>

        <IonTabButton tab="directory" href="/directory">
          <IonIcon aria-hidden="true" icon={peopleOutline} />
          <IonLabel>Team</IonLabel>
        </IonTabButton>

        <IonTabButton tab="profile" href="/profile">
          <IonIcon aria-hidden="true" icon={personOutline} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <TaskProvider>
            <IonReactRouter>
              <MainTabs />
              <NotificationToast />
            </IonReactRouter>
          </TaskProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  </IonApp>
);

export default App;
