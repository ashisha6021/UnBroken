package com.unbrokenrna.alarm

import android.app.*
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.unbrokenrna.MainActivity

class AlarmService : Service() {

  companion object {
    const val CHANNEL_ID = "ALARM_CHANNEL"
    const val NOTIFICATION_ID = 1001
    private const val TAG = "UNBROKEN_ALARM_DATA"
  }

  override fun onCreate() {
    super.onCreate()

    Log.d(TAG, "======================================")
    Log.d(TAG, "✅ AlarmService.onCreate() CALLED")
    Log.d(TAG, "======================================")
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {

    Log.d(TAG, "======================================")
    Log.d(TAG, "🔥 AlarmService.onStartCommand() CALLED")
    Log.d(TAG, "intent=$intent")
    Log.d(TAG, "extras=${intent?.extras}")
    Log.d(TAG, "======================================")

    val alarmId = intent?.getStringExtra("alarmId")

    if (alarmId.isNullOrEmpty()) {
      Log.e(TAG, "❌ alarmId missing → stopping service")
      stopSelf()
      return START_NOT_STICKY
    }

    val isCritical = intent.getBooleanExtra("isCritical", false)

    Log.d(TAG, "✅ alarmId=$alarmId")
    Log.d(TAG, "✅ isCritical=$isCritical")

    // ✅ STEP 1: Ensure notification channel exists
    ensureChannel()

    // ✅ STEP 2: Start Foreground Notification IMMEDIATELY
    Log.d(TAG, "➡ Starting Foreground Notification NOW...")

    startForeground(
      NOTIFICATION_ID,
      buildNotification(alarmId, isCritical)
    )

    Log.d(TAG, "✅ Foreground Notification ACTIVE")

    // ✅ STEP 3: Start Alarm Sound
    Log.d(TAG, "➡ Starting Alarm Sound now...")
    AlarmSoundPlayer.start(this, null, isCritical)
    Log.d(TAG, "✅ Alarm Sound STARTED")

    // ❌ DO NOT FORCE startActivity() here anymore
    // FullScreenIntent will handle lockscreen launch reliably

    Log.d(TAG, "======================================")
    Log.d(TAG, "🔥 AlarmService running successfully")
    Log.d(TAG, "======================================")

    return START_STICKY
  }

  /* ============================================================
     ✅ BUILD NOTIFICATION
     - Tap → MainActivity
     - FullScreenIntent → AlarmActivity (LOCKSCREEN UI FIX)
  ============================================================ */
  private fun buildNotification(
    alarmId: String,
    isCritical: Boolean
  ): Notification {

    Log.d(TAG, "--------------------------------------")
    Log.d(TAG, "buildNotification() CALLED")
    Log.d(TAG, "alarmId=$alarmId isCritical=$isCritical")
    Log.d(TAG, "--------------------------------------")

    /* ----------------------------
       1️⃣ FullScreenIntent → AlarmActivity
       (THIS FIXES LOCKSCREEN UI)
    ---------------------------- */
    val alarmScreenIntent =
      Intent(this, AlarmActivity::class.java).apply {

        putExtra("alarmId", alarmId)
        putExtra("isCritical", isCritical)

        addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_CLEAR_TOP or
            Intent.FLAG_ACTIVITY_SINGLE_TOP
        )
      }

    val fullScreenPendingIntent =
      PendingIntent.getActivity(
        this,
        alarmId.hashCode(),
        alarmScreenIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )

    Log.d(TAG, "✅ FullScreenIntent PendingIntent created")

    /* ----------------------------
       2️⃣ Tap Intent → MainActivity (Backup)
    ---------------------------- */
    val openIntent =
      Intent(this, MainActivity::class.java).apply {

        putExtra("alarmId", alarmId)
        putExtra("isCritical", isCritical)

        addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_SINGLE_TOP
        )
      }

    val tapPendingIntent =
      PendingIntent.getActivity(
        this,
        (alarmId.hashCode() + 999),
        openIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )

    Log.d(TAG, "✅ Tap PendingIntent created for MainActivity")

    /* ----------------------------
       3️⃣ Notification Builder
    ---------------------------- */
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("⏰ Alarm Ringing")
      .setContentText("Tap if screen didn’t open")
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)

      // ✅ Alarm Priority
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setCategory(NotificationCompat.CATEGORY_CALL)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)


      // ✅ MOST IMPORTANT FIX
      .setFullScreenIntent(fullScreenPendingIntent, true)

      // Backup tap
      .setContentIntent(tapPendingIntent)

      // Persistent alarm
      .setOngoing(true)
      .setAutoCancel(false)
      .setOnlyAlertOnce(true)

      .build()
  }

  /* ============================================================
     NOTIFICATION CHANNEL
  ============================================================ */
  private fun ensureChannel() {

    Log.d(TAG, "ensureChannel() CALLED")

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

      val nm = getSystemService(NotificationManager::class.java)

      if (nm.getNotificationChannel(CHANNEL_ID) == null) {

        Log.d(TAG, "Creating Alarm Notification Channel...")

        val channel =
          NotificationChannel(
            CHANNEL_ID,
            "Alarm Alerts",
            NotificationManager.IMPORTANCE_HIGH
          )

        channel.description = "Alarm notifications"
        channel.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        channel.setBypassDnd(true)
        channel.enableVibration(true)
        channel.enableLights(true)


        nm.createNotificationChannel(channel)

        Log.d(TAG, "✅ Notification Channel Created")

      } else {
        Log.d(TAG, "Notification Channel already exists")
      }
    }
  }

  override fun onDestroy() {

    Log.d(TAG, "======================================")
    Log.d(TAG, "🔥 AlarmService.onDestroy() CALLED")
    Log.d(TAG, "Stopping Alarm Sound...")
    Log.d(TAG, "======================================")

    AlarmSoundPlayer.stop()
      // ✅ REMOVE NOTIFICATION COMPLETELY
  val nm = getSystemService(NotificationManager::class.java)
  nm.cancel(NOTIFICATION_ID)

    Log.d(TAG, "✅ Alarm Sound STOPPED")

    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null
}
