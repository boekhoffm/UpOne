console.log("UpOne service worker loaded: "
          + new Date().toISOString().replace(/\D/g, '').slice(0, 14));

// Schemes we never touch (browser internals, extension pages, etc.).
const BLOCKED_PROTOCOLS = new Set([
    "chrome:", "chrome-extension:", "chrome-search:", "chrome-untrusted:",
    "about:",  "edge:",             "opera:",         "brave:",
    "view-source:", "data:", "javascript:",
    "devtools:"
]);

// Return the URL one level up from `currentUrl`, or null if there is nowhere
// to go. Supports http:, https:, and file:. In one press: strip query +
// fragment AND drop the last path segment.
function goUpOneLevel(currentUrl) {
    try {
        const u = new URL(currentUrl);
        if (BLOCKED_PROTOCOLS.has(u.protocol)) return null;

        u.search = "";
        u.hash   = "";

        const segs = u.pathname.split("/").filter(s => s !== "");
        if (segs.length === 0) return null;   // already at the site/drive root

        segs.pop();

        // For file:// URLs, stop at the drive root -- don't navigate to the
        // useless `file:///` (no-drive root).
        if (u.protocol === "file:" && segs.length === 0) return null;

        u.pathname = segs.length === 0 ? "/" : ("/" + segs.join("/") + "/");
        return u.href;
    } catch (e) {
        return null;
    }
}

async function navigateActiveTabUp() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return;
    const newUrl = goUpOneLevel(tab.url);
    if (newUrl && newUrl !== tab.url) {
        await chrome.tabs.update(tab.id, { url: newUrl });
    }
}

chrome.commands.onCommand.addListener(async (command) => {
    if (command === "go-up") {
        await navigateActiveTabUp();
    }
});

chrome.action.onClicked.addListener(async () => {
    await navigateActiveTabUp();
});
