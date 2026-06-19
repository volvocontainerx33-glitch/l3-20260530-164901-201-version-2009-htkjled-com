
import { H as Hls } from './hls-vendor.js';

function normalize(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '');
}

function initMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function initSearch() {
  const inputs = document.querySelectorAll('[data-search-input]');
  inputs.forEach((input) => {
    const targetSel = input.dataset.filterTarget;
    const target = targetSel ? document.querySelector(targetSel) : null;
    if (!target) return;
    const cards = Array.from(target.querySelectorAll('[data-card]'));
    const button = input.parentElement ? input.parentElement.querySelector('[data-search-button]') : null;

    const apply = () => {
      const query = normalize(input.value);
      cards.forEach((card) => {
        const hay = normalize(card.dataset.search || card.textContent);
        const show = !query || hay.includes(query);
        card.dataset.hidden = show ? 'false' : 'true';
      });
    };

    input.addEventListener('input', apply);
    if (button) button.addEventListener('click', apply);
  });
}

function initCarousel() {
  const track = document.querySelector('[data-carousel-track]');
  const prev = document.querySelector('[data-carousel-prev]');
  const next = document.querySelector('[data-carousel-next]');
  if (!track || !prev || !next) return;

  const step = () => Math.max(240, track.querySelector('.movie-card')?.getBoundingClientRect().width || 280);

  prev.addEventListener('click', () => {
    track.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  next.addEventListener('click', () => {
    track.scrollBy({ left: step(), behavior: 'smooth' });
  });

  let timer = window.setInterval(() => {
    const max = track.scrollWidth - track.clientWidth - 12;
    if (track.scrollLeft >= max) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    }
  }, 4500);

  track.addEventListener('mouseenter', () => window.clearInterval(timer));
  track.addEventListener('mouseleave', () => {
    timer = window.setInterval(() => {
      const max = track.scrollWidth - track.clientWidth - 12;
      if (track.scrollLeft >= max) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: step(), behavior: 'smooth' });
      }
    }, 4500);
  });
}

function initPlayers() {
  const videos = document.querySelectorAll('video.video-player');
  videos.forEach((video) => {
    const hlsSrc = video.dataset.hls;
    const mp4Src = video.dataset.mp4;
    if (hlsSrc && Hls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsSrc);
      hls.attachMedia(video);
      video._hls = hls;
    } else if (hlsSrc && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsSrc;
    } else if (mp4Src) {
      video.src = mp4Src;
    }
  });

  document.querySelectorAll('[data-play-button]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const stage = btn.closest('.player-stage');
      const video = stage ? stage.querySelector('video') : document.querySelector('video.video-player');
      if (!video) return;
      try {
        await video.play();
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
      } catch (error) {
        console.warn('play failed', error);
      }
    });
  });
}

function initLazyPlayButtons() {
  document.querySelectorAll('.player-stage').forEach((stage) => {
    const video = stage.querySelector('video');
    const btn = stage.querySelector('[data-play-button]');
    if (!video || !btn) return;
    video.addEventListener('play', () => {
      btn.style.opacity = '0';
      btn.style.pointerEvents = 'none';
    });
    video.addEventListener('pause', () => {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initSearch();
  initCarousel();
  initPlayers();
  initLazyPlayButtons();
});
