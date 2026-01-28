package com.unbrokenrna.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class AlarmReceiver : BroadcastReceiver() {

  override fun onReceive(context: Context, intent: Intent) {
    val alarmId = intent.getStringExtra("alarmId")

    if (alarmId != null) {
      AlarmIntentStore.alarmId = alarmId
      AlarmIntentStore.isAlarmLaunch = true
    }

    // 🔔 Start service
    val serviceIntent = Intent(context, AlarmService::class.java).apply {
      putExtra("alarmId", alarmId)
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(serviceIntent)
    } else {
      context.startService(serviceIntent)
    }

    // 🔥 START UI — THIS WAS MISSING
    val uiIntent = Intent(context, AlarmActivity::class.java).apply {
      putExtra("alarmId", alarmId)
      addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_CLEAR_TOP
      )
    }

    context.startActivity(uiIntent)
  }
}
