<template>
  <ion-item :class="['task-item', { 'task-completed': task.completed }]">
    <ion-checkbox slot="start" 
                 :checked="task.completed" 
                 @ion-change="toggleComplete()"
                 aria-label="Task completion"></ion-checkbox>
    <ion-label>
      <h2>{{ task.title }}</h2>
      <p class="ion-text-wrap task-description">{{ task.description }}</p>
      <p><ion-note>{{ formattedDate }}</ion-note></p>
    </ion-label>
    <ion-buttons slot="end">
      <ion-button @click="editTask()" color="primary" fill="clear">
        <ion-icon :icon="createOutline"></ion-icon>
      </ion-button>
      <ion-button @click="deleteTask()" color="danger" fill="clear">
        <ion-icon :icon="trashOutline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-item>
</template>

<script lang="ts">
import { PropType, computed } from 'vue';
import { defineComponent } from 'vue';
import { IonItem, IonLabel, IonCheckbox, IonNote, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { createOutline, trashOutline } from 'ionicons/icons';
import { Task } from '@/models/Task';
import TaskService from '@/services/TaskService';

export default defineComponent({
  name: 'TaskItem',
  components: { IonItem, IonLabel, IonCheckbox, IonNote, IonButtons, IonButton, IonIcon },
  props: {
    task: {
      type: Object as PropType<Task>,
      required: true
    }
  },
  setup(props, { emit }) {
    const taskService = TaskService.getInstance();
    
    const formattedDate = computed(() => {
      const date = new Date(props.task.dueDate);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });
    
    const toggleComplete = async () => {
      await taskService.toggleTaskCompletion(props.task.id);
      emit('task-updated');
    };
    
    const editTask = () => {
      emit('edit-task', props.task);
    };
    
    const deleteTask = async () => {
      emit('delete-task', props.task.id);
    };
    
    return {
      formattedDate,
      toggleComplete,
      editTask,
      deleteTask,
      createOutline,
      trashOutline
    };
  }
});
</script>

<style scoped>
.task-completed h2, 
.task-completed p {
  text-decoration: line-through;
  opacity: 0.7;
}

.task-description {
  max-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

ion-checkbox {
  --border-radius: 50%;
  --size: 24px;
  --border-color: var(--ion-color-medium);
  --background-checked: var(--ion-color-primary);
  --border-color-checked: var(--ion-color-primary);
  margin: 0 12px 0 0;
}

ion-buttons {
  margin-right: -8px;
}

ion-button {
  height: 36px;
  width: 36px;
  --padding-start: 0;
  --padding-end: 0;
}
</style> 