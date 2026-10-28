# The Flag Vault

A flag-knowledge heist for iPad. Created by **Leighton R. & Steve R.** © 2026.

Your crew breaks into a high-security vault. Each of six chambers is a set of locks, and every lock opens only when you type the country a flag belongs to. The flags get harder chamber by chamber, ending with the six-tumbler Final Lock and, if you make it, the vault door swinging open.

It's a plain web app: no accounts, no paid services, no build step needed to play. Once it has loaded on the iPad it also works offline.

---

## 1. Put it on GitHub and publish it

You only do this once. It's the same GitHub Pages setup as Leighton's Map Painter.

1. On a computer, go to **github.com** and sign in as **ghostcrtv**.
2. Click **+** (top right) → **New repository**.
   - Repository name: `flag-vault`
   - Set it to **Public** (GitHub Pages is free for public repositories).
   - Leave everything else as is and click **Create repository**.
3. On the new repository page, click the link **uploading an existing file**.
4. Unzip `flag-vault.zip`. Open the `flag-vault` folder, select **everything inside it** (the files *and* the folders: `css`, `js`, `icons`, `tools`, `tests`, `index.html` and the rest), and drag it all onto the GitHub upload page. Wait until every file shows in the list.
5. Scroll down and click **Commit changes**.
6. Go to the repository's **Settings** → **Pages** (left sidebar).
   - Under **Build and deployment**, set **Source** to **Deploy from a branch**.
   - Set **Branch** to **main** and the folder to **/ (root)**, then click **Save**.
7. Wait a minute or two, then refresh the Pages settings. The address appears at the top:
   **https://ghostcrtv.github.io/flag-vault/**

## 2. Put it on the iPad's Home Screen

1. On the iPad, open **Safari** and go to **https://ghostcrtv.github.io/flag-vault/**
2. Tap the **Share** button (the square with an arrow pointing up).
3. Tap **Add to Home Screen**. If you see an **Open as Web App** switch, leave it on.
4. Name it **Flag Vault** and tap **Add**.

The vault-door icon now opens the game full screen, without Safari's address bar, like an app.

**Internet:** needed the first time you open it, and whenever you want updates. After that first load, every flag, the map, the art and the sounds are saved on the iPad, so it plays offline.

**Sound:** iPad Safari only allows sound after a tap, so the music starts once you tap **Plan the heist**. Use the speaker button on the title screen or the **Settings** gear to mute or change volume. Sound plays even with the iPad's silent switch on, so use the in-game mute when you want quiet.

## 3. Updating the game later

When you change files (or I send you new ones), upload them to the same repository the same way (**Add file** → **Upload files**). Files with the same name are replaced. GitHub Pages republishes in about a minute. The iPad picks up the new version the next time the game is opened while online. If it doesn't, close the game fully and open it again.

Always upload `sw.js` along with any changed files. It's the offline cache list, and its version number tells the iPad that something changed.

---

## How to play

**Modes**
- **One crew:** you agree on every answer together.
- **Take turns:** players alternate flags. Shields and loot are shared, and the debrief shows each player's score.
- **Timed mode** is optional and off by default. It gives 45 seconds per flag.

**Resources**
- **Shields:** you start with 4. Each wrong answer (or skip) costs one. Lose them all and you're caught. A flawless chamber wins one back, up to 5.
- **Gadgets:** you start with 3. Each one is used up when spent, and you can get one more from a Supply Drop. The game always shows the cost before you confirm.

| Gadget | Reveals | Loot cost for that flag |
|---|---|---|
| Region Scan | The region of the world | −25% |
| Satellite Locator | A ping on the world map | −35% |
| Letter Decoder | The first letter and the shape of the name | −50% |
| Intel File | The capital, plus the status for territories | −50% |

- **Loot:** deeper chambers pay more per flag. A streak of correct answers adds up to +50%.

**The route**

| # | Chamber | Locks | Flags | What's new |
|---|---|---|---|---|
| 1 | Street Entrance | 5 | Famous (Canada, Japan, South Korea…) | The basics |
| 2 | Security Lobby | 5 | Well known | **Decryption scan:** the flag reveals tile by tile; answer early for up to double loot |
| 3 | Laser Corridor | 6 | Mid-level and lookalikes | **Doppelgänger:** lookalike flags flicker past, then one locks in. Plus a random security event |
| 4 | Control Room | 6 | Harder | **Satellite uplink** map question and the first **High-risk breach** wager |
| 5 | Deep Vault Corridor | 6 | Expert, including territories | Another wager and a random security event |
| 6 | The Final Lock | 6 | The toughest flags, mostly territories | Each correct answer pulls a bolt from the vault door |

That's 34 locks, about 20 minutes per run. It's long enough to feel like a real heist and short enough to finish in one sitting. The difficulty comes only from which flags appear: every flag is always shown full size and clear.

**Security events** (one of these is drawn at random at two points in each run):
- **Laser Grid:** gadgets are offline, but that flag pays double.
- **Patrol Countdown:** answer within 25 seconds for triple loot. Running out only loses the bonus.
- **Supply Drop:** +1 gadget.
- **Extra Checkpoint:** a bonus flag. Getting it right restores a shield; missing it costs nothing.

