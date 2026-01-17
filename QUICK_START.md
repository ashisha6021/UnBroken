# Quick Start Guide - Unbroken App

## Prerequisites

1. **Node.js** installed (v16 or higher)
2. **npm** or **yarn** package manager
3. **Expo Go app** on your phone (for testing on real device)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Step-by-Step Instructions

### 1. Install Dependencies

Open terminal/command prompt in the project folder and run:

```bash
npm install
```

This will install all required packages including:
- Expo SDK
- React Native
- SQLite
- All other dependencies

### 2. Start the Development Server

Run:

```bash
npm start
```

or

```bash
npx expo start
```

You should see:
- A QR code in the terminal
- Options to press `i` for iOS, `a` for Android, `w` for web

### 3. Run on Your Device

**Option A: Using Expo Go App (Recommended for Testing)**

1. Install **Expo Go** app on your phone
2. Scan the QR code from the terminal:
   - **iOS**: Use Camera app to scan QR code
   - **Android**: Use Expo Go app to scan QR code
3. The app will load on your device

**Option B: Using Simulator/Emulator**

- **iOS Simulator** (Mac only):
  ```bash
  npm run ios
  # or press 'i' in the terminal
  ```

- **Android Emulator**:
  ```bash
  npm run android
  # or press 'a' in the terminal
  ```
  
  *Note: Make sure Android Studio and an emulator are set up*

**Option C: Web Browser**

```bash
npm run web
# or press 'w' in the terminal
```

## Troubleshooting

### If `npm start` fails:

1. **Clear cache:**
   ```bash
   npx expo start --clear
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules
   npm install
   ```

### If SQLite errors occur:

- Make sure `expo-sqlite` is installed:
  ```bash
  npm install expo-sqlite
  ```

### If app doesn't load on phone:

- Make sure your phone and computer are on the same WiFi network
- Try using tunnel mode:
  ```bash
  npx expo start --tunnel
  ```

## First Launch

When you first open the app:

1. You'll see the **Home Screen** with a motivational quote
2. Click **"LET'S LOG TODAY'S PROGRESS"**
3. You'll be guided through setup:
   - Enter your name
   - Create long-term goals
   - Create short-term goals
   - Add daily tasks
4. After setup, you can start logging your daily progress!

## Development Commands

```bash
# Start development server
npm start

# Start with cache cleared
npx expo start --clear

# Start iOS simulator (Mac only)
npm run ios

# Start Android emulator
npm run android

# Start web version
npm run web
```

## Need Help?

- Check the main [README.md](./README.md) for app features
- Check [STORAGE.md](./STORAGE.md) for database information
- Check [SETUP.md](./SETUP.md) for detailed setup instructions
