<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import TaskService from '@/services/TaskService';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },
  setup() {
    onMounted(async () => {
      console.log('App initialized');
      
      // Initialize permissions for notifications
      try {
        console.log('Requesting notification permissions');
        await LocalNotifications.requestPermissions();
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
      }
      
      // Check if Preferences API is available
      try {
        console.log('Testing Preferences API');
        await Preferences.set({ key: 'test-key', value: 'test-value' });
        const { value } = await Preferences.get({ key: 'test-key' });
        console.log('Preferences API test result:', value);
      } catch (error) {
        console.error('Error testing Preferences API:', error);
      }
      
      // Initialize task service
      try {
        console.log('Initializing task service');
        await TaskService.getInstance().init();
        console.log('Task service initialized');
      } catch (error) {
        console.error('Error initializing task service:', error);
      }
    });
  }
});
</script>

<style>
/* Global styles */
.task-list-header {
  font-weight: bold;
  font-size: 1.2rem;
  margin: 10px 0;
}

ion-fab-button {
  --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
</style>
