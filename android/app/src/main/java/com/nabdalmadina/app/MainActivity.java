package com.nabdalmadina.app;

import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Enable Chrome DevTools Protocol for remote debugging of the WebView.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            android.webkit.WebView.setWebContentsDebuggingEnabled(true);
        }
        // The app controls dark/light theming itself via the mobile store
        // (server-persisted preference). Disable Android's algorithmic
        // WebView darkening so light backgrounds are never auto-inverted
        // into black even when the system is in night mode.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && getBridge() != null) {
            WebSettings settings = getBridge().getWebView().getSettings();
            disableForceDark(settings);
        }
    }

    private void disableForceDark(WebSettings settings) {
        try {
            WebSettings.class.getMethod("setForceDarkAllowed", boolean.class).invoke(settings, false);
        } catch (Throwable t) {
            try {
                WebSettings.class.getMethod("setAlgorithmicDarkeningAllowed", boolean.class).invoke(settings, false);
            } catch (Throwable ignored) {
                // Older WebView without force-dark APIs; nothing to disable.
            }
        }
    }
}