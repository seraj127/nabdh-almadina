import type { CapacitorConfig } from '@capacitor/cli'

const rawServerUrl = process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL
// Cache-busting: append a unique param so the WebView always fetches fresh JS
const BUILD_ID = '20260902-1'
const serverUrl = rawServerUrl ? `${rawServerUrl}?_cb=${BUILD_ID}` : undefined

const config: CapacitorConfig = {
  appId: 'com.nabdalmadina.app',
  appName: 'نبض المدينة',
  webDir: 'out',
  ...(serverUrl ? {
    server: {
      url: serverUrl,
      androidScheme: 'https',
      cleartext: false,
    },
  } : {
    server: {
      androidScheme: 'https',
      cleartext: false,
    },
  }),
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#004B63',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#004B63',
      showSpinner: true,
      spinnerColor: '#FF6F61',
      androidScaleType: 'CENTER_CROP',
    },
  },
  android: {
    backgroundColor: '#004B63',
  },
}

export default config
