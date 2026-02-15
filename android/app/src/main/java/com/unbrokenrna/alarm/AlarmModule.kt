package com.unbrokenrna.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.app.NotificationManager


class AlarmModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "AlarmModule"

  /* ----------------------------------
     SCHEDULE ALARM
  ---------------------------------- */
  @ReactMethod
  fun schedule(alarmId: String, triggerAt: Double) {
    android.util.Log.d(
      "AlarmModule",
      "schedule() called from JS alarmId=$alarmId triggerAt=${java.util.Date(triggerAt.toLong())}"
    )
    AlarmScheduler.scheduleExact(
      reactContext,
      alarmId,
      triggerAt.toLong()
    )
  }

  /* ----------------------------------
     CANCEL ALARM
  ---------------------------------- */
  @ReactMethod
  fun cancelScheduledAlarm(alarmId: String) {
    android.util.Log.d("AlarmModule", "cancelScheduledAlarm() alarmId=$alarmId")
    AlarmScheduler.cancel(reactContext, alarmId)
  }

  /* ----------------------------------
     CHECK IF ALARM IS SCHEDULED
  ---------------------------------- */
  @ReactMethod
  fun isAlarmScheduled(alarmId: String, promise: Promise) {
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
      android.util.Log.d("AlarmModule", "isAlarmScheduled() alarmId=$alarmId exists=$exists")
      promise.resolve(exists)
    } catch (e: Exception) {
      promise.reject("CHECK_FAILED", e)
    }
  }

  /* ----------------------------------
     STOP CURRENT RINGING
  ---------------------------------- */

@ReactMethod
fun stopRinging() {
    AlarmSoundPlayer.stop()

    val intent = Intent(reactContext, AlarmService::class.java)
    reactContext.stopService(intent)
    android.util.Log.d("AlarmModule", "stopRinging() stopping sound + service")
    val nm =
      reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    nm.cancel(AlarmService.NOTIFICATION_ID)
}


  /* ----------------------------------
     SCHEDULE SNOOZE
  ---------------------------------- */
  @ReactMethod
  fun scheduleSnooze(
    schedulerId: String,
    originalAlarmId: String,
    triggerAt: Double
  ) {
    android.util.Log.d(
      "AlarmModule",
      "scheduleSnooze() schedulerId=$schedulerId originalAlarmId=$originalAlarmId triggerAt=${java.util.Date(triggerAt.toLong())}"
    )
    AlarmScheduler.scheduleSnooze(
      reactContext,
      schedulerId,
      originalAlarmId,
      triggerAt.toLong()
    )
  }

  /* ----------------------------------
     EXACT ALARM PERMISSION
  ---------------------------------- */
  @ReactMethod
  fun canScheduleExactAlarmsjava(promise: Promise) {
    if (Build.VERSION.SDK_INT < 31) {
      promise.resolve(true)
      return
    }

    val am =
      reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val can = am.canScheduleExactAlarms()
    android.util.Log.d("AlarmModule", "canScheduleExactAlarmsjava() result=$can")
    promise.resolve(can)
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

  /* ----------------------------------
     FINISH ALARM TASK SAFELY
     (DO NOT KILL APP)
  ---------------------------------- */
@ReactMethod
fun finishAlarmTask() {
    val activity = reactContext.currentActivity

    android.util.Log.d("AlarmModule", "finishAlarmTask() finishing current activity=$activity")
    if (activity is AlarmActivity) {
        activity.finish()
    }
}



@ReactMethod
fun emitAlarmLaunch(alarmId: String) {
  val params = Arguments.createMap().apply {
    putString("alarmId", alarmId)
  }

  android.util.Log.d(
    "AlarmModule",
    "emitAlarmLaunch() manually emitting ALARM_LAUNCHED for alarmId=$alarmId"
  )
  reactContext
    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
    .emit("ALARM_LAUNCHED", params)
}

@ReactMethod
fun getLaunchIntentData(promise: Promise) {

  val activity = reactContext.currentActivity

  if (activity == null) {
    promise.resolve(null)
    return
  }

  val alarmId = activity.intent?.getStringExtra("alarmId")

  if (alarmId != null) {
    val map = Arguments.createMap()
    map.putString("alarmId", alarmId)
    promise.resolve(map)
  } else {
    promise.resolve(null)
  }
}

}
