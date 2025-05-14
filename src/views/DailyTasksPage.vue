<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Daily Tasks</ion-title>
        <ion-buttons slot="end">
          <ion-button id="open-date-modal">
            <ion-icon :icon="calendarOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="date-container md-elevation-1">
        <ion-button fill="clear" @click="previousDay">
          <ion-icon slot="icon-only" :icon="chevronBackOutline"></ion-icon>
        </ion-button>
        <h3>{{ formattedDate }}</h3>
        <ion-button fill="clear" @click="nextDay">
          <ion-icon slot="icon-only" :icon="chevronForwardOutline"></ion-icon>
        </ion-button>
      </div>
      
      <div class="task-list-container">
        <ion-list v-if="dailyTasks.length > 0">
          <task-item
            v-for="task in dailyTasks"
            :key="task.id"
            :task="task"
            @task-updated="loadDailyTasks"
            @edit-task="openEditTaskModal"
            @delete-task="confirmDeleteTask"
          />
        </ion-list>
        
        <div v-else class="empty-state">
          <p>No tasks scheduled for {{ formattedDate }}</p>
          <ion-button expand="block" color="primary" @click="openNewTaskModal">Add Task</ion-button>
        </div>
      </div>
      
      <ion-modal
        trigger="open-date-modal"
        :keep-contents-mounted="true"
      >
        <ion-datetime
          presentation="date"
          v-model="selectedDateString"
          :value="selectedDateString"
          @ionChange="onDateChange"
        ></ion-datetime>
      </ion-modal>
      
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openNewTaskModal" color="primary">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
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
  IonList,
  IonButtons,
  IonButton,
  IonIcon,
  IonModal,
  IonDatetime,
  modalController,
  alertController,
  IonFab,
  IonFabButton
} from '@ionic/vue';
import { calendarOutline, chevronBackOutline, chevronForwardOutline, addOutline } from 'ionicons/icons';
import TaskItem from '@/components/TaskItem.vue';
import TaskForm from '@/components/TaskForm.vue';
import TaskService from '@/services/TaskService';
import { Task } from '@/models/Task';

export default defineComponent({
  name: 'DailyTasksPage',
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
    IonModal,
    IonDatetime,
    IonFab,
    IonFabButton,
    TaskItem
  },
  setup() {
    const selectedDate = ref(new Date());
    const dailyTasks = ref<Task[]>([]);
    const taskService = TaskService.getInstance();
    
    const selectedDateString = computed({
      get: () => selectedDate.value.toISOString(),
      set: (val) => {
        selectedDate.value = new Date(val);
      }
    });
    
    const formattedDate = computed(() => {
      return selectedDate.value.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });
    
    const loadDailyTasks = async () => {
      dailyTasks.value = await taskService.getDailyTasks(selectedDate.value);
    };
    
    const previousDay = () => {
      const newDate = new Date(selectedDate.value);
      newDate.setDate(newDate.getDate() - 1);
      selectedDate.value = newDate;
      loadDailyTasks();
    };
    
    const nextDay = () => {
      const newDate = new Date(selectedDate.value);
      newDate.setDate(newDate.getDate() + 1);
      selectedDate.value = newDate;
      loadDailyTasks();
    };
    
    const onDateChange = (event: CustomEvent) => {
      selectedDate.value = new Date(event.detail.value);
      loadDailyTasks();
    };
    
    const openNewTaskModal = async () => {
      const dateForTask = new Date(selectedDate.value);
      dateForTask.setHours(12, 0, 0, 0);
      
      const modal = await modalController.create({
        component: TaskForm,
        componentProps: {
          initialDueDate: dateForTask.toISOString()
        },
        backdropDismiss: false,
        animated: true
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
        },
        backdropDismiss: false,
        animated: true
      });
      
      modal.onDidDismiss().then(({ data }) => {
        if (data) {
          handleUpdateTask(task.id, data);
        }
      });
      
      await modal.present();
    };
    
    const handleSaveTask = async (taskData: any) => {
      if (!taskData) return;
      
      console.log('Creating task with date:', taskData.dueDate);
      
      await taskService.addTask(
        taskData.title,
        taskData.description,
        taskData.dueDate,
        taskData.reminderSet
      );
      
      await loadDailyTasks();
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
        await loadDailyTasks();
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
      await loadDailyTasks();
    };
    
    onIonViewDidEnter(() => {
      loadDailyTasks();
    });
    
    return {
      selectedDate,
      selectedDateString,
      formattedDate,
      dailyTasks,
      loadDailyTasks,
      previousDay,
      nextDay,
      onDateChange,
      openNewTaskModal,
      openEditTaskModal,
      confirmDeleteTask,
      calendarOutline,
      chevronBackOutline,
      chevronForwardOutline,
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

.date-container {
  margin-bottom: 8px;
}

ion-datetime {
  --background: #ffffff;
  border-radius: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

@media (min-width: 768px) {
  ion-content {
    --background: #f0f0f0;
  }
}
</style> 