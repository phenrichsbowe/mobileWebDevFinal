<template>
  <div class="calendar-container">
    <vue-cal
      ref="vueCal"
      :time-from="7 * 60"
      :time-to="22 * 60"
      :disable-views="['years', 'year']"
      :events="events"
      :on-event-click="onEventClick"
      :selected-date="selectedDate"
      :time-step="30"
      default-view="week"
      style="height: 100%"
      hide-weekends
      today-button
      @ready="onCalendarReady"
      @view-change="onViewChange"
    />
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, watch, defineExpose } from 'vue';
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
    const vueCal = ref(null);
    
    const fetchTasks = async () => {
      console.log('Fetching all tasks for calendar');
      tasks.value = await taskService.getAllTasks();
      console.log(`Retrieved ${tasks.value.length} tasks for calendar`);
      
      // Log task details for debugging
      tasks.value.forEach(task => {
        console.log(`Task: ${task.title}, Date: ${task.dueDate}, Completed: ${task.completed}`);
      });
    };
    
    const onCalendarReady = () => {
      console.log('Calendar component ready');
      fetchTasks();
    };
    
    const onViewChange = (view, startDate, endDate) => {
      console.log('Calendar view changed:', view, 'Start:', startDate, 'End:', endDate);
    };
    
    // Refresh method that can be called from parent
    const refreshCalendar = async () => {
      console.log('Refresh calendar called');
      await fetchTasks();
      
      // Force reactive update by creating a new events array
      const updatedEvents = [...events.value];
      console.log('Updated events after refresh:', updatedEvents);
      
      // Make sure the calendar component refreshes
      if (vueCal.value) {
        // @ts-expect-error - Vue-Cal's typings aren't complete
        console.log('Refreshing calendar events via vueCal instance');
        vueCal.value.refreshEvents();
        
        // Force view update
        const currentView = vueCal.value.view.id;
        const currentDate = vueCal.value.view.startDate || props.selectedDate;
        console.log('Refreshing view:', currentView, 'with date:', currentDate);
        vueCal.value.switchView(currentView, currentDate);
      } else {
        console.warn('VueCal reference not available - calendar might not refresh properly');
      }
    };
    
    // Expose refresh method to parent via defineExpose
    defineExpose({ refreshCalendar });
    
    onMounted(async () => {
      console.log('TaskCalendar component mounted, selectedDate:', props.selectedDate);
      await fetchTasks();
    });
    
    // Watch for global task changes
    watch(() => taskService.getAllTasks(), async () => {
      console.log('Tasks may have changed, refreshing calendar');
      await fetchTasks();
    });
    
    // Update calendar view when selectedDate changes
    watch(() => props.selectedDate, (newDate) => {
      console.log('Calendar selected date changed to:', newDate);
      if (vueCal.value) {
        // @ts-expect-error - Vue-Cal's typings aren't complete
        vueCal.value.switchView(vueCal.value.view.id, newDate);
      }
      fetchTasks();
    }, { deep: true });
    
    const events = computed(() => {
      console.log('Computing calendar events from tasks:', tasks.value);
      
      return tasks.value.map(task => {
        // Ensure proper date parsing with explicit date object creation
        let taskDate = new Date(task.dueDate);
        
        // Verify date is valid, if not try to parse it differently
        if (isNaN(taskDate.getTime())) {
          console.warn(`Invalid date format for task ${task.id}: ${task.dueDate}, trying alternative parsing`);
          // Try to handle different date formats if the standard parsing fails
          const dateParts = task.dueDate.split(/[- :T.Z]/);
          taskDate = new Date(Date.UTC(
            parseInt(dateParts[0]), 
            parseInt(dateParts[1]) - 1, 
            parseInt(dateParts[2]), 
            parseInt(dateParts[3] || '0'), 
            parseInt(dateParts[4] || '0')
          ));
        }
        
        console.log(`Processing task: ${task.title}, original date: ${task.dueDate}, parsed date: ${taskDate.toISOString()}`);
        
        // Create end date 1 hour after start
        const endDate = new Date(taskDate);
        endDate.setHours(endDate.getHours() + 1);
        
        const event = {
          start: taskDate,
          end: endDate,
          title: task.title,
          content: task.description || '',
          class: task.completed ? 'task-completed' : 'task-pending',
          taskId: task.id
        } as CalendarEvent;
        
        console.log('Created calendar event:', event);
        return event;
      });
    });
    
    const onEventClick = (event: CalendarEvent) => {
      const taskId = event.taskId;
      emit('task-selected', taskId);
    };
    
    return {
      events,
      onEventClick,
      onCalendarReady,
      onViewChange,
      vueCal
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
.vuecal__event {
  padding: 10px;
  min-height: 60px;
  border-radius: 4px;
  margin: 2px 0;
  overflow: visible !important; /* Ensure events are not cut off */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15); /* Add shadow for better visibility */
  position: relative; /* Ensure z-index works properly */
  z-index: 2; /* Show above grid lines */
}

.vuecal__event-title {
  font-weight: bold;
  font-size: 14px;
  line-height: 1.3;
  overflow: visible; /* Ensure text is not cut off */
  white-space: normal; /* Allow text to wrap */
}

.vuecal__event-content {
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.2;
}

.vuecal__event.task-completed {
  background-color: rgba(76, 175, 80, 0.3); /* Increased opacity */
  border-left: 4px solid var(--ion-color-success);
}

.vuecal__event.task-pending {
  background-color: rgba(66, 133, 244, 0.3); /* Increased opacity */
  border-left: 4px solid var(--ion-color-primary);
}

/* Make sure cells have proper z-index */
.vuecal__cell {
  padding: 2px 3px;
  position: relative;
  z-index: 1;
}

.vuecal__cell-content {
  padding: 4px;
  min-height: 60px; /* Ensure cells have minimum height */
}

/* Fixed time cells */
.vuecal__time-cell {
  font-size: 12px;
  text-align: center;
}

/* Force events to display */
.vuecal:deep(.vuecal__bg-events),
.vuecal:deep(.vuecal__fg-events) {
  pointer-events: auto;
  overflow: visible !important;
}

/* Responsive calendar */
@media (max-width: 768px) {
  .vuecal__time-cell {
    font-size: 11px;
    width: 40px;
  }
  
  .vuecal__header {
    padding: 5px;
  }
  
  .vuecal__weekdays-headings {
    margin-bottom: 0;
  }
}
</style> 