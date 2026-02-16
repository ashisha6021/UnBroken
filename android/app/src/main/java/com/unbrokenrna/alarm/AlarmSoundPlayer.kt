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

  private const val TAG = "UNBROKEN_ALARM_DATA"

  fun isRinging(): Boolean {
  return player != null && player!!.isPlaying
}

  /* ----------------------------------
     START ALARM SOUND
  ---------------------------------- */
  fun start(
    context: Context,
    ringtoneUri: String?,
    isCritical: Boolean
  ) {

    Log.d(TAG, "==============================")
    Log.d(TAG, "AlarmSoundPlayer.start() CALLED")
    Log.d(TAG, "ringtoneUri=$ringtoneUri isCritical=$isCritical")

    // Always reset safely
    stop()

    try {

      // ✅ Select ringtone
      val uri: Uri = if (!ringtoneUri.isNullOrEmpty()) {
        Log.d(TAG, "Custom ringtone selected: $ringtoneUri")
        Uri.parse(ringtoneUri)
      } else {
        Log.d(TAG, "Using SYSTEM DEFAULT ALARM ringtone")
        RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
      }

      Log.d(TAG, "Ringtone URI resolved = $uri")

      // ✅ Audio manager
      val audioManager =
        context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

      // 🔊 Force alarm stream volume
      val maxVolume =
        audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM)

      Log.d(TAG, "Max Alarm Volume = $maxVolume")
      Log.d(TAG, "Forcing alarm volume to MAX...")

      audioManager.setStreamVolume(
        AudioManager.STREAM_ALARM,
        maxVolume,
        AudioManager.FLAG_REMOVE_SOUND_AND_VIBRATE
      )

      Log.d(TAG, "Volume forced successfully")

      // ✅ MediaPlayer init
      Log.d(TAG, "Creating MediaPlayer instance...")

      player = MediaPlayer().apply {

        setAudioAttributes(
          AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .build()
        )

        Log.d(TAG, "AudioAttributes set successfully")

        setDataSource(context, uri)

        Log.d(TAG, "MediaPlayer datasource set")

        isLooping = true
        Log.d(TAG, "Looping enabled")

        setOnPreparedListener {
          Log.d(TAG, "MediaPlayer prepared → STARTING SOUND NOW 🔔")
          start()
        }

        setOnErrorListener { _, what, extra ->
          Log.e(TAG, "❌ MediaPlayer ERROR what=$what extra=$extra")
          stop()
          true
        }

        Log.d(TAG, "Calling prepareAsync()...")
        prepareAsync()
      }

      Log.d(TAG, "MediaPlayer preparation started")

    } catch (e: Exception) {

      Log.e(TAG, "❌ FAILED to start alarm sound", e)
      stop()
    }

    Log.d(TAG, "==============================")
  }

  /* ----------------------------------
     STOP ALARM SOUND
  ---------------------------------- */
  fun stop() {

    Log.d(TAG, "AlarmSoundPlayer.stop() CALLED")

    try {
      player?.let {

        Log.d(TAG, "Stopping MediaPlayer...")

        if (it.isPlaying) {
          Log.d(TAG, "MediaPlayer is playing → stopping now")
          it.stop()
        } else {
          Log.d(TAG, "MediaPlayer not playing")
        }

        it.reset()
        it.release()

        Log.d(TAG, "MediaPlayer released successfully")
      }

    } catch (e: Exception) {

      Log.e(TAG, "❌ ERROR while stopping alarm sound", e)

    } finally {

      player = null
      Log.d(TAG, "Player set to NULL")
    }
  }

  /* ----------------------------------
     CHECK IF SOUND IS PLAYING
  ---------------------------------- */
  fun isPlaying(): Boolean {

    val playing = player?.isPlaying == true
    Log.d(TAG, "AlarmSoundPlayer.isPlaying() = $playing")

    return playing
  }
}
