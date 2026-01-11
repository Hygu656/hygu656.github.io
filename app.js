const feed = document.getElementById("feed");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const clickSound = document.getElementById("clickSound");
const openSound = document.getElementById("openSound");

function initClock() {
  const tray = document.querySelector("#taskbar .tray");
  if (!tray) return;

  function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    tray.textContent = `${hours}:${minutes}`;
  }

  updateClock(); 
  setInterval(updateClock, 1000); 
}

document.addEventListener("DOMContentLoaded", initClock);

POSTS.forEach(post => feed.appendChild(createPost(post)));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const video = entry.target;
    if (!entry.isIntersecting) {
      video.pause();
    }
  });
}, { threshold: 0.6 });

function updateVideoObserver() {
  document.querySelectorAll("video").forEach(v => observer.observe(v));
}

updateVideoObserver();

const feedWindow = document.getElementById("feedWindow");

let zIndexCounter = 10;
function bringToFront(el) {
  zIndexCounter += 1;
  el.style.zIndex = zIndexCounter;
  el.classList.remove('hidden');
}

function toggleMaximize(win) {
  const isNowMax = win.classList.toggle('maximized');
  if (isNowMax) {
    win._smallRect = win._smallRect || win.getBoundingClientRect();
    win.style.left = '';
    win.style.top = '';
    win.style.width = '';
    win.style.height = '';
  } else {
    const r = win._smallRect || { left: 40, top: 60, width: 540, height: 640 };
    win.style.left = r.left + 'px';
    win.style.top = r.top + 'px';
    win.style.width = r.width + 'px';
    win.style.height = r.height + 'px';
  }
}

function makeDraggable(win) {
  const title = win.querySelector('.title-bar');
  if (!title) return;


  if (!win._smallRect) {
    const r0 = win.getBoundingClientRect();
    win._smallRect = { left: r0.left, top: r0.top, width: r0.width, height: r0.height };
  }

  title.addEventListener('dblclick', () => {

    
    toggleMaximize(win);
  });

  title.addEventListener('pointerdown', (e) => {

    if (e.target.closest('.window-controls')) return;


    if (win.classList.contains('maximized')) {
      const prev = win._smallRect || { width: 540, height: 640 };
      toggleMaximize(win); 


      const ratio = e.clientX / window.innerWidth;
      let newLeft = e.clientX - ratio * prev.width;
      let newTop = e.clientY - 20; 
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - prev.width));
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - prev.height - 40));
      win.style.left = newLeft + 'px';
      win.style.top = newTop + 'px';
    }

    bringToFront(win);

    title.setPointerCapture(e.pointerId);
    win.classList.add('dragging');
    title.classList.add('dragging');

    const startX = e.clientX;
    const startY = e.clientY;
    const rect = win.getBoundingClientRect();
    const origLeft = rect.left;
    const origTop = rect.top;

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      win.style.left = origLeft + dx + 'px';
      win.style.top = origTop + dy + 'px';
    }

    function onUp(ev) {
      win.classList.remove('dragging');
      title.classList.remove('dragging');
      try { title.releasePointerCapture(ev.pointerId); } catch (err) {}
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);


      const rFinal = win.getBoundingClientRect();
      win._smallRect = { left: rFinal.left, top: rFinal.top, width: rFinal.width, height: rFinal.height };
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });

  win.addEventListener('pointerdown', (e) => { if (e.target.closest('.window-controls')) return; bringToFront(win); });
}


document.querySelectorAll('.draggable').forEach(makeDraggable);

const startBtn = document.getElementById('startBtn');
const startMenu = document.getElementById('startMenu');
const startThemeToggle = document.getElementById('startThemeToggle');
const startOpenXPgram = document.getElementById('startOpenXPgram');
const startAbout = document.getElementById('startAbout');

if (startBtn) {
  startBtn.onclick = (e) => {
    e.stopPropagation();
    if (!startMenu) return play(clickSound);
    startMenu.classList.toggle('hidden');
    const open = !startMenu.classList.contains('hidden');
    startBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    startMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    play(clickSound);
  };
}


