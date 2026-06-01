(function () {
  const grid = document.getElementById("projects-grid");
  const sortSelect = document.getElementById("projects-sort");
  const tagSearchInput = document.getElementById("projects-tag-search");
  const tagSelect = document.getElementById("projects-tag-select");
  const clearFiltersButton = document.getElementById("projects-clear-filters");
  const resultsSummary = document.getElementById("projects-results-summary");
  if (!grid || !sortSelect) return;

  const cards = Array.from(grid.querySelectorAll(".project-card"));
  const cardTagButtons = Array.from(
    document.querySelectorAll(".project-tag-chip, .tech-tag"),
  );

  const parseDate = (v) => {
    if (!v) return 0;
    const t = Date.parse(v);
    return Number.isNaN(t) ? 0 : t;
  };

  const parseNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const compare = (a, b, mode) => {
    const isAH = a.classList.contains("highlight-gold");
    const isBH = b.classList.contains("highlight-gold");
    if (isAH !== isBH) {
      return isAH ? -1 : 1;
    }

    if (mode === "commits") {
      return parseNum(b.dataset.commits) - parseNum(a.dataset.commits);
    }
    if (mode === "pub_date") {
      return parseDate(b.dataset.created) - parseDate(a.dataset.created);
    }
    if (mode === "updated_date") {
      return parseDate(b.dataset.updated) - parseDate(a.dataset.updated);
    }
    if (mode === "language") {
      const al = (a.dataset.language || "").toLowerCase();
      const bl = (b.dataset.language || "").toLowerCase();
      return al.localeCompare(bl);
    }
    return 0;
  };

  const getCardTags = (card) =>
    (card.dataset.tags || "")
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

  const updateChipStates = (selectedTag) => {
    cardTagButtons.forEach((button) => {
      const tag = (button.dataset.cardTag || "").toLowerCase();
      button.classList.toggle("is-active", selectedTag === tag);
    });
  };

  const updateResultsSummary = (visibleCount) => {
    if (!resultsSummary) return;

    const total = cards.length;
    const selectedTag = (tagSelect?.value || "").trim();
    const q = (tagSearchInput?.value || "").trim();

    if (!selectedTag && !q) {
      resultsSummary.textContent = `Showing all ${total} projects`;
      return;
    }

    const parts = [];
    if (selectedTag) {
      parts.push(`tag: ${selectedTag}`);
    }
    if (q) {
      parts.push(`search: "${q}"`);
    }
    resultsSummary.textContent = `Showing ${visibleCount} of ${total} projects${parts.length ? ` for ${parts.join(" • ")}` : ""}`;
  };

  const filterCards = () => {
    const q = (tagSearchInput?.value || "").trim().toLowerCase();
    const selectedTag = (tagSelect?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const tags = getCardTags(card);
      const haystack = [
        card.dataset.title || "",
        card.dataset.description || "",
        ...tags,
      ].join(" ");
      const matchesSelectedTag = !selectedTag || tags.includes(selectedTag);
      const matchesQuery = !q || haystack.includes(q);
      const visible = matchesSelectedTag && matchesQuery;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    updateChipStates(selectedTag);
    updateResultsSummary(visibleCount);
  };

  const sortCards = () => {
    const mode = sortSelect.value;
    cards.sort((a, b) => compare(a, b, mode));
    cards.forEach((card) => grid.appendChild(card));
  };

  const applyTag = (tag) => {
    if (!tag) return;
    if (tagSelect) {
      if (tagSelect.value === tag) {
        tagSelect.value = "";
      } else {
        tagSelect.value = tag;
      }
    }
    filterCards();
  };

  sortSelect.addEventListener("change", sortCards);
  tagSearchInput?.addEventListener("input", filterCards);
  tagSelect?.addEventListener("change", filterCards);
  clearFiltersButton?.addEventListener("click", () => {
    if (tagSearchInput) {
      tagSearchInput.value = "";
    }
    if (tagSelect) {
      tagSelect.value = "";
    }
    filterCards();
  });

  cardTagButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyTag((button.dataset.cardTag || "").toLowerCase());
    });
  });

  sortCards();
  filterCards();

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".animate-on-scroll").forEach(el => {
    observer.observe(el);
  });
})();
