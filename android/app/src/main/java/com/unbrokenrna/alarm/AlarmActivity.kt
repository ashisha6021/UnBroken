package com.unbrokenrna.alarm

import android.os.Bundle
import android.view.WindowManager
import com.facebook.react.ReactActivity

class AlarmActivity : ReactActivity() {

  override fun getMainComponentName(): String = "UnBrokenRNA"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null) // 🔥 important for release builds

    setShowWhenLocked(true)
    setTurnScreenOn(true)

    window.addFlags(
      WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
      WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
    )

    handleIntent(intent)
  }

  override fun onNewIntent(intent: android.content.Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleIntent(intent)
  }

  private fun handleIntent(intent: android.content.Intent?) {
    val alarmId = intent?.getStringExtra("alarmId")
    if (alarmId != null) {
      AlarmIntentStore.alarmId = alarmId
      AlarmIntentStore.isAlarmLaunch = true
    }
  }

  // ❌ NO finishAndRemoveTask
}
