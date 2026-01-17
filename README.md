# Unbroken - Hardcore Discipline & Productivity App

A strict, motivating, and emotionally impactful productivity app built with React Native and Expo.

## Features

- **Goal Hierarchy**: Long-term goals → Short-term goals → Daily tasks
- **Daily Logging**: Track your progress with emotional feedback
- **Streak Tracking**: Maintain consistency with streak calculations
- **Emotional UI**: Guilt mode for partial completion, celebration for full completion
- **Reward & Punishment System**: User-defined rules for accountability
- **Dark, Premium UI**: Minimal, serious design focused on discipline

## Tech Stack

- **React Native (Expo)** - Built with Expo SDK
- **JavaScript** - No TypeScript
- **SQLite (expo-sqlite)** - Persistent database for 3+ years of data storage
- **Zustand** - State management
- **Expo Router** - File-based navigation

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app

## Project Structure

```
├── app/              # Screen components (Expo Router)
├── components/       # Reusable UI components
├── constants/        # Theme and constants
├── storage/          # SQLite database & storage utilities
│   ├── database.js   # Database initialization
│   └── storage-sqlite.js  # SQLite operations
├── store/            # Zustand state management
├── types/            # Data model constants
└── utils/            # Helper functions
```

## Core Philosophy

- Discipline over motivation
- Consistency is non-negotiable
- Streaks matter
- Missing tasks creates guilt
- Completing everything creates elevation & pride

## License

Private project
