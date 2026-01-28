import { BackHandler } from 'react-native';
import { markAppExiting } from './alarmExitState';

let exitScheduled = false;

export function resetExitGuard() {
  exitScheduled = false;
}

export function exitAppSafely(delay = 0) {
  if (exitScheduled) return;

  exitScheduled = true;
  markAppExiting();

  console.log('🛑 [EXIT] exitAppSafely called');

  setTimeout(() => {
    BackHandler.exitApp();
  }, delay);
}
