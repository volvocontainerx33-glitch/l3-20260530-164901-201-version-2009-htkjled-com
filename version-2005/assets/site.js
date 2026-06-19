(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function initHeroCarousel() {
    const hero = qs("[data-hero-carousel]");
    if (!hero) return;
    const slides = qsa("[data-hero-slide]", hero);
    const dots = qsa("[data-hero-dot]", hero);
    if (slides.length <= 1) return;
    let index = slides.findIndex((s) => s.classList.contains("is-active"));
    if (index < 0) index = 0;
    const setActive = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };
    dots.forEach((dot, i) => dot.addEventListener("click", () => setActive(i)));
    setInterval(() => setActive(index + 1), 5000);
  }

  function initPlayer() {
    qsa("[data-player]").forEach((wrap) => {
      const video = qs("video", wrap);
      const playBtn = qs("[data-play]", wrap);
      const progress = qs("[data-progress]", wrap);
      const status = qs("[data-status]", wrap);
      const hlsSrc = video && video.dataset.m3u8;
      const mp4Src = video && video.dataset.mp4;
      let started = false;

      async function loadHlsIfNeeded() {
        if (!hlsSrc || !window.Hls) return false;
        if (window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(hlsSrc);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (status) status.textContent = "HLS 播放出现网络或兼容性问题，已回退本地 MP4。";
            if (mp4Src && video.src !== mp4Src) video.src = mp4Src;
          });
          return true;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hlsSrc;
          return true;
        }
        return false;
      }

      function ensureSource() {
        if (started) return;
        started = true;
        if (mp4Src && !video.src) video.src = mp4Src;
        loadHlsIfNeeded();
      }

      function syncProgress() {
        if (!progress || !video.duration) return;
        const pct = (video.currentTime / video.duration) * 100;
        progress.style.width = `${Math.max(0, Math.min(100, pct))}%`;
      }

      if (playBtn) {
        playBtn.addEventListener("click", async () => {
          ensureSource();
          try {
            await video.play();
            if (status) status.textContent = "正在播放中…";
          } catch (err) {
            if (status) status.textContent = "播放被浏览器拦截，点击视频区域或再次点击播放按钮即可。";
          }
        });
      }

      if (video) {
        video.addEventListener("click", ensureSource);
        video.addEventListener("play", () => {
          if (playBtn) playBtn.style.opacity = "0";
          if (status) status.textContent = "正在播放中…";
        });
        video.addEventListener("pause", () => {
          if (playBtn) playBtn.style.opacity = "1";
          if (status) status.textContent = "已暂停";
        });
        video.addEventListener("timeupdate", syncProgress);
        video.addEventListener("loadedmetadata", syncProgress);
        video.addEventListener("ended", () => {
          if (playBtn) playBtn.style.opacity = "1";
          if (status) status.textContent = "播放结束，可重新开始。";
          progress && (progress.style.width = "0%");
        });
        ensureSource();
      }
    });
  }

  function initSearchPage() {
    const root = qs("[data-search-page]");
    if (!root || !Array.isArray(window.__MOVIES__)) return;
    const input = qs("[data-search-input]", root);
    const genre = qs("[data-search-genre]", root);
    const year = qs("[data-search-year]", root);
    const type = qs("[data-search-type]", root);
    const grid = qs("[data-search-grid]", root);
    const count = qs("[data-search-count]", root);
    const empty = qs("[data-search-empty]", root);

    const movies = window.__MOVIES__;

    function render(list) {
      if (count) count.textContent = `${list.length}`;
      if (!list.length) {
        grid.innerHTML = "";
        empty.hidden = false;
        return;
      }
      empty.hidden = true;
      grid.innerHTML = list.map((m) => `
        <a class="card" href="${m.detail_url}">
          <div class="poster">
            <img src="../${m.poster}" alt="${escapeHtml(m.title)}">
          </div>
          <div class="card-body">
            <h3>${escapeHtml(m.title)}</h3>
            <div class="meta-line"><span>${escapeHtml(m.year)}</span><span>${escapeHtml(m.region)}</span><span>${escapeHtml(m.type)}</span></div>
            <p class="synopsis">${escapeHtml(m.summary_short)}</p>
          </div>
        </a>
      `).join("");
    }

    function apply() {
      const q = (input?.value || "").trim().toLowerCase();
      const g = (genre?.value || "").trim();
      const y = (year?.value || "").trim();
      const t = (type?.value || "").trim();
      const list = movies.filter((m) => {
        const blob = [m.title, m.region, m.type, m.genre, m.tags.join(" "), m.summary_short].join(" ").toLowerCase();
        const okQ = !q || blob.includes(q);
        const okG = !g || m.category === g;
        const okY = !y || String(m.year) === y;
        const okT = !t || m.type === t;
        return okQ && okG && okY && okT;
      }).sort((a,b) => b.score - a.score).slice(0, 400);
      render(list);
    }

    [input, genre, year, type].forEach((el) => el && el.addEventListener("input", apply));
    apply();
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function initScrollTop() {
    const btn = qs("[data-top]");
    if (!btn) return;
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function initCategoryTabs() {
    qsa("[data-category-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.categoryFilter;
        qsa("[data-category-filter]").forEach((b) => b.classList.toggle("active", b === btn));
        qsa("[data-category-block]").forEach((section) => {
          section.hidden = target !== "all" && section.dataset.categoryBlock !== target;
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeroCarousel();
    initPlayer();
    initSearchPage();
    initScrollTop();
    initCategoryTabs();
  });
})();
