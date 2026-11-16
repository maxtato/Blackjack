# Circuit rule checks

Run from this directory with Node 20 or newer:

```sh
npm install
npm test
N=400 npm run calibrate
N=200 DECK=starter npm run expedition
MODE=campaign N=60 npm run expedition
```

`engine.mjs` loads the real game sources in Happy DOM. It replaces rendering, sound, advertisements and visual waiting, while keeping the actual game rules, timer callbacks, deck, purchases and progression. Fake timers make pause and race regressions reproducible. The new particle effects use a separate random generator.

`calibrate.mjs` measures each table on its own at the advised bankroll, one attempt per sample. `calib-search.mjs` finds the goal matching a target clear rate for one table. `expedition.mjs` plays whole expeditions with three lives, or campaigns that resume from the furthest table and unlock cards. The policy is a seeded basic-strategy approximation at the maximum bet; it takes the highest-ranked offered card and legally peeks with Glasses. Long runs leak memory in Happy DOM: keep one process under about 5,000 table attempts.

These policies are not optimal play or human usability tests. Small sampling differences are not definitive item rankings. Output JSON stays local; the rules and regression checks are versioned.
