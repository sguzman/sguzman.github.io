(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function text(v) {
    return (v || "").toString();
  }

  function normalizeRow(row) {
    return {
      title: text(row.Title),
      author: text(row.Author),
      year: Number(row["Year Published"]) || null,
      pages: Number(row["Number of Pages"]) || null,
      avg_rating: Number(row["Average Rating"]) || null,
      my_rating: Number(row["My Rating"]) || null,
      date_read: text(row["Date Read"]),
      publisher: text(row.Publisher),
      shelves: text(row["Bookshelves"]),
      isbn: text(row.ISBN),
      isbn13: text(row.ISBN13),
      binding: text(row.Binding),
      read_count: Number(row["Read Count"]) || null
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

  async function initBooks() {
    var page = document.querySelector(".books-page");
    if (!page || typeof Tabulator === "undefined") return;

    var searchInput = byId("books-search");
    var metaEl = byId("books-meta");
    var pageSizeSelect = byId("books-page-size");
    var dataUrl = page.getAttribute("data-books-json") || "/data/books.json";

    var response = await fetch(dataUrl);
    if (!response.ok) {
      metaEl.textContent = "Failed to load books data.";
      return;
    }

    var rows = (await response.json()).map(normalizeRow);

    var table = new Tabulator("#books-table", {
      data: rows,
      layout: "fitDataFill",
      height: "70vh",
      movableColumns: true,
      persistence: { columns: true, sort: true, filter: true },
      persistenceID: "books-table-v2",
      pagination: "local",
      paginationSize: 100,
      paginationSizeSelector: false,
      initialSort: [{ column: "date_read", dir: "desc" }],
      columns: [
        { title: "Title", field: "title", sorter: "string", headerFilter: "input", width: 340 },
        { title: "Author", field: "author", sorter: "string", headerFilter: "input", width: 240 },
        { title: "Year", field: "year", sorter: "number", headerFilter: "input", hozAlign: "right", width: 110 },
        { title: "Pages", field: "pages", sorter: "number", headerFilter: "input", hozAlign: "right", width: 120 },
        { title: "Avg Rating", field: "avg_rating", sorter: "number", headerFilter: "input", hozAlign: "right", width: 130 },
        { title: "My Rating", field: "my_rating", sorter: "number", headerFilter: "input", hozAlign: "right", width: 130 },
        { title: "Date Read", field: "date_read", sorter: "string", headerFilter: "input", width: 150 },
        { title: "Publisher", field: "publisher", sorter: "string", headerFilter: "input", width: 260 },
        { title: "Shelves", field: "shelves", sorter: "string", headerFilter: "input", visible: false, width: 220 },
        { title: "ISBN", field: "isbn", sorter: "string", headerFilter: "input", visible: false, width: 180 },
        { title: "ISBN13", field: "isbn13", sorter: "string", headerFilter: "input", visible: false, width: 210 },
        { title: "Binding", field: "binding", sorter: "string", headerFilter: "input", visible: false, width: 140 },
        { title: "Read Count", field: "read_count", sorter: "number", headerFilter: "input", hozAlign: "right", visible: false, width: 140 }
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
      buildPicker(table, "books-column-picker");
    });

    searchInput.addEventListener("input", function () {
      var q = searchInput.value.trim().toLowerCase();
      if (!q) {
        table.clearFilter(true);
        return;
      }

      table.setFilter(function (data) {
        var blob = [
          data.title, data.author, data.publisher, data.shelves, data.isbn, data.isbn13
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

    buildPicker(table, "books-column-picker");
    refreshMeta();
  }

  document.addEventListener("DOMContentLoaded", initBooks);
})();
