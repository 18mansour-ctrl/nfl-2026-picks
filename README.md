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

    core  logos  players  divisions  seeds  bracket  awards  share

`src/logos.js` is generated too, from whatever is in `logos/`. Drop a file in,
rebuild, and it is picked up. `build.sh` also stamps content hashes onto the
`style.css` and `app.js` query strings in `index.html`, syntax-checks the
bundle, and fails if any CSS animation names a keyframe that does not exist.

## How it is put together

**One state object, saved on every change.** `S` holds the name, the eight
division winners, the order of those winners, the wild cards, the winner of each
played game, and the three awards. It lives in `localStorage` under
`nflpicks.2026`. There is no server and no account: each person fills in their
own sheet on their own device and shares the picture.

**The winner order and the wild cards are separate keys, and that is
load-bearing.** They were one array of seven with the division winners pinned to
the front. Every moment a division sat empty mid-edit — the instant between
un-picking one team and picking another — `reconcile()` could not tell a stale
winner from a wild card, so it cleared all seven. Changing your mind about one
division cost you three wild cards. Two keys makes that state unrepresentable.

**The bracket is derived, never stored.** `bracket()` builds every matchup
fresh from the seeds and the results so far. The NFL reseeds after the wild
card round — the top seed left plays the lowest seed left — so the divisional
matchups genuinely cannot be written down in advance, which is why they are
computed rather than kept.

**Illegal state heals rather than being wiped.** `reconcile()` runs before every
paint. Seeds one to four *are* the division winners — that is the rule, not a
choice — so they are placed automatically the moment all four are known, and
swapping one heals that slot rather than clearing the conference. A game whose
participants are no longer determined loses its winner. The alternative is a
sheet that shows a team in a round it can no longer reach.

**Steps unlock in order.** Each step reports its own completeness and the rail
reads from that one place, so there is no second definition of "done" to drift.

## The bracket

Three columns a conference — wild card, divisional, championship — each holding
fewer games than the last, so the shape converges. The games distribute with
`space-around` inside a shared height, which is what makes a column of two sit
between a column of three without anything being positioned by hand.

**The connecting lines are drawn after layout, not faked in CSS.** `lines()`
measures where each game actually ended up and draws into an SVG underneath.
They gather rather than fork, and that is deliberate: the NFL reseeds, so the
three wild card winners are pooled and redrawn against the bye. Fixed elbows
would claim a feeder that does not exist.

The top seed sits in the divisional round from the moment its conference is
seeded, greyed and un-tappable until it has an opponent. It cannot win a game
with nobody on the other side of it, but it is not a blank either.

## The awards board

Fifty candidates an award, ranked by an **indicative preseason price**. The odds
are there to order the field and give a pick some context — they are not a live
market and the page says so. Anyone can be written in.

An empty text box is the worst version of this: it asks you to remember fifty
names and spell them. The list filters as you type rather than re-rendering, so
the caret survives the first keystroke, and once a pick is made it collapses to
the pick, because the decision is done.

## Motion

**The entrance belongs to the step change and to nothing else.** It runs off a
class the router puts on the sheet for one paint, so a pick inside a step cannot
trigger it. A whole page re-entering every time you tap a chip is what makes an
app feel like it is reloading rather than responding.

So a pick never re-renders the control you touched. A division chip toggles its
own classes and the background transitions under your finger; a bracket pick
keeps its cell and only redraws the columns downstream of it, which fade rather
than travel. `-webkit-tap-highlight-color` is off, because the browser was
painting its own blue over a chip before ours arrived.

## Ranking a division

Step one asks for all four places, not just the winner, and it is tap-to-rank
rather than drag.

That is against the reflex, so it is worth saying why. Karth's comparison of
ranking questions found drag-and-drop scored **no better on usability** than
entering the order, and was no faster; the guidance for short lists on a phone
is click-to-rank, with drag kept for *adjusting* an order that already exists —
which is exactly what the seeding step is. Four items is also comfortably
inside the three-to-seven a ranking question is meant to stay within.

What drag genuinely has over a bare tap-to-rank is that you can see the order
you are building. So the list sorts itself into the finish order, animated with
FLIP — measure, rewrite, put each row back where it was, release. Same feedback,
no gesture.

