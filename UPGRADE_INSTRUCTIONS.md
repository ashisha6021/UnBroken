# SDK 54 Upgrade Instructions

## Steps to Complete the Upgrade

### 1. Delete node_modules and lock file
```bash
rm -rf node_modules
rm package-lock.json
```

On Windows PowerShell:
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
```

### 2. Install Updated Dependencies
```bash
npm install
```

### 3. Fix Any Dependency Mismatches
```bash
npx expo install --fix
```

### 4. Clear Cache and Start
```bash
npx expo start --clear
```

## What Was Updated

- **Expo SDK**: 50 → 54
- **expo-router**: 3.4.0 → 4.0.0
- **React**: 18.2.0 → 18.3.1
- **React Native**: 0.73.0 → 0.76.5
- **expo-sqlite**: 13.0.0 → 15.0.0
- **expo-status-bar**: 1.11.1 → 2.0.0
- All other dependencies updated to SDK 54 compatible versions

## Potential Breaking Changes

### expo-router v4
- Should be mostly compatible, but check routing if issues occur

### expo-sqlite v15
- API should be the same, but verify database operations work correctly

### React Native 0.76
- Some internal changes, but our code should work fine

## If You Encounter Errors

1. **Clear all caches:**
   ```bash
   npx expo start --clear
   ```

2. **Run expo-doctor to check for issues:**
   ```bash
   npx expo-doctor
   ```

3. **Check for any import errors** and update if needed

4. **Verify SQLite operations** work correctly after upgrade
