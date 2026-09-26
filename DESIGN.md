# Cold Deck / The Back Room

This branch replaces the pixel presentation with an illustrated, modern card game.

- Warm overhead light, pale sage felt, ivory surfaces and burgundy primary actions. Minimal framing and soft card shadows keep the table readable.
- Cards are approximately 20% smaller: 88px on spacious desktops and 74px on typical portrait phones, with smaller sizes for short screens and crowded hands.
- New landing page, preparation hub, desktop dashboard and mobile action dock.
- Original two-headed, engraved court figures, traditional dark and burgundy suit inks, twelve card backs and app icons. Small illustrated glass and matchbook details give the landing page an after-hours club atmosphere.
- Cards float independently while idle. Titles, cash values and primary action lettering gently oscillate; whole-word accessible text remains available. These effects pause behind menus and when the page is hidden.
- Card flips, sequential branched blue lightning, actual combo labels, screen kicks, a large result slam and winnings travelling into the bank. Larger wins add a delayed second impact. The timing is inspired by the supplied Cascadou recording.
- All new transient effects share an 84-element budget and use a random generator separate from the deck. Optional device vibration is feature-detected, throttled and cancelled when effects are cleared.
- Soft synthesized plucks replace the square-wave sound. System reduced-motion preferences and the in-game Gentle setting suppress motion.
- The existing blackjack rules, currencies, progression and storage keys remain in place.

## Files

`index.html` contains the accessible UI shell. `modern.css` owns the entire visual system. `card-art.js` draws the cards and icons. `modern-fx.js` owns the transient effects and uses its own random generator. `game-data.js` contains translations; `game.js` contains the existing engine and rendering hooks. `menu-v2.js` maintains navigation, language selection and focus management. `controls.js` binds UI actions directly, without inline handlers or global function lookups.

Run `node scripts/build.mjs` after editing JavaScript. It produces the checked-in `cold-deck.js`, a single application closure that works when a preview isolates script execution. The optional argument exports a self-contained HTML file, for example `node scripts/build.mjs /tmp/cold-deck.html`. The generator requires no packages or network access. Serve the repository root to run it locally. Vercel can publish the committed files with the existing static-site configuration.

## Verification

Automated DOM checks compare win, natural blackjack, perfect 21, bust and push resolution with commit `366a905`. Distribution, hidden dealer cards, split hands, navigation and persistence are checked separately. The complete HTML export is loaded with its actual script execution: tests click an animated letter inside each mode button, Play, a bet, Deal, Pause and Resume, and check for runtime errors.

Additional checks exercise lightning and the second impact, the particle limit, independent visual randomness, haptic cancellation, delayed-effect cleanup, reduced motion and repeated lettering updates. The new vector card artwork was rasterized and inspected at enlarged and 74px widths. Visual verification of the complete game on actual mobile and desktop browsers is still required: the connected Vercel preview is protected.
