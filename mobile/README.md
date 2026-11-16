# Mobile App

Expo app for browsing artifacts, scanning QR codes, listening to multilingual narration, and trying a local English–Vietnamese phrase-translation demo.

The app interface follows the selected language across the Home, Artifacts, QR
scanner, Favorites, and Personal tabs, as well as artifact details and the
translation screens. Vietnamese, English, Chinese, Japanese, and Korean are
supported; artifact narration is shown in the selected language when available.
Each app launch first shows a language picker. Select a language and confirm
with **OK** to save it; the app then displays a localized welcome message
before opening the main interface. The selection is shared with the language
setting in the Personal tab.

Demo mode uses eight built-in artifacts with draft narration in Vietnamese, English, Chinese, Japanese, and Korean, plus local images. The phrase translator uses a small built-in dictionary; it is not a general-purpose translation service. Translation history is stored locally on the device. Verify draft historical content with official sources before production use.

The Personal tab provides persistent light and dark themes. Narration uses the
device's built-in text-to-speech voices for the selected language. Install the
Japanese (`ja-JP`), Chinese (`zh-CN`), or Korean (`ko-KR`) voice in the device
accessibility or text-to-speech settings if the app reports that voice as
unavailable, then use the localized **Check voices again** action. Voice
availability varies by device and browser; this app does not download or bundle
voice audio.

## Requirements

- Node.js and npm
- Expo Go installed on the test phone

## Run the demo without a backend

The `.env.example` file enables demo mode by default.

From this directory:

```bash
npm install
cp .env.example .env.local
npm start
```

The artifact list and details work with local demo data. Restart Expo after changing environment variables.

## Connect to the backend

Set `EXPO_PUBLIC_DEMO_MODE=false` and configure `EXPO_PUBLIC_API_URL` in `mobile/.env.local`.
When connected, the artifact detail screen uses the backend's
`available_languages` for that artifact: languages with published translations
can be selected, while unavailable languages are shown as disabled. The
English–Vietnamese phrase translator is a separate local demo and does not use
the artifact translation API.

- For a deployed backend, use its HTTPS base URL, such as `https://api.example.com`.
- For a local backend and a physical phone, use the computer's LAN IP and API port, such as `http://192.168.1.10:3000`. The phone and computer must be on the same network, the backend must be reachable through the firewall, and `localhost` will not work from the phone.
- For the Android emulator, use the emulator's host address supported by your setup rather than the phone's LAN address.

```bash
npm start
```

Scan the Expo QR code with Expo Go. Keep the phone and development computer on the same network when using LAN mode. Verify a deployed backend first at `/api/health`.

## Validation

```bash
npm run typecheck
npm run lint
```

Use [the mobile test checklist](../docs/MOBILE-TEST-CHECKLIST.md) to verify the demo flow on a physical device. Test camera permission and all available TTS voices on the actual target device; voice availability depends on its installed system voices.

APK generation through EAS is optional for the MVP. Use Expo Go for the demo unless an installable package is specifically required.