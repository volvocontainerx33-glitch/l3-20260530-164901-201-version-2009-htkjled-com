(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot'));
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
    var activeFilter = 'all';

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function cardText(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }

        var query = normalize(searchInput ? searchInput.value : '');
        var filter = normalize(activeFilter);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = cardText(card);
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchFilter = filter === 'all' || haystack.indexOf(filter) !== -1;
            var show = matchQuery && matchFilter;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var queryParam = params.get('q');

        if (queryParam) {
            searchInput.value = queryParam;
        }

        searchInput.addEventListener('input', applyFilter);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter-button') || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applyFilter();
        });
    });

    applyFilter();
}());
