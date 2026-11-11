# StarQuest LL (Living Legendary) Card Playbook
Paste this whole document at the top of a new conversation, then add: "Build the next LL card about: <TOPIC>." It records how the Kowloon Walled City card (ll03) was built, so the next one comes out the same way.

---

## 1. Purpose
- An LL card is the rarest card in StarQuest. It is a "living" card for one child aged 8 (English plus simple Japanese).
- The card opens a short story that teaches ONE real place, event or legend in about 30 seconds.
- The child taps "Watch the story". The card's glass frame shatters, the picture opens into a story made of painted pictures, and the story ends by returning to the exact card picture while the glass re-forms.
- Goals, in order: (1) feels magical, (2) is truthful and age-appropriate, (3) teaches one clear idea, (4) feels the same as the other LL cards (Halley, Kaguya, Nian, Wave, Carp, Kowloon).
- This is a private family app. Never put anything about the child or family into these stories, captions, prompts or file names.

## 2. What you are building (the parts)
Each LL card is made of these pieces. All must exist before it ships.

| Piece | What it is | Where it lives |
|---|---|---|
| Card art | One 5:7 portrait painting, 720x1008, the picture the glass opens onto (`art-llNN.<hash>.webp`) | assets/ll, `window.LLX` |
| Glass set | body, cracks, shadow, charms, flat images, plus the shared 22-piece glass data `glass22.<hash>.json` | assets/ll |
| Card row | 11 fields: id, name, native name, region, years, type, emoji, rarity "LL", tagline, story text, fun fact | the card list in index.html (`["ll03","Kowloon Walled City","九龍城寨","CN","1847–1994","K","🏙️","LL", ...]`) |
| Card image | the normal card face (`llNN.<hash>.webp`) | assets/cards, `CARD_URLS` |
| Facts list | 4 bullet facts, English plus Japanese | `LL_INFO` |
| Story file | one self-contained HTML file with pictures embedded | assets/stories, `LL_URLS` |
| Music | one track of about 34 s | assets/music, `TRACK_URLS` |
| Saying | one local-language saying linked to the card | the sayings list |
| Voice language | the language tag for read-aloud (e.g. `ll03:'zh-HK'`) | the TTS language map |
| Offline list | every new file added to `assets/assets.json` (the service worker deletes anything not listed) | assets/assets.json |
After the build: bump the version in `index.html` (`var V`), `sw.js` (`VERSION`) and `assets/assets.json` (`"v"`). All three must match.

## 3. The concept (how to choose the story)
Use the Kowloon structure: **"one place, three time layers, then home."**
1. **The card's world** (the picture on the card, alive).
2. **A glimpse of a feeling or idea about that world** (Kowloon: the same city imagined as a glowing sci-fi future, because it inspired films and games).
3. **Life inside it** (Kowloon: a night food stall in a crowded alley).
4. **Where it came from** (Kowloon: the Qing fort).
5. **Where it is now** (Kowloon: the peaceful park).
6. **Back to the card** (the exact card picture, with a closing line).

The story is told in time order of the caption, not always in the order of the pictures. Kowloon told "1950s-80s city, then future, then almost no rules, then the fort (1840s-1898), then the park (1994 to today), then home."
Rule: end on a hopeful or peaceful note ("from fort, to city with almost no rules, to peaceful garden"). The last line is always one short sentence of change over time.

