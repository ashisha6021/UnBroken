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

class AlarmModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val TAG = "UNBROKEN_ALARM_DATA"
  }

  override fun getName() = "AlarmModule"

  /* ============================================================
     1️⃣ SCHEDULE ALARM (isCritical REQUIRED)
  ============================================================ */
  @ReactMethod
  fun schedule(alarmId: String, triggerAt: Double, isCritical: Boolean) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.schedule() CALLED")
    Log.d(TAG, "alarmId=$alarmId")
    Log.d(TAG, "triggerAt=${java.util.Date(triggerAt.toLong())}")
    Log.d(TAG, "isCritical=$isCritical")
    Log.d(TAG, "==============================")

    try {
      AlarmScheduler.scheduleExact(
        reactContext,
        alarmId,
        triggerAt.toLong(),
        isCritical
      )

      Log.d(TAG, "✅ AlarmScheduler.scheduleExact() SUCCESS")

    } catch (e: Exception) {
      Log.e(TAG, "❌ ERROR scheduling alarm", e)
    }
  }

  /* ============================================================
     2️⃣ CANCEL ALARM (ONLY alarmId)
     🚨 Extras do NOT matter
  ============================================================ */
  @ReactMethod
  fun cancelScheduledAlarm(alarmId: String) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.cancelScheduledAlarm() CALLED")
    Log.d(TAG, "alarmId=$alarmId")
    Log.d(TAG, "==============================")

    try {
      AlarmScheduler.cancel(
        reactContext,
        alarmId
      )

      Log.d(TAG, "✅ AlarmScheduler.cancel() SUCCESS")

    } catch (e: Exception) {
      Log.e(TAG, "❌ ERROR cancelling alarm", e)
    }
  }

  /* ============================================================
     3️⃣ CHECK IF ALARM EXISTS (ONLY alarmId)
  ============================================================ */
  @ReactMethod
  fun isAlarmScheduled(alarmId: String, promise: Promise) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.isAlarmScheduled() CALLED")
    Log.d(TAG, "alarmId=$alarmId")
    Log.d(TAG, "==============================")

    try {
      val intent = Intent(reactContext, AlarmReceiver::class.java).apply {
        action = "com.unbrokenrna.ALARM_$alarmId"
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
     4️⃣ STOP CURRENT RINGING
  ============================================================ */
  @ReactMethod
  fun stopRinging() {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.stopRinging() CALLED")
    Log.d(TAG, "Stopping sound + foreground service")
    Log.d(TAG, "==============================")

    try {
      AlarmSoundPlayer.stop()
      Log.d(TAG, "✅ AlarmSoundPlayer stopped")

      val serviceIntent = Intent(reactContext, AlarmService::class.java)
      reactContext.stopService(serviceIntent)

      Log.d(TAG, "✅ AlarmService stopped")

      val nm =
        reactContext.getSystemService(Context.NOTIFICATION_SERVICE)
            as NotificationManager

      nm.cancel(AlarmService.NOTIFICATION_ID)

      Log.d(TAG, "✅ Alarm notification cancelled")

    } catch (e: Exception) {
      Log.e(TAG, "❌ ERROR stopping ringing", e)
    }
  }

  /* ============================================================
     5️⃣ SNOOZE ALARM (isCritical REQUIRED)
  ============================================================ */
  @ReactMethod
  fun scheduleSnooze(
    schedulerId: String,
    originalAlarmId: String,
    triggerAt: Double,
    isCritical: Boolean
  ) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.scheduleSnooze() CALLED")
    Log.d(TAG, "schedulerId=$schedulerId")
    Log.d(TAG, "originalAlarmId=$originalAlarmId")
    Log.d(TAG, "triggerAt=${java.util.Date(triggerAt.toLong())}")
    Log.d(TAG, "isCritical=$isCritical")
    Log.d(TAG, "==============================")

    try {
      AlarmScheduler.scheduleSnooze(
        reactContext,
        schedulerId,
        originalAlarmId,
        triggerAt.toLong(),
        isCritical
      )

      Log.d(TAG, "✅ Snooze scheduled SUCCESSFULLY")

    } catch (e: Exception) {
      Log.e(TAG, "❌ ERROR scheduling snooze", e)
    }
  }

  /* ============================================================
     6️⃣ FINISH ALARM SCREEN SAFELY
  ============================================================ */
  @ReactMethod
  fun finishAlarmTask() {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.finishAlarmTask() CALLED")
    Log.d(TAG, "==============================")

    try {
      AlarmActivity.instance?.finish()
      Log.d(TAG, "✅ AlarmActivity closed")

    } catch (e: Exception) {
      Log.e(TAG, "❌ ERROR finishing AlarmActivity", e)
    }
  }

  /* ============================================================
     7️⃣ GET LAUNCH INTENT DATA
  ============================================================ */
  @ReactMethod
  fun getLaunchIntentData(promise: Promise) {

    val alarmId = MainActivity.latestAlarmId

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.getLaunchIntentData() CALLED")
    Log.d(TAG, "latestAlarmId=$alarmId")
    Log.d(TAG, "==============================")

    if (alarmId != null) {

      val map = Arguments.createMap()
      map.putString("alarmId", alarmId)

      MainActivity.latestAlarmId = null

      Log.d(TAG, "Returning alarmId to JS + clearing")

      promise.resolve(map)

    } else {
      promise.resolve(null)
    }
  }

  @ReactMethod
fun openExactAlarmSettings() {
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
      data = Uri.parse("package:${reactContext.packageName}")
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    reactContext.startActivity(intent)
  }
}

  @ReactMethod
  fun canScheduleExactAlarmsjava(promise: Promise) {
    if (android.os.Build.VERSION.SDK_INT < 31) {
      promise.resolve(true)
      return
    }

    val am =
      reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    promise.resolve(am.canScheduleExactAlarms())
  }
  /* ============================================================
     8️⃣ EXIT APP COMPLETELY
  ============================================================ */
  @ReactMethod
  fun exitAppCompletely() {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmModule.exitAppCompletely() CALLED")
    Log.d(TAG, "Killing app process fully")
    Log.d(TAG, "==============================")

    try {

      AlarmSoundPlayer.stop()

      val serviceIntent = Intent(reactContext, AlarmService::class.java)
      reactContext.stopService(serviceIntent)

      android.os.Process.killProcess(android.os.Process.myPid())

    } catch (e: Exception) {
      Log.e(TAG, "❌ ERROR exiting app completely", e)
    }
  }
}
