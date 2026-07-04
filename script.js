/* =========================================================
   MOOD TARANG — script.js
   Handles: mood switching, audio playback, playlist rendering,
   floating particles, seek/volume controls.
   ========================================================= */

// ---------- MOOD + PLAYLIST DATA ----------
// `src` points at a local file under /songs/<mood>/ — add your own
// MP3s there and update the file names below to match.
// `ytQuery` builds a guaranteed-working YouTube search link (no
// hardcoded video IDs, so it never points at the wrong clip).
const MOODS = {
  happy: {
    label: "Happy",
    eyebrow: "Happy mode · sunshine & dhol",
    particle: { shape: "petal", count: 22, speed: [10, 18] },
    songs: [
      { title: "London Thumakda", artist: "Labh Janjua, Sonu Kakkar", file: "london-thumakda.mp3" },
      { title: "Gallan Goodiyaan", artist: "Various Artists", file: "gallan-goodiyaan.mp3" },
      { title: "Badtameez Dil", artist: "Benny Dayal", file: "badtameez-dil.mp3" },
      { title: "Nagada Sang Dhol", artist: "Shreya Ghoshal, Osman Mir", file: "nagada-sang-dhol.mp3" },
      { title: "Balam Pichkari", artist: "Vishal Dadlani, Shalmali Kholgade", file: "balam-pichkari.mp3" },
    ],
  },
  sad: {
    label: "Sad",
    eyebrow: "Sad mode · rain & reflection",
    particle: { shape: "drop", count: 26, speed: [4, 8] },
    songs: [
      { title: "Channa Mereya", artist: "Arijit Singh", file: "channa-mereya.mp3" },
      { title: "Tum Hi Ho", artist: "Arijit Singh", file: "tum-hi-ho.mp3" },
      { title: "Agar Tum Saath Ho", artist: "Alka Yagnik, Arijit Singh", file: "agar-tum-saath-ho.mp3" },
      { title: "Kabira", artist: "Tochi Raina, Rekha Bhardwaj", file: "kabira.mp3" },
      { title: "Muskurane", artist: "Arijit Singh", file: "muskurane.mp3" },
    ],
  },
  focused: {
    label: "Focused",
    eyebrow: "Focused mode · soft & steady",
    particle: { shape: "dust", count: 18, speed: [14, 24] },
    songs: [
      { title: "Kun Faya Kun", artist: "A.R. Rahman, Javed Ali, Mohit Chauhan", file: "kun-faya-kun.mp3" },
      { title: "Tum Se Hi", artist: "Mohit Chauhan", file: "tum-se-hi.mp3" },
      { title: "Ilahi", artist: "Arijit Singh", file: "ilahi.mp3" },
      { title: "Luka Chuppi", artist: "A.R. Rahman, Lata Mangeshkar", file: "luka-chuppi.mp3" },
      { title: "Tera Yaar Hoon Main (Acoustic)", artist: "Arijit Singh", file: "tera-yaar-hoon-main.mp3" },
    ],
  },
  energetic: {
    label: "Energetic",
    eyebrow: "Energetic mode · full volume, full josh",
    particle: { shape: "spark", count: 30, speed: [6, 12] },
    songs: [
      { title: "Malhari", artist: "Vishal Dadlani", file: "malhari.mp3" },
      { title: "Kar Gayi Chull", artist: "Badshah, Fazilpuria, Sukhbir", file: "kar-gayi-chull.mp3" },
      { title: "Sheila Ki Jawani", artist: "Sunidhi Chauhan", file: "sheila-ki-jawani.mp3" },
      { title: "Zingaat (Hindi)", artist: "Amit Mishra, Sachet Tandon", file: "zingaat.mp3" },
      { title: "Ghungroo", artist: "Arijit Singh, Shilpa Rao", file: "ghungroo.mp3" },
    ],
  },
};

// ---------- STATE ----------
let currentMood = "focused";
let currentIndex = 0;
let isPlaying = false;

// ---------- DOM REFS ----------
const body = document.body;
const moodButtons = document.querySelectorAll(".mood-btn");
const playlistEl = document.getElementById("playlist");
const playlistMoodLabel = document.getElementById("playlist-mood-label");
const moodEyebrow = document.getElementById("mood-eyebrow");
const trackTitle = document.getElementById("track-title");
const trackArtist = document.getElementById("track-artist");
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const seek = document.getElementById("seek");
const timeCurrent = document.getElementById("time-current");
const timeDuration = document.getElementById("time-duration");
const volume = document.getElementById("volume");
const disc = document.getElementById("disc");
const localHint = document.getElementById("local-hint");
const particleLayer = document.getElementById("particle-layer");

