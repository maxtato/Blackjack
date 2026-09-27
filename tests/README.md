# Circuit rule checks

Run from this directory with Node 20 or newer:

```sh
npm install
npm test
CIRCUIT_SAMPLES=600 npm run simulate
npm run campaign
```

`engine.mjs` loads the real game sources in Happy DOM. It replaces rendering, sound, advertisements and visual waiting, while keeping the actual game rules, timer callbacks, deck, purchases and progression. Fake timers make pause and race regressions reproducible. The new particle effects use a separate random generator.

The simulation uses a seeded basic-strategy approximation with visible dealer information. When the selected equipment includes Glasses, it legally peeks before reading the next card. The automatic draft chooses Glasses when offered. Purchases retain a reserve, and the campaign buys real upgrades then resumes from the furthest reached table. It never doubles reputation with ads, watches a retry video or farms resale. The reference table grid excludes gifted zone Tarots to keep equipment constant.

These policies are not optimal play or human usability tests. Small sampling differences are not definitive item rankings. Output JSON stays local; the rules and regression checks are versioned.
