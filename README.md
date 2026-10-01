# Zenith Mobile — Advanced Ionic Mobile App

A modern, high-performance mobile application built with **Ionic 9 + React 19 + TypeScript + Capacitor 8**, mirroring and enhancing the functionality of the **to-do-list-advanced** desktop application.

---

## 🚀 Key Features

- **Direct Firebase Synchronization**:
  - Uses the **exact same Firebase credentials** and Cloud Firestore collections (`todos`, `assignees`, `users/{userId}`) as the `to-do-list-advanced` web app.
  - Changes made on mobile update the desktop app in real time, and vice versa!
- **Complete Authentication Flow**:
  - Firebase Email & Password authentication with input validation, password safety rules, and session persistence.
- **Mobile-Optimized Task Management**:
  - **Touch Priority Cycler**: Tap the priority pill on any task card to instantly cycle through `Low` ➔ `Medium` ➔ `High` ➔ `Urgent` with haptic feedback.
  - **One-Tap Checkbox**: Smooth completion toggle with celebratory confetti particles (`canvas-confetti`).
  - **In-Progress Mode**: Pulsing status dot indicator for active in-progress tasks.
  - **Smart Date Badges**: Automatic recognition of "Due Today", "Due Tomorrow", or "Overdue".
  - **Recurrence Engine**: Auto-spawns next task occurrence (`Daily`, `Weekly`, `Monthly`, `Yearly`).
  - **Collaboration & Help Requests**: Tag team members for assistance with a specific topic or question.
  - **Budget / Cost Tracking**: Custom budget amount per task.
- **Dynamic Stats Carousel**:
  - Live counts for Total, In Progress, Completed, Due Soon, and Completion Rate (%). Tap any stat card to filter by that status immediately.
- **Interactive Calendar View**:
  - Monthly calendar grid with color-coded dot markers for tasks due and tasks created.
  - Tap any day to open a bottom sheet modal showing that day's tasks with a quick "Add Task for This Day" button.
- **Assignee Directory (Team)**:
  - Real-time synced team directory.
  - Add members with role titles, view active pending tasks count badge per member, and delete assignees.
- **Account-Wide Theme Engine & Palettes**:
  - Dark mode (OLED optimized) and Light mode.
  - 8 curated accent color palettes: **Emerald**, **Forest Pine**, **Sapphire Blue**, **Cobalt Sky**, **Amethyst Purple**, **Rose Crimson**, **Amber Gold**, and **Midnight Indigo**.
  - Theme choices persist directly to your Firebase user document (`users/{uid}`) and sync across devices.
- **In-App Notification Engine**:
  - Background due-date rule engine detecting tasks due today and overdue tasks.
  - In-app floating toast alerts and dedicated notification sheet with "Mark all read" and "Clear all".

---

## 📱 Native Android & iOS Projects

The repository includes ready-to-run native mobile projects in the `android/` and `ios/` folders:

- **Android Studio Project**: Located in [`android/`](file:///d:/Coding/React%20Code/to-do-mobile/android)
  - Package ID: `com.zenith.todomobile`
  - Includes Gradle configuration, AndroidManifest with internet permissions, and Capacitor plugins (`@capacitor/app`, `@capacitor/haptics`, `@capacitor/keyboard`, `@capacitor/status-bar`).
- **iOS Xcode Project**: Located in [`ios/`](file:///d:/Coding/React%20Code/to-do-mobile/ios)
  - Xcode Workspace: [`ios/App/App.xcodeproj`](file:///d:/Coding/React%20Code/to-do-mobile/ios/App/App.xcodeproj)
  - Includes Swift Package Manager integration and iOS native configurations.

---

## 🛠️ Getting Started & Commands

### 1. Run in Web Browser
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Build Web Assets
```bash
npm run build
```

### 3. Sync Web Assets to Android & iOS
Whenever you make frontend changes, compile and sync them to the native platforms:
```bash
npm run build
npx cap sync
```

### 4. Run on Android
```bash
# Open directly in Android Studio:
npx cap open android

# Or build debug APK using Gradle:
cd android
./gradlew assembleDebug
```
The APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

### 5. Run on iOS (macOS required)
```bash
npx cap open ios
```
Opens Xcode where you can select a simulator or connected iPhone and click **Run**.

---

## 🔑 Firebase Credentials

Configured in [`.env`](file:///d:/Coding/React%20Code/to-do-mobile/.env):
```env
VITE_FIREBASE_API_KEY=AIzaSyBn5puSUc0pq_q4QTDMWqbqnHKM9QOktiY
VITE_FIREBASE_AUTH_DOMAIN=todo-advanced-27e80.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=todo-advanced-27e80
VITE_FIREBASE_STORAGE_BUCKET=todo-advanced-27e80.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=68585655009
VITE_FIREBASE_APP_ID=1:68585655009:web:055ea8e65b395c853b45a0
VITE_FIREBASE_MEASUREMENT_ID=G-HFFBX2VFV0
```
