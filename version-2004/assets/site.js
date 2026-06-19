document.addEventListener("DOMContentLoaded", () => {
  const mobileButton = document.querySelector(".mobile-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      mobileButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let currentSlide = 0;

  const activateSlide = (index) => {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentSlide);
      dot.setAttribute("aria-current", dotIndex === currentSlide ? "true" : "false");
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => activateSlide(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => activateSlide(currentSlide + 1), 5200);
  }

  activateSlide(0);

  const input = document.querySelector(".search-input");
  const selects = Array.from(document.querySelectorAll(".filter-select"));
  const cards = Array.from(document.querySelectorAll(".movie-card"));
  const resetButton = document.querySelector(".reset-filters");

  const clean = (value) => String(value || "").trim().toLowerCase();

  const applyFilters = () => {
    const query = clean(input ? input.value : "");
    const selected = {};

    selects.forEach((select) => {
      selected[select.dataset.filter] = clean(select.value);
    });

    cards.forEach((card) => {
      const text = clean(card.dataset.search);
      const region = clean(card.dataset.region);
      const type = clean(card.dataset.type);
      const year = clean(card.dataset.year);
      const category = clean(card.dataset.category);
      const matchesQuery = !query || text.includes(query);
      const matchesRegion = !selected.region || region.includes(selected.region);
      const matchesType = !selected.type || type.includes(selected.type);
      const matchesYear = !selected.year || year === selected.year;
      const matchesCategory = !selected.category || category.includes(selected.category);

      card.hidden = !(matchesQuery && matchesRegion && matchesType && matchesYear && matchesCategory);
    });
  };

  if (input || selects.length) {
    if (input) {
      input.addEventListener("input", applyFilters);
    }

    selects.forEach((select) => {
      select.addEventListener("change", applyFilters);
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (input) {
        input.value = "";
      }

      selects.forEach((select) => {
        select.value = "";
      });

      applyFilters();
    });
  }
});
