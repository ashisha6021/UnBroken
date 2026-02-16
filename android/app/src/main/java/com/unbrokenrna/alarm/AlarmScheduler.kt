package com.unbrokenrna.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log

object AlarmScheduler {

  private const val TAG = "UNBROKEN_ALARM_DATA"


  private fun buildPendingIntent(
    context: Context,
    alarmId: String,
    flags: Int
  ): PendingIntent? {

    Log.d(TAG, "buildPendingIntent() called")
    Log.d(TAG, "alarmId=$alarmId flags=$flags")

    val intent = Intent(context, AlarmReceiver::class.java).apply {
      action = "com.unbrokenrna.ALARM_$alarmId"
      putExtra("alarmId", alarmId)
    }

    return PendingIntent.getBroadcast(
      context,
      alarmId.hashCode(),
      intent,
      flags
    )
  }

  fun scheduleExact(
    context: Context,
    alarmId: String,
    triggerAt: Long
  ) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "scheduleExact() REQUEST RECEIVED")
    Log.d(TAG, "alarmId=$alarmId")
    Log.d(TAG, "triggerAt=${java.util.Date(triggerAt)}")

    val intent = Intent(context, AlarmReceiver::class.java).apply {
      action = "com.unbrokenrna.ALARM_$alarmId"
      putExtra("alarmId", alarmId)
    }

    val pendingIntent = PendingIntent.getBroadcast(
      context,
      alarmId.hashCode(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val alarmManager =
      context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    Log.d(TAG, "Setting EXACT alarm now...")

    alarmManager.setExactAndAllowWhileIdle(
      AlarmManager.RTC_WAKEUP,
      triggerAt,
      pendingIntent
    )

    Log.d(TAG, "Alarm scheduled SUCCESSFULLY alarmId=$alarmId")
    Log.d(TAG, "==============================")
  }

  fun cancel(context: Context, alarmId: String) {

    Log.d(TAG, "cancel() REQUEST RECEIVED alarmId=$alarmId")

    val am =
      context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    val pi = buildPendingIntent(
      context,
      alarmId,
      PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
    )

    if (pi != null) {
      am.cancel(pi)
      pi.cancel()
      Log.d(TAG, "Alarm cancelled SUCCESSFULLY alarmId=$alarmId")
    } else {
      Log.d(TAG, "No PendingIntent found → nothing cancelled")
    }
  }

  fun scheduleSnooze(
    context: Context,
    schedulerId: String,
    originalAlarmId: String,
    triggerAt: Long
  ) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "scheduleSnooze() REQUEST RECEIVED")
    Log.d(TAG, "schedulerId=$schedulerId")
    Log.d(TAG, "originalAlarmId=$originalAlarmId")
    Log.d(TAG, "triggerAt=${java.util.Date(triggerAt)}")

    val intent = Intent(context, AlarmReceiver::class.java).apply {
      action = "com.unbrokenrna.ALARM_$schedulerId"
      putExtra("alarmId", originalAlarmId)
    }

    val pi = PendingIntent.getBroadcast(
      context,
      schedulerId.hashCode(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val am =
      context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    am.setExactAndAllowWhileIdle(
      AlarmManager.RTC_WAKEUP,
      triggerAt,
      pi
    )

    Log.d(TAG, "Snooze scheduled SUCCESSFULLY")
    Log.d(TAG, "==============================")
  }
}
