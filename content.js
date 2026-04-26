// UpOne content script: sort Chrome's file:// directory listings by
// Date Modified descending. Runs on every file:// URL at document_idle
// and bails quickly unless the page is a Chromium-generated directory index.
//
// Chromium renders file:///<dir>/ as:
//   <h1>Index of /<path></h1>
//   <div id="parentDirLinkBox">[parent directory]</div>
//   <table>
//     <thead><tr><th>Name</th><th>Size</th><th>Date Modified</th></tr></thead>
//     <tbody>
//       <tr><td><a>name</a></td><td>size</td><td>4/10/26, 4:18:50 PM</td></tr>
//       ...
//     </tbody>
//   </table>
//
// We sort the <tbody> rows in place. The [parent directory] link is outside
// the table so remains at the top. If the user later clicks a header to sort
// by Name or Size, the built-in sort replaces tbody content and wins -- we
// only set the initial order.
(function () {
    const title = document.title || "";
    if (!/^Index of /i.test(title)) return;

    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll("tr"));
    if (rows.length < 2) return;

    // Identify the Date Modified column by header text; fall back to col 2.
    const headers = Array.from(document.querySelectorAll("table thead th"));
    let dateIdx = headers.findIndex(h => /date.*modified|modified/i.test(h.textContent));
    if (dateIdx < 0) dateIdx = 2;

    const dateOf = (r) => {
        const cells = r.querySelectorAll("td");
        if (dateIdx >= cells.length) return 0;
        const t = cells[dateIdx].textContent.trim();
        
        // Chromium format: "D/M/YYYY, HH:MM:SS" (day-first)
        // Parse manually: "16/11/2025, 13:00:30" -> Date object
        const match = t.match(/^(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+):(\d+)/);
        if (!match) {
            console.log(`dateOf: "${t}" -> NaN (parse failed)`);
            return 0;
        }
        
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // 0-indexed
        const year = parseInt(match[3], 10);
        const hour = parseInt(match[4], 10);
        const min = parseInt(match[5], 10);
        const sec = parseInt(match[6], 10);
        
        const d = new Date(year, month, day, hour, min, sec);
        const time = d.getTime();
        return time || 0;
    };

    rows.sort((a, b) => dateOf(b) - dateOf(a));

    const frag = document.createDocumentFragment();
    rows.forEach(r => frag.appendChild(r));
    tbody.appendChild(frag);
})();
