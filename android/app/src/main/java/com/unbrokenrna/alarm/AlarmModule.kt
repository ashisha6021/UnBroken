package com.unbrokenrna.alarm

import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import com.unbrokenrna.MainActivity


import com.facebook.react.bridge.*
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class AlarmModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val TAG = "UNBROKEN_ALARM_DATA"
  }

  override fun getName() = "AlarmModule"

  /* ============================================================
     1️⃣ SCHEDULE ALARM
  ============================================================ */
  @ReactMethod
  fun schedule(alarmId: String, triggerAt: Double) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.schedule() CALLED")
    Log.d(TAG, "alarmId = $alarmId")
    Log.d(TAG, "triggerAt = ${java.util.Date(triggerAt.toLong())}")
    Log.d(TAG, "==============================")

    try {
      AlarmScheduler.scheduleExact(
        reactContext,
        alarmId,
        triggerAt.toLong()
      )

      Log.d(TAG, "AlarmScheduler.scheduleExact() SUCCESS")

    } catch (e: Exception) {
      Log.e(TAG, "❌ ERROR scheduling alarm", e)
    }
  }

  /* ============================================================
     2️⃣ CANCEL ALARM
  ============================================================ */
  @ReactMethod
  fun cancelScheduledAlarm(alarmId: String) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.cancelScheduledAlarm() CALLED")
    Log.d(TAG, "alarmId = $alarmId")
    Log.d(TAG, "==============================")

    try {
      AlarmScheduler.cancel(reactContext, alarmId)
      Log.d(TAG, "AlarmScheduler.cancel() SUCCESS")

    } catch (e: Exception) {
      Log.e(TAG, "❌ ERROR cancelling alarm", e)
    }
  }

  /* ============================================================
     3️⃣ CHECK IF ALARM IS SCHEDULED
  ============================================================ */
  @ReactMethod
  fun isAlarmScheduled(alarmId: String, promise: Promise) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.isAlarmScheduled() CALLED")
    Log.d(TAG, "alarmId = $alarmId")
    Log.d(TAG, "==============================")

    try {
      val intent = Intent(reactContext, AlarmReceiver::class.java).apply {
        action = "com.unbrokenrna.ALARM_$alarmId"
        putExtra("alarmId", alarmId)
      }

      val pendingIntent = PendingIntent.getBroadcast(
        reactContext,
        alarmId.hashCode(),
        intent,
        PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
      )

      val exists = pendingIntent != null

      Log.d(TAG, "Alarm exists? → $exists")

      promise.resolve(exists)

    } catch (e: Exception) {
      Log.e(TAG, "❌ ERROR checking alarm", e)
      promise.reject("CHECK_FAILED", e)
    }
  }

  /* ============================================================
     4️⃣ STOP CURRENT RINGING (ONLY FROM UI)
  ============================================================ */
  @ReactMethod
  fun stopRinging() {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.stopRinging() CALLED")
    Log.d(TAG, "Stopping sound + foreground service")
    Log.d(TAG, "==============================")

    try {
      // ✅ Stop sound safely
      AlarmSoundPlayer.stop()
      Log.d(TAG, "AlarmSoundPlayer.stop() DONE")

      // ✅ Stop service
      val serviceIntent = Intent(reactContext, AlarmService::class.java)
      val stopped = reactContext.stopService(serviceIntent)

      Log.d(TAG, "AlarmService stopService() result=$stopped")

      // ✅ Remove notification
      val nm =
        reactContext.getSystemService(Context.NOTIFICATION_SERVICE)
            as NotificationManager

      nm.cancel(AlarmService.NOTIFICATION_ID)

      Log.d(TAG, "Alarm notification cancelled")

    } catch (e: Exception) {
      Log.e(TAG, "❌ ERROR stopping ringing", e)
    }
  }

  /* ============================================================
     5️⃣ SNOOZE ALARM
  ============================================================ */
  @ReactMethod
  fun scheduleSnooze(
    schedulerId: String,
    originalAlarmId: String,
    triggerAt: Double
  ) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.scheduleSnooze() CALLED")
    Log.d(TAG, "schedulerId = $schedulerId")
    Log.d(TAG, "originalAlarmId = $originalAlarmId")
    Log.d(TAG, "triggerAt = ${java.util.Date(triggerAt.toLong())}")
    Log.d(TAG, "==============================")

    try {
      AlarmScheduler.scheduleSnooze(
        reactContext,
        schedulerId,
        originalAlarmId,
        triggerAt.toLong()
      )

      Log.d(TAG, "Snooze scheduled SUCCESSFULLY")

    } catch (e: Exception) {
      Log.e(TAG, "❌ ERROR scheduling snooze", e)
    }
  }

  /* ============================================================
     6️⃣ EXACT ALARM PERMISSION CHECK
  ============================================================ */
  @ReactMethod
  fun canScheduleExactAlarmsjava(promise: Promise) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.canScheduleExactAlarmsjava() CALLED")
    Log.d(TAG, "SDK_INT=${Build.VERSION.SDK_INT}")
    Log.d(TAG, "==============================")

    try {
      if (Build.VERSION.SDK_INT < 31) {
        Log.d(TAG, "Exact alarms allowed automatically (< Android 12)")
        promise.resolve(true)
        return
      }

      val am =
        reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager

      val can = am.canScheduleExactAlarms()

      Log.d(TAG, "Exact alarm permission result=$can")

      promise.resolve(can)

    } catch (e: Exception) {
      Log.e(TAG, "❌ ERROR checking exact alarm permission", e)
      promise.reject("PERMISSION_CHECK_FAILED", e)
    }
  }

  /* ============================================================
     7️⃣ OPEN EXACT ALARM SETTINGS
  ============================================================ */
  @ReactMethod
  fun openExactAlarmSettings() {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.openExactAlarmSettings() CALLED")
    Log.d(TAG, "==============================")

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {

      val intent =
        Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
          data = Uri.parse("package:${reactContext.packageName}")
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

      reactContext.startActivity(intent)

      Log.d(TAG, "Opened Exact Alarm Permission Settings")
    }
  }

  /* ============================================================
     8️⃣ FINISH ALARM SCREEN SAFELY (FIXED)
  ============================================================ */
  @ReactMethod
  fun finishAlarmTask() {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.finishAlarmTask() CALLED")
    Log.d(TAG, "Attempting to close AlarmActivity")
    Log.d(TAG, "==============================")

    try {
      val activity = AlarmActivity.instance

      Log.d(TAG, "AlarmActivity.instance = $activity")

      activity?.finish()

      Log.d(TAG, "AlarmActivity.finish() CALLED")

    } catch (e: Exception) {
      Log.e(TAG, "❌ ERROR finishing AlarmActivity", e)
    }
  }

  /* ============================================================
     9️⃣ EMIT ALARM LAUNCH EVENT TO JS
  ============================================================ */
  @ReactMethod
  fun emitAlarmLaunch(alarmId: String) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.emitAlarmLaunch() CALLED")
    Log.d(TAG, "alarmId = $alarmId")
    Log.d(TAG, "==============================")

    val params = Arguments.createMap().apply {
      putString("alarmId", alarmId)
    }

    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("ALARM_LAUNCHED", params)

    Log.d(TAG, "ALARM_LAUNCHED event emitted successfully")
  }

  /* ============================================================
     🔟 GET LAUNCH INTENT DATA
  ============================================================ */
