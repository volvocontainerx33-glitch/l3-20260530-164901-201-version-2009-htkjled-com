(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function normalizeText(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var grid = scope.querySelector("[data-card-grid]");
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var input = scope.querySelector(".js-search-input");
            var category = scope.querySelector(".js-category-filter");
            var region = scope.querySelector(".js-region-filter");
            var type = scope.querySelector(".js-type-filter");
            var sort = scope.querySelector(".js-sort-select");
            var empty = scope.querySelector(".empty-state");
            var params = new URLSearchParams(window.location.search);

            if (input && params.has("q")) {
                input.value = params.get("q");
            }

            function current(select) {
                return select ? select.value : "all";
            }

            function cardText(card) {
                return normalizeText(card.dataset.keywords || card.dataset.title || card.textContent);
            }

            function apply() {
                var query = normalizeText(input ? input.value : "");
                var categoryValue = current(category);
                var regionValue = current(region);
                var typeValue = current(type);
                var visible = cards.filter(function (card) {
                    var ok = true;
                    if (query) {
                        ok = cardText(card).indexOf(query) !== -1;
                    }
                    if (ok && categoryValue !== "all") {
                        ok = card.dataset.category === categoryValue;
                    }
                    if (ok && regionValue !== "all") {
                        ok = card.dataset.region === regionValue;
                    }
                    if (ok && typeValue !== "all") {
                        ok = card.dataset.type === typeValue;
                    }
                    card.style.display = ok ? "" : "none";
                    return ok;
                });

                var ordered = cards.slice();
                var sortValue = current(sort);
                if (sortValue === "heat") {
                    ordered.sort(function (a, b) {
                        return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
                    });
                }
                if (sortValue === "year") {
                    ordered.sort(function (a, b) {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    });
                }
                if (sortValue === "title") {
                    ordered.sort(function (a, b) {
                        return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-CN");
                    });
                }
                ordered.forEach(function (card) {
                    grid.appendChild(card);
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible.length === 0);
                }
            }

            [input, category, region, type, sort].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            });
            apply();
        });
    }

    function setupMoviePlayer(url) {
        var video = document.querySelector(".movie-video");
        var overlay = document.querySelector(".player-overlay");
        if (!video || !url) {
            return;
        }
        var attached = false;
        var hls = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                return;
            }
            video.src = url;
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
