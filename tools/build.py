#!/usr/bin/env python3
"""Build the China (offline / WeChat) edition of the Pulse sourcing app.

src/app.html is the claude.ai artifact source (Harris's shared version).
docs/ is what GitHub Pages serves to Farrukh in China, where claude.ai and
Google Fonts are blocked. The build:
  - removes the Google Fonts links (a blocked render-blocking stylesheet
    leaves the page blank until the request times out),
  - turns on PULSE_OFFLINE so the page uses WeChat hand-off instead of the
    claude.ai runtime,
  - adds a manifest + service worker so it installs to the home screen and
    opens with no signal.
"""
import hashlib
import json
import pathlib
import re
import shutil
import subprocess

from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "app.html"
OUT = ROOT / "docs"

ACCENT = (47, 125, 107)

HEAD = """<meta name="theme-color" content="#2F7D6B">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Pulse">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" href="icon-192.png">
<script>window.PULSE_OFFLINE=true;</script>
"""

TAIL = """<div id="upd" hidden style="position:fixed;left:16px;right:16px;top:calc(10px + env(safe-area-inset-top,0px));z-index:40;display:flex;justify-content:center"><button type="button" class="btn" style="box-shadow:0 8px 24px rgba(0,0,0,.25)" onclick="location.reload()">✨ New version ready · Tap to update</button></div>
<script>
if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost")){
 const had=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener("controllerchange",()=>{if(had)document.getElementById("upd").hidden=false;});
 addEventListener("load",()=>navigator.serviceWorker.register("sw.js").then(r=>{document.addEventListener("visibilitychange",()=>{if(!document.hidden)r.update().catch(()=>{});});}).catch(()=>{}));
}
</script>
"""


def icon(size):
    img = Image.new("RGB", (size, size), ACCENT)
    d = ImageDraw.Draw(img)
    font = None
    for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"):
        try:
            font = ImageFont.truetype(f, int(size * 0.62))
            break
        except OSError:
            pass
    font = font or ImageFont.load_default()
    d.text((size / 2, size / 2), "P", fill="white", font=font, anchor="mm")
    return img


def check_scripts(html):
    """Refuse to build if any inline script has a syntax error: one bad quote
    kills every button in the app."""
    node = shutil.which("node")
    if not node:
        print("warning: node not found, skipped the script syntax check")
        return
    js = ("const h=require('fs').readFileSync(0,'utf8');const re=/<script>([\\s\\S]*?)<\\/script>/g;"
          "let m;while((m=re.exec(h)))new Function(m[1]);")
    r = subprocess.run([node, "-e", js], input=html, text=True, capture_output=True)
    if r.returncode:
        raise SystemExit("script syntax error, not building:\n" + r.stderr.strip().splitlines()[-1])


def inject_data():
    """Put data/*.json into the app source, so the claude.ai artifact and the
    China build carry the same lists."""
    d = ROOT / "data"
    load = lambda n: json.loads((d / n).read_text(encoding="utf-8"))
    js = ("/*DATA*/const BUY=" + json.dumps(load("items.json"), ensure_ascii=False)
          + ",SUP=" + json.dumps(load("suppliers.json"), ensure_ascii=False)
          + ",FUN=" + json.dumps(load("fun.json"), ensure_ascii=False)
          + ",CK=" + json.dumps(load("checks.json"), ensure_ascii=False)
          + ",IMG=" + json.dumps(load("images.json"), ensure_ascii=False)
          + ",USB=" + json.dumps(load("us_items.json"), ensure_ascii=False)
          + ",PHOTO=" + json.dumps(load("photos.json"), ensure_ascii=False)
          + ",WORLD=" + json.dumps(load("world.json"), ensure_ascii=False) + ";/*/DATA*/")
    assert "</script" not in js.lower()
    src = SRC.read_text(encoding="utf-8")
    new, n = re.subn(r"/\*DATA\*/.*?/\*/DATA\*/", lambda m: js, src, flags=re.S)
    assert n == 1, "data markers not found in src/app.html"
    if new != src:
        SRC.write_text(new, encoding="utf-8")


def main():
    inject_data()
    html = SRC.read_text(encoding="utf-8")
    html, n = re.subn(r'<link rel="(?:preconnect|stylesheet)" href="https://fonts\.g[^"]*"[^>]*>\n?', "", html)
    assert n == 3, f"expected 3 Google Fonts links, removed {n}"
    assert "<title>" in html and "</body>" in html
    html = html.replace("<title>Pulse Equipment Sourcing</title>",
                        "<title>Pulse Equipment Sourcing</title>\n" + HEAD, 1)
    html = html.replace("</body>", TAIL + "</body>", 1)
    check_scripts(html)
    OUT.mkdir(exist_ok=True)
    (OUT / "index.html").write_text(html, encoding="utf-8")

    for s in (180, 192, 512):
        icon(s).save(OUT / f"icon-{s}.png")

    (OUT / "manifest.webmanifest").write_text(json.dumps({
        "name": "Pulse Equipment Sourcing",
        "short_name": "Pulse",
        "start_url": "./",
        "scope": "./",
        "display": "standalone",
        "background_color": "#F2F5F4",
        "theme_color": "#2F7D6B",
        "icons": [
            {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
        ],
    }, indent=2) + "\n", encoding="utf-8")

    # Cache name tracks the page content so a rebuild replaces the old copy.
    ver = hashlib.sha256(html.encode()).hexdigest()[:10]
    (OUT / "sw.js").write_text(f"""const CACHE="pulse-{ver}";
const FILES=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];
// cache:"reload" skips the browser's HTTP cache so a new version really is new.
self.addEventListener("install",e=>{{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(u=>new Request(u,{{cache:"reload"}})))).then(()=>self.skipWaiting()));}});
self.addEventListener("activate",e=>{{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));}});
// Cache first: in China the connection to github.io often hangs instead of
// failing, so never make the page wait on it. New versions arrive when the
// browser re-checks sw.js in the background; the page then offers a reload.
self.addEventListener("fetch",e=>{{
  const req=e.request;
  if(req.method!=="GET"||new URL(req.url).origin!==location.origin)return;
  e.respondWith(caches.match(req,{{ignoreSearch:true}}).then(hit=>hit||(req.mode==="navigate"?caches.match("index.html"):null)).then(hit=>hit||fetch(req).then(r=>{{if(r.ok){{const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c));}}return r;}})));
}});
""", encoding="utf-8")
    (OUT / ".nojekyll").write_text("")
    print(f"built docs/ ({len(html):,} bytes, cache pulse-{ver})")


if __name__ == "__main__":
    main()
