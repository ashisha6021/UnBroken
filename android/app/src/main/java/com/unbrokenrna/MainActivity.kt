package com.unbrokenrna

import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  companion object {
    private const val TAG = "UNBROKEN_ALARM_DATA"

    // ✅ Store latest alarmId
    var latestAlarmId: String? = null
  }

  override fun getMainComponentName(): String = "UnBrokenRNA"

  override fun onCreate(savedInstanceState: Bundle?) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "MainActivity.onCreate() CALLED")
    Log.d(TAG, "intent=$intent")
    Log.d(TAG, "extras=${intent.extras}")
    Log.d(TAG, "==============================")

    super.onCreate(savedInstanceState)

    val alarmId = intent?.getStringExtra("alarmId")

    if (!alarmId.isNullOrEmpty()) {
      latestAlarmId = alarmId

      Log.d(TAG, "🔥 Cold Start Alarm Detected")
      Log.d(TAG, "Stored latestAlarmId=$alarmId")
    } else {
      Log.d(TAG, "Normal launch (no alarmId)")
    }
  }

  override fun onNewIntent(intent: Intent?) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "MainActivity.onNewIntent() CALLED")
    Log.d(TAG, "newIntent=$intent")
    Log.d(TAG, "extras=${intent?.extras}")
    Log.d(TAG, "==============================")

    super.onNewIntent(intent)

    setIntent(intent)

    val alarmId = intent?.getStringExtra("alarmId")

    if (!alarmId.isNullOrEmpty()) {
      latestAlarmId = alarmId

      Log.d(TAG, "🔥 Notification Tap Alarm Detected")
      Log.d(TAG, "Stored latestAlarmId=$alarmId")
    } else {
      Log.w(TAG, "onNewIntent() missing alarmId")
    }
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
