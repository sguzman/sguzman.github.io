/* Foundry index: progressive enhancement only; all entries remain readable without JS. */
(() => {
  "use strict";

  const search = document.getElementById("foundry-search");
  const index = document.getElementById("foundry-index-grid");
  const count = document.getElementById("foundry-results");
  const empty = document.getElementById("foundry-empty");
  const filters = Array.from(document.querySelectorAll("[data-foundry-filter]"));
  if (!index || !search || !count || !empty || !filters.length) return;

  const cards = Array.from(index.querySelectorAll(".foundry-index-item[data-foundry-card]"));
  let category = "all";

  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;

    for (const card of cards) {
      const matchesCategory =
        category === "all" || card.dataset.foundryCategory === category;
      const matchesText =
        !query || (card.dataset.foundrySearch || "").includes(query);
      const show = matchesCategory && matchesText;
      card.hidden = !show;
      if (show) visible += 1;
    }

    index.classList.toggle("is-filtered", category !== "all" || !!query);

    for (const button of filters) {
      const selected = button.dataset.foundryFilter === category;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    }

    count.textContent = `Showing ${visible} of ${cards.length} publicly sourced works`;
    empty.hidden = visible !== 0;
  }

  for (const button of filters) {
    button.addEventListener("click", () => {
      category = button.dataset.foundryFilter || "all";
      render();
    });
  }
  search.addEventListener("input", render);
  render();
})();
