package com.unbrokenrna.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {

  companion object {
    private const val TAG = "UNBROKEN_ALARM_DATA"
  }


  override fun onReceive(context: Context, intent: Intent) {
    Log.e(TAG, "🔥🔥🔥 RECEIVER TRIGGERED FOR REAL 🔥🔥🔥")

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmReceiver FIRED")
    Log.d(TAG, "intent=$intent extras=${intent.extras}")

    val alarmId = intent.getStringExtra("alarmId")

    if (alarmId.isNullOrEmpty()) {
      Log.e(TAG, "ERROR: alarmId missing → Receiver exiting")
      return
    }

    Log.d(TAG, "alarmId RECEIVED: $alarmId")

    val serviceIntent = Intent(context, AlarmService::class.java).apply {
      putExtra("alarmId", alarmId)
    }

    Log.d(TAG, "Starting AlarmService now...")

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(serviceIntent)
      Log.d(TAG, "startForegroundService() called")
    } else {
      context.startService(serviceIntent)
      Log.d(TAG, "startService() called")
    }

    Log.d(TAG, "Receiver finished successfully")
    Log.d(TAG, "==============================")
  }
}
