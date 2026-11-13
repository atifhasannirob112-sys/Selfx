package com.selfx.growgram

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.Button
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors
import java.util.regex.Pattern

data class ModelItem(
    val id: String,
    val name: String,
    val handle: String,
    val emoji: String = "✨"
)

/**
 * In-App Floating Snaptube-Style Bottom Sheet Activity.
 * - Overlays TikTok in the background with dimmed translucent backdrop.
 * - Shows bottom sheet with top drag handle, "Post to GrowGram", saved model selector chips, and MP4 HD option.
 * - MP3 option removed per user requirement.
 * - Clicking "Post to GrowGram" publishes directly to GrowGram and immediately calls finish().
 * - The user NEVER leaves TikTok!
 */
class QuickDownloadActivity : Activity() {

    private val executor = Executors.newSingleThreadExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())

    private var targetUrl: String? = null
    private var isPosting = false
    private var selectedModelId = "niromax"
    private var selectedModelName = "Atif Nirob"

    private lateinit var postButton: Button
    private lateinit var statusTextView: TextView
    private lateinit var progressBar: ProgressBar

    private val availableModels = mutableListOf<ModelItem>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Make activity translucent and configure floating bottom sheet window
        window.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        window.setBackgroundDrawable(GradientDrawable().apply {
            setColor(Color.parseColor("#99000000")) // Translucent overlay over TikTok
        })
        window.addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
        window.setDimAmount(0.65f)

        // Extract shared URL from Intent
        targetUrl = extractUrlFromIntent(intent)

        if (targetUrl.isNullOrBlank()) {
            Toast.makeText(this, "কোনো ভিডিও লিঙ্ক পাওয়া যায়নি", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        // Initialize saved models from cache or defaults
        initSavedModels()

        // Build the modern UI
        buildSnaptubeBottomSheetUi()

        // Fetch live saved models from server in background
        fetchLivePersonasFromServer()

        // Auto-post immediately after a brief 350ms preview so user is NEVER pulled out of TikTok
        mainHandler.postDelayed({
            if (!isFinishing && !isPosting && !targetUrl.isNullOrBlank()) {
                executeQuickPost()
            }
        }, 350)
    }

    private fun initSavedModels() {
        val prefs = getSharedPreferences("selfx_prefs", Context.MODE_PRIVATE)
        val cached = prefs.getString("saved_personas_json", null)
        if (!cached.isNullOrBlank()) {
            try {
                val arr = JSONArray(cached)
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    val id = obj.optString("id", "")
                    val name = obj.optString("name", "")
                    val handle = obj.optString("handle", id)
                    if (id.isNotBlank() && name.isNotBlank()) {
                        val emoji = when {
                            name.contains("Atif", ignoreCase = true) -> "🔥"
                            name.contains("Tahmid", ignoreCase = true) -> "✨"
                            name.contains("Sajid", ignoreCase = true) -> "⚡"
                            name.contains("Fahim", ignoreCase = true) -> "🌟"
                            name.contains("Abbas", ignoreCase = true) -> "🔱"
                            else -> "👤"
                        }
                        availableModels.add(ModelItem(id, name, handle, emoji))
                    }
                }
            } catch (e: Exception) {}
        }

        if (availableModels.isEmpty()) {
            availableModels.addAll(listOf(
                ModelItem("hamza_malik", "Hamza Malik", "hamza_malik", "🇵🇰"),
                ModelItem("zaviyar_nauman", "Zaviyar Nauman", "zaviyar_nauman", "🔱"),
                ModelItem("daniyal_zafar", "Daniyal Zafar", "daniyal_zafar", "✨"),
                ModelItem("bilal_abbas", "Bilal Abbas", "bilal_abbas", "💎"),
                ModelItem("shahzad_noor", "Shahzad Noor", "shahzad_noor", "🔥"),
                ModelItem("zarrar_khan", "Zarrar Khan", "zarrar_khan", "⚡"),
                ModelItem("niromax", "Atif Nirob", "niromax", "👑")
            ))
        }

        // Set default selected model
        selectedModelId = availableModels[0].id
        selectedModelName = availableModels[0].name
    }

    private fun fetchLivePersonasFromServer() {
        val serverEndpoints = getServerEndpoints()
        executor.execute {
            for (baseUrl in serverEndpoints) {
                try {
                    val endpoint = "$baseUrl/api/community/personas"
                    val conn = (URL(endpoint).openConnection() as HttpURLConnection).apply {
                        requestMethod = "GET"
                        connectTimeout = 5000
                        readTimeout = 8000
                    }
                    if (conn.responseCode in 200..299) {
                        val responseText = BufferedReader(InputStreamReader(conn.inputStream, "UTF-8")).use { it.readText() }
                        val json = JSONObject(responseText)
                        if (json.optBoolean("success", false)) {
                            val personas = json.optJSONArray("personas")
                            if (personas != null && personas.length() > 0) {
                                val freshList = mutableListOf<ModelItem>()
                                for (i in 0 until personas.length()) {
                                    val obj = personas.getJSONObject(i)
                                    val id = obj.optString("id", "")
                                    val name = obj.optString("name", "")
                                    val handle = obj.optString("handle", id)
                                    if (id.isNotBlank() && name.isNotBlank()) {
                                        val emoji = when {
                                            name.contains("Atif", ignoreCase = true) -> "🔥"
                                            name.contains("Tahmid", ignoreCase = true) -> "✨"
                                            name.contains("Sajid", ignoreCase = true) -> "⚡"
                                            name.contains("Fahim", ignoreCase = true) -> "🌟"
                                            name.contains("Abbas", ignoreCase = true) -> "🔱"
                                            else -> "👤"
                                        }
                                        freshList.add(ModelItem(id, name, handle, emoji))
                                    }
                                }

                                if (freshList.isNotEmpty()) {
                                    // Save to prefs
                                    getSharedPreferences("selfx_prefs", Context.MODE_PRIVATE)
                                        .edit()
                                        .putString("saved_personas_json", personas.toString())
                                        .apply()

                                    mainHandler.post {
                                        availableModels.clear()
                                        availableModels.addAll(freshList)
                                        refreshModelChips()
                                    }
                                    break
                                }
                            }
                        }
                    }
                } catch (e: Exception) {}
            }
        }
    }

    private fun extractUrlFromIntent(intent: Intent?): String? {
        if (intent == null) return null
        val action = intent.action
        val type = intent.type

        if (Intent.ACTION_VIEW == action) {
            val data = intent.data
            val paramUrl = data?.getQueryParameter("url") ?: data?.getQueryParameter("text")
            if (!paramUrl.isNullOrBlank()) {
                val pattern = Pattern.compile("https?://[^\\s]+")
                val matcher = pattern.matcher(paramUrl)
                return if (matcher.find()) matcher.group() else paramUrl.trim()
            }
        }

        if (Intent.ACTION_SEND != action && Intent.ACTION_SEND_MULTIPLE != action) {
            return null
        }

        var rawText: String? = null
        if (type != null && type.startsWith("text/")) {
            rawText = intent.getStringExtra(Intent.EXTRA_TEXT) ?: intent.getStringExtra(Intent.EXTRA_SUBJECT)
        } else if (intent.hasExtra(Intent.EXTRA_TEXT)) {
            rawText = intent.getStringExtra(Intent.EXTRA_TEXT)
        }

        if (rawText.isNullOrBlank() && intent.hasExtra(Intent.EXTRA_STREAM)) {
            try {
                val streamUri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
                rawText = streamUri?.toString()
            } catch (e: Exception) {}
        }

        if (rawText.isNullOrBlank() && intent.clipData != null && intent.clipData!!.itemCount > 0) {
            try {
                val clipItem = intent.clipData!!.getItemAt(0)
                rawText = clipItem.text?.toString() ?: clipItem.uri?.toString()
            } catch (e: Exception) {}
        }

        if (!rawText.isNullOrBlank()) {
            val pattern = Pattern.compile("https?://[^\\s]+")
            val matcher = pattern.matcher(rawText)
            return if (matcher.find()) matcher.group() else rawText.trim()
        }

        return null
    }

    private fun buildSnaptubeBottomSheetUi() {
        val density = resources.displayMetrics.density
        fun dp(v: Int): Int = (v * density).toInt()

        // Root View: clicking top area closes sheet and immediately returns to TikTok
        val rootLayout = LinearLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.BOTTOM
            isClickable = true
            setOnClickListener {
                if (!isPosting) finish()
            }
        }

        // Bottom Sheet Card (clean Snaptube-style bottom sheet layout)
        val sheetCard = LinearLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(12), dp(20), dp(24))
            isClickable = true
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#12141a"))
                // Top-left and top-right rounded corners 26dp
                cornerRadii = floatArrayOf(
                    dp(26).toFloat(), dp(26).toFloat(),
                    dp(26).toFloat(), dp(26).toFloat(),
                    0f, 0f, 0f, 0f
                )
                setStroke(1, Color.parseColor("#27272a"))
            }
            elevation = dp(16).toFloat()
        }

        // Top Drag Handle Bar
        val handleBar = View(this).apply {
            layoutParams = LinearLayout.LayoutParams(dp(44), dp(4)).apply {
                gravity = Gravity.CENTER_HORIZONTAL
                setMargins(0, 0, 0, dp(14))
            }
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#52525b"))
                cornerRadius = dp(99).toFloat()
            }
        }
        sheetCard.addView(handleBar)

        // Title Header Row: Icon + "Post to GrowGram" + Close (X) button
        val titleRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(0, 0, 0, dp(14))
            }
        }

        val appIconBadge = TextView(this).apply {
            text = "⚡"
            textSize = 15f
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(dp(30), dp(30)).apply {
                setMargins(0, 0, dp(10), 0)
            }
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#facc15"))
                cornerRadius = dp(9).toFloat()
            }
        }

        val titleView = TextView(this).apply {
            text = "Post to GrowGram"
            textSize = 18f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
        }

        val closeButton = TextView(this).apply {
            text = "✕"
            textSize = 13f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.parseColor("#a1a1aa"))
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(dp(28), dp(28))
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#27272a"))
                cornerRadius = dp(99).toFloat()
                setStroke(1, Color.parseColor("#3f3f46"))
            }
            setOnClickListener {
                if (!isPosting) finish()
            }
        }

        titleRow.addView(appIconBadge)
        titleRow.addView(titleView)
        titleRow.addView(closeButton)
        sheetCard.addView(titleRow)

        // Model is selected automatically in background - no selection UI shown as requested
        selectedModelId = availableModels.firstOrNull()?.id ?: "niromax"
        selectedModelName = availableModels.firstOrNull()?.name ?: "Atif Nirob"

        // Video Format Card (Direct MP4 Full HD - Auto Post to GrowGram)
        val videoCard = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(14), dp(12), dp(14), dp(12))
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(0, 0, 0, dp(12))
            }
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#171922"))
                cornerRadius = dp(14).toFloat()
                setStroke(1, Color.parseColor("#2e323d"))
            }
        }

        val videoIconBox = TextView(this).apply {
            text = "▶"
            textSize = 15f
            setTextColor(Color.parseColor("#facc15"))
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(dp(36), dp(36)).apply {
                setMargins(0, 0, dp(12), 0)
            }
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#262311"))
                cornerRadius = dp(10).toFloat()
                setStroke(1, Color.parseColor("#715809"))
            }
        }

        val videoInfoCol = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
        }

        val videoTitle = TextView(this).apply {
            text = "MP4 Video Reel"
            textSize = 14.5f
            setTextColor(Color.WHITE)
            typeface = Typeface.DEFAULT_BOLD
        }

        val videoSubRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, dp(3), 0, 0)
        }

        val hdBadge = TextView(this).apply {
            text = "FULL HD 1080P"
            textSize = 9.5f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.BLACK)
            setPadding(dp(5), dp(1), dp(5), dp(1))
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#22c55e"))
                cornerRadius = dp(4).toFloat()
            }
        }

        val audioNote = TextView(this).apply {
            text = " • অরিজিনাল অডিও সহ"
            textSize = 11f
            setTextColor(Color.parseColor("#9ca3af"))
        }

        videoSubRow.addView(hdBadge)
        videoSubRow.addView(audioNote)

        videoInfoCol.addView(videoTitle)
        videoInfoCol.addView(videoSubRow)

        val checkCircle = TextView(this).apply {
            text = "✓"
            textSize = 13f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.BLACK)
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(dp(24), dp(24))
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#facc15"))
                cornerRadius = dp(99).toFloat()
            }
        }

        videoCard.addView(videoIconBox)
        videoCard.addView(videoInfoCol)
        videoCard.addView(checkCircle)
        sheetCard.addView(videoCard)

        // Shared Link Preview Box
        val urlCard = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(10), dp(8), dp(10), dp(8))
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(0, 0, 0, dp(14))
            }
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#0e1015"))
                cornerRadius = dp(10).toFloat()
                setStroke(1, Color.parseColor("#27272a"))
            }
        }

        val urlIcon = TextView(this).apply {
            text = "🔗"
            textSize = 11f
            setPadding(0, 0, dp(6), 0)
        }

        val urlPreview = TextView(this).apply {
            val display = targetUrl?.let { if (it.length > 55) it.substring(0, 52) + "..." else it } ?: ""
            text = display
            textSize = 11f
            setTextColor(Color.parseColor("#9ca3af"))
            isSingleLine = true
        }

        urlCard.addView(urlIcon)
        urlCard.addView(urlPreview)
        sheetCard.addView(urlCard)

        // Status / Error TextView
        statusTextView = TextView(this).apply {
            visibility = View.GONE
            textSize = 12.5f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            setPadding(dp(10), dp(6), dp(10), dp(6))
            val stParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(0, 0, 0, dp(8))
            }
            layoutParams = stParams
        }
        sheetCard.addView(statusTextView)

        progressBar = ProgressBar(this).apply {
            visibility = View.GONE
            val pbParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                gravity = Gravity.CENTER
                setMargins(0, 0, 0, dp(8))
            }
            layoutParams = pbParams
        }
        sheetCard.addView(progressBar)

        // Primary Vibrant Yellow Action Button
        postButton = Button(this).apply {
            text = "⚡ Post to GrowGram"
            setTextColor(Color.BLACK)
            textSize = 16f
            typeface = Typeface.DEFAULT_BOLD
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#facc15"))
                cornerRadius = dp(99).toFloat()
            }
            val btnParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(50)
            )
            layoutParams = btnParams
            setOnClickListener {
                executeQuickPost()
            }
        }
        sheetCard.addView(postButton)

        rootLayout.addView(sheetCard)
        setContentView(rootLayout)
    }

    private fun refreshModelChips() {
        if (selectedModelId.isBlank() && availableModels.isNotEmpty()) {
            selectedModelId = availableModels[0].id
            selectedModelName = availableModels[0].name
        }
    }

    private fun executeQuickPost() {
        val url = targetUrl ?: return
        if (isPosting) return

        isPosting = true
        postButton.isEnabled = false
        postButton.text = "পোস্ট হচ্ছে..."
        postButton.setBackgroundColor(Color.parseColor("#eab308"))
        progressBar.visibility = View.VISIBLE

        statusTextView.visibility = View.VISIBLE
        statusTextView.text = "ভিডিও ডাউনলোড ও GrowGram-এ পোস্ট হচ্ছে..."
        statusTextView.setTextColor(Color.parseColor("#facc15"))

        val serverEndpoints = getServerEndpoints()

        executor.execute {
            var postedSuccessfully = false
            var errorMessage = "ভিডিও পোস্ট করা সম্ভব হয়নি"

            for (baseUrl in serverEndpoints) {
                try {
                    val targetEndpoint = "$baseUrl/api/share/quick-post"
                    val connection = (URL(targetEndpoint).openConnection() as HttpURLConnection).apply {
                        requestMethod = "POST"
                        connectTimeout = 30000
                        readTimeout = 45000
                        doOutput = true
                        setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                        setRequestProperty("Accept", "application/json")
                    }

                    val payload = JSONObject().apply {
                        put("url", url)
                        put("mode", "video")
                        put("model", JSONObject().apply {
                            put("id", selectedModelId)
                            put("name", selectedModelName)
                            put("handle", selectedModelId)
                        })
                    }

                    OutputStreamWriter(connection.outputStream, "UTF-8").use { writer ->
                        writer.write(payload.toString())
                        writer.flush()
                    }

                    val responseCode = connection.responseCode
                    if (responseCode in 200..299) {
                        val responseText = BufferedReader(InputStreamReader(connection.inputStream, "UTF-8")).use { it.readText() }
                        val json = JSONObject(responseText)
                        if (json.optBoolean("success", false)) {
                            postedSuccessfully = true
                            break
                        } else {
                            errorMessage = json.optString("error", errorMessage)
                        }
                    } else {
                        val errorStream = connection.errorStream
                        if (errorStream != null) {
                            val errText = BufferedReader(InputStreamReader(errorStream, "UTF-8")).use { it.readText() }
                            try {
                                val json = JSONObject(errText)
                                errorMessage = json.optString("error", errorMessage)
                            } catch (e: Exception) {}
                        }
                    }
                } catch (netErr: Exception) {
                    errorMessage = netErr.localizedMessage ?: "নেটওয়ার্ক কানেকশন সমস্যা"
                }
            }

            mainHandler.post {
                if (postedSuccessfully) {
                    Toast.makeText(
                        this@QuickDownloadActivity,
                        "✓ TikTok ভিডিও সফলভাবে GrowGram-এ পোস্ট হয়েছে! 🚀",
                        Toast.LENGTH_LONG
                    ).show()
                    // Immediately finish this floating activity -> User stays right inside TikTok!
                    finish()
                } else {
                    isPosting = false
                    progressBar.visibility = View.GONE
                    postButton.isEnabled = true
                    postButton.text = "🔄 আবার চেষ্টা করুন"
                    postButton.setBackgroundColor(Color.parseColor("#facc15"))
                    statusTextView.text = "সমস্যা: $errorMessage"
                    statusTextView.setTextColor(Color.parseColor("#ef4444"))
                    Toast.makeText(this@QuickDownloadActivity, "পোস্ট ব্যর্থ: $errorMessage", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun getServerEndpoints(): List<String> {
        val endpoints = mutableListOf<String>()

        try {
            val prefs = getSharedPreferences("selfx_prefs", Context.MODE_PRIVATE)
            val savedUrl = prefs.getString("active_app_url", null)
            if (!savedUrl.isNullOrBlank()) {
                endpoints.add(savedUrl.trimEnd('/'))
            }
        } catch (e: Exception) {}

        try {
            val appInfo = packageManager.getApplicationInfo(packageName, android.content.pm.PackageManager.GET_META_DATA)
            val configuredUrl = appInfo.metaData?.getString("selfx_app_url")
            if (!configuredUrl.isNullOrBlank()) {
                endpoints.add(configuredUrl.trimEnd('/'))
            }
        } catch (e: Exception) {}

        endpoints.add("https://ais-pre-ctjdgfeeplnjq32qtuklii-369976751893.asia-southeast1.run.app")
        endpoints.add("https://ais-dev-ctjdgfeeplnjq32qtuklii-369976751893.asia-southeast1.run.app")
        endpoints.add("https://ais-pre-jomilvcnptecguivgbyqox-87872938411.asia-east1.run.app")
        endpoints.add("https://ais-dev-jomilvcnptecguivgbyqox-87872938411.asia-east1.run.app")
        endpoints.add("http://10.0.2.2:3000")
        endpoints.add("http://localhost:3000")

        return endpoints.distinct()
    }

    override fun onDestroy() {
        super.onDestroy()
        executor.shutdown()
    }
}
