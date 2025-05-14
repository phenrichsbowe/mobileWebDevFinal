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
          ref="calendar"
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
import { ref, computed, onMounted } from 'vue';
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
  IonCard,
  modalController,
  useIonRouter
} from '@ionic/vue';
import { addOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import TaskCalendar from '@/components/TaskCalendar.vue';
import TaskForm from '@/components/TaskForm.vue';
import TaskService from '@/services/TaskService';

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
    IonCard,
    TaskCalendar
  },
  setup() {
    const weekStartDate = ref(getStartOfWeek(new Date()));
    const taskService = TaskService.getInstance();
    const router = useIonRouter();
    const calendar = ref(null);
    
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
      console.log('Navigated to previous week:', newStartDate.toISOString());
    };
    
    const nextWeek = () => {
      const newStartDate = new Date(weekStartDate.value);
      newStartDate.setDate(newStartDate.getDate() + 7);
      weekStartDate.value = newStartDate;
      console.log('Navigated to next week:', newStartDate.toISOString());
    };
    
    const openNewTaskModal = async () => {
      // Use current week's middle day (Wednesday) as default
      const dateForTask = new Date(weekStartDate.value);
      dateForTask.setDate(dateForTask.getDate() + 3); // Wednesday of current week
      dateForTask.setHours(12, 0, 0, 0); // Set to noon
      
      console.log('Opening task modal with date:', dateForTask.toISOString());
      
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
    
    const handleSaveTask = async (taskData: any) => {
      if (!taskData) return;
      
      await taskService.addTask(
        taskData.title,
        taskData.description,
        taskData.dueDate,
        taskData.reminderSet
      );
      
      // Refresh the calendar after adding a task
      if (calendar.value && 'refreshCalendar' in calendar.value) {
        setTimeout(async () => {
          await (calendar.value as any).refreshCalendar();
        }, 300);
      }
    };
    
    const onTaskSelected = async (taskId: string) => {
      const task = await taskService.getTaskById(taskId);
      if (task) {
        router.navigate(`/tabs/task/${taskId}`);
      }
    };
    
    onIonViewDidEnter(() => {
      // Refresh calendar on re-entering the view
      if (calendar.value && 'refreshCalendar' in calendar.value) {
        (calendar.value as any).refreshCalendar();
      }
    });
    
    // Initial setup
    onMounted(() => {
      if (calendar.value && 'refreshCalendar' in calendar.value) {
        (calendar.value as any).refreshCalendar();
      }
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
      chevronForwardOutline,
      calendar
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
  padding: 12px;
  background-color: var(--ion-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 8px 12px 8px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.week-selector h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.calendar-card {
  margin: 0 8px 16px 8px;
  padding: 0;
  height: calc(100% - 90px);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  ion-content {
    --background: #f0f0f0;
  }

  .week-selector {
    max-width: 720px;
    margin: 12px auto;
    padding: 16px;
  }

  .week-selector h3 {
    font-size: 18px;
  }

  .calendar-card {
    max-width: 720px;
    margin: 0 auto 24px auto;
    height: calc(100% - 100px);
  }
}
</style> 