document.addEventListener('pointerdown', (e) => {
  if (!startMenu) return;
  if (!e.target.closest('#startMenu') && !e.target.closest('#startBtn')) {
    startMenu.classList.add('hidden');
    startBtn.setAttribute('aria-expanded', 'false');
    startMenu.setAttribute('aria-hidden', 'true');
  }
});


document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && startMenu) {
    startMenu.classList.add('hidden');
    startBtn.setAttribute('aria-expanded', 'false');
    startMenu.setAttribute('aria-hidden', 'true');
  }
});


function setTheme(isDark) {
  document.documentElement.classList.toggle('dark', !!isDark);
  localStorage.setItem('xp-theme', !!isDark ? 'dark' : 'xp');
  if (startThemeToggle) startThemeToggle.checked = !!isDark;
}

const _saved = localStorage.getItem('xp-theme');
if (_saved === 'dark') setTheme(true); else if (startThemeToggle) startThemeToggle.checked = false;

if (startThemeToggle) startThemeToggle.onchange = (e) => { setTheme(e.target.checked); play(clickSound); };

window.addEventListener('storage', (e) => {
  if (e.key === 'xp-theme') {
    const val = e.newValue;
    if (val === 'dark') setTheme(true); else setTheme(false);
  }
});



document.querySelectorAll('.taskbar-btn').forEach(btn => {
  btn.onclick = () => {
    const id = btn.dataset.window;
    const win = document.getElementById(id);
    if (!win) return;
    if (win.classList.contains('hidden')) {
      bringToFront(win);
      play(openSound);
    } else {
      win.classList.add('hidden');
      play(clickSound);
    }
  };
});

const minBtn = feedWindow.querySelector('.min-btn');
const maxBtn = feedWindow.querySelector('.max-btn');
const closeBtn = feedWindow.querySelector('.close-btn');

minBtn && (minBtn.onclick = () => { feedWindow.classList.add('hidden'); play(clickSound); });
maxBtn && (maxBtn.onclick = () => { toggleMaximize(feedWindow); play(clickSound); });
closeBtn && (closeBtn.onclick = () => { feedWindow.classList.add('hidden'); play(clickSound); });

const xpIcon = document.getElementById('xpgramIcon');
if (xpIcon) {
  xpIcon.ondblclick = () => {
    bringToFront(feedWindow);
    play(openSound);
  };
  xpIcon.onclick = () => play(clickSound);
}


function play(sound) {
  sound.currentTime = 0;
  sound.play();
}

function generateVideoThumb(src, callback) {
  const video = document.createElement('video');
  video.src = src;
  video.crossOrigin = "anonymous";
  video.preload = "metadata";

  video.addEventListener('loadeddata', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 160; 
    canvas.height = 90; 
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    callback(canvas.toDataURL()); 
  });

  video.load();
}

