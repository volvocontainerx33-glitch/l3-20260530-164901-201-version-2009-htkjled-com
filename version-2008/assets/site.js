
(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = qs('[data-menu-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initSearchForms() {
        qsa('.site-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = qs('input[name="q"]', form);
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    event.preventDefault();
                    window.location.href = 'search.html';
                }
            });
        });
    }

    function initHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        start();
    }

    function fillSearchPageOptions(scope) {
        if (!scope || !scope.hasAttribute('data-search-page')) {
            return;
        }
        ['year', 'region', 'type'].forEach(function (field) {
            var select = qs('[data-filter-field="' + field + '"]', scope);
            if (!select || select.options.length > 1) {
                return;
            }
            var values = {};
            qsa('.movie-card', scope).forEach(function (card) {
                var value = card.getAttribute('data-' + field);
                if (value) {
                    values[value] = true;
                }
            });
            Object.keys(values).sort().reverse().forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        });
    }

    function initFilters() {
        qsa('[data-filter-scope]').forEach(function (scope) {
            fillSearchPageOptions(scope);
            var cards = qsa('.movie-card', scope);
            var search = qs('[data-filter-search]', scope);
            var selects = qsa('[data-filter-field]', scope);
            var count = qs('[data-filter-count]', scope);
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';
            if (search && initialQuery) {
                search.value = initialQuery;
            }

            function apply() {
                var term = search ? search.value.trim().toLowerCase() : '';
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute('data-filter-field')] = select.value;
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-genre')
                    ].join(' ').toLowerCase();
                    var ok = !term || haystack.indexOf(term) !== -1;
                    Object.keys(filters).forEach(function (field) {
                        if (filters[field] && card.getAttribute('data-' + field) !== filters[field]) {
                            ok = false;
                        }
                    });
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = '显示 ' + visible + ' 部影片';
                }
            }

            if (search) {
                search.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = qs('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.onload = callback;
        document.head.appendChild(script);
    }

    function prepareVideo(video, source, callback) {
        if (!source) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = source;
            }
            callback();
            return;
        }
        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                if (!video._hlsInstance) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video._hlsInstance = hls;
                }
            } else if (!video.src) {
                video.src = source;
            }
            callback();
        });
    }

    function initPlayers() {
        qsa('[data-player]').forEach(function (player) {
            var video = qs('video[data-src]', player);
            var button = qs('[data-play-button]', player);
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute('data-src');
            button.addEventListener('click', function () {
                prepareVideo(video, source, function () {
                    video.play().catch(function () {
                        video.controls = true;
                    });
                    button.classList.add('is-hidden');
                });
            });
            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initSearchForms();
        initHero();
        initFilters();
        initPlayers();
    });
}());
