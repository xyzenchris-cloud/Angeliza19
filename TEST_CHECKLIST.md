# Manual Test Checklist — Part 1/2/3 Implementation

## Part 1: Modal Animation (CSS-based) ✅
**Status: Complete**

### Changes Made:
- Removed all Framer Motion imports and `motion.div`/`AnimatePresence` from `GameIntroModal.tsx`
- Added plain CSS `@keyframes modalFadeIn` (opacity fade 0→1, 300ms) and `modalPopIn` (scale + opacity, 300ms)
- Added `.modal-backdrop` and `.modal-card` CSS classes with animations applied via className
- Added `@media (prefers-reduced-motion: reduce)` to show modal instantly when Reduce Motion is ON

### Test Steps:
1. **With Reduce Motion OFF (normal dev state):**
   - Navigate to catch game by tapping "Let's go »" on landing screen
   - Modal should fade/scale in smoothly over 300ms
   - Dismiss the modal by tapping "Let's play »"
   - ✓ Expected: Smooth fade + scale animation visible

2. **With Reduce Motion ON (to verify accessibility):**
   - Close and re-open the dev server in a private browser with `prefers-reduced-motion: reduce` enabled
   - Modal should appear instantly (animation: none)
   - ✓ Expected: No animation, modal visible immediately

---

## Part 2: Landing Animation Status (CRITICAL — MUST BE VERIFIED)
**Status: Waiting for user input**

### Background:
User reported landing animation "still isn't working." Before treating this as a bug, we must confirm the actual root cause, because if Reduce Motion is currently **ON**, the CSS rule `animation: none !important` is correctly skipping the animation by design.

### Pre-test Confirmation Required:
**On the device/browser used for testing:**
- **iPhone/Safari:** Settings > Accessibility > Motion > Check if "Reduce Motion" is enabled or disabled
- **Android/Chrome:** Chrome Settings > Accessibility > Explore by touch > Reduce motion (or similar toggle)
- **Desktop/Chrome/Safari:** DevTools > Settings > Rendering > check "Emulate CSS media feature prefers-reduced-motion"

**If Reduce Motion is ON:** Animation is correctly being skipped by CSS rule. No bug. User must disable Reduce Motion on device to preview animation, or temporarily disable in DevTools to test.

**If Reduce Motion is OFF and animation still doesn't play:** Then it's a genuine bug. Debug steps:
1. Open browser DevTools > Elements inspector
2. Find any element with `.seq-1`, `.seq-2`, etc. class on the landing screen (h1, img, p, button)
3. Inspect "Computed" styles for that element
4. Verify these CSS properties are present and have values:
   - `animation-name: fadeInUp`
   - `animation-delay: 0.3s` (or 0.9s / 1.5s / 2.1s depending on element)
   - `animation-duration: 0.5s`
   - `animation-fill-mode: forwards`
5. Check the actual opacity and transform values after animation completes (should be `opacity: 1; transform: translateY(0)`)

---

## Part 3: Catch Game Sequencing (Gating + Get-Ready) ✅
**Status: Complete**

### Changes Made:
- Added `introModalDismissed` prop to CatchGame component (passed from App.tsx)
- Added `showGetReady` and `gameReady` state flags
- Effect on mount: if `introModalDismissed` becomes true, show get-ready overlay for 1.8s, then set `gameReady=true`
- Game loop effect gated behind `gameReady` flag (will not spawn items or start animations until true)
- Added `.get-ready-overlay` and `.get-ready-text` CSS classes with 1.8s fade-in/hold/fade-out animation
- CSS animation respects `@media (prefers-reduced-motion: reduce)`

### Test Steps:
1. **Flow timing:**
   - Tap "Let's go »" on landing screen
   - Catch game mounts, but modal appears immediately (should NOT see any game items spawning yet)
   - Tap "Let's play »" on modal to dismiss it
   - ✓ Expected: "Get ready... 3, 2, 1... Go!" text fades in, holds, fades out (1.8s total)
   - After get-ready fades out, catch game should begin (items start falling, player can drag)

2. **Verify no gameplay during modal or get-ready:**
   - Watch the modal and get-ready sequence carefully
   - ✓ Expected: No falling items, no score changes, no lives lost during these phases
   - ✓ Expected: Lives/score UI should not be ticking/updating

3. **Verify get-ready animation:**
   - Text "Get ready... 3, 2, 1... Go!" should be centered on screen
   - Should fade in (0-20%), hold (20-80%), fade out (80-100%)
   - ✓ Expected: Smooth fade with visible text hold in middle

4. **Re-navigate to catch game (same session):**
   - Play catch game, reach a game-over state (win or lose)
   - Navigate away (via progress dots to a different screen)
   - Navigate back to catch game via progress dots
   - ✓ Expected: Modal should NOT appear again (only first arrival shows modal)
   - ✓ Expected: Get-ready sequence should still run (new session/mount)

---

## Viewport Testing
Test at these mobile widths to ensure no horizontal overflow or layout issues:
- 360px (small Android)
- 390px (iPhone 13/14)
- 430px (iPhone 15)

---

## Build & Lint Status
- ✅ `npm run build` passes with zero TypeScript errors
- ✅ `npm run dev` starts without console errors
- ✅ Framer Motion imports removed from GameIntroModal
- ✅ No leftover Framer Motion motion.div or AnimatePresence usage in modal

---

## Known Unknowns
1. **Landing animation actual status** — Depends on user's Reduce Motion setting and DevTools inspection
2. **Modal animation visual appearance** — Cannot fully verify from code alone; requires manual visual inspection in browser

---

## Next Steps After Manual Testing
1. **Confirm landing animation status** (Part 2) — User must verify Reduce Motion setting
2. **Report any visual discrepancies** — If modal animation doesn't look smooth or get-ready text doesn't display correctly
3. **Check for any audio timing issues** — Verify intro/beat sounds align with screen transitions
4. **Test on actual mobile device** (iOS/Android) if possible — CSS animations and safe-area insets should work correctly
