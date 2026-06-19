(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("image-hidden");
    });
  });

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-search-input]");
    var section = scope.parentElement;
    var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
    var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
    var active = "all";

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function update() {
      var keyword = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags"));
        var channel = card.getAttribute("data-channel") || "";
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesChannel = active === "all" || channel === active;
        card.classList.toggle("is-hidden", !(matchesKeyword && matchesChannel));
      });
    }

    if (input) {
      input.addEventListener("input", update);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        active = button.getAttribute("data-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        update();
      });
    });
  });

  document.querySelectorAll("[data-player-shell]").forEach(function (shell) {
    var video = shell.querySelector("video[data-stream]");
    var button = shell.querySelector("[data-play-button]");
    var stream = video ? video.getAttribute("data-stream") : "";
    var ready = false;
    var hls = null;

    function attachStream() {
      return new Promise(function (resolve) {
        if (!video || !stream) {
          resolve();
          return;
        }

        if (ready) {
          resolve();
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          ready = true;
          resolve();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            ready = true;
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function () {
            ready = true;
            resolve();
          });
          return;
        }

        video.src = stream;
        ready = true;
        resolve();
      });
    }

    function playVideo() {
      if (!video) {
        return;
      }
      if (button) {
        button.hidden = true;
      }
      attachStream().then(function () {
        var playResult = video.play();
        if (playResult && playResult.catch) {
          playResult.catch(function () {
            if (button) {
              button.hidden = false;
            }
          });
        }
      });
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.hidden = true;
        }
      });
    }
  });
})();
