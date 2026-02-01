# Capacitor Setup Guide

## Första gången

### 1. Bygg appen
```bash
npm run build
```

### 2. Initiera Capacitor (endast första gången)
```bash
npm run cap:init
```

### 3. Lägg till plattformar
```bash
npm run cap:add:ios
npm run cap:add:android
```

### 4. Synka filer
```bash
npm run cap:sync
```

## Efter ändringar

### Efter frontend-ändringar:
```bash
npm run build
npm run cap:copy
```

### Efter native-plugin-ändringar:
```bash
npm run cap:sync
```

## Öppna i IDE

```bash
npm run cap:open:ios      # Öppnar i Xcode
npm run cap:open:android  # Öppnar i Android Studio
```

## Generera ikoner och splash screens

```bash
npx capacitor-assets generate
```

Detta läser från `/resources` mappen och genererar alla nödvändiga storlekar för iOS och Android.

## iOS-konfiguration

### Info.plist
Filen `ios/App/App/Info.plist` behöver eventuellt uppdateras för att tillåta API-anrop.

Om du behöver undantag för specifika domäner:
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSExceptionDomains</key>
  <dict>
    <key>mindgrowkids.online</key>
    <dict>
      <key>NSIncludesSubdomains</key><true/>
      <key>NSExceptionAllowsInsecureHTTPLoads</key><false/>
      <key>NSExceptionMinimumTLSVersion</key><string>TLSv1.2</string>
    </dict>
  </dict>
</dict>
```

## Android-konfiguration

### AndroidManifest.xml
Filen `android/app/src/main/AndroidManifest.xml` bör ha:
```xml
<application
    android:usesCleartextTraffic="false"
    ...>
```

Använd HTTPS för API-anrop i både dev och prod.

## Debugging

- Använd `/diag`-sidan för att se plattform, origin, och API-status
- Kontrollera att backend tillåter `capacitor://localhost` i CORS




