# UpOne

A minimal Chrome (Manifest V3) extension that navigates up one level in the
URL hierarchy of the active tab.

## Usage

Press **Alt+Up** in any tab (configurable in `chrome://extensions/shortcuts`),
or click the toolbar icon.

In a single press:

1. Query string (`?...`) and fragment (`#...`) are removed.
2. The last path segment is removed.
3. Once the new page finishes loading, UpOne triggers a **hard refresh** (`bypassCache: true`) so the target page is fetched fresh from the server rather than served from Chrome's cache.

The extension does **not** filter by scheme -- it tries on whatever the
active tab is. Chrome itself refuses navigation on schemes where it is
not appropriate.

### Examples

| From | To |
|---|---|
| `https://example.com/a/b/c?q=1#x` | `https://example.com/a/b/` |
| `https://example.com/a/b/` | `https://example.com/a/` |
| `https://example.com/a/` | `https://example.com/` |
| `https://example.com/` | *no change (nothing to strip)* |
| `file:///C:/foo/bar/x.md` | `file:///C:/foo/bar/` |
| `file:///C:/foo/bar/` | `file:///C:/foo/` |

## Install (developer mode)

1. Open `chrome://extensions/`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and pick this directory.
4. Optionally rebind the shortcut in `chrome://extensions/shortcuts`.

### `file://` URL access

If Alt+Up does nothing on a `file://` tab, open `chrome://extensions/`, click
the UpOne card's **Details** button, and enable **Allow access to file URLs**.
Chrome requires this per-extension opt-in before any extension can read or
manipulate `file://` tabs.

## Directory listing sort (v1.4+)

When you view a `file:///<dir>/` URL in Chrome, the browser renders a table listing of the folder contents. Out of the box Chrome sorts by **Name ascending** with no preference stored.

UpOne injects a content script on every `file://` page that:

1. Bails unless the document title begins with `Index of ` (the Chromium directory-listing marker).
2. Finds the `<tbody>` inside the listing table.
3. Locates the **Date Modified** column by header text (falls back to column index 2).
4. Reorders the rows by that column **descending**.

The `[parent directory]` link lives outside the table and is not touched. If you click the `Name` or `Size` header to re-sort, Chromium's built-in handler takes over and wins -- UpOne only sets the initial order.

Requires the same **Allow access to file URLs** toggle as the navigation feature; see above.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | MV3 manifest; declares the `go-up` command, the content script, and `file:///*` host permission. |
| `background.js` | Service worker. Handles the keyboard command, toolbar click, and post-navigation hard refresh. |
| `content.js` | Content script. Sorts `file://` directory listings by Date Modified descending. |
| `icon16.png` | 16x16 toolbar icon -- capital **U**. |
