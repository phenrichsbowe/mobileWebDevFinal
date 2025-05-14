<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEdit ? 'Edit Task' : 'New Task' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list class="form-list">
        <ion-item>
          <ion-input
            label="Title"
            labelPlacement="stacked"
            placeholder="Task title"
            v-model="title"
            required
            class="form-input"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-textarea
            label="Description"
            labelPlacement="stacked"
            placeholder="Task description"
            v-model="description"
            :rows="4"
            class="form-input"
          ></ion-textarea>
        </ion-item>
        <ion-item class="datetime-item">
          <ion-label position="stacked">Due Date</ion-label>
          <ion-datetime-button datetime="datetime" class="datetime-button"></ion-datetime-button>
          <ion-modal :keep-contents-mounted="true">
            <ion-datetime
              id="datetime"
              presentation="date-time"
              v-model="dueDate"
              first-day-of-week="1"
            ></ion-datetime>
          </ion-modal>
        </ion-item>
        <ion-item>
          <ion-label>Set Reminder</ion-label>
          <ion-toggle v-model="reminderSet"></ion-toggle>
        </ion-item>
      </ion-list>
      
      <div class="button-container">
        <ion-button color="medium" expand="block" @click="dismiss()">Cancel</ion-button>
        <ion-button color="primary" expand="block" @click="save()" :disabled="!isFormValid">Save</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { PropType, ref, computed, onMounted } from 'vue';
import { defineComponent } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonLabel,
  IonButton,
  IonToggle,
  IonDatetimeButton,
  IonDatetime,
  IonModal,
  modalController
} from '@ionic/vue';
import { Task } from '@/models/Task';

export default defineComponent({
  name: 'TaskForm',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonTextarea,
    IonLabel,
    IonButton,
    IonToggle,
    IonDatetimeButton,
    IonDatetime,
    IonModal
  },
  props: {
    task: {
      type: Object as PropType<Task>,
      default: null
    },
    initialDueDate: {
      type: String,
      default: () => new Date().toISOString()
    }
  },
  setup(props) {
    const title = ref('');
    const description = ref('');
    const dueDate = ref(props.initialDueDate);
    const reminderSet = ref(false);
    
    const isEdit = computed(() => !!props.task);
    
    const isFormValid = computed(() => {
      return title.value.trim().length > 0 && dueDate.value;
    });
    
    onMounted(() => {
      if (props.task) {
        title.value = props.task.title;
        description.value = props.task.description;
        dueDate.value = props.task.dueDate;
        reminderSet.value = props.task.reminderSet;
      }
    });
    
    const save = () => {
      const taskData = {
        title: title.value,
        description: description.value,
        dueDate: dueDate.value,
        reminderSet: reminderSet.value
      };
      
      modalController.dismiss(taskData);
    };
    
    const dismiss = () => {
      modalController.dismiss();
    };
    
    return {
      title,
      description,
      dueDate,
      reminderSet,
      isEdit,
      isFormValid,
      save,
      dismiss
    };
  }
});
</script>

<style scoped>
:host {
  --width: 90%;
  --max-width: 400px;
  --height: auto;
  --max-height: 90%;
  --border-radius: 16px;
  --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

ion-toolbar {
  --background: var(--ion-background-color);
  --color: var(--ion-text-color);
  --border-color: var(--ion-border-color);
  --border-width: 0 0 1px 0;
  --border-style: solid;
}

ion-title {
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
}

ion-content {
  --background: #f5f5f5;
}

.task-form-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.form-list {
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 20px;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.button-container {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  padding: 0 4px;
}

ion-button {
  margin: 0;
  --border-radius: 10px;
  --box-shadow: none;
  flex: 1;
}

ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  --background: transparent;
  --border-color: rgba(0, 0, 0, 0.08);
}

ion-label {
  color: var(--ion-color-dark);
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 8px;
}

.form-input {
  margin-top: 8px;
  --padding-start: 0;
  --placeholder-color: var(--ion-color-medium);
  --placeholder-opacity: 0.6;
}

.datetime-item {
  --inner-padding-end: 0;
}

.datetime-button {
  margin-top: 8px;
}

ion-toggle {
  --background: #e0e0e0;
  --background-checked: var(--ion-color-primary-shade);
  --handle-background: #ffffff;
  --handle-background-checked: #ffffff;
}

ion-datetime {
  --background: #ffffff;
  border-radius: 8px;
}
</style> 