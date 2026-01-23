package com.unbroken.app.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri

class AlarmReceiver : BroadcastReceiver() {

  override fun onReceive(context: Context, intent: Intent) {
    val soundUriStr = intent.getStringExtra("soundUri")
    val soundUri = soundUriStr?.let { Uri.parse(it) }

    AlarmSoundManager.play(context, soundUri)

    // Optional: launch full-screen UI here later
  }
}