## 4. How it is made (the pipeline)
1. **Scope first.** Write a 5-shot storyboard and the 6 captions and get approval BEFORE generating anything. Ask: is there a higher-resolution card image, which exact subject for each shot, captions yes/no, who generates the images.
2. **Generate the pictures** (3 new pictures plus the card art as shot 1). Use the card art as the style reference every time. Generate the picture that must be shown inside another picture FIRST (Kowloon: the fort, because it hangs inside the shop picture).
3. **Use stills, not AI video.** AI video drifted in style and length. Stills with camera pans, zooms and glows are faster, consistent, small, and match the card's art exactly.
4. **Build the story HTML** from the existing story template (`kowloon-story-original.html`) with a build script: embed each picture as WebP (quality 86) plus a tiny blurred copy (48 px wide) for the backdrop; replace the `GLOWS`, `SCENES`, `PARTS`, `END` blocks. Fix the shop-picture frame position in code (`INSET`: a rectangle in picture pixels) so the fort picture is painted into the frame and the zoom lands exactly on picture 4.
5. **Register** all pieces (section 2), update `assets.json`, bump versions.
6. **Validate:** extract inline scripts and run `node --check`; check CSS brace balance; check the version is the same in three files; make sure any new global name is unique (a duplicate `LLX` once broke the whole app); check file names and hashes are in `assets.json`.
7. **Test on the real devices** (tablet in landscape, phone in portrait, Text size Normal AND Large, reduced motion on). Keep the previous version as rollback.

## 5. Timing: all LL stories are the same length
Target: **about 30 seconds from tap to finished card. Hard maximum 30 s for the story itself. Music track is about 34 s so it never runs out early.**

| Phase | Time |
|---|---|
| Glass flies out | about 2 s (burst, then drift, fade over the last 45%) |
| Dive into the card picture | 0.65 s |
| Shot 1 to 5 | each about 4.6 to 6.4 s (see below) |
| End on the card picture | 0.7 s settle + 2.8 s caption hold = 3.5 s |
| Glass returns | 4 s (do not change this) |
| Card snap into place | 480 ms |
| Face details fade in | about 0.4 s |

Per-shot recipe (Kowloon values, copy these):
- Camera move (pan/zoom) 4.6 to 5.2 s long, glows pulse during it.
- Caption appears 0.4 s after the shot starts and stays for the "hold" (4.0 to 4.4 s).
- Between shots: either a cross-fade (0.25 to 1.4 s) or a "zoom into the next picture" move (1.4 to 2.0 s).
- Whole story: shot 1 about 4.6 s, shot 2 about 5.1 s, shot 3 about 6.4 s (includes the zoom into the painting), shot 4 about 5.7 s, shot 5 about 4.8 s, end 3.5 s, dive 0.65 s. Total is about 31 s including the dive. If the new story runs longer, shorten holds, not the glass or return.
- Always five picture shots plus the card finish. Do not make a 4-shot or 7-shot story.

## 6. How one scene flows into the next (the handoff rule)
A cut is never allowed. Every shot ends in a position the next shot starts from.
- **Start of story:** shot 1 is the card picture itself, the same crop the glass opened onto.
- **Cross-fade handoff:** shot N ends at zoom Z and origin (x% y%); shot N+1 starts at the same values and the picture is painted so the content lines up (Kowloon: the lit windows of picture 1 dissolve into the neon of picture 2, so it reads as the lights coming on).
- **Zoom-into-picture handoff:** shot 3 ends by zooming 6.0x at origin 71% 16.25% into the framed painting on the wall. Picture 4 starts exactly full-frame on that painting. The framed image is composited in code so the edges match perfectly. The shop picture's glow near the frame fades as the zoom goes in.
- **Sky handoff:** shot 4 ends by tilting up into the blue sky (zoom 1.45, origin 42% 0%), and shot 5 starts on the same sky (zoom 1.45, origin 55% 0%) and tilts down to the building. For this, the upper 45% of pictures 4 and 5 must be clear blue sky.
- **Return handoff:** the last shot ends on the card picture at zoom 1.2 settling to 1.0, so the card snaps back exactly.
- Quiet cuts (no whoosh) are used when two shots dissolve; whooshes only on real zooms and tilts.
- Rate of change: each shot has ONE camera move and ONE small particle effect (sparkles, steam, rain, petals). Do not stack many effects.

## 7. The picture style (exact wording)
Use this opening for every image prompt, with the card art attached as the reference image:

````
Paint a NEW scene in exactly the same art style as the reference painting: same artist, same painterly gouache-and-watercolor brushwork with soft dappled strokes and visible paper texture, same rich detail, same soft glowing light, same storybook feel. Do not copy the reference composition; only its style.
````