// ---------- MOOD SWITCHING ----------
function setMood(moodKey) {
  currentMood = moodKey;
  currentIndex = 0;

  body.className = `mood-${moodKey}`;

  moodButtons.forEach((btn) => {
    const active = btn.dataset.mood === moodKey;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });

  moodEyebrow.textContent = MOODS[moodKey].eyebrow;
  playlistMoodLabel.textContent = `· ${MOODS[moodKey].label}`;

  renderPlaylist();
  loadTrack(0, { autoplay: false });
  rebuildParticles();
}

// ---------- PLAYLIST RENDERING ----------
function renderPlaylist() {
  const songs = MOODS[currentMood].songs;
  playlistEl.innerHTML = "";

  songs.forEach((song, i) => {
    const li = document.createElement("li");
    li.className = "track-row" + (i === currentIndex ? " is-active" : "");
    li.dataset.index = i;

    const ytQuery = encodeURIComponent(`${song.title} ${song.artist} Bollywood song`);

    li.innerHTML = `
      <span class="track-num">${i + 1}</span>
      <span class="track-meta">
        <span class="name">${song.title}</span>
        <span class="by">${song.artist}</span>
      </span>
      <a class="yt-link" href="https://www.youtube.com/results?search_query=${ytQuery}"
         target="_blank" rel="noopener noreferrer" title="Search this song on YouTube">▶ YouTube</a>
    `;

    li.addEventListener("click", (e) => {
      // don't hijack clicks on the YouTube link
      if (e.target.closest(".yt-link")) return;
      loadTrack(i, { autoplay: true });
    });

    playlistEl.appendChild(li);
  });
}

// ---------- TRACK LOADING ----------
function loadTrack(index, { autoplay }) {
  const songs = MOODS[currentMood].songs;
  currentIndex = index;
  const song = songs[index];

  trackTitle.textContent = song.title;
  trackArtist.textContent = song.artist;
  audio.src = `songs/${currentMood}/${song.file}`;
  localHint.textContent = `Looking for songs/${currentMood}/${song.file} — add your own MP3 there, or use the YouTube link in the playlist.`;

  // highlight active row
  document.querySelectorAll(".track-row").forEach((row) => {
    row.classList.toggle("is-active", Number(row.dataset.index) === index);
  });

  if (autoplay) {
    playAudio();
  } else {
    pauseAudio();
  }
}

// ---------- PLAYBACK CONTROLS ----------
function playAudio() {
  audio.play().then(() => {
    isPlaying = true;
    playBtn.textContent = "⏸";
    disc.classList.add("is-spinning");
  }).catch(() => {
    // file likely missing locally — keep UI usable, just don't spin
    isPlaying = false;
    playBtn.textContent = "▶";
    disc.classList.remove("is-spinning");
    localHint.textContent = `Couldn't find songs/${currentMood}/${MOODS[currentMood].songs[currentIndex].file}. Add the MP3 to that folder, or tap "YouTube" in the playlist to listen there.`;
  });
}

function pauseAudio() {
  audio.pause();
  isPlaying = false;
  playBtn.textContent = "▶";
  disc.classList.remove("is-spinning");
}

playBtn.addEventListener("click", () => {
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
});

prevBtn.addEventListener("click", () => {
  const songs = MOODS[currentMood].songs;
  const newIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadTrack(newIndex, { autoplay: isPlaying });
});

nextBtn.addEventListener("click", () => {
  const songs = MOODS[currentMood].songs;
  const newIndex = (currentIndex + 1) % songs.length;
  loadTrack(newIndex, { autoplay: isPlaying });
});

audio.addEventListener("ended", () => nextBtn.click());

// ---------- SEEK + TIME ----------
function formatTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

audio.addEventListener("loadedmetadata", () => {
  seek.max = audio.duration || 0;
  timeDuration.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  seek.value = audio.currentTime;
  timeCurrent.textContent = formatTime(audio.currentTime);
});

seek.addEventListener("input", () => {
  audio.currentTime = seek.value;
});

// ---------- VOLUME ----------
audio.volume = 0.7;
volume.addEventListener("input", () => {
  audio.volume = volume.value / 100;
});

// ---------- MOOD BUTTON EVENTS ----------
moodButtons.forEach((btn) => {
  btn.addEventListener("click", () => setMood(btn.dataset.mood));
});

// ---------- FLOATING PARTICLES ----------
function rebuildParticles() {
  particleLayer.innerHTML = "";
  const { shape, count, speed } = MOODS[currentMood].particle;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "particle" + (shape === "spark" ? " spark" : shape === "drop" ? " drop fall" : "");

    const size = shape === "dust" ? rand(3, 6) : shape === "petal" ? rand(8, 16) : shape === "drop" ? rand(6, 10) : rand(4, 8);
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${rand(0, 100)}%`;
    p.style.setProperty("--drift", `${rand(-60, 60)}px`);

    const dur = rand(speed[0], speed[1]);
    p.style.animationDuration = `${dur}s`;
    p.style.animationDelay = `${rand(0, dur)}s`;

    particleLayer.appendChild(p);
  }
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// ---------- INIT ----------
setMood("focused");