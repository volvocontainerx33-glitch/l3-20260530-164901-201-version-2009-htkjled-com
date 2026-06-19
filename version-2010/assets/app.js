(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(open));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var index = Number(dot.getAttribute("data-slide") || 0);
            showSlide(index);
            if (timer) {
                window.clearInterval(timer);
                startSlider();
            }
        });
    });

    startSlider();

    var searchInput = document.getElementById("movie-search");
    var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var activeFilter = "all";

    function normalize(value) {
        return String(value || "").toLowerCase();
    }

    function filterCards() {
        var query = normalize(searchInput ? searchInput.value : "");
        cards.forEach(function (card) {
            var matchesFilter = activeFilter === "all" || card.getAttribute("data-category") === activeFilter;
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year")
            ].join(" "));
            var matchesQuery = !query || text.indexOf(query) !== -1;
            card.classList.toggle("is-hidden", !(matchesFilter && matchesQuery));
        });
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            activeFilter = chip.getAttribute("data-filter") || "all";
            chips.forEach(function (item) {
                item.classList.toggle("active", item === chip);
            });
            filterCards();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", filterCards);
    }
})();

function initMoviePlayer(source) {
    var video = document.getElementById("movie-video");
    var layer = document.querySelector(".player-layer");

    if (!video || !source) {
        return;
    }

    function applySource() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.getAttribute("src") !== source) {
                video.setAttribute("src", source);
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!video.__hls) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.__hls = hls;
            }
            return;
        }

        if (video.getAttribute("src") !== source) {
            video.setAttribute("src", source);
        }
    }

    function play() {
        applySource();
        if (layer) {
            layer.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {});
        }
    }

    if (layer) {
        layer.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", function () {
        if (layer) {
            layer.classList.add("is-hidden");
        }
    });

    applySource();
}
