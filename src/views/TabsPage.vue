<template>
  <ion-page>
    <ion-menu content-id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>Task Manager</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list>
          <ion-item button router-link="/tabs/tasks">
            <ion-icon :icon="listOutline" slot="start"></ion-icon>
            <ion-label>All Tasks</ion-label>
          </ion-item>
          <ion-item button router-link="/tabs/daily">
            <ion-icon :icon="todayOutline" slot="start"></ion-icon>
            <ion-label>Daily Tasks</ion-label>
          </ion-item>
          <ion-item button router-link="/tabs/weekly">
            <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
            <ion-label>Weekly Tasks</ion-label>
          </ion-item>
          <ion-item-divider>
            <ion-label>Settings</ion-label>
          </ion-item-divider>
          <ion-item>
            <ion-icon :icon="moonOutline" slot="start"></ion-icon>
            <ion-label>Dark Mode</ion-label>
            <ion-toggle @ionChange="handleDarkModeToggle" :checked="darkMode" slot="end"></ion-toggle>
          </ion-item>
          <ion-item button @click="clearAllTasks">
            <ion-icon :icon="trashOutline" slot="start" color="danger"></ion-icon>
            <ion-label>Clear All Tasks</ion-label>
          </ion-item>
          <ion-item button @click="showAbout">
            <ion-icon :icon="informationCircleOutline" slot="start"></ion-icon>
            <ion-label>About</ion-label>
          </ion-item>
          <ion-item button @click="sendTestNotification">
            <ion-icon :icon="notificationsOutline" slot="start" color="warning"></ion-icon>
            <ion-label>Test Notification</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-page id="main-content" ref="mainContentRef" tabindex="0">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>Task Manager</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-tabs>
        <ion-router-outlet></ion-router-outlet>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="tasks" href="/tabs/tasks">
            <ion-icon :icon="listOutline" />
            <ion-label>Tasks</ion-label>
          </ion-tab-button>
          
          <ion-tab-button tab="daily" href="/tabs/daily">
            <ion-icon :icon="todayOutline" />
            <ion-label>Daily</ion-label>
          </ion-tab-button>
          
          <ion-tab-button tab="weekly" href="/tabs/weekly">
            <ion-icon :icon="calendarOutline" />
            <ion-label>Weekly</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-page>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { 
  IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet,
  IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonMenuButton, IonButtons, IonToggle, IonItemDivider, alertController, toastController
} from '@ionic/vue';
import { 
  listOutline, todayOutline, calendarOutline, moonOutline, 
  trashOutline, informationCircleOutline, notificationsOutline 
} from 'ionicons/icons';
import TaskService from '@/services/TaskService';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';