Then add: `Scene: ...`, `Light: ...`, and `Composition (important): landscape. ...` Always end with: `No text, no signage, no borders, no frame, no watermark.` (For the shop picture use `No readable text, no logos, no watermark.`)

Settings: aspect ratio 3:2 landscape, quality medium, one reference image (the card art). Generate one picture, show it to the user, adjust, then generate the next.

Style rules:
- Warm painterly storybook look, same palette family as the card art.
- People are small, distant, softly painted. A friendly figure may appear but never as a close-up.
- Compose so a 1.5x zoom still looks sharp (the card art is only 720x1008, so keep the zoom on that picture gentle, about 1.12 to 1.2x).
- Frame element: if one picture hangs inside another, say so explicitly: "ONE large rectangular framed picture with a simple dark wooden frame, perfectly straight and flat, facing the viewer head-on (no perspective tilt), about one quarter of the image width, warmly lit by a bulb. Inside the frame is a faded painting of ..."
- Composition for tilt-ups: "The upper 45% is a wide clear luminous blue sky with a few soft wispy white clouds, painted with the same textured brushwork as the reference sky."

The video-style block used earlier (kept in case a short clip is ever needed): "Painterly, storybook-illustration look matching the supplied reference painting. Stylized, Hong Kong-inspired scene. Gentle, curious, family-friendly tone. Silent. No text, no captions, no logos, no UI, no close-up faces, no violence, no horror. People appear only as small, distant, softly painted figures. Smooth continuous camera movement, no jump cuts, no fast whip pans. Do not change the art style between frames."

## 8. Caption format and phrasing (exact)
Each shot has a caption with three lines: a **year or label** (short), one **English sentence or two**, and one **Japanese line**.
- Year/label: "1950s to 1980s", "A city of the future?", "Almost no rules", "1840s to 1898", "1994 to today". The last caption has no label and is bigger.
- English: plain words for an 8-year-old, one or two short sentences, maximum about 160 characters. Concrete numbers help ("about 350 buildings", "33,000 people"). One idea per caption.
- Japanese: simple kid Japanese, spaces between words, kana-heavy, numbers kept (e.g. 家の 上に 家を つみ上げて、やく 350の ビルが 1つの 大きな かたまりに。). Maximum about 200 characters.
- A question is allowed once, in a caption that raises curiosity ("So who was in charge? Nobody agreed!").
- The final caption is one short sentence with an arrow in the Japanese line: "From fort, to city with almost no rules, to peaceful garden 🌳" / "とりで → ルールの ない 町 → しずかな 庭園 🌳".

Kowloon's actual captions (copy this tone):
1. 1950s to 1980s: "People built homes on top of homes, until about 350 buildings were squeezed into one giant block for 33,000 people."
2. A city of the future?: "Its tangled, glowing maze later inspired lots of sci-fi films, comics and video games."
3. Almost no rules: "There was almost no law, and the lanes were dark. But real families lived here and helped each other."
4. 1840s to 1898: "It began as a small Chinese fort. In 1898 Britain leased all the land around it, but left the fort out. So who was in charge? Nobody agreed!"
5. 1994 to today: "By 1994 the buildings were taken down. Now it is a beautiful park, and the old fort's office still stands."
6. (final): "From fort, to city with almost no rules, to peaceful garden 🌳"

Card text (the card row):
- Tagline: one short line ("Nicknamed the City of Darkness").
- Story: 3 to 4 sentences, true, simple, includes the numbers and the honest hard fact in one softened sentence.
- Fun fact: one or two sentences linking to the present ("It was torn down in 1993-94 and became Kowloon Walled City Park in 1995. Its crowded towers inspired many sci-fi films, comics and games.").
- 4 bullet facts in `LL_INFO`, each with an emoji first, bold on the key number or name, then a Japanese line. Example: `🏙️ About <b>33,000 people</b> in 350 buildings, one of the most crowded places ever`.
- A local-language saying: the saying in its own script, the English meaning, who says it, then one or two sentences linking it to the story (Kowloon: 寸金尺土, "Every inch of land is worth gold.").

