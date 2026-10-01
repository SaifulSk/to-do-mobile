import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  setDoc,
  onSnapshot, 
  query, 
  where,
  getDocs,
  orderBy, 
  serverTimestamp,
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import { Task, AssigneeMaster, UserPreferences } from '../types';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBn5puSUc0pq_q4QTDMWqbqnHKM9QOktiY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "todo-advanced-27e80.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "todo-advanced-27e80",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "todo-advanced-27e80.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "68585655009",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:68585655009:web:055ea8e65b395c853b45a0",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HFFBX2VFV0"
};

const STORAGE_CONFIG_KEY = 'zenith_firebase_config';

export const getActiveFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read stored Firebase config', e);
  }

  return DEFAULT_FIREBASE_CONFIG;
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isConfigured = false;

const config = getActiveFirebaseConfig();

try {
  app = getApps().length > 0 ? getApp() : initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
  isConfigured = true;
} catch (error) {
  console.error('Failed to initialize Firebase with provided credentials:', error);
  isConfigured = false;
}

export { app, auth, db, isConfigured };

export const saveFirebaseConfig = (newConfig: any) => {
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(newConfig));
    return true;
  } catch (e) {
    console.error('Error saving config to localStorage', e);
    return false;
  }
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem(STORAGE_CONFIG_KEY);
};

/* --- Real-Time Firestore Tasks API --- */

export const claimLegacyTodosForSaiful = async (targetUserId: string) => {
  if (!db || !isConfigured || !targetUserId) return;
  const currentDb = db;
  try {
    const legacyQ = query(
      collection(currentDb, 'todos'),
      where('userEmail', '==', 'saiful@yopmail.com')
    );
    const snap = await getDocs(legacyQ);
    const updates = snap.docs
      .filter((d) => d.data().userId !== targetUserId)
      .map((d) => updateDoc(doc(currentDb, 'todos', d.id), { userId: targetUserId }));
    if (updates.length > 0) {
      await Promise.all(updates);
    }
  } catch (e) {
    console.warn('Error claiming legacy todos for saiful@yopmail.com:', e);
  }
};

export const subscribeToUserTasks = (
  userId: string | null, 
  onData: (tasks: Task[]) => void, 
  onError?: (err: any) => void
): Unsubscribe => {
  if (!db || !isConfigured || !userId) {
    onData([]);
    return () => {};
  }

  try {
    // Isolated per user account
    const q = query(
      collection(db, 'todos'),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as Task;
      });

      // In-memory sort by createdAt descending (avoids requiring composite indexes in Firestore)
      tasks.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      onData(tasks);
    }, (error) => {
      console.warn('Firestore subscription notice (tasks):', error);
      if (onError) onError(error);
    });
  } catch (err) {
    console.warn('Failed to query firestore tasks:', err);
    if (onError) onError(err);
    return () => {};
  }
};

export const addTaskToFirestore = async (taskData: Omit<Task, 'id'> & { id?: string }) => {
  if (!db || !isConfigured) throw new Error('Firebase DB is not initialized');
  const { id, ...cleanData } = taskData;
  return await addDoc(collection(db, 'todos'), {
    ...cleanData,
    createdAt: cleanData.createdAt || new Date().toISOString().split('T')[0],
    serverTimestamp: serverTimestamp()
  });
};

export const updateTaskInFirestore = async (taskId: string, updates: Partial<Task>) => {
  if (!db || !isConfigured) throw new Error('Firebase DB is not initialized');
  const { id, ...cleanUpdates } = updates;
  const taskRef = doc(db, 'todos', taskId);
  return await updateDoc(taskRef, {
    ...cleanUpdates,
    updatedAt: new Date().toISOString()
  });
};

export const deleteTaskFromFirestore = async (taskId: string) => {
  if (!db || !isConfigured) throw new Error('Firebase DB is not initialized');
  const taskRef = doc(db, 'todos', taskId);
  return await deleteDoc(taskRef);
};

/* --- Real-Time Firestore Assignees Master API --- */

export const subscribeToAssignees = (
  onData: (assignees: AssigneeMaster[]) => void, 
  onError?: (err: any) => void
): Unsubscribe => {
  if (!db || !isConfigured) return () => {};

  try {
    const q = query(collection(db, 'assignees'), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const assignees: AssigneeMaster[] = snapshot.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      } as AssigneeMaster));
      onData(assignees);
    }, (error) => {
      console.warn('Firestore assignees subscription notice:', error);
      if (onError) onError(error);
    });
  } catch (err) {
    console.warn('Failed to query assignees:', err);
    if (onError) onError(err);
    return () => {};
  }
};

export const addAssigneeToFirestore = async (assigneeData: { name: string; role?: string }) => {
  if (!db || !isConfigured) throw new Error('Firebase DB is not initialized');
  return await addDoc(collection(db, 'assignees'), {
    ...assigneeData,
    createdAt: new Date().toISOString()
  });
};

export const deleteAssigneeFromFirestore = async (assigneeId: string) => {
  if (!db || !isConfigured) throw new Error('Firebase DB is not initialized');
  const assigneeRef = doc(db, 'assignees', assigneeId);
  return await deleteDoc(assigneeRef);
};

/* --- User Preferences (Account Theme Palette) API --- */

export const saveUserPreferences = async (userId: string, prefs: UserPreferences) => {
  if (!db || !isConfigured || !userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { ...prefs, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn('Could not sync user preferences to Firestore:', err);
  }
};

export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  if (!db || !isConfigured || !userId) return null;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserPreferences;
    }
  } catch (err) {
    console.warn('Could not fetch user preferences from Firestore:', err);
  }
  return null;
};

/* --- Firebase Authentication Exports --- */

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
};
