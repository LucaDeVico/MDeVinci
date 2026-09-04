#!/usr/bin/env python3
"""
Build a single self-contained HTML file from index.html and vendor/.

Everything is inlined: the config, the four libraries, the KaTeX stylesheet
with its fonts as data URIs, and Mermaid. The result runs from file://, from
a chat preview pane, or from anywhere else that hands the browser one file
and nothing else.

    python3 make-standalone.py   ->  standalone.html

Run it again after editing index.html or app-config.js.
"""
import base64, pathlib, re

HERE = pathlib.Path(__file__).parent
OUT = HERE / "standalone.html"


def read(rel):
    return (HERE / rel).read_text(encoding="utf-8")


def inline_katex_css():
    """KaTeX CSS with every woff2 font turned into a data URI."""
    css = read("vendor/katex.min.css")

    def fontref(m):
        name = m.group(1)
        data = (HERE / "vendor/fonts" / name).read_bytes()
        b64 = base64.b64encode(data).decode("ascii")
        return 'url(data:font/woff2;base64,%s) format("woff2")' % b64

    return re.sub(r'url\(fonts/([^)]+\.woff2)\)\s*format\("woff2"\)', fontref, css)


def main():
    html = read("index.html")

    # <link rel="stylesheet" href="vendor/katex.min.css">  ->  <style>…</style>
    html = html.replace(
        '<link rel="stylesheet" href="vendor/katex.min.css">',
        "<style>\n" + inline_katex_css() + "\n</style>",
    )

    # Mermaid is normally fetched on demand; in this build it comes along too,
    # so the tag is added before anything is inlined
    html = html.replace(
        '<script src="app-config.js"></script>',
        '<script src="vendor/mermaid.min.js"></script>\n<script src="app-config.js"></script>',
        1,
    )

    # every <script src="…"></script> -> the script itself
    def inline_script(m):
        src = m.group(1)
        code = read(src)
        # a lone </script> inside a library would close the tag early
        code = code.replace("</script>", "<\\/script>")
        return "<script>\n/* %s */\n%s\n</script>" % (src, code)

    html = re.sub(r'<script src="([^"]+)"></script>', inline_script, html)

    # no manifest, no icons, no service worker in a single file
    html = html.replace('<link rel="manifest" href="manifest.json">', "")
    html = html.replace('<link rel="icon" href="icon.svg" type="image/svg+xml">', "")
    html = html.replace('<link rel="apple-touch-icon" href="icon-192.png">', "")
    html = html.replace(
        'navigator.serviceWorker.register("sw.js").catch(() => {})',
        "Promise.resolve()   /* no service worker in the single-file build */",
    )

    OUT.write_text(html, encoding="utf-8")
    size = OUT.stat().st_size / 1048576
    print("wrote %s  (%.1f MB)" % (OUT.name, size))
    leftovers = sorted(set(re.findall(r'<(?:script|link)[^>]+(?:src|href)="((?!data:)[^"]+)"', html)))
    print("still loaded from outside:", leftovers if leftovers else "nothing")


if __name__ == "__main__":
    main()
