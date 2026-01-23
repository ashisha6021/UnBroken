package com.unbroken.app.alarm

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.provider.Settings
import android.util.Log

object AlarmSoundManager {

  private var player: MediaPlayer? = null

  fun play(context: Context, soundUri: Uri?) {
    stop()

    val uri =
      soundUri ?: Settings.System.DEFAULT_ALARM_ALERT_URI

    try {
      player = MediaPlayer().apply {
        setDataSource(context, uri)

        val attributes = AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_ALARM)
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .build()

        setAudioAttributes(attributes)
        isLooping = true
        prepare()
        start()
      }

      Log.d("AlarmSoundManager", "🔔 Alarm sound started")

    } catch (e: Exception) {
      Log.e("AlarmSoundManager", "❌ Failed to play alarm", e)
    }
  }

  fun stop() {
    try {
      player?.stop()
      player?.release()
    } catch (_: Exception) {}
    player = null
  }
}
