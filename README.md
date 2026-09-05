# 2026 NFL Predictions

Fill in a season — eight division winners, both conferences seeded, the whole
bracket played out, and three awards — then save it as one picture to send to
the group.

Static and dependency-free: no framework, no package manager, no bundler, no
server, no backend. Everything is one HTML file, one stylesheet, and a bundle
built from `src/` by a shell script.

## Run it

    ./serve.sh          # http://localhost:8145
    ./serve.sh 9000     # or pick a port

It must be served over HTTP. The logos are fetched relatively, so opening
`index.html` off the filesystem works in some browsers and not others.

## Build

    ./build.sh

`app.js` is **generated** — do not edit it. It is `src/*.js` concatenated in the
order set by `ORDER`, with `boot()` appended:

    core  logos  divisions  seeds  bracket  awards  share

`src/logos.js` is generated too, from whatever is in `logos/`. Drop a file in,
rebuild, and it is picked up. `build.sh` also stamps content hashes onto the
`style.css` and `app.js` query strings in `index.html`, syntax-checks the
bundle, and fails if any CSS animation names a keyframe that does not exist.

## How it is put together

**One state object, saved on every change.** `S` holds the name, the eight
division winners, the two seed lists, the winner of each played game, and the
three awards. It lives in `localStorage` under `nflpicks.2026`. There is no
server and no account: each person fills in their own sheet on their own
device and shares the picture.

**The bracket is derived, never stored.** `bracket()` builds every matchup
fresh from the seeds and the results so far. The NFL reseeds after the wild
card round — the top seed left plays the lowest seed left — so the divisional
matchups genuinely cannot be written down in advance, which is why they are
computed rather than kept.

**Illegal state is dropped rather than rendered.** `reconcile()` runs before
every paint. Seeds one to four have to be the division winners, so changing a
division winner clears that conference's seeding; a game whose participants are
no longer determined loses its winner. The alternative is a sheet that shows a
team in a round it can no longer reach.

**Steps unlock in order.** Each step reports its own completeness and the rail
reads from that one place, so there is no second definition of "done" to drift.

## The card

`src/share.js` draws it on a canvas at 1080 × 1920, rendered at 2× — the ratio a
phone screen and a story both are, so it arrives in a group chat at full height
rather than letterboxed. It is drawn rather than screenshotted, so it is
identical on every device and needs nothing loaded from anywhere.

Two things must be resident before the first stroke or they fail silently: the
type (a font that has not loaded falls back to the system sans) and the logos
(`drawImage` on a half-loaded image draws nothing and reports no error). Both
are awaited in `ready()`.

## Logos

`logos/<key>.<ext>`, keyed on the team abbreviation in lower case — `buf.webp`,
`nyj.png`. Any image extension works; `build.sh` records which one each team
has. All 32 are present.

A team with no file falls back to a tile in its own colour carrying its
abbreviation. That is a designed stand-in rather than a guess at a trademark,
and it means the set can be completed a few files at a time without a row of
logos and blanks in between.

Team colours come from `nfl team color codes.csv` in the same source folder as
the logos, not from memory.

## Fonts

Söhne, Söhne Schmal and Tiempos Text, self-hosted from `fonts/`.

> **These are trial licenses, carried over from the HUB. License them from Klim
> Type Foundry before this is public.** Fallbacks are declared, so the page
> degrades to system faces if the files are pulled.

## Files

- `index.html` — shell only: masthead, `#root`, two tags.
- `style.css` — the whole design system, including the `@font-face` block.
- `src/*.js` — the seven sources. **Edit these.** `logos.js` is generated.
- `app.js` — generated. See above.
- `logos/` — 32 team marks.

## Known gaps

- **No shared board.** Everyone's picks live on their own device. Comparing
  them means comparing pictures. A shared board would need a backend, which
  this deliberately does not have.
- **Nothing is scored.** The app has no idea what actually happened, so it
  cannot tell you who won the pool. That would need results from somewhere.
- **The awards are free text.** A player list would mean inventing a roster for
  a season that has not been played, so you type the name and tap the team.
