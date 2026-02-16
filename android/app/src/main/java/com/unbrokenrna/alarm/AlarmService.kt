package com.unbrokenrna.alarm

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.SystemClock
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
    Log.d(TAG, "AlarmService onCreate()")
  }

  override fun onTaskRemoved(rootIntent: Intent?) {

  Log.e(TAG, "🔥 USER CLEARED APP FROM RECENTS")

  Log.e(TAG, "Restarting alarm service immediately...")

  val restartIntent = Intent(applicationContext, AlarmService::class.java)

  val pendingIntent = PendingIntent.getService(
    this,
    9999,
    restartIntent,
    PendingIntent.FLAG_IMMUTABLE
  )

  val alarmManager =
    getSystemService(Context.ALARM_SERVICE) as AlarmManager

  alarmManager.setExact(
    AlarmManager.ELAPSED_REALTIME_WAKEUP,
    SystemClock.elapsedRealtime() + 1000,
    pendingIntent
  )

  super.onTaskRemoved(rootIntent)
}


 override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {

  Log.d(TAG, "==============================")
  Log.d(TAG, "AlarmService onStartCommand() CALLED")

  val alarmId = intent?.getStringExtra("alarmId")

  if (alarmId.isNullOrEmpty()) {
    Log.d(TAG, "Missing alarmId → exiting")
    return return START_STICKY
  }

  ensureChannel()

  startForeground(
    NOTIFICATION_ID,
    buildNotification(alarmId)
  )

  if (AlarmSoundPlayer.isPlaying()) {
    Log.w(TAG, "Alarm already playing → no restart")
    return return START_STICKY
  }

  Log.d(TAG, "Starting alarm sound now...")
  AlarmSoundPlayer.start(this, null, false)

  return return START_STICKY
}


  private fun buildNotification(alarmId: String): Notification {

    Log.d(TAG, "buildNotification() alarmId=$alarmId")

    val openIntent = Intent(this, MainActivity::class.java).apply {
      putExtra("alarmId", alarmId)

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

   Log.d(TAG, "PendingIntent created for MainActivity")


    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle("⏰ Alarm Ringing")
      .setContentText("Tap to open alarm screen")
      .setCategory(Notification.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)

      .setOngoing(true)
      .setAutoCancel(false)
      .setOnlyAlertOnce(true)

      // ✅ Tap opens AlarmActivity ONLY
      .setContentIntent(pendingIntent)

      .build()
  }

  override fun onDestroy() {
    Log.d(TAG, "AlarmService onDestroy() → stopping sound")
    AlarmSoundPlayer.stop()
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun ensureChannel() {

    Log.d(TAG, "ensureChannel() called")

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

      val nm = getSystemService(NotificationManager::class.java)

      if (nm.getNotificationChannel(CHANNEL_ID) == null) {

        Log.d(TAG, "Creating Notification Channel...")

        val channel = NotificationChannel(
          CHANNEL_ID,
          "Alarms",
          NotificationManager.IMPORTANCE_HIGH
        )

        nm.createNotificationChannel(channel)

        Log.d(TAG, "Notification Channel created successfully")

      } else {
        Log.d(TAG, "Notification Channel already exists")
      }
    }
  }
}
