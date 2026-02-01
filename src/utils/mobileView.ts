import { Capacitor } from '@capacitor/core';

/**
 * Kontrollerar om appen körs i native app-läge (iOS/Android via Capacitor)
 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Kontrollerar om appen körs i PWA-läge (installerad som web app)
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Kolla om appen körs i standalone-läge (PWA)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;
  
  return isStandalone || isIOSStandalone;
}

/**
 * Kontrollerar om appen körs på mobil enhet (native app eller mobil webbläsare)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  return mobileRegex.test(String(userAgent));
}

/**
 * Hämtar plattformsinformation
 */
export function getPlatformInfo(): {
  platform: 'web' | 'ios' | 'android';
  isNative: boolean;
  isPWA: boolean;
  isMobile: boolean;
} {
  const native = isNativeApp();
  const pwa = isPWA();
  const mobile = isMobileDevice();
  
  let platform: 'web' | 'ios' | 'android' = 'web';
  if (native) {
    const capPlatform = Capacitor.getPlatform();
    if (capPlatform === 'ios') platform = 'ios';
    else if (capPlatform === 'android') platform = 'android';
  }
  
  return {
    platform,
    isNative: native,
    isPWA: pwa,
    isMobile: mobile,
  };
}