export default defineComponent({
  name: 'TabsPage',
  components: { 
    IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet,
    IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
    IonMenuButton, IonButtons, IonToggle, IonItemDivider
  },
  setup() {
    const darkMode = ref(false);
    const taskService = TaskService.getInstance();
    const mainContentRef = ref<HTMLElement | null>(null);

    // Initialize dark mode based on existing class or system preference
    onMounted(async () => {
      try {
        // First check if there's a stored preference
        const { value } = await Preferences.get({ key: 'theme-preference' });
        console.log('Retrieved theme preference:', value);
        
        if (value === 'dark') {
          darkMode.value = true;
          document.body.classList.add('dark');
          document.body.classList.remove('light');
        } else if (value === 'light') {
          darkMode.value = false;
          document.body.classList.add('light');
          document.body.classList.remove('dark');
        } else {
          // If no preference stored, check if body already has dark class (set by system)
          if (document.body.classList.contains('dark')) {
            darkMode.value = true;
          } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
            if (prefersDark.matches) {
              darkMode.value = true;
              document.body.classList.add('dark');
            }
          }
        }
      } catch (error) {
        console.error('Error retrieving theme preference:', error);
        // Fallback to checking if dark mode is already applied
        if (document.body.classList.contains('dark')) {
          darkMode.value = true;
        }
      }
      
      // Add global event listener for tab changes
      document.addEventListener('ionTabsWillChange', () => {
        // Ensure no elements in hidden tabs retain focus
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        
        // Move focus to main content area after tab change
        setTimeout(() => {
          const mainContent = document.querySelector('#main-content');
          if (mainContent && mainContent instanceof HTMLElement) {
            mainContent.focus();
          }
        }, 50);
      });
    });

    const handleDarkModeToggle = async (event: CustomEvent) => {
      const isChecked = event.detail.checked;
      console.log('Dark mode toggle changed to:', isChecked);
      
      // Set value directly instead of toggling
      darkMode.value = isChecked;
      
      // Apply changes to DOM
      if (darkMode.value) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      } else {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      }
      
      // Save preference
      try {
        const themeValue = darkMode.value ? 'dark' : 'light';
        await Preferences.set({
          key: 'theme-preference',
          value: themeValue
        });
        console.log('Theme preference saved:', themeValue);
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    };

    const toggleDarkMode = async () => {
      darkMode.value = !darkMode.value;
      console.log('Dark mode toggled to:', darkMode.value);
      
      // Apply changes to DOM
      if (darkMode.value) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      } else {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      }
      
      // Save preference
      try {
        const themeValue = darkMode.value ? 'dark' : 'light';
        await Preferences.set({
          key: 'theme-preference',
          value: themeValue
        });
        console.log('Theme preference saved:', themeValue);
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    };

    const clearAllTasks = async () => {
      const alert = await alertController.create({
        header: 'Confirm',
        message: 'Are you sure you want to delete all tasks? This cannot be undone.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: async () => {
              const tasks = await taskService.getAllTasks();
              for (const task of tasks) {
                await taskService.deleteTask(task.id);
              }
              
              const toast = await toastController.create({
                message: 'All tasks have been deleted',
                duration: 2000,
                position: 'bottom'
              });
              await toast.present();
            }
          }
        ]
      });
      await alert.present();
    };

    const showAbout = async () => {
      const alert = await alertController.create({
        header: 'About Task Manager',
        message: 'A comprehensive task management app built with Ionic Vue. Features include daily and weekly task views, reminders, and push notifications.',
        buttons: ['OK']
      });
      await alert.present();
    };

    const sendTestNotification = async () => {
      try {
        const notificationId = new Date().getTime();
        console.log('Sending test notification with ID:', notificationId);
        
        // Check permissions first
        const permissionStatus = await LocalNotifications.checkPermissions();
        if (permissionStatus.display !== 'granted') {
          console.log('Requesting notification permissions');
          await LocalNotifications.requestPermissions();
        }
        
        // Schedule the notification to appear 5 seconds from now
        await LocalNotifications.schedule({
          notifications: [
            {
              id: notificationId,
              title: 'Test Notification',
              body: 'This is a test notification from Task Manager',
              schedule: {
                at: new Date(Date.now() + 5000) // 5 seconds from now
              },
              sound: 'default',
              actionTypeId: 'TASK_ACTION',
              extra: {
                taskId: 'test-notification',
                data: 'Test notification data'
              }
            }
          ]
        });
        
        // Inform the user that notification has been scheduled
        const toast = await toastController.create({
          message: 'Test notification will appear in 5 seconds',
          duration: 3000,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();
        
        console.log('Test notification scheduled');
      } catch (error) {
        console.error('Error sending test notification:', error);
        
        // Show error to user
        const toast = await toastController.create({
          message: 'Failed to send notification: ' + (error.message || 'Unknown error'),
          duration: 3000,
          position: 'bottom',
          color: 'danger'
        });
        await toast.present();
      }
    };

    return {
      mainContentRef,
      listOutline, 
      todayOutline, 
      calendarOutline,
      moonOutline,
      trashOutline,
      informationCircleOutline,
      notificationsOutline,
      darkMode,
      toggleDarkMode,
      handleDarkModeToggle,
      clearAllTasks,
      showAbout,
      sendTestNotification
    };
  }
});
</script>

<style scoped>
ion-menu::part(backdrop) {
  background-color: rgba(0, 0, 0, 0.5);
}

ion-menu::part(container) {
  border-radius: 0 16px 16px 0;
  box-shadow: 4px 0px 16px rgba(0, 0, 0, 0.18);
}

ion-item {
  --padding-start: 16px;
  margin-bottom: 8px;
  --border-radius: 8px;
}

ion-item-divider {
  --background: transparent;
  --padding-start: 16px;
  font-weight: bold;
  letter-spacing: 0.5px;
  margin: 8px 0;
}

ion-toggle {
  --background: var(--ion-color-medium);
  --background-checked: var(--ion-color-primary);
  --handle-background: white;
}
</style>
