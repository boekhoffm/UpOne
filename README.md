# UpOne

A minimal Chrome (Manifest V3) extension that navigates up one level in the
URL hierarchy of the active tab.

## Usage

Press **Alt+Up** in any tab (configurable in `chrome://extensions/shortcuts`),
or click the toolbar icon.

In a single press:

1. Query string (`?...`) and fragment (`#...`) are removed.
2. The last path segment is removed.

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

## Files

| File | Purpose |
|---|---|
| `manifest.json` | MV3 manifest; declares the `go-up` command and its default shortcut. |
| `background.js` | Service worker. Handles the keyboard command and toolbar click. |
| `icon16.png` | 16x16 toolbar icon -- capital **U**. |
