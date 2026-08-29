import type { CapacitorConfig } from '@capacitor/cli'

const serverUrl = process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL

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
