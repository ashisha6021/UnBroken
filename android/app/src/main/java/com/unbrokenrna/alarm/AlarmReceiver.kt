package com.unbrokenrna.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {

  override fun onReceive(context: Context, intent: Intent) {


    val alarmId = intent.getStringExtra("alarmId")

    if (alarmId.isNullOrEmpty()) {
      Log.e("UNBROKEN_ALARM_DATA", "❌ alarmId is NULL/EMPTY → receiver exiting")

      return
    }

    val isCritical = intent.getBooleanExtra("isCritical", false)



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

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

      
        context.startForegroundService(serviceIntent)
       
        context.startActivity(activityIntent)
    

      } else {

        context.startService(serviceIntent)
      }

    

    } catch (e: Exception) {

      Log.e("UNBROKEN_ALARM_DATA", "❌ FAILED to start AlarmService", e)
    }

  }
}
