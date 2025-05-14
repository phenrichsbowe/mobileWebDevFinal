<template>
  <ion-page>
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { listOutline, todayOutline, calendarOutline } from 'ionicons/icons';

export default defineComponent({
  name: 'TabsPage',
  components: { IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet },
  setup() {
    return {
      listOutline, 
      todayOutline, 
      calendarOutline
    }
  }
});
</script>
