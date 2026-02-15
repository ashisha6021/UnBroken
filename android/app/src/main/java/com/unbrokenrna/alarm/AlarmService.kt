package com.unbrokenrna.alarm

import android.app.*
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat

class AlarmService : Service() {

  companion object {
    const val CHANNEL_ID = "ALARM_CHANNEL"
    const val NOTIFICATION_ID = 1001
    private const val TAG = "AlarmService"
  }

  override fun onCreate() {
    super.onCreate()
    Log.d(TAG, "onCreate() AlarmService created")
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {

    val alarmId = intent?.getStringExtra("alarmId")

    Log.d(
      TAG,
      "onStartCommand() startId=$startId flags=$flags alarmId=$alarmId intent=$intent"
    )

    // 🚨 If alarmId is missing, do NOT restart sound again
    if (alarmId.isNullOrEmpty()) {
      Log.w(TAG, "onStartCommand() Missing alarmId → ignoring start request")
      return START_NOT_STICKY
    }

    // ✅ Ensure notification channel exists
    ensureChannel()

    // ✅ Start foreground notification immediately
    Log.d(TAG, "Starting foreground notification for alarmId=$alarmId")

    startForeground(
      NOTIFICATION_ID,
      buildNotification(alarmId)
    )

    // ✅ Start alarm sound ALWAYS
    Log.d(TAG, "Starting alarm sound for alarmId=$alarmId")
    AlarmSoundPlayer.start(this, null, false)

    // ✅ Do NOT restart automatically if system kills it
    return START_NOT_STICKY
  }

  /* ============================================================
     NOTIFICATION
     - Ongoing (cannot swipe away)
     - Tap opens AlarmActivity ONLY
     - Does NOT stop alarm
  ============================================================ */
  private fun buildNotification(alarmId: String): Notification {

    Log.d(TAG, "buildNotification() Creating notification for alarmId=$alarmId")

    val openIntent = Intent(this, AlarmActivity::class.java).apply {
      putExtra("alarmId", alarmId)

      // ✅ Correct flags (NO CLEAR_TOP loop)
      addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_SINGLE_TOP
      )
    }

    val pendingIntent = PendingIntent.getActivity(
      this,
      alarmId.hashCode(),
      openIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle("⏰ Alarm Ringing")
      .setContentText("Tap to solve Brain Game and stop alarm")
      .setCategory(Notification.CATEGORY_ALARM)

      // 🚨 Max priority + alarm visibility
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)

      // 🔒 User cannot dismiss
      .setOngoing(true)
      .setAutoCancel(false)

      // ✅ Prevent re-alert spam
      .setOnlyAlertOnce(true)

      // ✅ Tap should ONLY open UI
      .setContentIntent(pendingIntent)

      // ❌ DO NOT USE fullscreen intent (causes double launch + crash)
      // .setFullScreenIntent(pendingIntent, true)

      .build()
  }

  /* ============================================================
     CLEANUP
  ============================================================ */
  override fun onDestroy() {
    Log.d(TAG, "onDestroy() AlarmService destroyed → stopping sound")

    // Stop sound safely
    AlarmSoundPlayer.stop()

    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  /* ============================================================
     NOTIFICATION CHANNEL
  ============================================================ */
  private fun ensureChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

      val nm = getSystemService(NotificationManager::class.java)

      if (nm.getNotificationChannel(CHANNEL_ID) == null) {

        Log.d(TAG, "ensureChannel() Creating Alarm notification channel")

        val channel = NotificationChannel(
          CHANNEL_ID,
          "Alarms",
          NotificationManager.IMPORTANCE_HIGH
        ).apply {
          description = "Alarm notifications"
          lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        }

        nm.createNotificationChannel(channel)

      } else {
        Log.d(TAG, "ensureChannel() Alarm channel already exists")
      }
    }
  }
}
