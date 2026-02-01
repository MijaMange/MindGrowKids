import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mindgrowkids.app',
  appName: 'MindGrow Kids',
  webDir: 'dist',
  server: {
    cleartext: false, // HTTPS i produktion
    androidScheme: 'https',
    iosScheme: 'https'
  }
};

export default config;




