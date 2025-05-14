# Time Management App

A mobile time management application built with Ionic Framework and Vue.js, targeted for Android devices.

## Features

- Task creation with title, description, date, and time
- Daily and weekly task views
- Calendar integration with Vue-Cal
- Notifications/reminders for tasks
- Task completion toggle
- Local storage using Capacitor Preferences API
- Clean UI with Ionic components

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Build the app:

```bash
npm run build
```

4. Sync with Capacitor:

```bash
npx cap sync
```

5. Open in Android Studio:

```bash
npx cap open android
```

## Development

For local development with hot-reload:

```bash
npm run dev
```

## Building for Android

1. Build the app:

```bash
npm run build
```

2. Sync with Capacitor:

```bash
npx cap sync
```

3. Open in Android Studio:

```bash
npx cap open android
```

4. Build and run from Android Studio

## Technology Stack

- Ionic Framework 8.x
- Vue.js 3.x
- TypeScript
- Capacitor 7.x
- Capacitor Plugins:
  - Preferences (local storage)
  - Local Notifications
- Vue-Cal (calendar component)

## Project Structure

- `src/models` - Data models
- `src/services` - Business logic and data services
- `src/views` - Main app views
- `src/components` - Reusable UI components
- `src/router` - Application routing 