@ReactMethod
fun getLaunchIntentData(promise: Promise) {

  val alarmId = MainActivity.latestAlarmId

  android.util.Log.d("UNBROKEN_ALARM_DATA", "==============================")
  android.util.Log.d("UNBROKEN_ALARM_DATA", "AlarmModule.getLaunchIntentData() CALLED")
  android.util.Log.d("UNBROKEN_ALARM_DATA", "latestAlarmId=$alarmId")
  android.util.Log.d("UNBROKEN_ALARM_DATA", "==============================")

  if (alarmId != null) {

    val map = Arguments.createMap()
    map.putString("alarmId", alarmId)

    // ✅ Clear after reading
    MainActivity.latestAlarmId = null

    android.util.Log.d("UNBROKEN_ALARM_DATA", "Returning alarmId to JS and clearing storage")

    promise.resolve(map)

  } else {

    android.util.Log.d("UNBROKEN_ALARM_DATA", "No alarm launch detected → returning null")

    promise.resolve(null)
  }
}


@ReactMethod
fun exitAppCompletely() {

  Log.d(TAG, "==============================")
  Log.d(TAG, "AlarmModule.exitAppCompletely() CALLED")
  Log.d(TAG, "Force closing entire app process")
  Log.d(TAG, "==============================")

  try {

    // ✅ Stop alarm sound
    AlarmSoundPlayer.stop()
    Log.d(TAG, "Alarm sound stopped")

    // ✅ Stop AlarmService
    val serviceIntent = Intent(reactContext, AlarmService::class.java)
    reactContext.stopService(serviceIntent)
    Log.d(TAG, "AlarmService stopped")

    // ✅ Kill app fully (works even if currentActivity is null)
    android.os.Process.killProcess(android.os.Process.myPid())
    Log.d(TAG, "App process killed successfully")

  } catch (e: Exception) {
    Log.e(TAG, "❌ ERROR exiting app completely", e)
  }
}


}
