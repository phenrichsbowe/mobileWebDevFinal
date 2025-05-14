import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Task, createNewTask } from '@/models/Task';

const TASKS_STORAGE_KEY = 'tasks';

export default class TaskService {
  private static instance: TaskService;
  private tasks: Task[] = [];
  private initialized = false;

  private constructor() {}

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  public async init(): Promise<void> {
    if (this.initialized) return;
    
    await this.loadTasks();
    this.initialized = true;
  }

  private async loadTasks(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: TASKS_STORAGE_KEY });
      console.log('Loaded tasks from storage:', value);
      if (value) {
        this.tasks = JSON.parse(value);
      } else {
        this.tasks = [];
        console.log('No tasks found in storage, initializing empty array');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.tasks = [];
    }
  }

  private async saveTasks(): Promise<void> {
    try {
      const tasksJson = JSON.stringify(this.tasks);
      console.log('Saving tasks to storage:', tasksJson);
      await Preferences.set({
        key: TASKS_STORAGE_KEY,
        value: tasksJson,
      });
      console.log('Tasks saved successfully');
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  public async getAllTasks(): Promise<Task[]> {
    await this.init();
    return [...this.tasks];
  }

  public async getTaskById(id: string): Promise<Task | undefined> {
    await this.init();
    return this.tasks.find(task => task.id === id);
  }

  public async getDailyTasks(date: Date): Promise<Task[]> {
    await this.init();
    console.log('Getting daily tasks for date:', date.toISOString());
    
    // Normalize the date by removing time component
    const dateString = date.toISOString().split('T')[0];
    console.log('Normalized date string:', dateString);
    
    const filteredTasks = this.tasks.filter(task => {
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      const matches = taskDate === dateString;
      console.log(`Task ${task.id} date: ${taskDate}, matches: ${matches}`);
      return matches;
    });
    
    console.log(`Found ${filteredTasks.length} tasks for ${dateString}`);
    return filteredTasks;
  }

  public async getWeeklyTasks(startDate: Date): Promise<Task[]> {
    await this.init();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    return this.tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= startDate && taskDate <= endDate;
    });
  }

  public async addTask(title: string, description: string, dueDate: string, reminderSet: boolean = false): Promise<Task> {
    await this.init();
    console.log('Adding new task:', { title, description, dueDate, reminderSet });
    
    const newTask = createNewTask(title, description, dueDate);
    newTask.reminderSet = reminderSet;
    
    this.tasks.push(newTask);
    await this.saveTasks();
    
    if (newTask.reminderSet) {
      await this.scheduleNotification(newTask);
    }
    
    return newTask;
  }

  public async updateTask(updatedTask: Task): Promise<void> {
    await this.init();
    const index = this.tasks.findIndex(t => t.id === updatedTask.id);
    
    if (index !== -1) {
      // Check if notification needs to be updated
      const oldTask = this.tasks[index];
      if (oldTask.reminderSet !== updatedTask.reminderSet || 
          oldTask.dueDate !== updatedTask.dueDate || 
          oldTask.title !== updatedTask.title) {
        
        // Cancel existing notification if exists
        if (oldTask.notificationId) {
          await this.cancelNotification(oldTask.notificationId);
        }
        
        // Schedule new notification if needed
        if (updatedTask.reminderSet) {
          await this.scheduleNotification(updatedTask);
        }
      }
      
      this.tasks[index] = updatedTask;
      await this.saveTasks();
    }
  }

  public async deleteTask(id: string): Promise<void> {
    await this.init();
    const taskToDelete = this.tasks.find(t => t.id === id);
    
    if (taskToDelete && taskToDelete.notificationId) {
      await this.cancelNotification(taskToDelete.notificationId);
    }
    
    this.tasks = this.tasks.filter(task => task.id !== id);
    await this.saveTasks();
  }

  public async toggleTaskCompletion(id: string): Promise<void> {
    await this.init();
    const task = this.tasks.find(t => t.id === id);
    
    if (task) {
      task.completed = !task.completed;
      await this.saveTasks();
    }
  }

  private async scheduleNotification(task: Task): Promise<void> {
    const dueDate = new Date(task.dueDate);
    
    // Schedule notification 30 minutes before due time
    const notificationTime = new Date(dueDate);
    notificationTime.setMinutes(notificationTime.getMinutes() - 30);
    
    // Only schedule if it's in the future
    if (notificationTime > new Date()) {
      const notificationId = Date.now();
      
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: 'Task Reminder',
            body: `Reminder: ${task.title} is due soon`,
            schedule: { at: notificationTime },
            sound: 'beep.wav',
            actionTypeId: '',
            extra: { taskId: task.id }
          }
        ]
      });
      
      // Save notification ID reference
      task.notificationId = notificationId.toString();
    }
  }

  private async cancelNotification(notificationId: string): Promise<void> {
    await LocalNotifications.cancel({
      notifications: [{ id: parseInt(notificationId, 10) }]
    });
  }
} 