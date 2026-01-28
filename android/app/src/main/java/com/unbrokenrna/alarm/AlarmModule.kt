package com.unbrokenrna.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.*
import android.util.Log
import com.unbrokenrna.alarm.AlarmIntentStore
import android.provider.Settings
import android.net.Uri
import android.os.Build

class AlarmModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "AlarmModule"

  /* ----------------------------------
     SCHEDULE ALARM
  ---------------------------------- */
  @ReactMethod
  fun schedule(
    alarmId: String,
    triggerAt: Double
  ) {
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

    promise.resolve(pendingIntent != null)
  } catch (e: Exception) {
    promise.reject("CHECK_FAILED", e)
  }
}


  /* ----------------------------------
     EXACT ALARM PERMISSION
  ---------------------------------- */
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

@ReactMethod
fun getLaunchIntentData(promise: Promise) {
  val alarmId = AlarmIntentStore.alarmId
  val isAlarmLaunch = AlarmIntentStore.isAlarmLaunch

  if (alarmId == null && !isAlarmLaunch) {
    promise.resolve(null)
    return
  }

  val map = Arguments.createMap().apply {
    putString("alarmId", alarmId)
    putBoolean("isAlarmLaunch", isAlarmLaunch)
  }

  // 🔒 consume AFTER JS reads
  AlarmIntentStore.alarmId = null
  AlarmIntentStore.isAlarmLaunch = false

  promise.resolve(map)
}



@ReactMethod
fun stopRinging() {
  AlarmIntentStore.alarmId = null
  AlarmIntentStore.isAlarmLaunch = false

  val intent = Intent(reactContext, AlarmService::class.java).apply {
    putExtra("STOP_ALARM", true)
  }

  if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
    reactContext.startForegroundService(intent)
  } else {
    reactContext.startService(intent)
  }
}

@ReactMethod
fun scheduleSnooze(
  schedulerId: String,
  originalAlarmId: String,
  triggerAt: Double
) {
  AlarmScheduler.scheduleSnooze(
    reactContext,
    schedulerId,
    originalAlarmId,
    triggerAt.toLong()
  )
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


}