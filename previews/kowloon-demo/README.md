# Kowloon LL story demo 0.5.0

Replace these three files in the existing `kowloon-demo` folder:
- index.html (single view, Claude's glass, all images embedded)
- sw.js (version marker only, deliberately not registered)
- kowloon-story.mp4 (sped up 1.32x: 29.75 s, ~9.5 MB, silent; first and last frames unchanged)

Open https://coldbeefsundae.github.io/LearningEveryday/kowloon-demo/ and confirm kowloon-demo-0.5.0.

Changes from 0.4.0:
- Side-by-side removed; Claude's 22-piece glass only.
- Each piece has a holo sheen (rainbow, masked to the piece, brightens as it rushes toward you), a white glint sweep, and a twinkling sparkle. They animate at rest too. Reduced motion turns them off.
- Opening faster: fit 0.5 s, glass crossing 0.8 s, dive 1.0 s, blend-in 0.45 s (was 0.7/1.1/1.4/0.6).
- Ending slower: blend-out 0.9 s, pull-back 2.4 s, glass return 4.0 s, settle 1.0 s (was 0.6/1.6/2.8/0.7).
- Video punch-in: the video fills the screen (no blurred sides). In landscape this crops the top and bottom heavily; "Show whole video" restores the fitted view with blurred sides for comparison.

No StarQuest files, saved progress or service worker are touched. baseline-26.11.55 remains the StarQuest rollback.
