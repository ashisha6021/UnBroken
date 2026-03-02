package com.unbrokenrna.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log

object AlarmScheduler {

  private const val TAG = "UNBROKEN_ALARM_DATA"

  /* ============================================================
     ✅ BUILD PENDING INTENT
     - Extras do NOT affect matching
     - Only requestCode + action matter
  ============================================================ */
  private fun buildPendingIntent(
    context: Context,
    alarmId: String,
    isCritical: Boolean,
    flags: Int
  ): PendingIntent? {

  

    val intent = Intent(context, AlarmReceiver::class.java).apply {
      action = "com.unbrokenrna.ALARM_$alarmId"
      putExtra("alarmId", alarmId)
      putExtra("isCritical", isCritical)
    }

    return PendingIntent.getBroadcast(
      context,
      alarmId.hashCode(),
      intent,
      flags
    )
  }

  /* ============================================================
     1️⃣ SCHEDULE EXACT ALARM
  ============================================================ */
  fun scheduleExact(
  context: Context,
  alarmId: String,
  triggerAt: Long,
  isCritical: Boolean
) {



  val alarmManager =
    context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

  val pendingIntent = buildPendingIntent(
    context,
    alarmId,
    isCritical,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
  )

  if (pendingIntent == null) {
    Log.e(TAG, "❌ PendingIntent is NULL → Alarm not scheduled")
    return
  }

  // ✅ AlarmClock API (LOCKSCREEN UI GUARANTEE)
  val showIntent = Intent(context, AlarmActivity::class.java).apply {
    addFlags(
      Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_CLEAR_TOP or
        Intent.FLAG_ACTIVITY_SINGLE_TOP
    )
    putExtra("alarmId", alarmId)
    putExtra("isCritical", isCritical)
  }

  val showPendingIntent = PendingIntent.getActivity(
    context,
    (alarmId.hashCode() + 1111),
    showIntent,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
  )

  alarmManager.setAlarmClock(
    AlarmManager.AlarmClockInfo(triggerAt, showPendingIntent),
    pendingIntent
  )

}


  /* ============================================================
     2️⃣ CANCEL ALARM (NO isCritical needed)
     - Extras do not matter
  ============================================================ */
  fun cancel(
    context: Context,
    alarmId: String
  ) {



    val alarmManager =
      context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    val intent = Intent(context, AlarmReceiver::class.java).apply {
      action = "com.unbrokenrna.ALARM_$alarmId"
    }

    val pendingIntent = PendingIntent.getBroadcast(
      context,
      alarmId.hashCode(),
      intent,
      PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
    )

    if (pendingIntent != null) {
      alarmManager.cancel(pendingIntent)
      pendingIntent.cancel()
    
    } else {
      Log.w(TAG, "⚠ No PendingIntent found → nothing cancelled")
    }


  }

  /* ============================================================
     3️⃣ SNOOZE ALARM (KEEP isCritical)
  ============================================================ */
fun scheduleSnooze(
  context: Context,
  schedulerId: String,
  originalAlarmId: String,
  triggerAt: Long,
  isCritical: Boolean
) {


  val intent = Intent(context, AlarmReceiver::class.java).apply {
    action = "com.unbrokenrna.ALARM_$schedulerId"
    putExtra("alarmId", originalAlarmId)
    putExtra("isCritical", isCritical)
  }

  val pendingIntent = PendingIntent.getBroadcast(
    context,
    schedulerId.hashCode(),
    intent,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
  )

  val alarmManager =
    context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

 
  val showIntent = Intent(context, AlarmActivity::class.java).apply {
    addFlags(
      Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_CLEAR_TOP or
        Intent.FLAG_ACTIVITY_SINGLE_TOP
    )
    putExtra("alarmId", originalAlarmId)
    putExtra("isCritical", isCritical)
  }

  val showPendingIntent = PendingIntent.getActivity(
    context,
    (schedulerId.hashCode() + 2222),
    showIntent,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
  )


  alarmManager.setAlarmClock(
    AlarmManager.AlarmClockInfo(triggerAt, showPendingIntent),
    pendingIntent
  )

}


  /* ============================================================
     4️⃣ RESCHEDULE NEXT WEEK
  ============================================================ */
  fun scheduleNextWeek(
    context: Context,
    alarmId: String,
    isCritical: Boolean
  ) {


    val nextWeek =
      System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000
   scheduleExact(context, alarmId, nextWeek, isCritical)


  }
}
