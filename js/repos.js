(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function text(v) {
    return (v || "").toString();
  }

  function normalizeRow(row) {
    return {
      name: text(row.name),
      description: text(row.description),
      language: text(row.language),
      stars: Number(row.stargazers) || 0,
      watchers: Number(row.watchers) || 0,
      size: Number(row.size) || 0,
      license: text(row.license),
      created_at: text(row.created_at),
      updated_at: text(row.updated_at),
      archived: Boolean(row.archived),
      fork: Boolean(row.fork),
      topics: Array.isArray(row.topics) ? row.topics.join(", ") : "",
      html_url: text(row.html_url)
    };
  }

  function buildPicker(table, containerId) {
    var container = byId(containerId);
    if (!container) return;
    container.replaceChildren();

    table.getColumns().forEach(function (col) {
      var field = col.getField();
      if (!field) return;
      var def = col.getDefinition();
      if (def.title === undefined) return;

      var label = document.createElement("label");
      var box = document.createElement("input");
      var span = document.createElement("span");

      label.className = "column-picker-item";
      box.type = "checkbox";
      box.checked = col.isVisible();
      span.textContent = def.title;

      box.addEventListener("change", function () {
        if (box.checked) {
          col.show();
        } else {
          col.hide();
        }
      });

      label.appendChild(box);
      label.appendChild(span);
      container.appendChild(label);
    });
  }

  function setMeta(table, metaEl, total) {
    var filtered = table.getDataCount("active");
    metaEl.textContent = filtered.toLocaleString() + " shown (" + total.toLocaleString() + " total)";
  }

  async function initRepos() {
    var page = document.querySelector(".repos-page");
    if (!page || typeof Tabulator === "undefined") return;

    var searchInput = byId("repos-search");
    var metaEl = byId("repos-meta");
    var pageSizeSelect = byId("repos-page-size");
    var dataUrl = page.getAttribute("data-repos-json") || "/data/repos.json";

    var response = await fetch(dataUrl);
    if (!response.ok) {
      metaEl.textContent = "Failed to load repository data.";
      return;
    }

    var rows = (await response.json()).map(normalizeRow);

    var table = new Tabulator("#repos-table", {
      data: rows,
      layout: "fitDataFill",
      height: "70vh",
      movableColumns: true,
      pagination: "local",
      paginationSize: 100,
      paginationSizeSelector: false,
      persistence: { columns: true, sort: true, filter: true },
      persistenceID: "repos-table-v2",
      initialSort: [{ column: "updated_at", dir: "desc" }],
      columns: [
        {
          title: "Name",
          field: "name",
          sorter: "string",
          headerFilter: "input",
          width: 280,
          formatter: function (cell) {
            var data = cell.getRow().getData();
            var name = cell.getValue();
            return '<a href="' + data.html_url + '" target="_blank" rel="noopener noreferrer">' + name + "</a>";
          }
        },
        { title: "Language", field: "language", sorter: "string", headerFilter: "input", width: 140 },
        { title: "Stars", field: "stars", sorter: "number", headerFilter: "input", hozAlign: "right", width: 110 },
        { title: "Watchers", field: "watchers", sorter: "number", headerFilter: "input", hozAlign: "right", width: 120 },
        { title: "Size (KB)", field: "size", sorter: "number", headerFilter: "input", hozAlign: "right", width: 120 },
        { title: "License", field: "license", sorter: "string", headerFilter: "input", width: 140 },
        { title: "Updated", field: "updated_at", sorter: "datetime", headerFilter: "input", width: 170 },
        { title: "Created", field: "created_at", sorter: "datetime", headerFilter: "input", visible: false, width: 170 },
        { title: "Description", field: "description", sorter: "string", headerFilter: "input", visible: false, width: 420 },
        { title: "Topics", field: "topics", sorter: "string", headerFilter: "input", visible: false, width: 260 },
        { title: "Archived", field: "archived", sorter: "boolean", headerFilter: "input", visible: false, width: 120 },
        { title: "Fork", field: "fork", sorter: "boolean", headerFilter: "input", visible: false, width: 100 }
      ]
    });

    function refreshMeta() {
      setMeta(table, metaEl, rows.length);
    }

    table.on("dataFiltered", refreshMeta);
    table.on("dataLoaded", refreshMeta);
    table.on("renderComplete", refreshMeta);
    table.on("pageLoaded", refreshMeta);
    table.on("columnMoved", function () {
      buildPicker(table, "repos-column-picker");
    });

    searchInput.addEventListener("input", function () {
      var q = searchInput.value.trim().toLowerCase();
      if (!q) {
        table.clearFilter(true);
        return;
      }

      table.setFilter(function (data) {
        var blob = [
          data.name, data.description, data.language, data.license, data.topics, data.html_url
        ].join(" ").toLowerCase();
        return blob.indexOf(q) !== -1;
      });
    });

    pageSizeSelect.addEventListener("change", function () {
      var value = pageSizeSelect.value;
      if (value === "all") {
        table.setPageSize(Math.max(rows.length, 1));
      } else {
        table.setPageSize(Number(value));
      }
      refreshMeta();
    });

    buildPicker(table, "repos-column-picker");
    refreshMeta();
  }

  document.addEventListener("DOMContentLoaded", initRepos);
})();
