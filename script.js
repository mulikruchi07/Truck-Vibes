/* =========================================================
   TRUCK VIBES — player logic
   Add your own mp3 files inside /assets/songs/ and list
   them below. Cover art is optional (used only for the
   Media Session lock-screen art, not shown on the disc).
   ========================================================= */

const PLAYLIST = [
  {
    title: "Utha Utha Ho Sakalik",
    artist: "Satrang Music Official",
    src: "assets/songs/song1.mp3"
  },
  {
    title: "Keshava Madhava Tuzya Naamaat Re Godava",
    artist: "Satrang Music Official, Rahul Sharma",
    src: "assets/songs/song2.mp3"
  },
  {
    title: "Pratham Tula Vandito",
    artist: "Truck Beats, DJ Panjabi, Satrang Music Official, MC Rana",
    src: "assets/songs/song3.mp3"
  }
];

let current = 0;
let isSeeking = false;

const audio = document.getElementById("audio");
const discSpin = document.getElementById("discSpin");
const discBtn = document.getElementById("discBtn");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");

const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const artistWrap = trackArtist.parentElement;

const seekBar = document.getElementById("seekBar");
const seekFill = document.getElementById("seekFill");
const seekHandle = document.getElementById("seekHandle");
const timeCurrent = document.getElementById("timeCurrent");
const timeTotal = document.getElementById("timeTotal");

/* ---------------- load track ---------------- */

function loadTrack(index, autoplay){
  current = (index + PLAYLIST.length) % PLAYLIST.length;
  const track = PLAYLIST[current];

  audio.src = track.src;
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;

  seekFill.style.width = "0%";
  seekHandle.style.left = "0%";
  timeCurrent.textContent = "0:00";
  timeTotal.textContent = "0:00";

  updateMarquee();
  updateMediaSession(track);

  if (autoplay){
    audio.play().catch(() => {});
  }
}

function updateMarquee(){
  // reset first to measure natural width
  artistWrap.classList.remove("marquee");
  requestAnimationFrame(() => {
    const overflow = trackArtist.scrollWidth - artistWrap.clientWidth;
    if (overflow > 4){
      artistWrap.style.setProperty("--overflow", overflow + 40 + "px");
      artistWrap.classList.add("marquee");
    }
  });
}

/* ---------------- play / pause ---------------- */

function play(){
  audio.play().catch(() => {});
}
function pause(){
  audio.pause();
}
function togglePlay(){
  if (audio.paused) play(); else pause();
}

audio.addEventListener("play", () => {
  playIcon.style.display = "none";
  pauseIcon.style.display = "block";
  discSpin.classList.add("playing");
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
});

audio.addEventListener("pause", () => {
  playIcon.style.display = "block";
  pauseIcon.style.display = "none";
  discSpin.classList.remove("playing");
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
});

audio.addEventListener("ended", () => {
  loadTrack(current + 1, true);
});

playBtn.addEventListener("click", togglePlay);
discBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", () => loadTrack(current - 1, true));
nextBtn.addEventListener("click", () => loadTrack(current + 1, true));

/* ---------------- seek / progress ---------------- */

function formatTime(sec){
  if (!isFinite(sec) || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

audio.addEventListener("loadedmetadata", () => {
  timeTotal.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (isSeeking) return;
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  seekFill.style.width = pct + "%";
  seekHandle.style.left = pct + "%";
  timeCurrent.textContent = formatTime(audio.currentTime);
});

function seekFromEvent(clientX){
  const rect = seekBar.getBoundingClientRect();
  let pct = (clientX - rect.left) / rect.width;
  pct = Math.min(1, Math.max(0, pct));
  seekFill.style.width = pct * 100 + "%";
  seekHandle.style.left = pct * 100 + "%";
  timeCurrent.textContent = formatTime(pct * (audio.duration || 0));
  return pct;
}

function bindSeek(){
  const start = (e) => {
    isSeeking = true;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    seekFromEvent(x);
  };
  const move = (e) => {
    if (!isSeeking) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    seekFromEvent(x);
  };
  const end = (e) => {
    if (!isSeeking) return;
    const x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
    const pct = seekFromEvent(x);
    if (audio.duration) audio.currentTime = pct * audio.duration;
    isSeeking = false;
  };

  seekBar.addEventListener("mousedown", start);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);

  seekBar.addEventListener("touchstart", start, { passive: true });
  window.addEventListener("touchmove", move, { passive: true });
  window.addEventListener("touchend", end);
}
bindSeek();

/* ---------------- Media Session (background / lock-screen controls) ---------------- */

function updateMediaSession(track){
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: "Truck Vibes"
  });
  navigator.mediaSession.setActionHandler("play", play);
  navigator.mediaSession.setActionHandler("pause", pause);
  navigator.mediaSession.setActionHandler("previoustrack", () => loadTrack(current - 1, true));
  navigator.mediaSession.setActionHandler("nexttrack", () => loadTrack(current + 1, true));
}

/* ---------------- date / time (top right) ---------------- */

const dateEl = document.getElementById("dateNow");
const timeEl = document.getElementById("timeNow");

function ordinal(n){
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function updateClock(){
  const now = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  dateEl.textContent = `${ordinal(now.getDate())} ${months[now.getMonth()]} ${now.getFullYear()}`;

  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12; if (h === 0) h = 12;
  timeEl.textContent = `${h}:${m} ${ampm}`;
}
updateClock();
setInterval(updateClock, 1000 * 15);

window.addEventListener("resize", updateMarquee);

/* ---------------- init ---------------- */

loadTrack(0, false);