function createPost(post, opts = {}) {
  let index = (typeof opts.startIndex === 'number') ? opts.startIndex : 0;
  const el = document.createElement("div");
  el.className = "post";

  const likes = typeof post.likes === 'number' ? post.likes : 124;

  const header = document.createElement('div');
  header.className = 'post-header';

  const avatarEl = document.createElement('div');
  avatarEl.className = 'avatar';
  if (post.avatar) {
    const img = document.createElement('img');
    img.src = post.avatar;
    img.alt = `${post.user} avatar`;
    img.onerror = () => { avatarEl.removeChild(img); avatarEl.textContent = post.user.charAt(0).toUpperCase(); };
    avatarEl.appendChild(img);
  } else {
    avatarEl.textContent = post.user.charAt(0).toUpperCase();
  }

const userInfo = document.createElement('div');
userInfo.className = 'user-info';
userInfo.innerHTML = `
  <a href="${post.userLink || '#'}" target="_blank" class="username">${post.user}</a>
  <div class="caption">${post.caption || ''}</div>
`;

  header.appendChild(avatarEl);
  header.appendChild(userInfo);
  el.appendChild(header);


  const mediaBox = document.createElement("div");
  mediaBox.className = "post-media";


  const actions = document.createElement("div");
  actions.className = "post-actions";
  actions.innerHTML = `
    <button class="like-btn" aria-label="Like">♡</button>
    <button class="comment-btn" aria-label="Comment" title="Comment">
      <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2v3l4-3h8a2 2 0 0 0 2-2V6z"/></svg>
    </button>
    <button class="share-btn" aria-label="Share">📤</button>
    <div class="likes-count">${likes}</div>
  `;


  const likeBtn = actions.querySelector('.like-btn');
  const likesCountEl = actions.querySelector('.likes-count');
  let liked = false;
  likeBtn.onclick = (e) => {
    e.stopPropagation();
    liked = !liked;
    likeBtn.classList.toggle('liked', liked);
    likeBtn.textContent = liked ? '❤️' : '♡';
    likesCountEl.textContent = liked ? likes + 1 : likes;
  };


function render() {
  mediaBox.innerHTML = "";
  const item = post.media[index];

  let media;

  if (item.type === "video") {
    media = document.createElement("video");
    media.src = item.src;
    media.controls = !!opts.modal;
    media.preload = "metadata";
    media.muted = true;
    media.loop = true;
    media.playsInline = true;

  }  else if (item.type === "model") {

  if (!opts.modal) {
    media = document.createElement("img");
    media.src = item.poster;
    media.className = "model-poster";

  } else {
    const wrap = document.createElement("div");
    wrap.className = "model-wrap";
    wrap.style.height = "420px";  
    wrap.style.width = "100%";
    wrap.style.position = "relative";

    const loading = document.createElement("div");
    loading.className = "model-loading";
    loading.innerHTML = `
      <div class="xp-loading-title">Loading 3D Asset</div>

      <div class="xp-loading-bar">
        <div class="xp-loading-progress"></div>
      </div>

      <div class="xp-loading-percent">0%</div>
    `;
    let progress = 0;
  const bar = loading.querySelector(".xp-loading-progress");
  const percent = loading.querySelector(".xp-loading-percent");

  const fakeInterval = setInterval(() => {
    if (progress < 90) {
      progress += Math.random() * 6;
      progress = Math.min(progress, 90);
      bar.style.width = progress + "%";
      percent.textContent = Math.floor(progress) + "%";
    }
  }, 120);

    const mv = document.createElement("model-viewer");
    mv.src = item.src;
    mv.setAttribute("camera-controls", "");
    mv.setAttribute("auto-rotate", "");
    mv.setAttribute("shadow-intensity", "1");
    mv.style.width = "100%";
    mv.style.height = "100%";
    mv.style.background = "#000";

  mv.addEventListener("load", () => {
    clearInterval(fakeInterval);

    progress = 100;
    bar.style.width = "100%";
    percent.textContent = "100%";

    setTimeout(() => {
      loading.classList.add("hide");
    }, 300);
  });

    wrap.appendChild(mv);
    wrap.appendChild(loading); 
    media = wrap;
  }

  } else {
    media = document.createElement("img");
    media.src = item.src;
  }

  mediaBox.appendChild(media);


  if (!opts.modal && !mediaBox.dataset.onclickSet) {
    mediaBox.addEventListener('click', (e) => {
      if (e.target.closest('.gallery-nav') || e.target.closest('.thumb')) return;
      openModal(post, index);
    });
    mediaBox.dataset.onclickSet = "1";
  }


  if (!opts.modal) {
    const openBtn = document.createElement('button');
    openBtn.className = 'media-open-btn' + (item.type === 'video' ? ' video' : '');
    openBtn.title = 'Open post';
    openBtn.setAttribute('aria-label', 'Open post');
    if (item.type === 'video') {
      openBtn.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><polygon points="8,5 19,12 8,19" fill="white"/></svg>`;
    } else if (item.type === 'model') {
      openBtn.textContent = '🧊';
    } else {
      openBtn.textContent = '🔍';
    }
    openBtn.onclick = (e) => { e.stopPropagation(); openModal(post, index); };
    mediaBox.appendChild(openBtn);
  }


  if (post.media.length > 1) {

  
    ["left", "right"].forEach(dir => {
      const btn = document.createElement("button");
      btn.className = `gallery-nav ${dir}`;
      btn.textContent = dir === "left" ? "◀" : "▶";
      btn.onclick = e => {
        e.stopPropagation();
        play(clickSound);
        index = dir === "left"
          ? (index === 0 ? post.media.length - 1 : index - 1)
          : (index + 1) % post.media.length;
        render();
      };
      mediaBox.appendChild(btn);
    });

 
    const thumbBar = document.createElement('div');
    thumbBar.className = 'thumbs';
    post.media.forEach((m, i) => {
      const t = document.createElement('button');
      t.className = 'thumb' + (i === index ? ' active' : '');
      t.onclick = (e) => { 
        e.stopPropagation(); 
        index = i; 
        render(); 
      };

      const wrapper = document.createElement('div');
      wrapper.className = 'thumb-wrapper';

      if (m.type === 'image') {
        const img = document.createElement('img');
        img.src = m.src;
        img.alt = m.alt || '';
        wrapper.appendChild(img);

      } else if (m.type === 'video') {
        const video = document.createElement('video');
        video.src = m.src;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';
        wrapper.appendChild(video);

        const icon = document.createElement('div');
        icon.className = 'thumb-video-icon';
        icon.innerHTML = '▶';
        wrapper.appendChild(icon);

      } else if (m.type === 'model') {
        const img = document.createElement('img');
        img.src = m.poster;
        wrapper.appendChild(img);

        const icon = document.createElement('div');
        icon.className = 'thumb-model-icon';
        icon.innerHTML = '🧊';
        wrapper.appendChild(icon);
      }

      t.appendChild(wrapper);
      thumbBar.appendChild(t);
    });

    mediaBox.appendChild(thumbBar);


const activeThumb = thumbBar.querySelector('.thumb.active');
if (activeThumb) {
  const thumbRect = activeThumb.getBoundingClientRect();
  const barRect = thumbBar.getBoundingClientRect();
  const scrollOffset = thumbRect.left - barRect.left - (barRect.width / 2) + (thumbRect.width / 2);
  thumbBar.scrollLeft += scrollOffset;
}
  }
}



  render();
  el.appendChild(mediaBox);
  el.appendChild(actions);
  return el;
}


function openModal(post, startIndex = 0) {
  play(openSound);

  document.querySelectorAll('video').forEach(v => v.pause());
  modalContent.innerHTML = "";

  const modalPost = createPost(post, { modal: true, startIndex });
  modalContent.appendChild(modalPost);

  modal.classList.remove("hidden");
  modal.style.zIndex = 20000;

  const modalWin = document.getElementById('modalWindow');
  if (modalWin) {
    bringToFront(modalWin);
    modalWin.style.zIndex = 20001;
    makeDraggable(modalWin);

    if (!modalWin.style.left) {
      modalWin.style.left = (window.innerWidth - modalWin.offsetWidth) / 2 + 'px';
      modalWin.style.top = Math.max(40, (window.innerHeight - modalWin.offsetHeight) / 3) + 'px';
    }
  }


  const modalVideo = modalContent.querySelector('video');
  if (modalVideo) {
    modalVideo.currentTime = 0;
    modalVideo.play().catch(() => {});
  }


  const modalModel = modalContent.querySelector('model-viewer');
  if (modalModel) {
    modalModel.autoRotate = true;
    modalModel.cameraControls = true;
  }
}


document.getElementById("closeModal").onclick = () => {
  play(clickSound);
  modalContent.querySelectorAll('video').forEach(v => { v.pause(); try{ v.currentTime = 0 } catch(e){} });
  modal.classList.add("hidden");
};




const secretCode = "WWSSADAD"; 

let secretActive = false; 
let typed = "";

document.addEventListener("keydown", (e) => {
    if (secretActive) return;
  typed += e.key.toUpperCase();
  if (!secretCode.startsWith(typed)) typed = "";
  if (typed === secretCode) {
    typed = "";
    secretActive = true;
    triggerXPGlitch("media/secret/dyrek.mp4", "sounds/glitch.mp3");
  }
});

function triggerXPGlitch(videoUrl, soundUrl) {
  const desktop = document.getElementById("desktop") || document.body;
  const icons = document.querySelectorAll(".desktop-icon");
  const taskbar = document.getElementById("taskbar");

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.zIndex = "30000";
  overlay.style.pointerEvents = "none";
  overlay.style.mixBlendMode = "difference";
  document.body.appendChild(overlay);

  const strips = [];
  const numStrips = 35;
  for (let i = 0; i < numStrips; i++) {
    const strip = document.createElement("div");
    strip.style.position = "absolute";
    strip.style.width = "100%";
    strip.style.height = `${Math.random() * 25 + 5}px`;
    strip.style.top = `${Math.random() * 100}%`;
    strip.style.background = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},0.15)`;
    overlay.appendChild(strip);
    strips.push(strip);
  }


  const glitchSound = new Audio(soundUrl);
  glitchSound.volume = 0.8;
  glitchSound.play();

  let glitchInterval = setInterval(() => {

    const tx = Math.random() * 60 - 30;
    const ty = Math.random() * 60 - 30;
    const skewX = Math.random() * 15 - 7.5;
    const skewY = Math.random() * 15 - 7.5;
    desktop.style.transform = `translate(${tx}px, ${ty}px) skew(${skewX}deg, ${skewY}deg) scale(${1 + Math.random()*0.08})`;

    icons.forEach(icon => {
      icon.style.transform = `translate(${Math.random()*30-15}px, ${Math.random()*30-15}px) rotate(${Math.random()*10-5}deg)`;
    });


    if (taskbar) taskbar.style.transform = `translate(${Math.random()*25-12}px, ${Math.random()*15-7}px) rotate(${Math.random()*3-1.5}deg)`;


    strips.forEach(s => {
      s.style.top = `${Math.random()*100}%`;
      s.style.opacity = Math.random()*0.5;
      s.style.background = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.random()*0.25+0.05})`;
    });


    if (Math.random() < 0.3) desktop.style.filter = `contrast(${1 + Math.random()*0.8}) brightness(${1 + Math.random()*0.8})`;
    else desktop.style.filter = "none";

    if (Math.random() < 0.15) desktop.style.clipPath = `inset(${Math.random()*20}% ${Math.random()*20}% ${Math.random()*20}% ${Math.random()*20}%)`;
    else desktop.style.clipPath = "none";

  }, 30); 

  
  setTimeout(() => {
    clearInterval(glitchInterval);
    desktop.style.transform = "";
    desktop.style.filter = "";
    desktop.style.clipPath = "";
    icons.forEach(icon => icon.style.transform = "");
    if (taskbar) taskbar.style.transform = "";
    document.body.removeChild(overlay);
    openSecretVideo(videoUrl);
  }, 3000);
}

function openSecretVideo(videoUrl) {
  const modal = document.createElement("div");
  modal.className = "modal";

  const windowEl = document.createElement("div");
  windowEl.className = "window draggable";
  windowEl.style.width = "640px";
  windowEl.style.height = "360px";
  windowEl.style.top = "80px";
  windowEl.style.left = "80px";

  const titleBar = document.createElement("div");
  titleBar.className = "title-bar";
  titleBar.innerHTML = `
    <div class="title-left">SECRET FILE</div>
    <div class="window-controls">
      <button class="close-btn">×</button>
    </div>
  `;

  titleBar.querySelector(".close-btn").addEventListener("click", () => {
    secretActive = false;
    document.body.removeChild(modal);
  });

  const content = document.createElement("div");
  content.className = "window-content";
  content.style.flex = "1";
  content.style.overflow = "hidden";
  content.style.display = "flex";
  content.style.alignItems = "center";
  content.style.justifyContent = "center";

  const video = document.createElement("video");
  video.src = videoUrl;
  video.controls = true;
  video.autoplay = true;
  video.style.width = "100%";
  video.style.height = "100%";
  video.style.objectFit = "contain";

  content.appendChild(video);
  windowEl.appendChild(titleBar);
  windowEl.appendChild(content);
  modal.appendChild(windowEl);
  document.body.appendChild(modal);

  makeDraggable(windowEl, titleBar);
}


