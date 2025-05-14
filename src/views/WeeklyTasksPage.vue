<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Weekly View</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openNewTaskModal">
            <ion-icon :icon="addOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="week-selector md-elevation-1">
        <ion-button fill="clear" @click="previousWeek">
          <ion-icon slot="icon-only" :icon="chevronBackOutline"></ion-icon>
        </ion-button>
        <h3>{{ weekRangeText }}</h3>
        <ion-button fill="clear" @click="nextWeek">
          <ion-icon slot="icon-only" :icon="chevronForwardOutline"></ion-icon>
        </ion-button>
      </div>
      
      <ion-card class="calendar-card md-elevation-1">
        <task-calendar 
          :selected-date="weekStartDate" 
          @task-selected="onTaskSelected"
        />
      </ion-card>
      
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
  IonButtons,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  modalController,
  alertController,
  useIonRouter
} from '@ionic/vue';
import { addOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import TaskCalendar from '@/components/TaskCalendar.vue';
import TaskForm from '@/components/TaskForm.vue';
import TaskService from '@/services/TaskService';
import { Task } from '@/models/Task';

export default defineComponent({
  name: 'WeeklyTasksPage',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    TaskCalendar
  },
  setup() {
    const weekStartDate = ref(getStartOfWeek(new Date()));
    const taskService = TaskService.getInstance();
    const router = useIonRouter();
    
    // Get the start of the week (Sunday)
    function getStartOfWeek(date: Date): Date {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day;
      const newDate = new Date(d.setDate(diff));
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    }
    
    const weekEndDate = computed(() => {
      const endDate = new Date(weekStartDate.value);
      endDate.setDate(endDate.getDate() + 6);
      return endDate;
    });
    
    const weekRangeText = computed(() => {
      const start = weekStartDate.value.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      const end = weekEndDate.value.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return `${start} - ${end}`;
    });
    
    const previousWeek = () => {
      const newStartDate = new Date(weekStartDate.value);
      newStartDate.setDate(newStartDate.getDate() - 7);
      weekStartDate.value = newStartDate;
    };
    
    const nextWeek = () => {
      const newStartDate = new Date(weekStartDate.value);
      newStartDate.setDate(newStartDate.getDate() + 7);
      weekStartDate.value = newStartDate;
    };
    
    const openNewTaskModal = async () => {
      const modal = await modalController.create({
        component: TaskForm,
        componentProps: {
          initialDueDate: new Date().toISOString()
        }
      });
      
      modal.onDidDismiss().then(({ data }) => {
        if (data) {
          handleSaveTask(data);
        }
      });
      
      await modal.present();
    };
    
    const handleSaveTask = async (taskData: any) => {
      if (!taskData) return;
      
      await taskService.addTask(
        taskData.title,
        taskData.description,
        taskData.dueDate,
        taskData.reminderSet
      );
    };
    
    const onTaskSelected = async (taskId: string) => {
      const task = await taskService.getTaskById(taskId);
      if (task) {
        router.navigate(`/tabs/task/${taskId}`);
      }
    };
    
    onIonViewDidEnter(() => {
      // Calendar component will handle loading tasks
    });
    
    return {
      weekStartDate,
      weekRangeText,
      previousWeek,
      nextWeek,
      openNewTaskModal,
      onTaskSelected,
      addOutline,
      chevronBackOutline,
      chevronForwardOutline
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

ion-fab {
  margin-bottom: 16px;
  margin-right: 16px;
}

.week-selector {
  margin-bottom: 8px;
}

@media (min-width: 768px) {
  ion-content {
    --background: #f0f0f0;
  }
}
</style> 