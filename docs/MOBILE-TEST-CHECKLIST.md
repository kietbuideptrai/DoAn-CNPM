# Mobile Test Checklist

Run the required checks on each target physical Android or iOS device before the demo. For every run, record the device model, OS version, app/runtime (Expo Go or build), date, and tester below. Use `Not tested`, `Pass`, `Fail`, or `Blocked` for each case; include steps to reproduce and evidence for failures. Do not mark device-only checks as passed based on code review or simulator results.

| Device model | OS version | App/runtime | Date | Tester |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

| ID | Steps | Expected result | Status / notes |
| --- | --- | --- | --- |
| MOB-01 | Start the app in Expo Go and open the Artifacts tab. | Published artifacts load from the backend with title, summary, and image. | |
| MOB-02 | With display language set to Vietnamese, search for a known Vietnamese name and an English name. Repeat with display languages English and Korean. | Search matches Vietnamese and English artifact names regardless of the selected display language; result titles stay in the selected display language. A non-matching query shows a clear empty state. | |
| MOB-03 | Open an artifact from the list. | The correct detail opens. | |
| MOB-04 | Scan a valid QR containing `/artifacts/<slug>`. | The scanner opens the matching artifact detail. | |
| MOB-05 | Scan a QR that is not an HTTP(S) artifact URL. | The app reports an invalid QR and allows scanning again. | |
| MOB-06 | Scan a valid-format URL with an unknown slug. | A not-found message appears without crashing. | |
| MOB-07 | Deny camera permission, then grant it; repeat with permission permanently denied. | The app explains the permission requirement and offers request permission or device settings as appropriate. | |
| MOB-08 | Turn off network access, load the list/detail, then restore it and tap Retry. | A clear network error and retry action appear; retry succeeds after connectivity returns. | |
| MOB-09 | Change languages on the detail screen, including one without a translation. | Available translation updates; missing translation lists available languages and text remains usable. | |
| MOB-10 | Restart the app after choosing a language. | The chosen language remains selected. | |
| MOB-11 | Play narration, pause, resume, and stop; change language or leave the detail screen during playback. Repeat on each available target language and with a device that lacks that voice. | Controls work; audio stops on language change or screen exit; text remains visible and a clear message appears if the voice is unavailable. | |
| MOB-12 | Use the main flow with TalkBack (Android) or VoiceOver (iOS): navigate the artifact list, open a detail, change language, and operate narration controls. | Focus order is usable; controls announce meaningful labels, roles, and selected/disabled state; image descriptions are announced. | |
| MOB-13 | Open an artifact with a missing or failed image and inspect it with the screen reader. | The image fallback appears without breaking the detail screen and has an appropriate accessible description. | |
| MOB-14 | Select dark mode in the Personal tab, navigate to the artifact list/detail and QR scanner, then restart the app. Select light mode and repeat. | All screens use the selected palette, both options remain readable, and the selection persists after restart. | |
| MOB-15 | In Personal, select Vietnamese, English, Chinese, Japanese, and Korean in turn. Visit Home, Artifacts, QR scanner, Favorites, Personal, artifact details, phrase translation, and translation history; check loading, empty, permission, and error states where available. | Every visible UI label, action, state message, and screen-reader label follows the selected language; artifact content uses that language when a translation is available. The language choice does not change the selected theme. | |
| MOB-16 | Fully close and reopen the app. Select each supported language from the startup screen, press OK, then wait for the welcome message and main interface. Change the language in Personal, close, and reopen again. | A language picker appears on every launch; selection does not continue until OK is pressed. Confirmation shows a brief fade-in welcome message in that language, then opens the main interface in the same language. The selection made in Personal is highlighted at the next launch and remains consistent throughout the app. | |

The following existing features are optional and are not MVP acceptance criteria:

| Optional check | Steps | Expected result | Status / notes |
| --- | --- | --- | --- |
| Favorites | Add an artifact to Favorites, restart the app, then remove it. | Favorite appears, persists across restart, opens the correct detail, and can be removed. | |