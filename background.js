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

// Tabs pending a cache-bypass reload after their Up-navigation completes.
// Kept in-memory: for the short window between tabs.update() and the matching
// onUpdated "complete" event, the service worker almost always stays alive.
// If the worker does sleep, Chrome will not fire the reload -- an acceptable
// edge case given the alternative is wiring chrome.storage.session.
const pendingReload = new Set();

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete" && pendingReload.has(tabId)) {
        pendingReload.delete(tabId);
        chrome.tabs.reload(tabId, { bypassCache: true }).catch(e => {
            console.warn("UpOne: post-navigation reload failed:", e);
        });
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    pendingReload.delete(tabId);
});

async function navigateActiveTabUp() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
        console.warn("UpOne: no active tab URL (likely missing host permission for this tab)");
        return;
    }
    const newUrl = goUpOneLevel(tab.url);
    if (!newUrl || newUrl === tab.url) return;
    pendingReload.add(tab.id);
    try {
        await chrome.tabs.update(tab.id, { url: newUrl });
    } catch (e) {
        // Chrome refuses some navigations from extensions (e.g. to chrome:// from a
        // non-matching page). Log and drop the pending reload.
        pendingReload.delete(tab.id);
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
