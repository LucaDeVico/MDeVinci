# Markdown editor (working title: MDeVinci)

A small offline Markdown editor: write on the left, read on the right, export as
`.md`, `.pdf` or `.html`. No server, no accounts, no network calls after the first
load. Everything is vendored locally.

## Two ways to run it

**One file.** `standalone.html` has everything inlined — config, libraries,
KaTeX fonts, Mermaid. Open it straight from the Files app, a chat preview, or a
double-click; no server, no folder around it. About 4.3 MB. It cannot be
installed as an app and has no offline cache, because both of those need a
service worker, which needs a server.

**The folder.** `index.html` plus `vendor/` is the installable version — smaller
initial parse, service worker, home-screen icon. It must be served over
`http://localhost` or `https://`, and the whole folder must stay together.
Opening `index.html` on its own does nothing at all: the config and the
libraries are separate files, so none of the code ever runs.

Rebuild the single file after any edit:

```bash
python3 make-standalone.py
```

## Files

```
index.html                 the whole application
app-config.js              the app name, tagline, version  <- change the name here
manifest.json              PWA metadata (the name lives here too, see below)
sw.js                      service worker; caches everything for offline use
icon.svg, icon-192.png, icon-512.png
standalone.html            generated single-file build (see above)
make-standalone.py         builds it
vendor/                    marked, KaTeX (+ woff2 fonts), highlight.js,
                           Mermaid, DOMPurify
```

## Serving the folder version

GitHub Pages works, as with your other tools. Locally:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000/`.

## Installing

- **Android / desktop Chrome or Edge**: the install prompt appears in the address bar.
- **iPhone / iPad Safari**: Share → Add to Home Screen.

The first load downloads about 4.5 MB (Mermaid is 3.5 MB of that) and then never
needs the network again.

## Exports

- **`.md`** — on Chrome, Edge and Android, Save overwrites the file you opened.
  On Safari and iOS the API does not exist, so Save produces a download instead.
- **`.pdf`** — through the browser's print dialog, destination "Save as PDF".
  Text stays selectable, headings avoid page breaks, code blocks and tables are
  kept whole where possible.
- **`.html`** — one self-contained file. Maths is written as MathML so no fonts
  or stylesheets are needed; diagrams are inline SVG.

## What it renders

CommonMark plus GitHub tables, task lists and strikethrough; LaTeX maths with
`$…$` and `$$…$$`; fenced code with syntax highlighting; ` ```mermaid ` blocks as
diagrams. Output is sanitised with DOMPurify before it reaches the page.

## Changing the name

Edit `NAME` in `app-config.js`. It propagates to the page title, the wordmark, the
About box, export metadata, the autosave key and the service-worker cache name.

The browser reads `manifest.json` as static JSON before any script runs, so the
name has to be repeated there: change `"name"` and `"short_name"`. Two files, no
more.

If the new name starts with "MD", the wordmark colours the first two letters in
ink and the rest in red chalk; otherwise it is shown plain.

## Notes

- Your text is kept in the browser's local storage between visits, so a closed tab
  is not lost work. It never leaves the device.
- Bump `VERSION` in `app-config.js` when you deploy — the cache name changes with
  it and clients pick up the new files.
- Task-list checkboxes in the preview are display only; edit the source to tick them.
- Inserted images are kept outside the editable text: the document shows only a
  short reference such as `![photo][img-1]`, and the data URI is written into the
  file when you save, so the `.md` stays self-contained and portable. Opening such
  a file pulls the definitions back out again. The image count in the status bar
  opens a list where you can re-insert or remove them.
- Pictures in diagram nodes: put the cursor inside a ` ```mermaid ` block and use
  the image button (or Insert in the image list). Instead of `![…]`, it adds a node
  such as `Pic1@{ img: "img-1", label: "photo", pos: "b", w: 90, h: 68, constraint: "on" }`,
  sized to the picture's proportions; connect it like any node (`Pic1 --> A`).
  `img-1` names a picture in the image library and is swapped for the real data
  only when the diagram is drawn, so the source stays short. Saving, reopening
  and HTML export all keep the picture. Other Markdown viewers will not know what
  `img-1` is, so the node shows without its picture there.
  Mermaid rejects any diagram source over 50,000 characters, which a photo alone
  exceeds, so diagrams are drawn with a small blank stand-in of the picture's
  proportions and the real picture is put into the finished drawing.
- Large images will overflow the browser's local-storage quota for drafts; the
  status bar says so once when that happens. The file itself is unaffected.
- `Enter` continues lists, quotes and table rows; on an empty item it stops.
  Inside a fenced code block, indentation carries over. `Tab` / `Shift+Tab`
  indent and outdent list items.
- Hovering a code block in the preview shows a copy button.
- Scrolling the editor moves the preview to the same block, not to the same
  percentage of the page. Each rendered block records where it starts in the
  source, and the editor position of that point is measured, so long prose,
  code, tables, diagrams and images all line up. The map is rebuilt after every
  edit and whenever a diagram or image finishes drawing, so the panes stay
  aligned after large insertions or deletions. Scrolling the preview does not
  move the editor.
- Double-click (or double-tap) anywhere in the preview and the editor scrolls to
  the matching place in the source and selects the word, the way Overleaf does.
  On a phone this also switches back to the Write tab.
- Outline: the list icon at the far left of the top bar, or `Ctrl/Cmd+Shift+O`.
  It lists every heading, indented by level, and highlights the section you are
  in as you scroll either pane. Clicking an entry brings that heading to the top
  of both the editor and the preview. On a wide screen it docks to the left and
  stays open between visits; on a phone it slides over the page and closes
  after you pick a section. Headings inside code blocks are ignored.
- Find and replace: the magnifier at the end of the toolbar, or `Ctrl/Cmd+F`.
  `Ctrl/Cmd+G` steps to the next match (add `Shift` for the previous one),
  `Aa` toggles case sensitivity, `Esc` closes. "All" counts as a single undo.
- A Mermaid diagram is validated before it is drawn, so a half-typed one shows
  the last complete version dimmed instead of Mermaid's own error graphic.
  Rendered diagrams are cached, so re-rendering while you type is cheap.
