# 🚴‍♂️ E-Shuttle — Urban E-Bike Ride-Hailing Platform

A mobile-first Progressive Web Application (PWA) and IoT management platform for urban electric bike ride-hailing, driver dispatch, live GPS tracking, and fleet telemetry.

---

## 🌟 Key Features

- **📱 Customer Ride Booking**: Interactive Leaflet maps, live driver tracking, fare calculation, destination selection, and ride reviews.
- **🛵 Driver Portal & Mobile Dispatch**: Online/offline toggle, ride requests acceptance, turn-by-turn routing, and live trip status updates.
- **🛡️ Admin Fleet & Operations Center**:
  - Live E-Bike telemetry map with GPS tracking.
  - Driver RFID card registration and instant hardware pairing.
  - Account approvals, ride history, and fleet oversight.
- **⚡ IoT & Hardware Ready**: Firmware generator for ESP32 with RC522 RFID, NEO-6M GPS, and SSD1306 OLED screens.
- **📲 Full PWA Experience**: Installable on Android, iOS Safari, and Desktop with offline caching and native mobile back-button navigation.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or bun

### 2. Installation

Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/e-shuttle.git
cd e-shuttle
npm install
```

### 3. Firebase Configuration Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password).
3. Enable **Cloud Firestore** and deploy `firestore.rules`.
4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Fill in your Firebase Web App credentials in `.env`:
   ```env
   VITE_FIREBASE_API_KEY="AIzaSy..."
   VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="1:...:web:..."
   VITE_FIREBASE_DATABASE_ID="(default)"
   ```

### 4. Running the Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Building for Production

```bash
npm run build
```

---

## 🔒 Security & Privacy Notice

- **No Secrets in Code**: Private API keys and specific project configurations are excluded from the repository via `.gitignore`.
- All runtime credentials are loaded securely via standard `VITE_FIREBASE_*` environment variables.
