package com.unbroken.app.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExactAlarmModule : Module() {

  override fun definition() = ModuleDefinition {
    Name("ExactAlarm")

    Function("scheduleExactAlarm") { 
      triggerTime: Double,
      alarmId: String,
      soundUri: String? ->

      val context = appContext.reactContext ?: return@Function
      val alarmManager =
        context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

      val intent = Intent(context, AlarmReceiver::class.java).apply {
        putExtra("alarmId", alarmId)
        putExtra("soundUri", soundUri)
      }

      val pendingIntent = PendingIntent.getBroadcast(
        context,
        alarmId.hashCode(),
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or
          if (Build.VERSION.SDK_INT >= 23)
            PendingIntent.FLAG_IMMUTABLE else 0
      )

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        alarmManager.setExactAndAllowWhileIdle(
          AlarmManager.RTC_WAKEUP,
          triggerTime.toLong(),
          pendingIntent
        )
      } else {
        alarmManager.setExact(
          AlarmManager.RTC_WAKEUP,
          triggerTime.toLong(),
          pendingIntent
        )
      }
    }

    Function("stopAlarm") {
      AlarmSoundManager.stop()
    }
  }
}
