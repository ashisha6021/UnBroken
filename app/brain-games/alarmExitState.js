let IS_EXITING_APP = false;

export function markAppExiting() {
  IS_EXITING_APP = true;
  console.log('🛑 [EXIT] App marked exiting');
}

export function isAppExiting() {
  return IS_EXITING_APP;
}

export function resetAppExit() {
  IS_EXITING_APP = false;
}
