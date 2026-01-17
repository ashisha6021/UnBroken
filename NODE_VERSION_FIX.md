# Node.js Version Fix

## Problem
Expo SDK 54 requires **Node.js 20.3.0 or higher** because it uses the `toReversed()` method.

Your current version: **Node.js v18.20.6**

## Solution 1: Upgrade Node.js (Recommended)

### Step 1: Download Node.js 20.x or 22.x
- Visit: https://nodejs.org/
- Download the **LTS version** (20.x or 22.x)
- Install it (this will replace your current version)

### Step 2: Verify Installation
```bash
node --version
```
Should show: `v20.x.x` or `v22.x.x`

### Step 3: Reinstall Dependencies
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Step 4: Start Expo
```bash
npx expo start --clear
```

## Solution 2: Use Node Version Manager (NVM) - Better for Development

If you want to keep multiple Node.js versions:

### Windows (using nvm-windows):
1. Download: https://github.com/coreybutler/nvm-windows/releases
2. Install nvm-windows
3. Install Node.js 20:
   ```bash
   nvm install 20
   nvm use 20
   ```
4. Verify: `node --version`

### Mac/Linux (using nvm):
```bash
nvm install 20
nvm use 20
```

## Solution 3: Downgrade Expo SDK (If you can't upgrade Node.js)

If you absolutely cannot upgrade Node.js, we can downgrade to Expo SDK 51 which works with Node 18:

1. Update `package.json` to use SDK 51
2. Run `npm install`
3. Run `npx expo install --fix`

**Note:** This means you'll need to use an older version of Expo Go that supports SDK 51.

## Quick Check

After upgrading, verify:
```bash
node --version  # Should be 20.3.0 or higher
npm --version
npx expo start --clear
```
