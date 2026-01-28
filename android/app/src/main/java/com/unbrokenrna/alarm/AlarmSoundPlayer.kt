package com.unbrokenrna.alarm

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.util.Log

object AlarmSoundPlayer {

  private var player: MediaPlayer? = null

  private const val TAG = "AlarmSoundPlayer"

  /* ----------------------------------
     START ALARM SOUND
  ---------------------------------- */
  fun start(
    context: Context,
    ringtoneUri: String?,
    isCritical: Boolean
  ) {
    stop() // always reset safely

    try {
      val uri: Uri = if (!ringtoneUri.isNullOrEmpty()) {
        Uri.parse(ringtoneUri)
      } else {
        // ✅ SYSTEM DEFAULT ALARM TONE
        RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
      }

      val audioManager =
        context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

      // 🔊 FORCE ALARM STREAM VOLUME
      val maxVolume =
        audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM)

      audioManager.setStreamVolume(
        AudioManager.STREAM_ALARM,
        maxVolume,
        AudioManager.FLAG_REMOVE_SOUND_AND_VIBRATE
      )

      player = MediaPlayer().apply {

        setAudioAttributes(
          AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .build()
        )

        setDataSource(context, uri)

        isLooping = true

        setOnPreparedListener {
          Log.d(TAG, "🔔 Alarm sound started")
          start()
        }

        setOnErrorListener { _, what, extra ->
          Log.e(
            TAG,
            "❌ MediaPlayer error what=$what extra=$extra"
          )
          stop()
          true
        }

        prepareAsync()
      }

    } catch (e: Exception) {
      Log.e(TAG, "❌ Failed to start alarm sound", e)
      stop()
    }
  }

  /* ----------------------------------
     STOP ALARM SOUND
  ---------------------------------- */
  fun stop() {
    try {
      player?.let {
        if (it.isPlaying) it.stop()
        it.reset()
        it.release()
      }
    } catch (e: Exception) {
      Log.e(TAG, "❌ Error stopping alarm sound", e)
    } finally {
      player = null
    }
  }

  /* ----------------------------------
     CHECK IF SOUND IS PLAYING ✅ (NEW)
  ---------------------------------- */
  fun isPlaying(): Boolean {
    return player?.isPlaying == true
  }
}
