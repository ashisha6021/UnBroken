package com.unbrokenrna.alarm

import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

class AlarmActivity : ReactActivity() {

  override fun getMainComponentName(): String = "UnBrokenRNA"

  override fun onCreate(savedInstanceState: Bundle?) {
    android.util.Log.d("AlarmActivity", "onCreate() intent=$intent")
    super.onCreate(savedInstanceState)

    setShowWhenLocked(true)
    setTurnScreenOn(true)

    window.addFlags(
      WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
      WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
    )

    handleAlarmIntent(intent)
  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)
    android.util.Log.d("AlarmActivity", "onNewIntent() intent=$intent")
    handleAlarmIntent(intent)
  }

private fun handleAlarmIntent(intent: Intent?) {
  val alarmId = intent?.getStringExtra("alarmId") ?: run {
    android.util.Log.w("AlarmActivity", "handleAlarmIntent() missing alarmId extra, intent=$intent")
    return
  }
  android.util.Log.d("AlarmActivity", "handleAlarmIntent() alarmId=$alarmId")

  val params = Arguments.createMap().apply {
    putString("alarmId", alarmId)
  }

  val reactContext = reactInstanceManager.currentReactContext

  if (reactContext != null) {
    // ✅ React already ready → emit immediately
    android.util.Log.d(
      "AlarmActivity",
      "handleAlarmIntent() React context READY, emitting ALARM_LAUNCHED for alarmId=$alarmId"
    )
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("ALARM_LAUNCHED", params)
  } else {
    // 🔒 Buffer until React is ready (ONE TIME)
    android.util.Log.d(
      "AlarmActivity",
      "handleAlarmIntent() React context NOT ready, registering listener for alarmId=$alarmId"
    )
    val listener =
      object : com.facebook.react.ReactInstanceManager.ReactInstanceEventListener {
        override fun onReactContextInitialized(context: com.facebook.react.bridge.ReactContext) {
          android.util.Log.d(
            "AlarmActivity",
            "React context initialized, emitting ALARM_LAUNCHED for alarmId=$alarmId"
          )
          context
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("ALARM_LAUNCHED", params)

          // 🔥 VERY IMPORTANT: remove listener after first emit
          reactInstanceManager.removeReactInstanceEventListener(this)
        }
      }

    reactInstanceManager.addReactInstanceEventListener(listener)

    if (!reactInstanceManager.hasStartedCreatingInitialContext()) {
      reactInstanceManager.createReactContextInBackground()
    }
  }
}


}
