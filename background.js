console.log("UpOne service worker loaded: "
          + new Date().toISOString().replace(/\D/g, '').slice(0, 14));

// Return the URL one level up from `currentUrl`, or null if there is nowhere
// to go (non-http scheme, or already at the site root).
//
// Single-step behaviour: in one press, strip query and fragment AND go up one
// path segment. Pressing Alt+Up again then steps further up the hierarchy.
function goUpOneLevel(currentUrl) {
    try {
        const u = new URL(currentUrl);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
            return null;   // don't touch chrome://, about:, file:, etc.
        }

        u.search = '';
        u.hash   = '';

        const segs = u.pathname.split('/').filter(s => s !== '');
        if (segs.length === 0) return null;   // already at domain root

        segs.pop();
        u.pathname = segs.length === 0 ? '/' : ('/' + segs.join('/') + '/');
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
