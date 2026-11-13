package com.selfx.growgram

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.webkit.*
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.net.URLEncoder
import java.util.regex.Pattern

/**
 * SelfX Native Android Host Activity with WebView & System Assistant / Share Sheet receiver
 * Handles:
 * - ACTION_ASSIST & ACTION_VOICE_COMMAND from Home long-press, power-button, or navigation gestures
 * - VoiceInteractionService session triggers
 * - ACTION_SEND from TikTok, Instagram, YouTube Shorts, Douyin, etc.
 * - Runtime Microphone (RECORD_AUDIO) & Camera permissions
 * - Xiaomi HyperOS / MIUI gesture shortcut intents
 * - Direct WebView communication via Javascript Bridge & URL deep links
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private var isWebViewLoaded = false
    private var pendingSharedUrl: String? = null
    private var pendingLaunchDecreeVoice = false

    // Default Web App URL - Supports dynamic configuration via AndroidManifest meta-data
    private var appUrl = "http://localhost:3000"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Support launching on top of lock screen and turning screen on when triggered as Assistant
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }

        try {
            val appInfo = packageManager.getApplicationInfo(packageName, android.content.pm.PackageManager.GET_META_DATA)
            val configuredUrl = appInfo.metaData?.getString("selfx_app_url")
            if (!configuredUrl.isNullOrBlank()) {
                appUrl = configuredUrl
            }
            getSharedPreferences("selfx_prefs", MODE_PRIVATE).edit().putString("active_app_url", appUrl).apply()
        } catch (e: Exception) {}

        // Set modern dark background to match SelfX aesthetic
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )
        window.statusBarColor = android.graphics.Color.parseColor("#0a0a0c")
        window.navigationBarColor = android.graphics.Color.parseColor("#0a0a0c")

        webView = WebView(this)
        setContentView(webView)

        configureWebView()

        // If launched via Share or Web Share Target, forward immediately to QuickDownloadActivity
        // This ensures the user is NEVER kicked out of TikTok into the full GrowGram application!
        if (intent?.action == Intent.ACTION_SEND || 
            intent?.action == Intent.ACTION_SEND_MULTIPLE || 
            intent?.data?.path?.startsWith("/share-target") == true) {
            val forwardIntent = Intent(this, QuickDownloadActivity::class.java).apply {
                action = intent.action ?: Intent.ACTION_SEND
                type = intent.type ?: "text/plain"
                putExtras(intent)
                if (intent.data != null) {
                    data = intent.data
                }
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            startActivity(forwardIntent)
            finish()
            return
        }

        // Handle incoming intent if launched from Assistant or Share Sheet
        handleIncomingIntent(intent)

        val isAssistLaunch = intent?.action == Intent.ACTION_ASSIST ||
                             intent?.action == Intent.ACTION_VOICE_COMMAND ||
                             intent?.getStringExtra("decree_voice") == "1"

        if (isAssistLaunch) {
            pendingLaunchDecreeVoice = true
        }

        val isAlarmLaunch = intent?.getStringExtra("alarm_ring") == "1"

        val targetUrl = if (isAlarmLaunch) {
            "$appUrl/?alarm_ring=1"
        } else if (isAssistLaunch) {
            "$appUrl/?decree_voice=1"
        } else {
            pendingSharedUrl?.let {
                val isInstagram = it.contains("instagram.com") || it.contains("instagr.am")
                val isTikTok = it.contains("tiktok.com") || it.contains("douyin.com")
                val shareType = if (isInstagram) "instagram" else if (isTikTok) "tiktok" else "social"
                "$appUrl/?shared=$shareType&url=${URLEncoder.encode(it, "UTF-8")}"
            } ?: appUrl
        }

        webView.loadUrl(targetUrl)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        if (intent.action == Intent.ACTION_SEND || 
            intent.action == Intent.ACTION_SEND_MULTIPLE || 
            intent.data?.path?.startsWith("/share-target") == true) {
            val forwardIntent = Intent(this, QuickDownloadActivity::class.java).apply {
                action = intent.action ?: Intent.ACTION_SEND
                type = intent.type ?: "text/plain"
                putExtras(intent)
                if (intent.data != null) {
                    data = intent.data
                }
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            startActivity(forwardIntent)
            finish()
            return
        }
        handleIncomingIntent(intent)
    }

    fun checkAndRequestAudioPermissions() {
        val permissions = mutableListOf<String>()
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.RECORD_AUDIO) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            permissions.add(android.Manifest.permission.RECORD_AUDIO)
        }
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.CAMERA) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            permissions.add(android.Manifest.permission.CAMERA)
        }
        if (permissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toTypedArray(), 1001)
        }
    }

    private fun configureWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.userAgentString = "${settings.userAgentString} SelfX-Android-Native"

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                isWebViewLoaded = true

                if (pendingLaunchDecreeVoice) {
                    webView.evaluateJavascript("if (window.triggerDecreeVoiceAssistant) { window.triggerDecreeVoiceAssistant(); }", null)
                    pendingLaunchDecreeVoice = false
                }

                pendingSharedUrl?.let { sharedLink ->
                    dispatchLinkToWebView(sharedLink)
                    pendingSharedUrl = null
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val uri = request?.url ?: return false
                val scheme = uri.scheme ?: return false
                if (scheme == "http" || scheme == "https") {
                    return false
                }
                return try {
                    val intent = Intent(Intent.ACTION_VIEW, uri)
                    startActivity(intent)
                    true
                } catch (e: Exception) {
                    true
                }
            }
        }

        webView.addJavascriptInterface(AndroidNativeBridge(this), "AndroidNativeBridge")

        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
                // Grant microphone and camera access directly to WebView
                request?.grant(request.resources)
            }
        }
    }

    inner class AndroidNativeBridge(private val activity: MainActivity) {
        @JavascriptInterface
        fun openDefaultAssistantSettings() {
            activity.runOnUiThread {
                val intents = listOf(
                    // Direct Android Default Assistant App selection
                    Intent("android.settings.VOICE_INPUT_SETTINGS"),
                    Intent("android.settings.MANAGE_DEFAULT_APPS_SETTINGS"),
                    Intent(android.provider.Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS),
                    Intent().setClassName("com.android.settings", "com.android.settings.Settings\$VoiceInputSettingsActivity"),
                    Intent().setClassName("com.android.settings", "com.android.settings.applications.DefaultAppSettings"),
                    Intent(android.provider.Settings.ACTION_SETTINGS)
                )
                for (targetIntent in intents) {
                    try {
                        targetIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        activity.startActivity(targetIntent)
                        return@runOnUiThread
                    } catch (e: Exception) {}
                }
            }
        }

        @JavascriptInterface
        fun openHyperOsGestureShortcuts() {
            activity.runOnUiThread {
                val intents = listOf(
                    // Xiaomi HyperOS / MIUI Gesture and Button Shortcuts
                    Intent().setClassName("com.android.settings", "com.android.settings.KeyAndGestureShortcutSettings"),
                    Intent().setClassName("com.android.settings", "com.android.settings.Settings\$KeyAndGestureShortcutSettingsActivity"),
                    Intent("com.miui.action.KEY_AND_GESTURE_SHORTCUT_SETTINGS"),
                    Intent("android.settings.VOICE_INPUT_SETTINGS")
                )
                for (targetIntent in intents) {
                    try {
                        targetIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        activity.startActivity(targetIntent)
                        return@runOnUiThread
                    } catch (e: Exception) {}
                }
            }
        }

        @JavascriptInterface
        fun openAppPermissionsSettings() {
            activity.runOnUiThread {
                try {
                    val intent = Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                        data = Uri.fromParts("package", activity.packageName, null)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    activity.startActivity(intent)
                } catch (e: Exception) {}
            }
        }

        @JavascriptInterface
        fun openUsageAccessSettings() {
            activity.runOnUiThread {
                try {
                    val intent = Intent(android.provider.Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    activity.startActivity(intent)
                } catch (e: Exception) {
                    try {
                        val intent = Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                            data = Uri.fromParts("package", activity.packageName, null)
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        activity.startActivity(intent)
                    } catch (e2: Exception) {}
                }
            }
        }

        @JavascriptInterface
        fun hasUsageStatsPermission(): Boolean {
            return try {
                val appOps = activity.getSystemService(android.content.Context.APP_OPS_SERVICE) as android.app.AppOpsManager
                val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    appOps.unsafeCheckOpNoThrow(
                        android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
                        android.os.Process.myUid(),
                        activity.packageName
                    )
                } else {
                    @Suppress("DEPRECATION")
                    appOps.checkOpNoThrow(
                        android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
                        android.os.Process.myUid(),
                        activity.packageName
                    )
                }
                mode == android.app.AppOpsManager.MODE_ALLOWED
            } catch (e: Exception) {
                false
            }
        }

        @JavascriptInterface
        fun requestAudioPermission() {
            activity.runOnUiThread {
                activity.checkAndRequestAudioPermissions()
            }
        }

        @JavascriptInterface
        fun isNativeAndroid(): Boolean = true

        @JavascriptInterface
        fun scheduleNativeAlarm(hour: Int, minute: Int, label: String) {
            try {
                AlarmReceiver.scheduleExactAlarm(activity.applicationContext, hour, minute, label)
            } catch (_: Exception) {}
        }

        @JavascriptInterface
        fun cancelNativeAlarm() {
            try {
                AlarmReceiver.cancelAlarm(activity.applicationContext)
            } catch (_: Exception) {}
        }

        @JavascriptInterface
        fun stopNativeAlarmService() {
            try {
                val stopIntent = Intent(activity.applicationContext, AlarmForegroundService::class.java).apply {
                    action = AlarmForegroundService.ACTION_STOP_ALARM
                }
                activity.startService(stopIntent)
            } catch (_: Exception) {}
        }
    }

    /**
     * Inspects incoming Android Intent from System Assistant or Share Sheet
     */
    private fun handleIncomingIntent(intent: Intent?) {
        if (intent == null) return

        val action = intent.action
        val type = intent.type

        if (intent.getStringExtra("alarm_ring") == "1") {
            if (isWebViewLoaded) {
                webView.evaluateJavascript("if (window.triggerSelfXAlarmFromNative) { window.triggerSelfXAlarmFromNative(); } else { window.location.href = '/?alarm_ring=1'; }", null)
            }
            return
        }

        if (Intent.ACTION_ASSIST == action || Intent.ACTION_VOICE_COMMAND == action || intent.getStringExtra("decree_voice") == "1") {
            if (isWebViewLoaded) {
                webView.evaluateJavascript("if (window.triggerDecreeVoiceAssistant) { window.triggerDecreeVoiceAssistant(); } else { window.location.href = '/?decree_voice=1'; }", null)
            } else {
                pendingLaunchDecreeVoice = true
            }
            return
        }

        if ((Intent.ACTION_SEND == action || Intent.ACTION_SEND_MULTIPLE == action || intent.data?.path?.startsWith("/share-target") == true)) {
            val forwardIntent = Intent(this, QuickDownloadActivity::class.java).apply {
                this.action = intent.action ?: Intent.ACTION_SEND
                this.type = intent.type ?: "text/plain"
                putExtras(intent)
                if (intent.data != null) {
                    this.data = intent.data
                }
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            startActivity(forwardIntent)
            finish()
            return
        }
    }

    private fun extractUrlFromText(text: String): String? {
        val urlPattern = Pattern.compile("https?://[^\\s<>\"']+")
        val matcher = urlPattern.matcher(text)
        return if (matcher.find()) {
            matcher.group()
        } else null
    }

    private fun dispatchLinkToWebView(url: String) {
        val escaped = JSONObject.quote(url)
        val js = """
            (function() {
                if (window.handleNativeSharedLink) {
                    window.handleNativeSharedLink($escaped);
                } else {
                    window.location.href = '/?shared=social&url=' + encodeURIComponent($escaped);
                }
            })();
        """.trimIndent()
        webView.evaluateJavascript(js, null)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
