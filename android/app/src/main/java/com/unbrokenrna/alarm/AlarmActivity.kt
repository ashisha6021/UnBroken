package com.unbrokenrna.alarm

import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import android.util.Log

import com.facebook.react.ReactActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

class AlarmActivity : ReactActivity() {

  companion object {
    private const val TAG = "UNBROKEN_ALARM_DATA"

    // ✅ Needed for finishAlarmTask()
    var instance: AlarmActivity? = null
  }

  override fun getMainComponentName(): String = "UnBrokenRNA"

  override fun onCreate(savedInstanceState: Bundle?) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmActivity.onCreate() CALLED")
    Log.d(TAG, "intent = $intent")
    Log.d(TAG, "extras = ${intent.extras}")
    Log.d(TAG, "==============================")

    super.onCreate(savedInstanceState)

    // ✅ Store instance reference
    instance = this
    Log.d(TAG, "AlarmActivity instance SET")

    // ✅ Show over lock screen
    setShowWhenLocked(true)
    setTurnScreenOn(true)

    Log.d(TAG, "Lockscreen flags applied")

    // ✅ Keep screen awake + dismiss keyguard
    window.addFlags(
      WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
    )

    Log.d(TAG, "Window flags added successfully")

    // ✅ Handle incoming alarm intent
    handleAlarmIntent(intent)
  }

  override fun onNewIntent(intent: Intent?) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmActivity.onNewIntent() CALLED")
    Log.d(TAG, "newIntent = $intent")
    Log.d(TAG, "extras = ${intent?.extras}")
    Log.d(TAG, "==============================")

    super.onNewIntent(intent)

    setIntent(intent)

    handleAlarmIntent(intent)
  }

  override fun onDestroy() {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmActivity.onDestroy() CALLED")
    Log.d(TAG, "Clearing instance reference")
    Log.d(TAG, "==============================")

    instance = null

    super.onDestroy()
  }

  /* ============================================================
     HANDLE ALARM INTENT
     - Extract alarmId
     - Emit ALARM_LAUNCHED event to JS
  ============================================================ */
  private fun handleAlarmIntent(intent: Intent?) {

    Log.d(TAG, "------------------------------")
    Log.d(TAG, "handleAlarmIntent() CALLED")
    Log.d(TAG, "intent = $intent")
    Log.d(TAG, "------------------------------")

    val alarmId = intent?.getStringExtra("alarmId")

    if (alarmId.isNullOrEmpty()) {
      Log.e(TAG, "❌ ERROR: alarmId missing in AlarmActivity intent!")
      return
    }

    Log.d(TAG, "alarmId extracted successfully = $alarmId")

    val params = Arguments.createMap().apply {
      putString("alarmId", alarmId)
    }

    val reactContext = reactInstanceManager.currentReactContext

    if (reactContext != null) {

      // ✅ React already running → emit immediately
      Log.d(TAG, "React context READY → emitting ALARM_LAUNCHED now")

      reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("ALARM_LAUNCHED", params)

      Log.d(TAG, "ALARM_LAUNCHED emitted successfully")

    } else {

      // 🔒 React not ready → wait ONE TIME
      Log.w(TAG, "React context NOT READY → buffering event until initialized")

      val listener =
        object :
          com.facebook.react.ReactInstanceManager.ReactInstanceEventListener {

          override fun onReactContextInitialized(
            context: com.facebook.react.bridge.ReactContext
          ) {

            Log.d(TAG, "React context initialized → emitting ALARM_LAUNCHED now")

            context
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
              .emit("ALARM_LAUNCHED", params)

            Log.d(TAG, "ALARM_LAUNCHED emitted AFTER init successfully")

            // ✅ Remove listener after first trigger
            reactInstanceManager.removeReactInstanceEventListener(this)

            Log.d(TAG, "Listener removed successfully")
          }
        }

      reactInstanceManager.addReactInstanceEventListener(listener)

      Log.d(TAG, "ReactInstanceEventListener registered")

      // ✅ Force React init if needed
      if (!reactInstanceManager.hasStartedCreatingInitialContext()) {

        Log.d(TAG, "React context not started → creating in background now")

        reactInstanceManager.createReactContextInBackground()
      }
    }
  }
}
