# Truck Vibes — setup notes

Plain HTML/CSS/JS, no build step, no frameworks. Just open `index.html`
in a browser (or host the folder anywhere static).

## 1. Add your songs
Drop your mp3 files into `assets/songs/` and list them in `script.js`
at the top, in the `PLAYLIST` array:

```js
const PLAYLIST = [
  { title: "Song Name", artist: "Artist One, Artist Two", src: "assets/songs/song1.mp3" },
  ...
];
```
Add as many as you like — prev/next and auto-advance-on-end already loop
through the whole array. If an artist line is too long for the box it
automatically scrolls sideways instead of wrapping (see `updateMarquee()`
in script.js) — no action needed from you.

## 2. Playlist redirect links
In `index.html`, update the two `href`s to your actual playlists:
```html
<a id="spotifyLink" href="https://open.spotify.com/playlist/YOUR_PLAYLIST_ID">
<a id="youtubeLink" href="https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID">
```

## 3. Developer / Designer LinkedIn links
In `index.html`, footer section:
```html
<a class="credit-link" href="https://www.linkedin.com/in/YOUR_DEVELOPER_PROFILE">Developed by <em>Developer</em></a>
<a class="credit-link right" href="https://www.linkedin.com/in/YOUR_DESIGNER_PROFILE">Designed by <em>Designer</em></a>
```
Swap the visible words "Developer"/"Designer" for real names too.

## 4. Favicon / logo
`assets/img/favicon.png` is a placeholder vinyl icon. Replace it with your
own logo file (keep the filename, or update the `<link rel="icon">` path
in `index.html`).

## 5. Background image
`assets/img/bg.jpg` is your uploaded artwork, compressed to ~350KB (down
from 15MB) so the page stays light and loads fast. The crop position per
screen size is controlled purely in CSS (`style.css`, `.bg` rules):
- Desktop: centered
- Tablet (≤1024px): shifted left (`30% 50%`)
- Phone (≤640px): shifted further left (`14% 50%`)

Tweak those percentages if you want the framing adjusted.

## How the behaviors work
- **No scroll, ever**: `html, body { overflow: hidden }` plus a
  `100dvh` app shell that lays out header / hero / footer / player as
  flex rows that always fit the viewport.
- **Background playback**: it's a plain `<audio>` element — browsers do
  not pause audio tags when you switch tabs, so playback continues
  automatically. The Media Session API is also wired up
  (`updateMediaSession()`), so the OS lock screen / notification shows
  title, artist and play/pause/next/prev controls too.
- **Disc rotation**: pure CSS `@keyframes spin`, toggled on/off via a
  `.playing` class — no JS animation loop, so it's cheap.
- **Draggable seek bar**: mouse + touch drag both supported
  (`bindSeek()` in script.js), updates `audio.currentTime` on release.
- **Phone view**: platform links show icon-only (Spotify/YouTube text
  and arrow hidden) via the `max-width: 640px` media query.
- **Player box size**: capped with `min(640px, 92vw)` width and a
  `clamp()` height so it never blows up to fill big screens or shrink
  awkwardly — matches the reference proportions across breakpoints.

## Notes on weight
Total page weight is fonts (Google Fonts, cached) + ~355KB background
image + a few KB of HTML/CSS/JS. No libraries, no build tooling.
