<template>
  <div class="calendar-container">
    <vue-cal
      :time-from="7 * 60"
      :time-to="22 * 60"
      :disable-views="['years', 'year']"
      :events="events"
      :on-event-click="onEventClick"
      style="height: 100%"
    />
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { defineComponent } from 'vue';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import TaskService from '@/services/TaskService';
import { Task } from '@/models/Task';

interface CalendarEvent {
  start: Date;
  end: Date;
  title: string;
  content: string;
  class: string;
  taskId: string;
}

export default defineComponent({
  name: 'TaskCalendar',
  components: { VueCal },
  props: {
    selectedDate: {
      type: Date,
      default: () => new Date()
    }
  },
  setup(props, { emit }) {
    const taskService = TaskService.getInstance();
    const tasks = ref<Task[]>([]);
    
    const fetchTasks = async () => {
      tasks.value = await taskService.getAllTasks();
    };
    
    onMounted(() => {
      fetchTasks();
    });
    
    const events = computed(() => {
      return tasks.value.map(task => {
        const taskDate = new Date(task.dueDate);
        
        // Create end date 1 hour after start
        const endDate = new Date(taskDate);
        endDate.setHours(endDate.getHours() + 1);
        
        return {
          start: taskDate,
          end: endDate,
          title: task.title,
          content: task.description,
          class: task.completed ? 'task-completed' : 'task-pending',
          taskId: task.id
        } as CalendarEvent;
      });
    });
    
    const onEventClick = (event: CalendarEvent) => {
      const taskId = event.taskId;
      emit('task-selected', taskId);
    };
    
    // Refresh tasks when props change
    watch(() => props.selectedDate, fetchTasks);
    
    return {
      events,
      onEventClick
    };
  }
});
</script>

<style>
.calendar-container {
  height: 100%;
  width: 100%;
}

/* Task status styling */
.vuecal__event.task-completed {
  background-color: rgba(0, 128, 0, 0.2);
  border-left: 3px solid green;
}

.vuecal__event.task-pending {
  background-color: rgba(0, 149, 255, 0.2);
  border-left: 3px solid rgb(0, 149, 255);
}
</style> 