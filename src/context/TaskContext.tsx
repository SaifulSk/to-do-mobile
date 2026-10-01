import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { format, addDays, addWeeks, addMonths, addYears, parseISO, isValid } from 'date-fns';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { 
  isConfigured as isFirebaseLive, 
  subscribeToUserTasks,
  claimLegacyTodosForSaiful,
  addTaskToFirestore,
  updateTaskInFirestore,
  deleteTaskFromFirestore,
  subscribeToAssignees,
  addAssigneeToFirestore,
  deleteAssigneeFromFirestore
} from '../services/firebase';
import { checkTaskNotifications, notifyTaskCompleted, triggerHaptic } from '../services/notificationService';
import { Task, AssigneeMaster, Priority, TaskStatus } from '../types';
import { ImpactStyle } from '@capacitor/haptics';

interface StatsData {
  total: number;
  completed: number;
  inProgress: number;
  needHelp: number;
  dueSoon: number;
  completionRate: number;
}

interface TaskContextType {
  tasks: Task[];
  assignees: AssigneeMaster[];
  filteredTasks: Task[];
  loading: boolean;
  stats: StatsData;
  allAssignees: string[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterPriority: string;
  setFilterPriority: (p: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  filterNeedHelp: boolean;
  setFilterNeedHelp: (h: boolean) => void;
  filterAssignee: string;
  setFilterAssignee: (a: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (o: 'asc' | 'desc') => void;
  addTask: (taskData: Omit<Task, 'id'>) => Promise<any>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<any>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  toggleTaskInProgress: (taskId: string) => Promise<void>;
  cycleTaskPriority: (taskId: string) => Promise<void>;
  addAssignee: (name: string, role?: string) => Promise<any>;
  deleteAssignee: (id: string) => Promise<void>;
  refreshTasks: () => void;
}

const TaskContext = createContext<TaskContextType | null>(null);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

const LOCAL_ASSIGNEES_KEY = 'zenith_mobile_assignees_master';

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isFirebaseConnected } = useAuth();
  const { pushNotification } = useNotifications();

  const userKey = currentUser ? currentUser.uid : 'guest';

  // Tasks state scoped to current user
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(`zenith_mobile_user_tasks_${userKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading saved tasks:', e);
    }
    return [];
  });

  const prevTasksRef = useRef<Task[]>(tasks);
  const isInitialTasksSyncRef = useRef(true);

  // Switch tasks state when currentUser changes (prevents account bleed)
  useEffect(() => {
    const currentKey = currentUser ? currentUser.uid : 'guest';
    try {
      const saved = localStorage.getItem(`zenith_mobile_user_tasks_${currentKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
          prevTasksRef.current = parsed;
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    setTasks([]);
    prevTasksRef.current = [];
  }, [currentUser?.uid]);

  // Assignees Master state
  const [assignees, setAssignees] = useState<AssigneeMaster[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ASSIGNEES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading saved assignees:', e);
    }
    return [];
  });

  const [loading, setLoading] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterNeedHelp, setFilterNeedHelp] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Persistence to user-scoped localStorage
  useEffect(() => {
    const currentKey = currentUser ? currentUser.uid : 'guest';
    try {
      localStorage.setItem(`zenith_mobile_user_tasks_${currentKey}`, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Could not persist tasks to localStorage', e);
    }
  }, [tasks, currentUser?.uid]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_ASSIGNEES_KEY, JSON.stringify(assignees));
    } catch (e) {
      console.warn('Could not persist assignees to localStorage', e);
    }
  }, [assignees]);

  // Firestore Sync: Tasks (Strictly filtered by currentUser.uid)
  useEffect(() => {
    if (!isFirebaseConnected || !currentUser) {
      if (!currentUser) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);

    // If logging in as saiful@yopmail.com, ensure all legacy todos are assigned to this user's UID
    if (currentUser.email === 'saiful@yopmail.com') {
      claimLegacyTodosForSaiful(currentUser.uid).catch((err) => {
        console.warn('Could not claim todos for saiful:', err);
      });
    }

    const unsubscribe = subscribeToUserTasks(
      currentUser.uid,
      (firestoreTasks) => {
        if (Array.isArray(firestoreTasks)) {
          // Detect remote completions across devices
          if (!isInitialTasksSyncRef.current && prevTasksRef.current && prevTasksRef.current.length > 0) {
            const prevMap = new Map(prevTasksRef.current.map((t) => [t.id, t]));
            firestoreTasks.forEach((incomingTask) => {
              const prevTask = prevMap.get(incomingTask.id);
              if (prevTask && prevTask.status !== 'completed' && incomingTask.status === 'completed') {
                notifyTaskCompleted(incomingTask, pushNotification);
              }
            });
          }

          setTasks(firestoreTasks);
          prevTasksRef.current = firestoreTasks;
          isInitialTasksSyncRef.current = false;
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Firestore tasks subscription fallback:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid, currentUser?.email, isFirebaseConnected, pushNotification]);

  // Firestore Sync: Assignees Master Directory
  useEffect(() => {
    if (!isFirebaseConnected) return;

    const unsubscribe = subscribeToAssignees(
      (firestoreAssignees) => {
        if (Array.isArray(firestoreAssignees)) {
          setAssignees(firestoreAssignees);
        }
      },
      (err) => {
        console.warn('Firestore assignees subscription fallback:', err);
      }
    );

    return () => unsubscribe();
  }, [isFirebaseConnected]);

  // Periodic Task Notification Rule Checks (Every 5 minutes or when tasks change)
  useEffect(() => {
    if (tasks.length > 0) {
      checkTaskNotifications(tasks, pushNotification);
    }
  }, [tasks, pushNotification]);

  // Refresh tasks callback
  const refreshTasks = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  }, []);

  // Add Task
  const addTask = async (taskData: Omit<Task, 'id'>) => {
    const tempId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newTask: Task = {
      ...taskData,
      id: tempId,
      createdAt: taskData.createdAt || format(new Date(), 'yyyy-MM-dd'),
      userId: currentUser ? currentUser.uid : 'user-local',
      userEmail: currentUser?.email || 'user-local'
    };

    // Optimistic UI update
    setTasks((prev) => [newTask, ...prev]);
    triggerHaptic(ImpactStyle.Light);

    if (isFirebaseConnected) {
      try {
        const docRef = await addTaskToFirestore(newTask);
        if (docRef?.id) {
          setTasks((prev) =>
            prev.map((t) => (t.id === tempId ? { ...t, id: docRef.id } : t))
          );
        }
        return docRef;
      } catch (err) {
        console.error('Firestore task creation error, stored locally:', err);
      }
    }
    return newTask;
  };

  // Update Task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const existingTask = tasks.find((t) => t.id === taskId);
    const isBecomingCompleted = updates.status === 'completed' && existingTask?.status !== 'completed';

    const finalUpdates: Partial<Task> = {
      ...updates,
      ...(isBecomingCompleted ? { completedAt: format(new Date(), 'yyyy-MM-dd HH:mm') } : {})
    };

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...finalUpdates } : t))
    );

    if (isBecomingCompleted && existingTask) {
      notifyTaskCompleted({ ...existingTask, ...finalUpdates } as Task, pushNotification);
    }

    if (isFirebaseConnected) {
      try {
        await updateTaskInFirestore(taskId, finalUpdates);
      } catch (err) {
        console.error('Firestore update error, keeping local change:', err);
      }
    }
  };

  // Delete Task
  const deleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    triggerHaptic(ImpactStyle.Medium);

    if (isFirebaseConnected) {
      try {
        await deleteTaskFromFirestore(taskId);
      } catch (err) {
        console.error('Firestore delete error:', err);
      }
    }
  };

  // Toggle In Progress
  const toggleTaskInProgress = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus: TaskStatus = task.status === 'in_progress' ? 'todo' : 'in_progress';
    triggerHaptic(ImpactStyle.Light);
    await updateTask(taskId, { status: newStatus, completedAt: null });
  };

  // Cycle Priority: low -> medium -> high -> urgent -> low
  const cycleTaskPriority = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const order: Priority[] = ['low', 'medium', 'high', 'urgent'];
    const nextIndex = (order.indexOf(task.priority) + 1) % order.length;
    const nextPriority = order[nextIndex];
    triggerHaptic(ImpactStyle.Light);
    await updateTask(taskId, { priority: nextPriority });
  };

  // Toggle Complete with Confetti & Recurrence Spawning
  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const isNowCompleted = task.status !== 'completed';
    const newStatus: TaskStatus = isNowCompleted ? 'completed' : 'todo';

    if (isNowCompleted) {
      triggerHaptic(ImpactStyle.Heavy);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#6366f1', '#38bdf8', '#f59e0b', '#ec4899']
        });
      } catch (e) {
        // ignore
      }

      // Auto recurrence logic
      if (task.recurrence && task.recurrence !== 'none') {
        const baseDate = task.dueDate ? parseISO(task.dueDate) : new Date();
        const validBase = isValid(baseDate) ? baseDate : new Date();
        let nextDueDate: Date | null = null;

        switch (task.recurrence) {
          case 'daily':
            nextDueDate = addDays(validBase, 1);
            break;
          case 'weekly':
            nextDueDate = addWeeks(validBase, 1);
            break;
          case 'monthly':
            nextDueDate = addMonths(validBase, 1);
            break;
          case 'yearly':
            nextDueDate = addYears(validBase, 1);
            break;
        }

        const nextDateStr = nextDueDate ? format(nextDueDate, 'yyyy-MM-dd') : null;

        setTimeout(() => {
          addTask({
            title: task.title,
            description: task.description || '',
            priority: task.priority || 'medium',
            status: 'todo',
            dueDate: nextDateStr,
            createdAt: format(new Date(), 'yyyy-MM-dd'),
            assignedTo: task.assignedTo || null,
            needHelpFrom: task.needHelpFrom || null,
            tags: task.tags || [],
            recurrence: task.recurrence,
            amount: task.amount !== undefined ? task.amount : null,
            currency: task.currency || '$'
          });
        }, 200);
      }
    } else {
      triggerHaptic(ImpactStyle.Light);
    }

    const completedAt = isNowCompleted ? format(new Date(), 'yyyy-MM-dd HH:mm') : null;
    await updateTask(taskId, { status: newStatus, completedAt });
  };

  // Add Assignee to Master
  const addAssignee = async (name: string, role?: string) => {
    const tempId = `assignee_${Date.now()}`;
    const newAssignee: AssigneeMaster = {
      id: tempId,
      name: name.trim(),
      role: role?.trim() || 'Team Member',
      createdAt: new Date().toISOString()
    };

    setAssignees((prev) => [...prev, newAssignee]);
    triggerHaptic(ImpactStyle.Light);

    if (isFirebaseConnected) {
      try {
        const docRef = await addAssigneeToFirestore({ name: newAssignee.name, role: newAssignee.role });
        if (docRef?.id) {
          setAssignees((prev) =>
            prev.map((a) => (a.id === tempId ? { ...a, id: docRef.id } : a))
          );
        }
        return docRef;
      } catch (err) {
        console.error('Firestore add assignee error:', err);
      }
    }
    return newAssignee;
  };

  // Delete Assignee from Master
  const deleteAssignee = async (id: string) => {
    setAssignees((prev) => prev.filter((a) => a.id !== id));
    triggerHaptic(ImpactStyle.Medium);

    if (isFirebaseConnected) {
      try {
        await deleteAssigneeFromFirestore(id);
      } catch (err) {
        console.error('Firestore delete assignee error:', err);
      }
    }
  };

  // Filtered and Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title?.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          const matchAssignee = task.assignedTo?.name?.toLowerCase().includes(q);
          const matchHelper = task.needHelpFrom?.name?.toLowerCase().includes(q);
          const matchTags = task.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchAssignee && !matchHelper && !matchTags) {
            return false;
          }
        }

        // Priority Filter
        if (filterPriority !== 'all' && task.priority !== filterPriority) {
          return false;
        }

        // Status Filter
        if (filterStatus === 'todo' && task.status !== 'todo') {
          return false;
        }
        if (filterStatus === 'in_progress' && task.status !== 'in_progress') {
          return false;
        }
        if (filterStatus === 'completed' && task.status !== 'completed') {
          return false;
        }
        if (filterStatus === 'active' && task.status === 'completed') {
          return false;
        }

        // Need Help Filter
        if (filterNeedHelp && (!task.needHelpFrom || !task.needHelpFrom.name)) {
          return false;
        }

        // Assignee Filter
        if (filterAssignee !== 'all' && task.assignedTo?.name !== filterAssignee) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priorityOrder: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        let compare = 0;

        if (sortBy === 'priority') {
          compare = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        } else if (sortBy === 'createdAt') {
          compare = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        } else if (sortBy === 'title') {
          compare = (a.title || '').localeCompare(b.title || '');
        } else {
          // Default: dueDate
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          compare = dateA - dateB;
        }

        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [tasks, searchQuery, filterPriority, filterStatus, filterNeedHelp, filterAssignee, sortBy, sortOrder]);

  // Combined all assignees from tasks + Assignee Master
  const allAssignees = useMemo(() => {
    const set = new Set<string>();
    assignees.forEach((a) => set.add(a.name));
    tasks.forEach((t) => {
      if (t.assignedTo?.name) set.add(t.assignedTo.name);
    });
    return Array.from(set);
  }, [tasks, assignees]);

  // Stats
  const stats: StatsData = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const needHelp = tasks.filter((t) => t.needHelpFrom && t.needHelpFrom.name && t.status !== 'completed').length;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayTimestamp = new Date(todayStr).getTime();
    const dueSoon = tasks.filter((t) => {
      if (t.status === 'completed' || !t.dueDate) return false;
      const dueTimestamp = new Date(t.dueDate).getTime();
      return dueTimestamp <= todayTimestamp + 86400000 * 2;
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, needHelp, dueSoon, completionRate };
  }, [tasks]);

  const value: TaskContextType = {
    tasks,
    assignees,
    filteredTasks,
    loading,
    stats,
    allAssignees,
    searchQuery,
    setSearchQuery,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    filterNeedHelp,
    setFilterNeedHelp,
    filterAssignee,
    setFilterAssignee,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleTaskInProgress,
    cycleTaskPriority,
    addAssignee,
    deleteAssignee,
    refreshTasks
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
