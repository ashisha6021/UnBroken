package com.unbrokenrna.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent

object AlarmScheduler {

  private fun buildPendingIntent(
    context: Context,
    alarmId: String,
    flags: Int
  ): PendingIntent? {
    val intent = Intent(context, AlarmReceiver::class.java).apply {
      action = "com.unbrokenrna.ALARM_$alarmId"
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

    alarmManager.setExactAndAllowWhileIdle(
      AlarmManager.RTC_WAKEUP,
      triggerAt,
      pendingIntent
    )
  }

  fun cancel(context: Context, alarmId: String) {
    val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    val pi = buildPendingIntent(
      context,
      alarmId,
      PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
    )

    if (pi != null) {
      am.cancel(pi)
      pi.cancel()
    }
  }

  fun scheduleSnooze(
  context: Context,
  schedulerId: String,
  originalAlarmId: String,
  triggerAt: Long
) {
  val intent = Intent(context, AlarmReceiver::class.java).apply {
    action = "com.unbrokenrna.ALARM_$schedulerId"
    putExtra("alarmId", originalAlarmId) // 🔥 key
  }

  val pi = PendingIntent.getBroadcast(
    context,
    schedulerId.hashCode(),
    intent,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
  )

  val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
  am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi)
}

}
