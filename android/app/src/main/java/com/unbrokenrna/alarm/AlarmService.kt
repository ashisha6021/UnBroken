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
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {

  val alarmId = intent?.getStringExtra("alarmId")

    if (alarmId.isNullOrEmpty()) {
      Log.e(TAG, "❌ alarmId missing → stopping service")
      stopSelf()
      return START_NOT_STICKY
    }

    val isCritical = intent.getBooleanExtra("isCritical", false)



   
    ensureChannel()

  

    startForeground(
      NOTIFICATION_ID,
      buildNotification(alarmId, isCritical)
    )

 AlarmSoundPlayer.start(this, null, isCritical)
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

   

    /* ----------------------------
       3️⃣ Notification Builder
    ---------------------------- */
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("⏰ Alarm Ringing")
      .setContentText("Tap if screen didn’t open")
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)

     
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setCategory(NotificationCompat.CATEGORY_CALL)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)


      
      .setFullScreenIntent(fullScreenPendingIntent, true)

 
      .setContentIntent(tapPendingIntent)

     
      .setOngoing(true)
      .setAutoCancel(false)
      .setOnlyAlertOnce(true)

      .build()
  }

  /* ============================================================
     NOTIFICATION CHANNEL
  ============================================================ */
  private fun ensureChannel() {

  

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

      val nm = getSystemService(NotificationManager::class.java)

      if (nm.getNotificationChannel(CHANNEL_ID) == null) {

        

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

      } else {
        Log.d(TAG, "Notification Channel already exists")
      }
    }
  }

  override fun onDestroy() {

    AlarmSoundPlayer.stop()
    
  val nm = getSystemService(NotificationManager::class.java)
  nm.cancel(NOTIFICATION_ID)


    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null
}
