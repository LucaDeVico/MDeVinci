/* ------------------------------------------------------------------
   The ONLY place the app name lives.
   Change NAME here and it propagates to: page title, header, About box,
   export metadata, autosave storage key, and the service-worker cache.

   The one file this does NOT reach is manifest.json (the browser reads
   that as static JSON before any script runs). If you change the name,
   also edit "name" and "short_name" in manifest.json.
   ------------------------------------------------------------------ */
const APP_CONFIG = {
  NAME: "MDeVinci",              // placeholder — change at will
  TAGLINE: "Markdown, written and read",
  VERSION: "0.1",
  AUTHOR: "Luca De Vico"
};

// makes the config usable both in the page and inside the service worker
if (typeof self !== "undefined") self.APP_CONFIG = APP_CONFIG;