## 9. Music and sound
- One track of about 34 s per card, started at the tap, played once (not looped), faded about 0.5 s after the whole animation finishes. The glass break and re-form sounds are shared.
- Whooshes only on zooms; quiet on cross-fades. Reduced motion: no flying shards, no particles, simple cross-fades.
- Keep music volume calm (no sudden loud start). Respect the app's mute and sound settings.

## 10. Safety rules for an 8-year-old (must pass before shipping)
Content
1. **Truthful.** Every fact is checked against at least two reliable sources. If unsure, leave it out or soften it ("about", "believed"). Mark disputed items honestly (Kowloon: "Nobody agreed!").
2. **Hard topics are told gently and honestly, in ONE sentence, never graphically.** Kowloon had gangs, crime and poor conditions. The story says "almost no law", "the lanes were dark" and "real families lived here and helped each other". Do not show or describe violence, weapons, drugs, death, injuries, sexual content, fear, or horror. Never glamorise crime or danger.
3. **Balance:** every hard fact is followed by a human, hopeful one (families, helping, a park today).
4. **No stereotypes or mocking.** People of a culture are shown with respect, as ordinary people.
5. **No real children, no real identifiable people** in pictures. Figures are small, distant and painted.
6. **No readable text, logos, brands, slogans or symbols** inside pictures (these can be wrong, offensive, or copyrighted).
7. **No horror lighting.** Dark scenes are "cosy, warm lamplight, amber and teal", never menacing.
8. **No external links, no ads, no chat, no sharing, no tracking** inside a story file.
9. **Religion, politics, war:** state neutral facts only, no opinion, no "who was right".
10. **Check the Japanese** is simple, polite and correct, with no slang.

Visual safety
11. **No flashing.** No light pulse faster than 3 per second (Kowloon's fastest glow pulse is 1.5 s per cycle). No strobe, no full-screen flash.
12. **Reduced motion is honoured:** shards fade in place, no particles, no big zooms.
13. Do not use jump scares, sudden loud sounds or fast whip pans.

Privacy and legal
14. **Nothing personal** (names, photos, locations, school, family) in prompts, pictures, captions or file names.
15. **Private repo content stays private.** Images made with an AI tool: use only the card art and public facts as the reference. Do not upload family photos to a generator.
16. Pictures are original generations in the card's style, not copies of an artist's or photographer's work.

## 11. Mistakes already made (do not repeat)
- Do NOT reinvent an approved demo. Copy it exactly and change only what is asked.
- Apply the Text size setting correctly: `zoom` on fixed-pixel animations moved cards off centre. Counter-zoom the animation layer.
- Do not move the real card during the animation. Use a copy layer, and wait 4 frames before hiding the real card.
- Do not pause the copy's animations during the story (black squares).
- Do not give new globals names that already exist.
- Fly-out speed and return speed are separate; the user asked for a slower fly-out and an unchanged 4 s return.
- AI video was rejected: style drift and 39 s length. Stills with camera moves are the standard.

## 12. Deliverables for each new LL card (what to hand back)
1. The 3 new pictures plus the processed card art (WebP, quality 86).
2. The story file `assets/stories/<key>.<hash>.html`.
3. The card row, `LL_INFO` entry, saying, TTS language tag, `CARD_URLS`/`LLX`/`LL_URLS`/`TRACK_URLS` entries and the music file.
4. Updated `assets.json`, `sw.js`, `index.html` with the new version number.
5. A zip containing exactly the changed files and a test checklist (tablet landscape, phone portrait, Text size L, reduced motion, rollback version).
6. A short list of facts with their sources, so the parent can review them before it goes live.

## 13. First message to send to start a new card
"Build a new LL card about <TOPIC>. First give me (a) the 5-shot storyboard with the handoffs between shots, (b) the 6 captions in English and simple Japanese, (c) the card text, 4 facts and the saying, (d) the fact sources, (e) the three image prompts using the style block. Do not generate anything until I approve. Keep the whole story to about 30 seconds and follow the safety rules."
