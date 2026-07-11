const statusEl = document.getElementById("status");
const inputEl = document.getElementById("field-label");
const buttonEl = document.getElementById("highlight");

buttonEl.addEventListener("click", async () => {
  const label = inputEl.value.trim();
  if (!label) {
    statusEl.textContent = "Enter a portal field label first.";
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.startsWith("https://www.incometax.gov.in/")) {
    statusEl.textContent = "Open the Income Tax portal tab first.";
    return;
  }

  chrome.tabs.sendMessage(
    tab.id,
    { type: "LASTMINUTE_ITR_HIGHLIGHT", label },
    (response) => {
      statusEl.textContent = response?.highlighted
        ? "Highlighted. Enter the value yourself after checking it."
        : "Could not find that field on this screen.";
    }
  );
});