**But only once all four are placed.** Reordering on every tap meant the teams
you had not judged yet kept moving under your finger, which is the opposite of
helpful. The list holds its league order while you are deciding and only the
badges change; the sort is what tells you the division is finished. Take one
back out and it returns to league order, because the answer is no longer
complete.

Nothing is randomised. Ranking guidance says to shuffle the initial order to
dodge a primacy effect, and it is wrong here: these are teams with a
conventional order, and shuffling them would read as a bug rather than as
neutrality.

## The seeding drag

Pointer events, so mouse, touch and pen are one path. The rows are never
reordered in the DOM while you drag: the one under your finger is translated to
follow it, the others are translated out of its way, and nothing reflows
mid-gesture. The DOM is put in its new order once, on drop, at the moment the
transforms already have everything in that position — so there is nothing to
see.

Two lists rather than one of seven, because a division winner can never fall
below the fourth seed and a wild card can never rise above the fifth. Making
that structural means the drag has no illegal move to reject: there is nowhere
wrong to drop.

The drop commits on a timer rather than on `transitionend`. Drop a row exactly
where the settle would put it and the transform never changes, so
`transitionend` never fires and the reorder is silently lost.

## The card

`src/share.js` draws it on a canvas at **1080 × 1080**, rendered at 2×.

**It is one object.** The real NFL bracket — AFC running in from the left, NFC
in from the right, the champion in the middle where the trophy goes — a name,
and the three awards along the foot. Nothing else.

Earlier versions had a masthead, a dateline, a champion band, two section
heads, a Super Bowl block, a leader table and a colophon: fifteen things, each
with its own label and rule. That is how a card ends up looking like every
other generated card. A bracket is already a recognisable object and does not
need a frame around it.

No drop shadows and no rounded corners anywhere on it. Soft depth on rounded
boxes is the house style of every share graphic ever made.

It is drawn rather than screenshotted, so it is identical on every device and
needs nothing loaded from anywhere. Two things must be resident before the
first stroke or they fail silently: the type, and the images — `drawImage` on a
half-loaded image draws nothing and reports no error. Both are awaited.

The three award cards fill with the player's team colour, take his headshot
cropped to the head and bled off the corner, and carry his position and name.
A player with no headshot on disk gets his initials instead.

## Headshots and logos

`logos/<key>.<ext>` and `headshots/<key>.webp`. Both directories are read by
`build.sh`, which generates `src/logos.js` and `src/shots.js` — drop a file in,
rebuild, done.

All 32 logos are present. Headshots are at 79 of the 129 players on the award
boards, borrowed from the HUB's set, which is a fantasy one: everyone missing
is a defender, which is why DPOY is the award still showing initials.
`HEADSHOTS-WANTED.md` lists them with the filename each one needs.

A team or player with no file falls back to a designed stand-in — the team's
abbreviation on its colour, or the player's initials — rather than a blank, so
either set can be completed a few files at a time without a row of images and
holes in between.

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

## Curating the award boards

`awards-odds-2026.csv` is the raw pull — MVP 100, OPOY 67, DPOY 58, with the
odds source and a confidence flag on every team and position.

    ./serve.sh 8145
    open http://localhost:8145/curate.html

Drag or nudge to reorder, delete anyone who does not belong, and fix a wrong
team or position in place. Order, deletions and corrections are kept in the
browser, so the tool can be left and come back to. **Export players.js** writes
the block for `src/players.js`; re-pulling the odds later keeps everything you
have curated, because the tool stores an order and a set of corrections rather
than a copy of the rows.

## The searchable pool

`rosters-2026.csv` is every player on all 32 rosters. `tools/roster.py` turns it
into `src/roster.js` — skill positions only, since no award here has ever gone
to a lineman, a kicker, a punter or a long snapper:

    python3 tools/roster.py && ./build.sh

The board is what you see on the awards step: the curated, priced shortlist,
and the only names that need a headshot. The roster is what you can *find* —
it stays out of the DOM until you type, then appears under "Everyone else",
filtered to the right side of the ball. Offence cannot turn up in the
defensive award's search, or the other way round; MVP sees both.
