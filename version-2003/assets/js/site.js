(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(next) {
    if (!slides.length) {
      return;
    }
    activeSlide = (next + slides.length) % slides.length;
    slides.forEach(function (slide, index) {
      slide.classList.toggle('is-active', index === activeSlide);
    });
    dots.forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
      var visibleCount = 0;

      cards.forEach(function (card) {
        var content = (card.getAttribute('data-search') || '').toLowerCase();
        var match = !query || content.indexOf(query) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) {
          visibleCount += 1;
        }
      });

      var emptyState = document.querySelector('[data-empty-state]');
      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    });
  });

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-filter-value');
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });

      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
      var visibleCount = 0;
      cards.forEach(function (card) {
        var type = card.getAttribute('data-type') || '';
        var match = value === 'all' || type === value;
        card.style.display = match ? '' : 'none';
        if (match) {
          visibleCount += 1;
        }
      });

      var emptyState = document.querySelector('[data-empty-state]');
      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    });
  });
})();
