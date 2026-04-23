console.log("UpOne service worker loaded: "
          + new Date().toISOString().replace(/\D/g, '').slice(0, 14));

// Return the URL one level up from `currentUrl`, or null when there is
// nothing to strip. In one press: drop query + fragment AND the last
// path segment. No scheme filtering -- the extension attempts navigation
// on any URL and lets Chrome decide whether to honour it.
function goUpOneLevel(currentUrl) {
    try {
        const u = new URL(currentUrl);
        u.search = "";
        u.hash   = "";
        const segs = u.pathname.split("/").filter(s => s !== "");
        if (segs.length === 0) return null;      // nothing to strip
        segs.pop();
        u.pathname = segs.length === 0 ? "/" : ("/" + segs.join("/") + "/");
        return u.href;
    } catch (e) {
        console.warn("UpOne: cannot parse URL:", currentUrl, e);
        return null;
    }
}

async function navigateActiveTabUp() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
        console.warn("UpOne: no active tab URL (likely missing host permission for this tab)");
        return;
    }
    const newUrl = goUpOneLevel(tab.url);
    if (!newUrl || newUrl === tab.url) return;
    try {
        await chrome.tabs.update(tab.id, { url: newUrl });
    } catch (e) {
        // Chrome refuses some navigations from extensions (e.g. to chrome:// from a
        // non-matching page). Log and continue -- nothing else to do.
        console.warn("UpOne: chrome.tabs.update refused:", tab.url, "->", newUrl, e);
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
