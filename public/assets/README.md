# Assets Directory

This folder is configured for static game assets.

- `audio/`: Pre-synthesized procedural Web Audio API generators are utilized by default in `src/systems/AudioManager.js` (bell, chain clicks, wind surge, collectibles, collisions, and ambient raga music). You can also place custom `.mp3` files here (`bell.mp3`, `collision.mp3`, `boost.mp3`, `background.mp3`) if desired.
- `textures/`: Procedural high-resolution textures are generated on-the-fly using HTML5 Canvas in `src/world/TextureGenerator.js` (Kolkata rickshaw art, 5 unlockable canopies, road surface, and heritage signboards). Custom `.png` files can also be placed here.
- `fonts/`: System and web fonts are used (`Impact`, `Trebuchet MS`, `Georgia`, sans-serif).

