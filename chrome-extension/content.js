(() => {
  const HIGHLIGHT_CLASS = "lastminute-itr-highlight";

  function injectStyles() {
    if (document.getElementById("lastminute-itr-style")) return;
    const style = document.createElement("style");
    style.id = "lastminute-itr-style";
    style.textContent = `
      .${HIGHLIGHT_CLASS} {
        outline: 3px solid #0e5f63 !important;
        outline-offset: 3px !important;
        box-shadow: 0 0 0 6px rgba(191, 233, 224, 0.55) !important;
      }
    `;
    document.documentElement.appendChild(style);
  }

  function normalize(value) {
    return value.trim().toLowerCase();
  }

  function labelTextFor(input) {
    if (input.id) {
      const explicit = document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
      if (explicit?.textContent) return explicit.textContent;
    }
    const wrapping = input.closest("label");
    if (wrapping?.textContent) return wrapping.textContent;
    return input.getAttribute("aria-label") ?? input.getAttribute("placeholder") ?? "";
  }

  function clearHighlights() {
    document
      .querySelectorAll(`.${HIGHLIGHT_CLASS}`)
      .forEach((element) => element.classList.remove(HIGHLIGHT_CLASS));
  }

  function highlightField(label) {
    injectStyles();
    clearHighlights();
    const needle = normalize(label);
    const controls = Array.from(
      document.querySelectorAll("input, textarea, select, [role='textbox']")
    );
    const match = controls.find((control) =>
      normalize(labelTextFor(control)).includes(needle)
    );
    if (!match) return false;
    match.classList.add(HIGHLIGHT_CLASS);
    match.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "LASTMINUTE_ITR_HIGHLIGHT") return;
    const label = typeof message.label === "string" ? message.label : "";
    const highlighted = label.length > 0 ? highlightField(label) : false;
    sendResponse({ highlighted });
  });
})();
