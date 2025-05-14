export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO string format
  completed: boolean;
  reminderSet: boolean;
  notificationId?: string;
}

export function createNewTask(title: string, description: string, dueDate: string): Task {
  return {
    id: Date.now().toString(),
    title,
    description,
    dueDate,
    completed: false,
    reminderSet: false
  };
} 