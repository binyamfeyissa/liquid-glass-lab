# Expo Liquid Glass UI — Verification & Build Report

**Target Package:** `expo-liquid-glass-ui` (v0.2.0, repository `capthndsme/expo-liquid-glass-ui`)  
**Test Project:** `liquid-glass-lab`  
**GitHub Repository:** [https://github.com/binyamfeyissa/liquid-glass-lab](https://github.com/binyamfeyissa/liquid-glass-lab)  
**Expo SDK:** 58.0.0 (React 19.1.0, React Native 0.88.0, Reanimated 4.7.1, Gesture Handler 3.3.0)  
**Date:** November 19, 2026

---

## 1. Build Links

| Platform | Profile / Type | Status | Build Page Logs | Artifact / Direct Download |
| :--- | :--- | :--- | :--- | :--- |
| **Android** | `preview` (`buildType: "apk"`) | **Finished (SUCCESS)** | [EAS Build b00ba4f9](https://expo.dev/accounts/binapluto/projects/liquid-glass-lab/builds/b00ba4f9-1f53-45aa-b889-edff2d7a8647) | [Download Android APK](https://expo.dev/artifacts/eas/jxzDdtxcyPQWcSCvk_HDAAE_Va0Mzr8XOCUKqC4xAqQ.apk) |
| **iOS** | `simulator` (`simulator: true`) | **Finished (SUCCESS)** | [EAS Build b4927027](https://expo.dev/accounts/binapluto/projects/liquid-glass-lab/builds/b4927027-facb-4ffe-bbd4-123a2294c71b) | [Download iOS Simulator .tar.gz](https://expo.dev/artifacts/eas/c-ftchldPEW_SU7n31DOcqlG26Y_HDzTKEd5-O-qDh0.tar.gz) |

> [!NOTE]
> **iOS Build Type Disclosure:**  
> The iOS build was generated using the `simulator` profile (`ios.simulator: true`). When attempting an ad-hoc internal device build via `--profile preview`, EAS halted with:
> `You're in non-interactive mode. EAS CLI couldn't find any credentials suitable for internal distribution.`  
> Because no paid Apple Developer account / provisioning profile is configured on the Expo account `binapluto`, the build fell back to the `simulator` profile per project specifications.

---

## 2. Renderer Table

The package negotiates renderers dynamically based on platform, OS version, and hardware capability. These capabilities are exposed via the symbols:
- `supportsGlass`: Mount gate. Whether `LiquidGlassView` renders glass at all (Metal/AGSL/Native).
- `supportsNativeGlass`: Apple's `UIGlassEffect` (iOS 26+).
- `onRendererChange`: Callback reporting active renderer string.
- `GLASS_ACTIVE_RENDERERS`: `["native", "metal", "agsl", "fallback-blur", "scrim", "none"]`.

| Target OS / Device Class | Target Renderer Selected | Fallback Behavior | Package API & Symbols Reporting This |
| :--- | :--- | :--- | :--- |
| **iOS 26+** | `native` (`UIGlassEffect`) | Falls back to `metal` if native effect fails | `supportsNativeGlass: true`, `supportsGlass: true`, `onRendererChange('native')` |
| **iOS < 26** (e.g. iOS 16–25) | `metal` (Custom Metal shader) | Falls back to `fallback-blur` (`UIBlurEffect`) if Metal pipeline fails | `supportsNativeGlass: false`, `supportsGlass: true`, `onRendererChange('metal')` |
| **Android 13+ (API 33+)** | `agsl` (Custom AGSL RuntimeShader) | Falls back to `fallback-blur` (`RenderEffect`) | `supportsNativeGlass: false`, `supportsGlass: true`, `onRendererChange('agsl')` |
| **Android 12–12L (API 31–32)** | `fallback-blur` (`RenderEffect.createBlurEffect`) | Falls back to `scrim` | `supportsNativeGlass: false`, `supportsGlass: true`, `onRendererChange('fallback-blur')` |
| **Android 10–11 (API 29–30)** | `scrim` (Translucent `RenderNode` backdrop) | Plain translucent view | `supportsNativeGlass: false`, `supportsGlass: true`, `onRendererChange('scrim')` |
| **Android < API 29** | `none` (Plain `View`) | Mount gate disabled; renders ordinary styled view | `supportsNativeGlass: false`, `supportsGlass: false`, `onRendererChange('none')` |
| **Web / Unsupported** | `none` (Unregistered module) | Fallback to transparent/plain styled DOM view | `supportsNativeGlass: false`, `supportsGlass: false`, `onRendererChange('none')` |

---

## 3. Component Table

Every single exported component from `expo-liquid-glass-ui` (4 core views + 16 UI controls = 20 total) was integrated with real state into `liquid-glass-lab`.

| # | Component Name | Renders? | Interacts? | Broken or Missing Props | Notes & Visual Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `LiquidGlassView` | **Yes** | **Yes** | None | Core primitive. Refraction, dispersion, and magnification work cleanly. Note: library code deliberately does not use base `interactive` prop when external animated transforms are applied to avoid spring fighting. |
| 2 | `LiquidGlassContainer` | **Yes** | N/A | None | Layout wrapper providing continuous corner clipping and inner padding. |
| 3 | `LiquidGlassProvider` | **Yes** | N/A | None | Android backdrop capture node. Crucial requirement: must have exactly 1 direct child. On iOS, transparent passthrough. |
| 4 | `LiquidGlassStack` | **Yes** | N/A | None | Coordinates layered glass panes with elevation and cross-layer backdrop propagation. |
| 5 | `LiquidGlassButton` | **Yes** | **Yes** | Ref typing in source | Damped jelly physics (`useDampedDrag`), press scale (`buttonPressTransform`), loading indicator, and group merge capability. |
| 6 | `LiquidGlassIconButton` | **Yes** | **Yes** | None | Circular/square glass button with spring-back physics and haptics. |
| 7 | `LiquidGlassChip` | **Yes** | **Yes** | None | Selectable pill filter chip with active indicator and smooth state transitions. |
| 8 | `LiquidGlassGroup` | **Yes** | **Yes** | Ref typing in source | Dynamically merges adjacent glass items into a unified organic membrane using `useGlassGroupMember`. |
| 9 | `LiquidGlassMorphGroup`| **Yes** | **Yes** | None | Coordinates morphing geometry transitions between dynamic items. |
| 10 | `LiquidGlassScrim` | **Yes** | **Yes** | None | Screen or overlay dimming glass backdrop with progressive blur. |
| 11 | `LiquidGlassSegmentedControl` | **Yes** | **Yes** | None | Segmented tab switcher with animated sliding glass pill indicator. |
| 12 | `LiquidGlassSheet` | **Yes** | **Yes** | None | Modal bottom sheet with spring drag-to-dismiss physics and liquid glass handle/backdrop. |
| 13 | `LiquidGlassSlider` | **Yes** | **Yes** | None | Continuous range slider with glass track and spring-expanding glass thumb (`GLASS_SLIDER_THUMB_PRESSED_METAL`). |
| 14 | `LiquidGlassStepper` | **Yes** | **Yes** | None | Incremental/decremental counter housed in rounded glass capsules. |
| 15 | `LiquidGlassSwitch` | **Yes** | **Yes** | None | Toggle switch with spring thumb physics (`GLASS_THUMB_METAL`). |
| 16 | `LiquidGlassTabBar` | **Yes** | **Yes** | None | Floating bottom bar with sliding pill indicator (`GLASS_PILL_METAL` and `GLASS_PILL_DRAGGED_METAL`). Used as the main navigation bar. |
| 17 | `LiquidGlassTextInput` | **Yes** | **Yes** | Ref typing in source | Text field with glass outline, glowing focus border, and clear button. |
| 18 | `LiquidGlassToast` | **Yes** | **Yes** | None | Floating glass notification pill with timeout animation (`GLASS_TOAST_METAL`). |
| 19 | `LiquidGlassToolbar` | **Yes** | **Yes** | None | Header/footer glass action bar with icon distribution. |
| 20 | `LiquidGlassCard` | **Yes** | **Yes** | None | Glass panel supporting custom corner radii, tinting, border highlights, and optional press physics. |

---

## 4. Deviations

1. **Local Packaging (`file:expo-liquid-glass-ui-0.2.0.tgz`) instead of `github:` URL:**
   - **Reason:** The GitHub repository `capthndsme/expo-liquid-glass-ui` contains 125 MB of uncompressed `.mov` and `.mp4` video files under `example/video/`. Standard `npm install github:capthndsme/expo-liquid-glass-ui` triggers a full git clone over network, which consistently timed out.
   - **Resolution:** Cloned using git blob filtering (`--filter=blob:none`) and sparse checkout (`git sparse-checkout set android ios src assets package.json expo-module.config.json tsconfig.json README.md`), built the TypeScript sources, and packed the package as `expo-liquid-glass-ui-0.2.0.tgz` (766 kB). This was committed directly into the test project repository, ensuring 100% reliable, reproducible, and fast installs during EAS cloud builds.
2. **TypeScript 6 / `rootDir` Fix:**
   - The package `tsconfig.json` lacked `"rootDir": "./src"`. In modern Expo SDK 58 / TypeScript 6, compiling failed with `error TS5011: The common source directory of 'tsconfig.json' is './src'. The 'rootDir' setting must be explicitly set to this or another path`. Added `"rootDir": "./src"` to `tsconfig.json`.
3. **React 19 Ref Typing Adjustments:**
   - React 19 / React Native 0.88 ref typing changes caused type errors on `ref` props in `LiquidGlassView.tsx`, `LiquidGlassButton.tsx`, `LiquidGlassGroup.tsx`, and `LiquidGlassTextInput.tsx`. These were cast with `as any` in the library build.
4. **iOS Simulator Profile instead of Ad-Hoc Device Build:**
   - EAS CLI requires an active Apple Developer Team and Provisioning Profile to sign ad-hoc device builds in `--profile preview`. Because developer credentials were unavailable on the account, the build used the `--profile simulator` fallback.

---

## 5. Package README Discrepancies

1. **Git Installation Timeout / Bloat:**
   - The README suggests installing directly via `npx expo install capthndsme/expo-liquid-glass-ui` or `npm install github:capthndsme/expo-liquid-glass-ui`. Because `example/video/` contains 125 MB of demo videos and is not git-ignored or excluded from git tracking, installing from git downloads over 134 MB of data, which fails or hangs on throttled connections.
2. **Missing Precompiled `build/` in Repository:**
   - The repository does not commit the compiled `build/` directory and relies on `"prepare": "expo-module prepare"`. In environments where `expo-module-scripts` or the exact TypeScript compiler version isn't present during `npm install`, the prepare step crashes with `expo-module: command not found`. Precompiled artifacts or publishing to npm is required for standard `npx expo install`.
3. **TypeScript 6 Compatibility:**
   - The repository's `tsconfig.json` fails under TypeScript 6 (`TS5011`) due to missing `"rootDir": "./src"`.
4. **React 19 / RN 0.88 Ref Mismatches:**
   - The source ref types were designed for React 18 and cause compile errors when imported into React 19 projects without type casting.
5. **Android Single-Child Hierarchy Rigidity:**
   - The README mentions `LiquidGlassProvider`, but does not make it sufficiently prominent that enclosing multiple direct children or placing glass views inside the provider rather than as subsequent siblings causes the Android RenderNode backdrop sampling to fail.
