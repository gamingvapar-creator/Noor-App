import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.noor.ai',
  appName: 'Noor AI',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#ffffff",
    },
  },
  android: {
    backgroundColor: "#ffffff"
  }
};

export default config;
