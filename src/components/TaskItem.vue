<template>
  <ion-item :class="['task-item', { 'task-completed': isCompleted }]">
    <ion-checkbox slot="start" 
                :checked="isCompleted" 
                @ion-change="toggleComplete()"
                aria-label="Task completion"></ion-checkbox>
    <ion-label>
      <h2>
        {{ task.title }}
        <ion-badge v-if="task.reminderSet && !isCompleted" color="secondary" class="reminder-badge">
          <ion-icon :icon="notificationsOutline" size="small"></ion-icon>
          Reminder
        </ion-badge>
      </h2>
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
import { PropType, computed, ref, watch } from 'vue';
import { defineComponent } from 'vue';
import { IonItem, IonLabel, IonCheckbox, IonNote, IonButtons, IonButton, IonIcon, IonBadge } from '@ionic/vue';
import { createOutline, trashOutline, notificationsOutline } from 'ionicons/icons';
import { Task } from '@/models/Task';
import TaskService from '@/services/TaskService';

export default defineComponent({
  name: 'TaskItem',
  components: { IonItem, IonLabel, IonCheckbox, IonNote, IonButtons, IonButton, IonIcon, IonBadge },
  props: {
    task: {
      type: Object as PropType<Task>,
      required: true
    }
  },
  setup(props, { emit }) {
    const taskService = TaskService.getInstance();
    const isCompleted = ref(props.task.completed);
    
    // Keep local state in sync with prop changes
    watch(() => props.task.completed, (newValue) => {
      isCompleted.value = newValue;
    });
    
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
      // Update local reactive state immediately
      isCompleted.value = !isCompleted.value;
      emit('task-updated');
    };
    
    const editTask = () => {
      emit('edit-task', props.task);
    };
    
    const deleteTask = async () => {
      emit('delete-task', props.task.id);
    };
    
    return {
      isCompleted,
      formattedDate,
      toggleComplete,
      editTask,
      deleteTask,
      createOutline,
      trashOutline,
      notificationsOutline
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
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.reminder-badge {
  font-size: 0.7rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  margin-left: 8px;
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
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