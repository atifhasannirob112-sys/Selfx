package com.selfx.growgram

import android.content.Intent
import android.os.Bundle
import android.service.voice.VoiceInteractionService
import android.service.voice.VoiceInteractionSession
import android.service.voice.VoiceInteractionSessionService
import android.speech.RecognitionService

/**
 * Registers SelfX — Decree AI as an official Android Digital Assistant app
 * in Android Settings -> Apps -> Default Apps -> Digital assistant app.
 * Pressing and holding the Power Button launches Decree AI Voice Mode directly.
 */
class DecreeVoiceInteractionService : VoiceInteractionService()

class DecreeVoiceInteractionSessionService : VoiceInteractionSessionService() {
    override fun onNewSession(args: Bundle?): VoiceInteractionSession {
        return object : VoiceInteractionSession(this) {
            override fun onShow(args: Bundle?, showFlags: Int) {
                super.onShow(args, showFlags)
                val intent = Intent(context, MainActivity::class.java).apply {
                    action = Intent.ACTION_ASSIST
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    putExtra("decree_voice", "1")
                }
                try {
                    startAssistantActivity(intent)
                } catch (e: Exception) {
                    try {
                        context.startActivity(intent)
                    } catch (e2: Exception) {}
                }
                hide()
            }
        }
    }
}

class DecreeRecognitionService : RecognitionService() {
    override fun onStartListening(intent: Intent?, listener: Callback?) {}
    override fun onCancel(listener: Callback?) {}
    override fun onStopListening(listener: Callback?) {}
}
