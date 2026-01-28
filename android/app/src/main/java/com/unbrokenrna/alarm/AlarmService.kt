package com.unbrokenrna.alarm

import android.app.*
import android.content.Intent
import android.os.*
import androidx.core.app.NotificationCompat

class AlarmService : Service() {

  companion object {
    const val CHANNEL_ID = "ALARM_CHANNEL"
    const val NOTIFICATION_ID = 1001

    // 🧯 FAILSAFE: auto-stop after X minutes
    private const val FAILSAFE_TIMEOUT_MS = 20 * 60 * 1000L // 20 minutes
  }

  private var lastKnownAlarmIntent: Intent? = null
  private var wakeLock: PowerManager.WakeLock? = null
  private var currentAlarmId: String? = null

  // 🧯 failsafe handler
  private val failsafeHandler = Handler(Looper.getMainLooper())
  private val failsafeRunnable = Runnable {
    stopAlarmInternal("FAILSAFE_TIMEOUT")
  }
override fun onStartCommand(
  intent: Intent?,
  flags: Int,
  startId: Int
): Int {

  val safeIntent = intent ?: lastKnownAlarmIntent
  if (safeIntent == null) return START_NOT_STICKY

  lastKnownAlarmIntent = safeIntent

  // 🔴 ABSOLUTE FIRST: STOP COMMAND
  if (safeIntent.getBooleanExtra("STOP_ALARM", false)) {
    stopAlarmInternal("USER_STOP")
    return START_NOT_STICKY // 🔥 DO NOT RESTART
  }

  // 🔥 capture alarmId
  safeIntent.getStringExtra("alarmId")?.let {
    currentAlarmId = it
  }

  acquireWakeLock()

  val isCritical = safeIntent.getBooleanExtra("isCritical", false)
  val ringtone = safeIntent.getStringExtra("ringtoneUri")

  ensureNotificationChannel()

  startForeground(
    NOTIFICATION_ID,
    buildNotification(isCritical)
  )

  if (!AlarmSoundPlayer.isPlaying()) {
    AlarmSoundPlayer.start(
      context = this,
      ringtoneUri = ringtone,
      isCritical = isCritical
    )

    startFailsafeTimer()
  }

  return START_STICKY
}

  /* ===========================
     🧯 FAILSAFE
     =========================== */

  private fun startFailsafeTimer() {
    failsafeHandler.removeCallbacks(failsafeRunnable)
    failsafeHandler.postDelayed(failsafeRunnable, FAILSAFE_TIMEOUT_MS)
  }

  private fun cancelFailsafeTimer() {
    failsafeHandler.removeCallbacks(failsafeRunnable)
  }

  /* ===========================
     🔔 NOTIFICATION
     =========================== */

  private fun openAlarmRingingPendingIntent(): PendingIntent {
    val intent = Intent(this, AlarmActivity::class.java).apply {
      putExtra("alarmId", currentAlarmId)
      addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
          Intent.FLAG_ACTIVITY_CLEAR_TOP or
          Intent.FLAG_ACTIVITY_SINGLE_TOP
      )
    }

    return PendingIntent.getActivity(
      this,
      200,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  private fun buildNotification(isCritical: Boolean): Notification {
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle(if (isCritical) "⚠️ Critical Alarm" else "⏰ Alarm")
      .setCategory(Notification.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)          // 🚫 cannot swipe away
      .setAutoCancel(false)

      // 🔥 tap notification → ALWAYS reopen Alarm Ringing screen
      .setContentIntent(openAlarmRingingPendingIntent())
      .setFullScreenIntent(openAlarmRingingPendingIntent(), true)

      // 🔒 ONLY allowed action
      .addAction(
        android.R.drawable.ic_menu_view,
        "Open Alarm",
        openAlarmRingingPendingIntent()
      )
      .build()
  }

  /* ===========================
     🔋 WAKELOCK
     =========================== */

  private fun acquireWakeLock() {
    if (wakeLock?.isHeld == true) return

    val pm = getSystemService(POWER_SERVICE) as PowerManager
    wakeLock = pm.newWakeLock(
      PowerManager.PARTIAL_WAKE_LOCK,
      "UnBroken:AlarmWakeLock"
    ).apply {
      setReferenceCounted(false)
      acquire(10 * 60 * 1000L) // renewed if needed
    }
  }

  /* ===========================
     ⛔ STOP (ONLY CALLED FROM UI)
     =========================== */

  
 private fun stopAlarmInternal(reason: String) {
  cancelFailsafeTimer()

  AlarmSoundPlayer.stop()

  AlarmIntentStore.alarmId = null
  AlarmIntentStore.isAlarmLaunch = false   // 🔥 REQUIRED

  wakeLock?.release()
  wakeLock = null

  stopForeground(true)
  stopSelf()
}


  override fun onDestroy() {
    cancelFailsafeTimer()
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  /* ===========================
     🔔 CHANNEL
     =========================== */

  private fun ensureNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val nm = getSystemService(NotificationManager::class.java)
      if (nm.getNotificationChannel(CHANNEL_ID) == null) {
        nm.createNotificationChannel(
          NotificationChannel(
            CHANNEL_ID,
            "Alarms",
            NotificationManager.IMPORTANCE_MAX
          ).apply {
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            setSound(null, null)
          }
        )
      }
    }
  }
}
