<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>My Tasks</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openNewTaskModal">
            <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="refreshTasks($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      
      <div class="task-list-container">
        <ion-list v-if="tasks.length > 0">
          <task-item
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            @task-updated="loadTasks"
            @edit-task="openEditTaskModal"
            @delete-task="confirmDeleteTask"
          />
        </ion-list>
        
        <div v-else class="empty-state">
          <p>No tasks yet. Create your first task!</p>
          <ion-button expand="block" color="primary" @click="openNewTaskModal">Create Task</ion-button>
        </div>
      </div>
      
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openNewTaskModal" color="primary">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { ref } from 'vue';
import { defineComponent } from 'vue';
import { onIonViewDidEnter,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonButtons,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  modalController,
  alertController
} from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import TaskItem from '@/components/TaskItem.vue';
import TaskForm from '@/components/TaskForm.vue';
import TaskService from '@/services/TaskService';
import { Task } from '@/models/Task';

export default defineComponent({
  name: 'TasksPage',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonButtons,
    IonButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    TaskItem
  },
  setup() {
    const tasks = ref<Task[]>([]);
    const taskService = TaskService.getInstance();
    
    const loadTasks = async () => {
      tasks.value = await taskService.getAllTasks();
    };
    
    const refreshTasks = async (event: CustomEvent) => {
      await loadTasks();
      setTimeout(() => {
        event.target.complete();
      }, 1000);
    };
    
    const openNewTaskModal = async () => {
      const modal = await modalController.create({
        component: TaskForm
      });
      
      modal.onDidDismiss().then(({ data }) => {
        if (data) {
          handleSaveTask(data);
        }
      });
      
      await modal.present();
    };
    
    const openEditTaskModal = async (task: Task) => {
      const modal = await modalController.create({
        component: TaskForm,
        componentProps: {
          task
        }
      });
      
      modal.onDidDismiss().then(({ data }) => {
        if (data) {
          handleUpdateTask(task.id, data);
        }
      });
      
      await modal.present();
    };
    
    const handleSaveTask = async (taskData: any) => {
      console.log('Task data received:', taskData);
      if (!taskData) {
        console.error('No task data received');
        return;
      }
      
      try {
        await taskService.addTask(
          taskData.title,
          taskData.description,
          taskData.dueDate,
          taskData.reminderSet
        );
        console.log('Task added successfully');
        await loadTasks();
      } catch (error) {
        console.error('Error adding task:', error);
      }
    };
    
    const handleUpdateTask = async (taskId: string, taskData: any) => {
      const task = await taskService.getTaskById(taskId);
      if (task) {
        const updatedTask: Task = {
          ...task,
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate,
          reminderSet: taskData.reminderSet
        };
        
        await taskService.updateTask(updatedTask);
        await loadTasks();
      }
    };
    
    const confirmDeleteTask = async (taskId: string) => {
      const alert = await alertController.create({
        header: 'Confirm Deletion',
        message: 'Are you sure you want to delete this task?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: () => deleteTask(taskId)
          }
        ]
      });
      
      await alert.present();
    };
    
    const deleteTask = async (taskId: string) => {
      await taskService.deleteTask(taskId);
      await loadTasks();
    };
    
    onIonViewDidEnter(() => {
      loadTasks();
    });
    
    return {
      tasks,
      loadTasks,
      refreshTasks,
      openNewTaskModal,
      openEditTaskModal,
      confirmDeleteTask,
      addOutline
    };
  }
});
</script>

<style scoped>
ion-content {
  --background: #f5f5f5;
}

ion-list {
  background: transparent;
  padding: 8px 0;
}

ion-toolbar {
  --background: var(--ion-color-primary);
  --color: var(--ion-color-primary-contrast);
}

ion-title {
  font-size: 20px;
  font-weight: 500;
}

ion-fab {
  margin-bottom: 16px;
  margin-right: 16px;
}

@media (max-width: 576px) {
  ion-fab {
    margin-bottom: 16px;
    margin-right: 16px;
  }
}

@media (min-width: 768px) {
  ion-content {
    --background: #f0f0f0;
  }
}
</style> 