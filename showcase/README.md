# Glacia Showcase

A standalone test app for **glacia-native 0.6.0** (from npm) that puts every
one of the library's 48 catalogue components on a phone, one screen each —
modelled on the React Native Reusables showcase.

- **Home** — a "Showcase" title, a search field that filters the list, and
  all 48 components as tappable rows.
- **Component screens** — a Back header, the component's demo (every control
  is live: switches flip, sliders slide, dialogs and sheets open from their
  buttons), and ‹ › buttons at the bottom to walk to the previous/next
  component in catalogue order.
- **Three backdrops** — tap the ◐ toggle in the header to cycle
  **Light → Dark → Image**. Image mode puts a full-screen photo behind
  everything, so you can see the glass refraction over a busy picture.
  The mode survives navigation.

## Run it locally

```sh
npm install
npx expo start
```

Then open it in Expo Go or a development build. (The glass engine's best
path — real iOS 26 glass — needs a real build; Expo Go and older systems
use the library's fallback, which is exactly what this app is for testing.)

## Build installable apps with Codemagic

The repo carries a `codemagic.yaml` with two workflows. No signing accounts
or secrets are needed.

1. Create a GitHub repo and push this folder to it.
2. In [Codemagic](https://codemagic.io), add the repo as an application.
   Codemagic picks up `codemagic.yaml` automatically. (If this folder is a
   subfolder of the repo, set the app's project root to this folder in the
   Codemagic app settings.)

### Android — APK

3. Run the **Android APK** workflow.
4. Download the `.apk` from the build's artifacts.
5. Copy it to the phone and open it to install (allow "install from unknown
   sources" for your file manager/browser when Android asks). The APK is
   signed with the standard debug key, which is fine for personal testing.

### iPhone — unsigned IPA + SideStore

3. Run the **iOS unsigned IPA (SideStore)** workflow.
4. Download `GlaciaShowcase-unsigned.ipa` from the build's artifacts.
5. Install it with [SideStore](https://sidestore.io):
   - Install SideStore on the iPhone once (its site walks you through it —
     you need a computer for the first setup only).
   - In SideStore, tap **+**, pick the downloaded `.ipa`, and sign in with
     your Apple ID when asked. SideStore re-signs the app for your phone.
   - Free Apple IDs expire apps after 7 days; SideStore refreshes them
     automatically while you're on the same Wi-Fi as its pairing.

## Notes

- Dependencies are the same proven set as the Glacia templates
  (Expo SDK 58, React 19, React Native 0.88); `glacia-native` comes from
  npm as `^0.6.0` — no workspace links.
- The photo backdrop is `assets/backdrop.jpg`.
- Verified before handover: `npx tsc --noEmit`,
  `npx expo export --platform android`, and
  `npx expo export --platform ios` all exit 0.
