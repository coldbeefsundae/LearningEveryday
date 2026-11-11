# Kowloon LL glass comparison demo 0.4.0

Upload into the existing `kowloon-demo` folder, replacing index.html and sw.js, and ADD kowloon-story.mp4 (same folder):

- index.html (side-by-side page, all images embedded)
- sw.js (version marker only, deliberately not registered)
- kowloon-story.mp4 (the four Argon clips joined with 0.25 s blends, silent, H.264, 39.25 s, ~12 MB)

Open https://coldbeefsundae.github.io/LearningEveryday/kowloon-demo/ and confirm the version reads kowloon-demo-0.4.0.

Left: Claude's glass, 22 pieces cut from your artwork, independent depths. Right: your StarQuest LL layers (shadow, body + holo sheen, cracks, glare, bobbing charms) with the app's original dive: glass 3.275x and charms 3x over 700 ms cubic-bezier(.7,0,1,1), clipped to the card; return 2.4 s ease-in-out.
Everything else is identical and runs from one timeline: card fit, drift-in to the video's frame (1.27x, ~10.5% trimmed per side), blend into the story, blend back, widen to the full card, glass returns.

Differences from the live app on the right side: no tilt (static --dx/--dy), no sparks layer, no art "breathe" scale, the gold card border is the same thin rim used on the left.
No StarQuest files, saved progress or service worker are touched. baseline-26.11.55 remains the StarQuest rollback.
