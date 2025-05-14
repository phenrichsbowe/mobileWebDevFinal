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
      
      // Initialize theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Check if user has manually set theme preference
      try {
        const { value } = await Preferences.get({ key: 'theme-preference' });
        console.log('App: Retrieved theme preference:', value);
        
        if (value === 'dark') {
          console.log('App: Applying dark theme from stored preference');
          document.body.classList.add('dark');
          document.body.classList.remove('light');
        } else if (value === 'light') {
          console.log('App: Applying light theme from stored preference');
          document.body.classList.remove('dark');
          document.body.classList.add('light');
        } else if (prefersDark.matches) {
          // If no preference saved but system is dark, use dark mode
          console.log('App: No stored preference, using system dark mode');
          document.body.classList.add('dark');
          document.body.classList.remove('light');
          // Save this preference
          await Preferences.set({
            key: 'theme-preference',
            value: 'dark'
          });
        } else {
          // Explicitly set light mode if no preference and system is light
          console.log('App: No stored preference, using light mode');
          document.body.classList.remove('dark');
          document.body.classList.add('light');
          // Save this preference
          await Preferences.set({
            key: 'theme-preference', 
            value: 'light'
          });
        }
      } catch (error) {
        console.error('Error getting theme preference:', error);
        // Fallback to system preference
        if (prefersDark.matches) {
          document.body.classList.add('dark');
          document.body.classList.remove('light');
        } else {
          document.body.classList.remove('dark');
          document.body.classList.add('light');
        }
      }
      
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
