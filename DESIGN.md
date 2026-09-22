# Cold Deck / Club 21

This branch replaces the pixel presentation with an illustrated, modern card game.

- Forest green surfaces, citron primary actions, coral impacts and four suit inks.
- New landing page, preparation hub, desktop dashboard and mobile action dock.
- Original vector card illustrations, twelve card backs and refreshed app icons.
- Card flips, sequential electric-blue impacts, actual combo labels, a large result slam and winnings travelling into the bank. The timing is inspired by the supplied Cascadou recording.
- Soft synthesized plucks replace the square-wave sound. System reduced-motion preferences and the in-game Gentle setting suppress motion.
- The existing blackjack rules, currencies, progression and storage keys remain in place.

## Files

`index.html` contains the accessible UI shell. `modern.css` owns the entire visual system. `card-art.js` draws the cards and icons. `modern-fx.js` owns the transient effects and uses its own random generator. `game-data.js` contains translations; `game.js` contains the existing engine and rendering hooks. `menu-v2.js` maintains navigation, language selection and focus management. `controls.js` binds UI actions directly, without inline handlers or global function lookups.

Run `node scripts/build.mjs` after editing JavaScript. It produces the checked-in `cold-deck.js`, a single application closure that works when a preview isolates script execution. The optional argument exports a self-contained HTML file, for example `node scripts/build.mjs /tmp/cold-deck.html`. The generator requires no packages or network access. Serve the repository root to run it locally. Vercel can publish the committed files with the existing static-site configuration.

## Verification

Automated DOM checks compare win, natural blackjack, perfect 21, bust and push resolution with commit `366a905`. Distribution, hidden dealer cards, motion preferences and particle cleanup are checked separately. The complete HTML export is also loaded with its actual script execution: tests click the nested labels of both mode buttons, Play, a bet, Deal, Pause and Resume, and check for runtime errors. Visual verification on actual mobile and desktop browsers is still required: the connected Vercel preview is protected.
