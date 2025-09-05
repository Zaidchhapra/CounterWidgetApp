package com.counterwidgetapp

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import org.json.JSONObject
import java.io.File

class CounterWidgetProvider : AppWidgetProvider() {

    companion object {
        private const val ACTION_INCREMENT = "com.counterwidgetapp.INCREMENT"
        private const val ACTION_DECREMENT = "com.counterwidgetapp.DECREMENT"
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        
        when (intent.action) {
            ACTION_INCREMENT -> {
                updateCounter(context, true)
                updateAllWidgets(context)
            }
            ACTION_DECREMENT -> {
                updateCounter(context, false)
                updateAllWidgets(context)
            }
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val count = getCounterValue(context)
        val views = RemoteViews(context.packageName, R.layout.counter_widget)
        
        views.setTextViewText(R.id.counter_text, count.toString())
        
        // Set up increment button
        val incrementIntent = Intent(context, CounterWidgetProvider::class.java).apply {
            action = ACTION_INCREMENT
        }
        val incrementPendingIntent = PendingIntent.getBroadcast(
            context, 0, incrementIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.increment_button, incrementPendingIntent)
        
        // Set up decrement button
        val decrementIntent = Intent(context, CounterWidgetProvider::class.java).apply {
            action = ACTION_DECREMENT
        }
        val decrementPendingIntent = PendingIntent.getBroadcast(
            context, 1, decrementIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.decrement_button, decrementPendingIntent)
        
        // Set up app launch intent
        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        val launchPendingIntent = PendingIntent.getActivity(
            context, 2, launchIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.counter_text, launchPendingIntent)
        
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun getCounterValue(context: Context): Int {
        return try {
            val sharedDir = File(context.filesDir, "shared")
            val counterFile = File(sharedDir, "counter.json")
            
            if (counterFile.exists()) {
                val content = counterFile.readText()
                val json = JSONObject(content)
                json.getInt("value")
            } else {
                0
            }
        } catch (e: Exception) {
            0
        }
    }

    private fun updateCounter(context: Context, increment: Boolean) {
        try {
            val sharedDir = File(context.filesDir, "shared")
            if (!sharedDir.exists()) {
                sharedDir.mkdirs()
            }
            
            val counterFile = File(sharedDir, "counter.json")
            val currentCount = getCounterValue(context)
            val newCount = if (increment) currentCount + 1 else maxOf(0, currentCount - 1)
            
            val json = JSONObject().apply {
                put("value", newCount)
                put("lastUpdated", System.currentTimeMillis())
            }
            
            counterFile.writeText(json.toString())
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun updateAllWidgets(context: Context) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val componentName = ComponentName(context, CounterWidgetProvider::class.java)
        val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
        onUpdate(context, appWidgetManager, appWidgetIds)
    }
}
