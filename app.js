(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro = $('#birthday-intro');
  const site = $('#birthday-site');
  site.inert = true;
  intro.focus({ preventScroll: true });
  let introFinished = false;
  function finishBirthdayIntro() {
    if (introFinished) return;
    introFinished = true;
    const shouldFocusSite = intro.contains(document.activeElement);
    site.inert = false;
    document.documentElement.classList.remove('intro-active', 'intro-revealing');
    intro.remove();
    const anchor = document.getElementById(location.hash.slice(1));
    if (anchor) anchor.scrollIntoView({ behavior: 'instant' });
    if (shouldFocusSite) {
      const title = site.querySelector('h1');
      title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: true });
    }
  }
  setTimeout(() => {
    if (reducedMotion) { finishBirthdayIntro(); return; }
    document.documentElement.classList.add('intro-revealing');
    site.addEventListener('animationend', (event) => {
      if (event.target === site && event.animationName === 'birthday-circle-in') finishBirthdayIntro();
    });
    setTimeout(finishBirthdayIntro, 1500);
  }, 4000);
  let toastTimer;
  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3800);
  }
  let confettiFrame;
  function confetti() {
    if (reducedMotion) { toast('С днём рождения, Гулсезим! ♡'); return; }
    cancelAnimationFrame(confettiFrame);
    const canvas = $('#confetti-canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth, height = window.innerHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    const colors = ['#ac2445', '#ee9cb3', '#ffe778', '#b7a4df', '#729265', '#e98d4e'];
    const particles = Array.from({ length: 115 }, () => ({
      x: width / 2, y: height * .58, vx: (Math.random() - .5) * 18,
      vy: -8 - Math.random() * 16, size: 4 + Math.random() * 7,
      angle: Math.random() * Math.PI, spin: (Math.random() - .5) * .16,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    let start, last;
    function frame(now) {
      if (!start) { start = now; last = now; }
      const delta = Math.min((now - last) / 16.67, 2); last = now;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx * delta; p.y += p.vy * delta; p.vy += .19 * delta;
        p.vx *= Math.pow(.994, delta); p.angle += p.spin * delta;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
        ctx.globalAlpha = Math.min(1, (4500 - (now - start)) / 800);
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .5); ctx.restore();
      }
      if (now - start < 4500) confettiFrame = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, width, height);
    }
    confettiFrame = requestAnimationFrame(frame);
  }
  $('#blow-candles').addEventListener('click', () => {
    $('.cake-card').classList.add('candles-out');
    $('#blow-candles').textContent = '♡ Пусть сбудется!';
    $('#blow-candles').disabled = true;
    confetti(); toast('Желание принято Вселенной. Пусть обязательно сбудется!');
  });
  document.querySelectorAll('[data-wish]').forEach(button => button.addEventListener('click', () => {
    const revealed = button.classList.toggle('revealed');
    button.setAttribute('aria-expanded', String(revealed));
    button.querySelector('.wish-hint').textContent = revealed ? 'Сохранить в сердечке' : 'Переверни меня';
  }));
  const letter = $('#letter-dialog');
  document.querySelectorAll('[data-open-letter]').forEach(button => {
    button.addEventListener('click', () => { letter.showModal(); confetti(); });
  });
  $('#close-letter').addEventListener('click', () => letter.close());
  letter.addEventListener('click', (event) => {
    const bounds = letter.getBoundingClientRect();
    if (event.target === letter && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) letter.close();
  });
  $('#letter-confetti').addEventListener('click', confetti);
  $('#confetti-button').addEventListener('click', confetti);

  // The date is known; midnight is a countdown milestone, not an arrival time.
  const arrivalDate = Date.parse('2026-11-05T00:00:00+05:00');
  const arrivalFields = ['days', 'hours', 'minutes', 'seconds'];
  let arrivalPhase = 'before';
  function updateArrivalCountdown(now = Date.now()) {
    const remaining = Math.max(0, Math.ceil((arrivalDate - now) / 1000));
    const values = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60];
    arrivalFields.forEach((field, index) => {
      const value = String(values[index]).padStart(2, '0');
      const element = $('#arrival-' + field);
      if (element.textContent !== value) element.textContent = value;
    });
    if (remaining === 0) {
      const isMeetingDay = now < arrivalDate + 86400000;
      const phase = isMeetingDay ? 'meeting-day' : 'after';
      if (arrivalPhase === phase) return remaining;
      arrivalPhase = phase;
      $('.arrival-countdown').hidden = true;
      $('#arrival-title').textContent = isMeetingDay ? 'Сегодня тот самый день! ♡' : 'Расстояние — временно ♡';
      $('#arrival-clock-note').textContent = isMeetingDay ? '5 ноября · день самых крепких объятий' : 'До новых встреч и самых крепких объятий';
      if (!isMeetingDay) $('.arrival-message').innerHTML = 'Пусть впереди будет ещё больше встреч.<br><em>И самых крепких объятий 🤍</em>';
    }
    return remaining;
  }
  updateArrivalCountdown();
  setInterval(updateArrivalCountdown, 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateArrivalCountdown();
  });
  $('#arrival-gift').addEventListener('click', () => {
    confetti();
    $('#gift-stamp-note').textContent = 'и крепкие обнимашки 🤍';
    toast('Подарок — сюрприз. А обнимашки точно будут 🤍');
  });

  const photoLinks = Array.from(document.querySelectorAll('[data-photo-index]'));
  const viewer = $('#photo-viewer');
  let activePhoto = 0;
  function displayPhoto(index) {
    activePhoto = (index + photoLinks.length) % photoLinks.length;
    const link = photoLinks[activePhoto];
    $('#viewer-image').src = link.href;
    $('#viewer-image').alt = link.querySelector('img').alt;
    $('#viewer-caption').textContent = link.closest('article').querySelector('p').textContent;
    $('#viewer-count').textContent = (activePhoto + 1) + ' / ' + photoLinks.length;
  }
  photoLinks.forEach((link, index) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); displayPhoto(index); viewer.showModal();
  }));
  $('#close-viewer').addEventListener('click', () => viewer.close());
  $('#previous-photo').addEventListener('click', () => displayPhoto(activePhoto - 1));
  $('#next-photo').addEventListener('click', () => displayPhoto(activePhoto + 1));
  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); displayPhoto(activePhoto + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); displayPhoto(activePhoto - 1); }
  });
  viewer.addEventListener('click', (event) => {
    const bounds = viewer.getBoundingClientRect();
    if (event.target === viewer && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) viewer.close();
  });
  let touchStart;
  const imageWrap = $('.viewer-image-wrap');
  imageWrap.addEventListener('touchstart', (event) => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  imageWrap.addEventListener('touchend', (event) => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) displayPhoto(activePhoto + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  imageWrap.addEventListener('touchcancel', () => { touchStart = null; });
  $('#viewer-image').addEventListener('error', () => {
    toast('Фото не загрузилось. Попробуй открыть его ещё раз.');
  });

  let player, youtubeLoading = false;
  const panel = $('#music-panel'), musicButton = $('#music-toggle');
  function closeMusic() {
    panel.hidden = true; musicButton.setAttribute('aria-expanded', 'false');
    if (player && typeof player.pauseVideo === 'function') player.pauseVideo();
    musicButton.classList.remove('playing'); $('#music-label').textContent = 'Включить музыку';
  }
  function initializePlayer() {
    player = new YT.Player('youtube-player', {
      height: '175', width: '308', videoId: 'hDBoA3449Aw',
      playerVars: { playsinline: 1, rel: 0, start: 43 },
      events: {
        onReady(event) { if (!panel.hidden) event.target.playVideo(); },
        onStateChange(event) {
          const playing = event.data === YT.PlayerState.PLAYING;
          musicButton.classList.toggle('playing', playing);
          $('#music-label').textContent = playing ? 'Музыка играет' : 'Включить музыку';
          if (playing) $('#music-status').textContent = 'Пусть этот день звучит по-особенному ♡';
          else if (event.data === YT.PlayerState.PAUSED) $('#music-status').textContent = 'Музыка на паузе. Нажми ▶, чтобы продолжить.';
        },
        onError() { $('#music-status').textContent = 'Здесь видео недоступно. Включи его по ссылке на YouTube ниже.'; musicButton.classList.remove('playing'); $('#music-label').textContent = 'Включить музыку'; }
      }
    });
  }
  musicButton.addEventListener('click', () => {
    if (!panel.hidden) { closeMusic(); return; }
    panel.hidden = false; musicButton.setAttribute('aria-expanded', 'true');
    if (player && typeof player.playVideo === 'function') { player.playVideo(); return; }
    if (window.YT && window.YT.Player) { if (!player) initializePlayer(); return; }
    if (!youtubeLoading) {
      youtubeLoading = true;
      window.onYouTubeIframeAPIReady = initializePlayer;
      const script = document.createElement('script'); script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = () => { youtubeLoading = false; $('#music-status').textContent = 'Плеер не загрузился. Открой музыку на YouTube по ссылке ниже.'; };
      document.head.append(script);
    }
  });
  $('#music-close').addEventListener('click', closeMusic);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !panel.hidden) closeMusic(); });
})();
