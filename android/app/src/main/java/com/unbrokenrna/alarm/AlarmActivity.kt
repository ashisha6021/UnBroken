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
    
    Log.d("UNBROKEN_ALARM_DATA", "======================================")
    Log.d("UNBROKEN_ALARM_DATA", "🔥 AlarmActivity.onCreate() CALLED")
    Log.d("UNBROKEN_ALARM_DATA", "intent=$intent")
    Log.d("UNBROKEN_ALARM_DATA", "extras=${intent.extras}")
    Log.d("UNBROKEN_ALARM_DATA", "======================================")

    /* ============================================================
       ✅ LOCKSCREEN DISPLAY FIX (MODERN + OLD)
    ============================================================ */

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {

      Log.d("UNBROKEN_ALARM_DATA", "✅ Using modern lockscreen API")

      setShowWhenLocked(true)
      setTurnScreenOn(true)

      val keyguard =
        getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager

      keyguard.requestDismissKeyguard(this, null)

    } else {

      Log.d("UNBROKEN_ALARM_DATA", "✅ Using legacy window flags")

      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
          WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
          WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
          WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
      )
    }

    /* ============================================================
       ✅ LOAD UI
    ============================================================ */
     
   if (!AlarmSoundPlayer.isRinging()) {
  finish()
  return
}

    setContentView(R.layout.activity_alarm)

    val alarmId = intent.getStringExtra("alarmId")
    val isCritical = intent.getBooleanExtra("isCritical", false)

    Log.d("UNBROKEN_ALARM_DATA", "alarmId=$alarmId")
    Log.d("UNBROKEN_ALARM_DATA", "isCritical=$isCritical")

    val title = findViewById<TextView>(R.id.alarmTitle)
    val stopBtn = findViewById<Button>(R.id.stopButton)
    val snoozeBtn = findViewById<Button>(R.id.snoozeButton)

    val timeText = findViewById<TextView>(R.id.alarmTime)
    val formatter =java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault())
  timeText.text = formatter.format(java.util.Date())

    /* ============================================================
       ⚠ CRITICAL ALARM CASE
    ============================================================ */
if (isCritical) {

  snoozeBtn.visibility = View.GONE

  val keyguard =
    getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager

  val isLocked = keyguard.isKeyguardLocked

  Log.d("UNBROKEN_ALARM_DATA", "🔐 isLocked=$isLocked")

  // ✅ CASE 1: Phone already unlocked → go directly to brain game
  if (!isLocked) {

    Log.d("UNBROKEN_ALARM_DATA", "✅ Phone already unlocked → Starting Brain Game NOW")

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

  // ✅ CASE 2: Phone locked → show Unlock UI
  Log.w("UNBROKEN_ALARM_DATA", "⚠ Locked phone → Unlock required")

  stopBtn.setBackgroundResource(R.drawable.alarm_button_critical)

  title.text = "🧠 Critical Alarm\nUnlock to begin challenge"

  stopBtn.text = "UNLOCK"
  stopBtn.isEnabled = true

  stopBtn.setOnClickListener {

    Log.d("UNBROKEN_ALARM_DATA", "🔓 Unlock button pressed")

    keyguard.requestDismissKeyguard(
      this,
      object : KeyguardManager.KeyguardDismissCallback() {

        override fun onDismissSucceeded() {

          Log.d("UNBROKEN_ALARM_DATA", "✅ Unlock success → Launching Brain Game")

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

  Log.d("UNBROKEN_ALARM_DATA", "😴 Snooze pressed")

  if (alarmId == null) return@setOnClickListener

  // Stop sound
  AlarmSoundPlayer.stop()

  // Cancel current alarm
  AlarmScheduler.cancel(this, alarmId)

  // Snooze for 5 minutes
  val snoozeTime = System.currentTimeMillis() + (5 * 60 * 1000)

  AlarmScheduler.scheduleSnooze(
    this,
    schedulerId = alarmId + "_snooze",
    originalAlarmId = alarmId,
    triggerAt = snoozeTime,
    isCritical = false
  )

  Log.d("UNBROKEN_ALARM_DATA", "✅ Snoozed 5 minutes")

  // Stop service + close UI
  stopService(Intent(this, AlarmService::class.java))
  finish()
}


    /* ============================================================
       ✅ NON-CRITICAL STOP BUTTON
    ============================================================ */
    stopBtn.setOnClickListener {

      Log.d("UNBROKEN_ALARM_DATA", "======================================")
      Log.d("UNBROKEN_ALARM_DATA", "🛑 STOP BUTTON PRESSED")
      Log.d("UNBROKEN_ALARM_DATA", "alarmId=$alarmId")
      Log.d("UNBROKEN_ALARM_DATA", "======================================")

      if (alarmId == null) {
        Log.e("UNBROKEN_ALARM_DATA", "❌ alarmId missing → cannot stop")
        return@setOnClickListener
      }

      // ✅ Stop sound
      AlarmSoundPlayer.stop()
      Log.d("UNBROKEN_ALARM_DATA", "✅ Sound stopped")

      // ✅ Cancel current alarm
      AlarmScheduler.cancel(this, alarmId)
      Log.d("UNBROKEN_ALARM_DATA", "✅ Alarm cancelled")
       // Cancel snooze if exists
       AlarmScheduler.cancel(this, alarmId + "_snooze")


      // ✅ Reschedule next week
      AlarmScheduler.scheduleNextWeek(this, alarmId, false)
      Log.d("UNBROKEN_ALARM_DATA", "✅ Alarm rescheduled")

      // ✅ Close activity + task
       val stopServiceIntent = Intent(this, AlarmService::class.java)
        stopService(stopServiceIntent)
      finish()
     
    }
  }

  override fun onDestroy() {
    super.onDestroy()
    instance = null
    Log.d("UNBROKEN_ALARM_DATA", "AlarmActivity destroyed")
  }
}
