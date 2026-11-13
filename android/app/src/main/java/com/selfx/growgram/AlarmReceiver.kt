package com.selfx.growgram

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager
import androidx.core.content.ContextCompat
import java.util.Calendar

class AlarmReceiver : BroadcastReceiver() {

    companion object {
        const val PREFS_NAME = "selfx_native_alarm_prefs"
        const val KEY_ENABLED = "alarm_enabled"
        const val KEY_HOUR = "alarm_hour"
        const val KEY_MINUTE = "alarm_minute"
        const val KEY_LABEL = "alarm_label"
        const val REQUEST_CODE = 8844

        fun scheduleExactAlarm(context: Context, hour: Int, minute: Int, label: String) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit()
                .putBoolean(KEY_ENABLED, true)
                .putInt(KEY_HOUR, hour)
                .putInt(KEY_MINUTE, minute)
                .putString(KEY_LABEL, label)
                .apply()

            val cal = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
                if (timeInMillis <= System.currentTimeMillis()) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }

            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val triggerIntent = Intent(context, AlarmReceiver::class.java).apply {
                putExtra("alarm_label", label)
            }
            val pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            val pendingTrigger = PendingIntent.getBroadcast(context, REQUEST_CODE, triggerIntent, pendingFlags)

            val showIntent = Intent(context, MainActivity::class.java).apply {
                putExtra("alarm_ring", "1")
            }
            val pendingShow = PendingIntent.getActivity(context, REQUEST_CODE + 1, showIntent, pendingFlags)

            try {
                val info = AlarmManager.AlarmClockInfo(cal.timeInMillis, pendingShow)
                alarmManager.setAlarmClock(info, pendingTrigger)
            } catch (_: SecurityException) {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cal.timeInMillis, pendingTrigger)
            }
        }

        fun cancelAlarm(context: Context) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putBoolean(KEY_ENABLED, false).apply()

            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, AlarmReceiver::class.java)
            val pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            val pending = PendingIntent.getBroadcast(context, REQUEST_CODE, intent, pendingFlags)
            alarmManager.cancel(pending)
        }
    }

    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action == Intent.ACTION_BOOT_COMPLETED) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            if (prefs.getBoolean(KEY_ENABLED, false)) {
                val h = prefs.getInt(KEY_HOUR, 5)
                val m = prefs.getInt(KEY_MINUTE, 30)
                val lbl = prefs.getString(KEY_LABEL, "SelfX ওয়েক-আপ এলার্ম") ?: "SelfX ওয়েক-আপ এলার্ম"
                scheduleExactAlarm(context, h, m, lbl)
            }
            return
        }

        val label = intent?.getStringExtra("alarm_label") ?: "SelfX ওয়েক-আপ এলার্ম"

        // Briefly wake screen so full-screen activity launches reliably even while locked
        try {
            val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            @Suppress("DEPRECATION")
            val wl = pm.newWakeLock(
                PowerManager.FULL_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP or PowerManager.ON_AFTER_RELEASE,
                "SelfX::AlarmScreenWake"
            )
            wl.acquire(10_000L)
        } catch (_: Exception) {}

        val serviceIntent = Intent(context, AlarmForegroundService::class.java).apply {
            putExtra("alarm_label", label)
        }
        ContextCompat.startForegroundService(context, serviceIntent)

        // Reschedule for tomorrow automatically so daily alarm never drops
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        if (prefs.getBoolean(KEY_ENABLED, false)) {
            val h = prefs.getInt(KEY_HOUR, 5)
            val m = prefs.getInt(KEY_MINUTE, 30)
            scheduleExactAlarm(context, h, m, label)
        }

        val activityIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("alarm_ring", "1")
        }
        try {
            context.startActivity(activityIntent)
        } catch (_: Exception) {}
    }
}
