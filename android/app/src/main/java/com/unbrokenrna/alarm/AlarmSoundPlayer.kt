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

  
    stop()

    try {

      
      val uri: Uri = if (!ringtoneUri.isNullOrEmpty()) {
        
        Uri.parse(ringtoneUri)
      } else {
  
        RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
      }

   

     
      val audioManager =
        context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    
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
        
          start()
        }

        setOnErrorListener { _, what, extra ->
          Log.e(TAG, "❌ MediaPlayer ERROR what=$what extra=$extra")
          stop()
          true
        }

        
        prepareAsync()
      }


    } catch (e: Exception) {

      stop()
    }

 
  }

  /* ----------------------------------
     STOP ALARM SOUND
  ---------------------------------- */
  fun stop() {

   

    try {
      player?.let {

       

        if (it.isPlaying) {
    
          it.stop()
        } else {
          Log.d(TAG, "MediaPlayer not playing")
        }

        it.reset()
        it.release()

        
      }

    } catch (e: Exception) {

      Log.e(TAG, "❌ ERROR while stopping alarm sound", e)

    } finally {

      player = null
     
    }
  }

  /* ----------------------------------
     CHECK IF SOUND IS PLAYING
  ---------------------------------- */
  fun isPlaying(): Boolean {

    val playing = player?.isPlaying == true
 

    return playing
  }
}
