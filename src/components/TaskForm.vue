<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="dismiss()" fill="clear">Cancel</ion-button>
      </ion-buttons>
      <ion-title>{{ isEdit ? 'Edit Task' : 'New Task' }}</ion-title>
      <ion-buttons slot="end">
        <ion-button :strong="true" @click="save()" :disabled="!isFormValid" color="primary" fill="clear">Save</ion-button>
      </ion-buttons>
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
  </ion-content>
</template>

<script lang="ts">
import { PropType, ref, computed, onMounted } from 'vue';
import { defineComponent } from 'vue';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonLabel,
  IonButtons,
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
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonTextarea,
    IonLabel,
    IonButtons,
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
  setup(props, { emit }) {
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
ion-toolbar {
  --background: var(--ion-color-primary);
  --color: var(--ion-color-primary-contrast);
}

ion-title {
  font-size: 20px;
  font-weight: 500;
}

ion-content {
  --background: #f5f5f5;
}

.form-list {
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 0;
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