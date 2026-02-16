package com.unbrokenrna.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {

  override fun onReceive(context: Context, intent: Intent) {

    Log.d("UNBROKEN_ALARM_DATA", "======================================")
    Log.d("UNBROKEN_ALARM_DATA", "🔥🔥 AlarmReceiver.onReceive() FIRED 🔥🔥")
    Log.d("UNBROKEN_ALARM_DATA", "intent=$intent")
    Log.d("UNBROKEN_ALARM_DATA", "action=${intent.action}")
    Log.d("UNBROKEN_ALARM_DATA", "extras=${intent.extras}")
    Log.d("UNBROKEN_ALARM_DATA", "======================================")

    val alarmId = intent.getStringExtra("alarmId")

    if (alarmId.isNullOrEmpty()) {
      Log.e("UNBROKEN_ALARM_DATA", "❌ alarmId is NULL/EMPTY → receiver exiting")
      Log.d("UNBROKEN_ALARM_DATA", "======================================")
      return
    }

    val isCritical = intent.getBooleanExtra("isCritical", false)

    Log.d("UNBROKEN_ALARM_DATA", "✅ alarmId RECEIVED = $alarmId")
    Log.d("UNBROKEN_ALARM_DATA", "✅ isCritical RECEIVED = $isCritical")

    Log.d("UNBROKEN_ALARM_DATA", "➡ Preparing AlarmService Intent...")

    val serviceIntent = Intent(context, AlarmService::class.java).apply {
      putExtra("alarmId", alarmId)
      putExtra("isCritical", isCritical)
    }
    val activityIntent =Intent(context, AlarmActivity::class.java).apply {

    putExtra("alarmId", alarmId)
    putExtra("isCritical", isCritical)

    addFlags(
      Intent.FLAG_ACTIVITY_NEW_TASK or
      Intent.FLAG_ACTIVITY_CLEAR_TOP
    )
  }
    try {

      Log.d("UNBROKEN_ALARM_DATA", "➡ Starting AlarmService now...")

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

        Log.d("UNBROKEN_ALARM_DATA", "Using startForegroundService() (Android 8+)")
        context.startForegroundService(serviceIntent)
        Log.d("UNBROKEN_ALARM_DATA", "✅ STARTING ALARMactivity")
        context.startActivity(activityIntent)
        Log.d("UNBROKEN_ALARM_DATA", "✅ ALARMactivity started successfully")

      } else {

        Log.d("UNBROKEN_ALARM_DATA", "Using startService() (Android < 8)")
        context.startService(serviceIntent)
      }

      Log.d("UNBROKEN_ALARM_DATA", "✅ AlarmService started successfully")

    } catch (e: Exception) {

      Log.e("UNBROKEN_ALARM_DATA", "❌ FAILED to start AlarmService", e)
    }

    Log.d("UNBROKEN_ALARM_DATA", "======================================")
  }
}