**Answers.** Capitals, spaces, accents and punctuation never matter, and small typos are forgiven ("Phillipines", "Kazakstan"). The game never accepts a *different* country, though. For example, "Niger" is wrong for Nigeria.
- If a spelling is close but the game can't be sure, it lets you correct it once, free.
- Vague answers like "Korea" or "Congo" get a prompt to be more specific.
- Near-identical twins (Chad/Romania, Indonesia/Monaco) get one free second look.

**Starting fresh.** A run is saved after every answer, so you can close the iPad and resume later from the title screen. To abandon a run, tap the **Settings** gear and choose **Abandon heist**, or choose **Start a new heist** on the title screen. Settings and your best haul are also saved on the iPad.

---

## Where everything lives (for changes later)

```
index.html                 the page
css/style.css              all colors, fonts and layout (colors are at the top)
js/data/countries.js       every flag: name, accepted answers, region, capital, difficulty tier
js/data/lookalikes.js      Doppelgänger groups (flags that are easy to confuse)
js/data/chambers.js        the chambers, question slots, rules, gadgets, events, vault prizes
js/data/audio-files.js     optional sound files (see below)
js/data/flags-data.js      GENERATED: all flag artwork
js/data/map-data.js        GENERATED: the world map
js/engine/                 game logic (no screen code): answers.js, heist.js, rng.js
js/ui/                     screens (app.js), art (art.js), sound (audio.js), map (map.js)
tests/                     automated checks for the data, answers and game logic
tools/                     scripts that rebuild the generated files, icons and offline list
```

Common changes:
- **Add a flag or fix a name.** Edit `js/data/countries.js`. Each flag is one line. Add alternate names to `aliases`; typos are handled automatically.
- **Make a flag easier or harder.** Change its `tier` (1–6).
- **Change the chamber lineup.** Edit `js/data/chambers.js`. Add or remove slots, change tiers, move wagers or events, or add a whole new chamber object.
- **Change the look.** The color and font variables are at the top of `css/style.css`.

Changes to the flag list need the generated files rebuilt. On a computer with Node.js and Python, run:

```
npm install
npm run build        # rebuilds flags, map, icons and the offline list
npm test             # checks every flag, answer rule and the full game flow
```

Or just ask Claude to make the change and send you the updated files.

## Flags: where they come from and how to correct one

- **Artwork.** The flags come from the open-source `region-flags` collection, which is Wikimedia Commons artwork (public domain), drawn at each flag's true proportions.
- **Syria.** The flag is the current one adopted in 2025 (green, white and black with three red stars). It's drawn in `tools/flag-overrides/SY.svg` because the collection still has the old design.
- **Afghanistan** is left out on purpose, because which flag is "correct" is disputed.
- **Territories** whose official flag is just their parent country's flag (most French territories, for example) are left out, since they can't be told apart.
- **Checking.** Every flag was rendered on one contact sheet and checked against its name. The automated tests also check that every country has a flag and a map location, and that no two countries share an accepted answer.
- **Correcting.** To fix a flag, save the correct SVG as `tools/flag-overrides/<CODE>.svg` (for example `GB-SCT.svg`) and run `npm run build`. To fix a name or accepted answer, edit `js/data/countries.js`.

## Sound and music

Everything is synthesized live in the browser: the pulsing heist music, which gains layers chamber by chamber; the lock clicks; the alarms; and the vault door opening. No files are needed.

To use your own sounds (for example from Envato Elements):
1. Put the files in a new `audio/` folder. Use `.mp3` or `.m4a`.
2. Write their paths into `js/data/audio-files.js`.
3. Run `npm run build-sw`.

Any slot you fill replaces the built-in sound. Any slot left empty keeps it.

The most worthwhile files to get:
1. Music loops in three intensities: **calm** (chambers 1–3), **tense** (4–5) and **final** (the Final Lock). Search for "heist suspense loop" or "spy thriller underscore loop".
2. **Vault door opening**, about 5 seconds, heavy and mechanical.
3. **Lock click / latch** for correct answers.
4. **Alarm buzz** for wrong answers, and a **security siren** for events.
5. **Prison cell door slam** for getting caught.

## Future App Store release

The game is already organized for this:
- The engine (`js/engine/`) has no screen code.
- All the data is separate from the interface.
- Nothing depends on a server.

Releasing it would mean:
- Wrapping the same files in a native iOS app with **Capacitor**. This needs a Mac with **Xcode**.
- Joining the **Apple Developer Program** ($99/year).
- Making the App Store assets: screenshots and an icon (`icons/icon-1024.png` is ready), plus a launch screen.
- Filling in a privacy questionnaire. The game collects no data, so this is simple.
- Turning off the web service worker, since the app bundle already works offline.
- Optionally adding haptics, Game Center high scores, or in-app purchases for new vault packs.
- Testing on real devices and passing Apple's review.

The browser version stays exactly as it is.

## Credits

Created by Leighton R. & Steve R., out of a love for flags, countries and geography. Flag artwork: Wikimedia Commons contributors (public domain), via region-flags. Map: Natural Earth (public domain).
