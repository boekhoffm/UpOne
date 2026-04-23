# UpOne

A minimal Chrome (Manifest V3) extension that navigates up one level in the
URL hierarchy of the active tab.

## Usage

Press **Alt+Up** in any tab (configurable in `chrome://extensions/shortcuts`),
or click the toolbar icon.

In a single press:

1. Query string (`?...`) and fragment (`#...`) are removed.
2. The last path segment is removed.

Examples:

| From | To |
|---|---|
| `https://example.com/a/b/c?q=1#x` | `https://example.com/a/b/` |
| `https://example.com/a/b/` | `https://example.com/a/` |
| `https://example.com/a/` | `https://example.com/` |
| `https://example.com/` | *no change (already at root)* |
| `chrome://extensions/` / `file://...` / `about:blank` | *no change* |

## Install (developer mode)

1. Open `chrome://extensions/`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and pick this directory.
4. Optionally rebind the shortcut in `chrome://extensions/shortcuts`.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | MV3 manifest; declares the `go-up` command and its default shortcut. |
| `background.js` | Service worker. Handles the keyboard command and toolbar click. |
| `icon16.png` | 16x16 toolbar icon -- capital **U**. |
