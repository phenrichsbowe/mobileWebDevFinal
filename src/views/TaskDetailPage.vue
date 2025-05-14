<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tasks"></ion-back-button>
        </ion-buttons>
        <ion-title>Task Details</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openEditTaskModal" color="primary" fill="clear">
            <ion-icon :icon="createOutline"></ion-icon>
          </ion-button>
          <ion-button @click="confirmDeleteTask" color="danger" fill="clear">
            <ion-icon :icon="trashOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="form-container">
        <div v-if="task">
          <ion-card class="task-detail-card md-elevation-2">
            <ion-card-header>
              <ion-card-title>{{ task.title }}</ion-card-title>
              <ion-card-subtitle>
                <ion-chip :color="task.completed ? 'success' : 'primary'">
                  <ion-label>{{ task.completed ? 'Completed' : 'Pending' }}</ion-label>
                </ion-chip>
              </ion-card-subtitle>
            </ion-card-header>
            
            <ion-card-content>
              <ion-list lines="none">
                <ion-item>
                  <ion-label>
                    <h2 class="section-title">Description</h2>
                    <p class="ion-text-wrap">{{ task.description || 'No description provided' }}</p>
                  </ion-label>
                </ion-item>
                
                <ion-item>
                  <ion-label>
                    <h2 class="section-title">Due Date</h2>
                    <p>{{ formattedDate }}</p>
                  </ion-label>
                </ion-item>
                
                <ion-item>
                  <ion-label>Reminder Set</ion-label>
                  <ion-toggle v-model="task.reminderSet" @ionChange="updateTaskReminder"></ion-toggle>
                </ion-item>
                
                <ion-item>
                  <ion-label>Completed</ion-label>
                  <ion-toggle v-model="task.completed" @ionChange="toggleTaskCompletion"></ion-toggle>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>
        </div>
        <div v-else class="loading-container">
          <ion-spinner></ion-spinner>
          <p>Loading task...</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { defineComponent } from 'vue';
import { onIonViewDidEnter,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonChip,
  IonSpinner,
  modalController,
  alertController,
  useIonRouter,
  useRoute
} from '@ionic/vue';
import { createOutline, trashOutline } from 'ionicons/icons';
import TaskForm from '@/components/TaskForm.vue';
import TaskService from '@/services/TaskService';
import { Task } from '@/models/Task';

export default defineComponent({
  name: 'TaskDetailPage',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonChip,
    IonSpinner
  },
  setup() {
    const route = useRoute();
    const router = useIonRouter();
    const taskId = route.params.id as string;
    const task = ref<Task | null>(null);
    const taskService = TaskService.getInstance();
    
    const formattedDate = computed(() => {
      if (!task.value) return '';
      
      const date = new Date(task.value.dueDate);
      return date.toLocaleString();
    });
    
    const loadTask = async () => {
      if (taskId) {
        task.value = await taskService.getTaskById(taskId);
      }
    };
    
    const toggleTaskCompletion = async () => {
      if (task.value) {
        await taskService.toggleTaskCompletion(task.value.id);
        await loadTask();
      }
    };
    
    const updateTaskReminder = async () => {
      if (task.value) {
        await taskService.updateTask(task.value);
      }
    };
    
    const openEditTaskModal = async () => {
      if (!task.value) return;
      
      const modal = await modalController.create({
        component: TaskForm,
        componentProps: {
          task: task.value
        }
      });
      
      modal.onDidDismiss().then(({ data }) => {
        if (data) {
          handleUpdateTask(data);
        }
      });
      
      await modal.present();
    };
    
    const handleUpdateTask = async (taskData: any) => {
      if (task.value) {
        const updatedTask: Task = {
          ...task.value,
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate,
          reminderSet: taskData.reminderSet
        };
        
        await taskService.updateTask(updatedTask);
        await loadTask();
      }
    };
    
    const confirmDeleteTask = async () => {
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
            handler: () => deleteTask()
          }
        ]
      });
      
      await alert.present();
    };
    
    const deleteTask = async () => {
      if (task.value) {
        await taskService.deleteTask(task.value.id);
        router.back();
      }
    };
    
    onIonViewDidEnter(() => {
      loadTask();
    });
    
    return {
      task,
      formattedDate,
      toggleTaskCompletion,
      updateTaskReminder,
      openEditTaskModal,
      confirmDeleteTask,
      createOutline,
      trashOutline
    };
  }
});
</script>

<style scoped>
ion-content {
  --background: #f5f5f5;
}

ion-toolbar {
  --background: var(--ion-color-primary);
  --color: var(--ion-color-primary-contrast);
}

ion-title {
  font-size: 20px;
  font-weight: 500;
}

.task-detail-card {
  margin: 0;
  border-radius: 8px;
}

ion-card-title {
  font-size: 22px;
  font-weight: 500;
  color: var(--ion-color-dark);
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

.section-title {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 8px;
  color: var(--ion-color-primary);
}

ion-card-content {
  padding-top: 0;
}

ion-list {
  padding: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--ion-color-medium);
}

ion-spinner {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: var(--ion-color-primary);
}

ion-toggle {
  --background: #e0e0e0;
  --background-checked: var(--ion-color-primary-shade);
  --handle-background: #ffffff;
  --handle-background-checked: #ffffff;
}

@media (min-width: 768px) {
  ion-content {
    --background: #f0f0f0;
  }
}
</style> 