package com.nabdalmadina.app;

import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // The app controls dark/light theming itself via the mobile store
        // (server-persisted preference). Disable Android's algorithmic
        // WebView darkening so light backgrounds are never auto-inverted
        // into black even when the system is in night mode.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && getBridge() != null) {
            WebSettings settings = getBridge().getWebView().getSettings();
            settings.setForceDarkAllowed(false);
        }
    }
}