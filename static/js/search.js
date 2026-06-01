(function () {
  function el(id) {
    return document.getElementById(id);
  }

  function clear(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function renderResults(items, resultsNode) {
    clear(resultsNode);

    items.forEach(function (item) {
      var li = document.createElement("li");
      var link = document.createElement("a");
      var meta = document.createElement("p");

      link.className = "search-result-title";
      link.href = item.permalink;
      link.textContent = item.title || item.permalink;

      meta.className = "search-result-meta";
      meta.textContent = [item.section, item.date].filter(Boolean).join(" - ");

      li.appendChild(link);
      li.appendChild(meta);
      resultsNode.appendChild(li);
    });
  }

  async function initSearch() {
    var page = document.querySelector(".search-page");
    if (!page) {
      return;
    }

    var input = el("search-input");
    var status = el("search-status");
    var resultsNode = el("search-results");
    var indexUrl = page.getAttribute("data-search-index") || "/index.json";

    try {
      var response = await fetch(indexUrl);
      if (!response.ok) {
        throw new Error("Search index request failed");
      }

      var data = await response.json();
      var fuse = new Fuse(data, {
        includeScore: true,
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
        keys: [
          { name: "title", weight: 0.5 },
          { name: "summary", weight: 0.2 },
          { name: "content", weight: 0.2 },
          { name: "tags", weight: 0.05 },
          { name: "categories", weight: 0.05 }
        ]
      });

      status.textContent = "Index loaded. Enter a query.";

      input.addEventListener("input", function () {
        var query = input.value.trim();
        if (query.length < 2) {
          status.textContent = "Type at least 2 characters to search.";
          clear(resultsNode);
          return;
        }

        var matches = fuse.search(query, { limit: 30 }).map(function (r) {
          return r.item;
        });

        if (matches.length === 0) {
          status.textContent = "No results found.";
          clear(resultsNode);
          return;
        }

        status.textContent = "Found " + matches.length + " result(s).";
        renderResults(matches, resultsNode);
      });
    } catch (err) {
      status.textContent = "Search is unavailable right now.";
      clear(resultsNode);
    }
  }

  document.addEventListener("DOMContentLoaded", initSearch);
})();
