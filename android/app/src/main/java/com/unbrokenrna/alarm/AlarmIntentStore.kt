package com.unbrokenrna.alarm

object AlarmIntentStore {
  @Volatile
  var alarmId: String? = null
  var isAlarmLaunch: Boolean = false
}
