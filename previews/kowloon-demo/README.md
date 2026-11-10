# Kowloon transition demo 0.2.0

## Upload to GitHub Pages
Create a NEW folder named `kowloon-demo` in the root of LearningEveryday. Upload index.html and sw.js from this package INTO THAT FOLDER. Do not overwrite the main app index.html or sw.js.

After Pages deploys, open:
https://coldbeefsundae.github.io/LearningEveryday/kowloon-demo/

The HTML embeds all five images; no additional assets or build step are required. It can also be opened locally on a desktop. The companion sw.js has the matching version but is deliberately NOT registered, so the demo installs no cache and cannot take control of the app. An existing root-level app worker may still control navigation under the site; this demo does not modify or unregister it.

## What to test
Watch movie: card first fits the stage, then glass and charms pass beyond the picture. The original picture stays anchored. A five-second ambient hold is followed by a slower return. Test Replay, Return / Skip during approach and during the hold, Reset during return, rotation, Slow study and Reduced motion. The demo is silent. Full story, camera tilt, boat motion, music and landscape outpainting are not included.

Twelve charm clusters and ten irregular glass sections are extracted losslessly from existing images and embedded into the HTML. Each has an independent simulated depth, perspective scale, radial motion and restrained rotation. The same paths reverse on return. Glass masks approximate fracture boundaries; this is not physical 3D glass. At some scales, browser resampling may reveal thin mask seams and needs device review. At rest and after return, the home picture is identical. Ambient light/reflective overlays are prototype selections, not a reconstructed animated historical scene.

No live-app files, saved progress, localStorage or IndexedDB are changed. baseline-26.11.55 remains the StarQuest rollback. Delete the separate demo folder to remove this experiment.

Static checks: extracted inline JS and sw.js node --check; balanced CSS braces; exact version sync; declaration collision review; simulated timing/Skip/Reset paths. No browser was run. Visual quality still requires iPad testing.

## Update from 0.1.0
Replace BOTH index.html and sw.js in the SAME kowloon-demo folder. No other assets needed. The displayed version must read kowloon-demo-0.2.0. No image generation was used. Original 0.1.0 package remains available as a demo rollback.
