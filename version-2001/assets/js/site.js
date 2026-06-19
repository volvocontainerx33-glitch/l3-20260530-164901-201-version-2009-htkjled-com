(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var opened = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length) {
            var index = 0;
            var show = function (next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            show(0);
            setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        var heroForm = document.querySelector(".hero-search");
        if (heroForm) {
            heroForm.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = heroForm.querySelector("input");
                var value = input ? input.value.trim() : "";
                var target = "./search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = normalize(filterInput ? filterInput.value : "");
            var active = {};
            selects.forEach(function (select) {
                if (select.value) {
                    active[select.getAttribute("data-filter-select")] = normalize(select.value);
                }
            });
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var pass = !keyword || text.indexOf(keyword) !== -1;
                Object.keys(active).forEach(function (key) {
                    var cardValue = normalize(card.getAttribute("data-" + key));
                    if (cardValue.indexOf(active[key]) === -1) {
                        pass = false;
                    }
                });
                card.classList.toggle("hide-by-filter", !pass);
            });
        }

        if (filterInput || selects.length) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && filterInput) {
                filterInput.value = query;
            }
            if (filterInput) {
                filterInput.addEventListener("input", applyFilters);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", applyFilters);
            });
            applyFilters();
        }
    });
})();
