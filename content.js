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
        const d = Date.parse(t);
        return isNaN(d) ? 0 : d;
    };

    rows.sort((a, b) => dateOf(b) - dateOf(a));

    const frag = document.createDocumentFragment();
    rows.forEach(r => frag.appendChild(r));
    tbody.appendChild(frag);
})();
