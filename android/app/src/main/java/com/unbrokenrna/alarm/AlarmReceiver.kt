package com.unbrokenrna.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {

  companion object {
    private const val TAG = "AlarmReceiver"
  }

  override fun onReceive(context: Context, intent: Intent) {

    val alarmId = intent.getStringExtra("alarmId")

    if (alarmId.isNullOrEmpty()) {
      Log.w(TAG, "onReceive() Missing alarmId → ignoring")
      return
    }

    Log.d(TAG, "onReceive() Alarm Fired alarmId=$alarmId")

    // ✅ 1. OPEN UI FIRST (NO CLEAR_TOP)
    val activityIntent = Intent(context, AlarmActivity::class.java).apply {
      putExtra("alarmId", alarmId)
      addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_SINGLE_TOP
      )
    }

    context.startActivity(activityIntent)

    // ✅ 2. START SERVICE AFTER DELAY
    Handler(Looper.getMainLooper()).postDelayed({

      Log.d(TAG, "Starting AlarmService alarmId=$alarmId")

      val serviceIntent = Intent(context, AlarmService::class.java).apply {
        putExtra("alarmId", alarmId)
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(serviceIntent)
      } else {
        context.startService(serviceIntent)
      }

    }, 300)
  }
}
