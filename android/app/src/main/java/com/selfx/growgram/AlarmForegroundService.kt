package com.selfx.growgram

import android.app.*
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.*
import androidx.core.app.NotificationCompat

class AlarmForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "selfx_wakeup_alarm_channel"
        const val NOTIFICATION_ID = 9901
        const val ACTION_STOP_ALARM = "com.selfx.growgram.ACTION_STOP_ALARM"
    }

    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null
    private var wakeLock: PowerManager.WakeLock? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP_ALARM) {
            stopAlarmPlayback()
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
            return START_NOT_STICKY
        }

        val label = intent?.getStringExtra("alarm_label") ?: "SelfX ওয়েক-আপ এলার্ম"
        acquireCpuWakeLock()
        startForegroundNotification(label)
        startLoudLoopingAlarm()
        startContinuousVibration()

        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "SelfX Wake-Up Alarm",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Persistent wake-up alarm requiring standing eyes-open selfie verification"
                setBypassDnd(true)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                enableVibration(true)
            }
            val nm = getSystemService(NotificationManager::class.java)
            nm?.createNotificationChannel(channel)
        }
    }

    private fun startForegroundNotification(label: String) {
        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("alarm_ring", "1")
        }
        val pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val fullScreenPendingIntent = PendingIntent.getActivity(this, 9902, openIntent, pendingFlags)

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("🚨 $label")
            .setContentText("উঠুন! দাঁড়িয়ে চোখ সোজা করে সেলফি তুলে এলার্ম বন্ধ করুন।")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setOngoing(true)
            .setAutoCancel(false)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .setContentIntent(fullScreenPendingIntent)
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }

    private fun startLoudLoopingAlarm() {
        try {
            mediaPlayer?.release()
            val alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)

            val audioManager = getSystemService(Context.AUDIO_SERVICE) as? AudioManager
            audioManager?.let {
                val maxVol = it.getStreamMaxVolume(AudioManager.STREAM_ALARM)
                it.setStreamVolume(AudioManager.STREAM_ALARM, maxVol, 0)
            }

            mediaPlayer = MediaPlayer().apply {
                setDataSource(applicationContext, alarmUri)
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                isLooping = true
                prepare()
                start()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun startContinuousVibration() {
        try {
            val pattern = longArrayOf(0, 700, 250, 700, 250, 900)
            vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vm.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createWaveform(pattern, 0))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(pattern, 0)
            }
        } catch (_: Exception) {}
    }

    private fun acquireCpuWakeLock() {
        try {
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "SelfX::AlarmWakeLock").apply {
                acquire(15 * 60 * 1000L)
            }
        } catch (_: Exception) {}
    }

    private fun stopAlarmPlayback() {
        try {
            mediaPlayer?.stop()
            mediaPlayer?.release()
            mediaPlayer = null
        } catch (_: Exception) {}
        try {
            vibrator?.cancel()
        } catch (_: Exception) {}
        try {
            if (wakeLock?.isHeld == true) wakeLock?.release()
        } catch (_: Exception) {}
    }

    override fun onDestroy() {
        stopAlarmPlayback()
        super.onDestroy()
    }
}
