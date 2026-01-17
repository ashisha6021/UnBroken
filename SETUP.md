# Unbroken App - Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on device:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## App Structure

### Core Features Implemented

✅ **Home Screen** - Motivational quote and main CTA
✅ **First-Time Setup Flow:**
   - Name input
   - Long-term goals
   - Short-term goals (linked to long-term)
   - Daily tasks (linked to short-term goals, with day selection)

✅ **Daily Logging System:**
   - Shows today's scheduled tasks
   - Checkbox completion tracking
   - Optional notes per task
   - Visual connection to goals

✅ **Emotional UI Feedback:**
   - **100% Completion**: Green celebration screen with confetti
   - **Partial Completion**: Guilt mode with muted colors
   - **0% Completion**: Failure screen

✅ **Streak Tracking:**
   - Current streak calculation
   - Longest streak tracking
   - Break day support

✅ **Settings Screen:**
   - Profile information
   - Statistics display
   - Reward & Punishment rules management (basic)

✅ **Dark, Premium UI:**
   - Minimal design
   - High contrast
   - Serious aesthetic

## Data Storage

All data is stored locally using AsyncStorage:
- User profile
- Goals (long-term and short-term)
- Tasks
- Task logs (daily completion records)
- Reward rules
- Punishment rules
- Break days

## Navigation Flow

1. **First Launch:**
   Home → Setup → Name → Long Goals → Short Goals → Tasks → Home

2. **Daily Use:**
   Home → Log Progress → Result Screen → Home

3. **Settings:**
   Home → Settings → Rules Management

## Key Files

- `app/index.js` - Home screen
- `app/setup/` - Setup flow screens
- `app/log/index.js` - Daily task logging
- `app/result/index.js` - Completion result screen
- `app/celebration/index.js` - Goal completion celebration
- `store/useAppStore.js` - Zustand state management
- `storage/storage.js` - AsyncStorage utilities
- `utils/streak.js` - Streak calculation logic
- `constants/theme.js` - UI theme and colors

## Next Steps (Future Enhancements)

- Full reward/punishment rule creation UI
- Goal completion percentage calculation
- Break day management UI
- Statistics and analytics screens
- Export/import data functionality
- Notifications for daily logging

## Notes

- The app uses Expo Router for file-based navigation
- All screens are in JavaScript (no TypeScript)
- Dark mode is the default and only theme
- Break days are supported but need UI for creation
