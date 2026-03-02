package com.unbrokenrna.alarm

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import com.unbrokenrna.R
import android.content.Intent
import com.unbrokenrna.MainActivity
import android.view.View

class AlarmActivity : Activity() {

  companion object {
    var instance: AlarmActivity? = null
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    instance = this
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)

      val keyguard =
        getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager

      keyguard.requestDismissKeyguard(this, null)

    } else {
     window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
          WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
          WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
          WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
      )
    }


     
   if (!AlarmSoundPlayer.isRinging()) {
  finish()
  return
}

    setContentView(R.layout.activity_alarm)

    val alarmId = intent.getStringExtra("alarmId")
    val isCritical = intent.getBooleanExtra("isCritical", false)



    val title = findViewById<TextView>(R.id.alarmTitle)
    val stopBtn = findViewById<Button>(R.id.stopButton)
    val snoozeBtn = findViewById<Button>(R.id.snoozeButton)

    val timeText = findViewById<TextView>(R.id.alarmTime)
    val formatter =java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault())
  timeText.text = formatter.format(java.util.Date())


if (isCritical) {

  snoozeBtn.visibility = View.GONE

  val keyguard =
    getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager

  val isLocked = keyguard.isKeyguardLocked


  
  if (!isLocked) {

    

    val gameIntent =
      Intent(this@AlarmActivity, MainActivity::class.java).apply {

        putExtra("alarmId", alarmId)
        putExtra("isCritical", true)

        addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_CLEAR_TOP
        )
      }

    startActivity(gameIntent)
    finish()
    return
  }


  Log.w("UNBROKEN_ALARM_DATA", "⚠ Locked phone → Unlock required")

  stopBtn.setBackgroundResource(R.drawable.alarm_button_critical)

  title.text = "🧠 Critical Alarm\nUnlock to begin challenge"

  stopBtn.text = "UNLOCK"
  stopBtn.isEnabled = true

  stopBtn.setOnClickListener {

    

    keyguard.requestDismissKeyguard(
      this,
      object : KeyguardManager.KeyguardDismissCallback() {

        override fun onDismissSucceeded() {

          

          val gameIntent =
            Intent(this@AlarmActivity, MainActivity::class.java).apply {

              putExtra("alarmId", alarmId)
              putExtra("isCritical", true)

              addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK or
                  Intent.FLAG_ACTIVITY_CLEAR_TOP
              )
            }

          startActivity(gameIntent)
          finish()
        }

        override fun onDismissCancelled() {
          Log.w("UNBROKEN_ALARM_DATA", "❌ Unlock cancelled")
        }

        override fun onDismissError() {
          Log.e("UNBROKEN_ALARM_DATA", "❌ Unlock error")
        }
      }
    )
  }

  return
}

    snoozeBtn.setOnClickListener {



  if (alarmId == null) return@setOnClickListener


  AlarmSoundPlayer.stop()

 
  AlarmScheduler.cancel(this, alarmId)


  val snoozeTime = System.currentTimeMillis() + (5 * 60 * 1000)

  AlarmScheduler.scheduleSnooze(
    this,
    schedulerId = alarmId + "_snooze",
    originalAlarmId = alarmId,
    triggerAt = snoozeTime,
    isCritical = false
  )
  stopService(Intent(this, AlarmService::class.java))
  finish()
}


    stopBtn.setOnClickListener {
     if (alarmId == null) {
        Log.e("UNBROKEN_ALARM_DATA", "❌ alarmId missing → cannot stop")
        return@setOnClickListener
      }

      AlarmSoundPlayer.stop()
    

      
      AlarmScheduler.cancel(this, alarmId)
      
       AlarmScheduler.cancel(this, alarmId + "_snooze")


     
      AlarmScheduler.scheduleNextWeek(this, alarmId, false)
     
       val stopServiceIntent = Intent(this, AlarmService::class.java)
        stopService(stopServiceIntent)
      finish()
     
    }
  }

  override fun onDestroy() {
    super.onDestroy()
    instance = null
  
  }
}
