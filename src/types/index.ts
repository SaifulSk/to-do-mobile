export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface AssigneeInfo {
  name: string;
  avatar?: string;
  role?: string;
  email?: string;
}

export interface HelperInfo {
  name: string;
  topic?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt?: string;
  completedAt?: string | null;
  recurrence?: Recurrence | null;
  amount?: number | null;
  currency?: string | null;
  assignedTo?: AssigneeInfo | null;
  needHelpFrom?: HelperInfo | null;
  tags?: string[];
  userId?: string;
  userEmail?: string;
  updatedAt?: string;
}

export interface AssigneeMaster {
  id: string;
  name: string;
  role?: string;
  createdAt?: string;
}

export interface InAppNotification {
  id: string;
  taskId?: string;
  title: string;
  message: string;
  type: 'due' | 'overdue' | 'help' | 'completed' | 'info';
  timestamp: string;
  read: boolean;
}

export interface UserPreferences {
  palette?: string;
  defaultView?: 'list' | 'table' | 'calendar' | 'compact';
  theme?: 'dark' | 'light';
  updatedAt?: any;
}
