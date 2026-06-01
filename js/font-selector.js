(function () {
  var storageKey = "font_preferences_v2";
  var doc = document.documentElement;

  function byId(id) {
    return document.getElementById(id);
  }

  function parseConfig() {
    var cfgNode = byId("font-selector-config");
    if (!cfgNode) return null;

    try {
      var parsed = JSON.parse(cfgNode.textContent);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      return parsed;
    } catch (err) {
      return null;
    }
  }

  function defaultsFromConfig(config) {
    var defaults = {};
    config.categories.forEach(function (cat) {
      defaults[cat.id] = cat.default;
    });
    return defaults;
  }

  function validOption(cat, value) {
    return cat.options.indexOf(value) !== -1;
  }

  function readState(config, defaults) {
    try {
      var raw = localStorage.getItem(storageKey);
      if (!raw) return defaults;
      var parsed = JSON.parse(raw);
      var state = {};

      config.categories.forEach(function (cat) {
        var candidate = parsed[cat.id];
        state[cat.id] = validOption(cat, candidate) ? candidate : defaults[cat.id];
      });

      return state;
    } catch (err) {
      return defaults;
    }
  }

  function applyFonts(config, state) {
    config.categories.forEach(function (cat) {
      var key = state[cat.id];
      var font = config.fonts[key];
      if (!font || !font.family) return;
      doc.style.setProperty("--font-" + cat.id, font.family);
    });
  }

  function saveState(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function init() {
    var config = parseConfig();
    if (!config || !Array.isArray(config.categories) || !config.fonts) return;

    var switcher = byId("font-switcher");
    var toggle = byId("font-switcher-toggle");
    var panel = byId("font-switcher-panel");
    if (!switcher || !toggle || !panel) return;

    var defaults = defaultsFromConfig(config);
    var state = readState(config, defaults);
    applyFonts(config, state);

    config.categories.forEach(function (cat) {
      var select = byId("font-" + cat.id + "-select");
      if (!select) return;
      select.value = state[cat.id];
      select.addEventListener("change", function () {
        state[cat.id] = select.value;
        applyFonts(config, state);
        saveState(state);
      });
    });

    toggle.addEventListener("click", function () {
      var open = switcher.classList.toggle("open");
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", function (event) {
      if (!switcher.classList.contains("open")) return;
      if (switcher.contains(event.target)) return;
      switcher.classList.remove("open");
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
