/* =====================================================================
   KONCEPT JUNCTION — config.js  (V1)
   ---------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU EDIT WHEN YOU GET YOUR NEW IDS.
   Replace every value marked  <<< CHANGE  and re-upload this file.
   ===================================================================== */
window.KJ_CONFIG = {
  APP_NAME: "KONCEPT JUNCTION",
  TAGLINE: "State Level Competitive Exams",
  TAGLINE_TE: "రాష్ట్ర స్థాయి పోటీ పరీక్షలు",
  NOTES_BRAND: "Notes by BALAJI SIR",
  CONCEPTS_BRAND: "Quick Revision Concepts by BALAJI SIR",
  VERSION: "V8",
  BUILD_DATE: "2026-10-23",

  CONTACT_EMAIL: "YOUR_NEW_MAIL@gmail.com",          // <<< CHANGE (new Gmail)
  CONTACT_PHONE: "9494780174",                      // printed on question papers (from your model paper)
  MOTTO: "DREAM TO ACHIEVE",
  LOGO: "assets/icons/logo.png",

  /* GitHub repository that hosts the app (GitHub Pages).
     Student link will be:  https://<owner>.github.io/<repo>/home.html
     path_prefix = "" when the app files sit at the repo root.
     If you keep the app inside a folder (like V43 earlier), put "FOLDER/" here. */
  GITHUB: {
    owner: "konceptjunction",                         // V5: taken from your link konceptjunction.github.io
    repo: "V1",                                       // V5: your repo name (link …github.io/V1/)
    branch: "main",
    path_prefix: ""
  },

  /* Cloudinary — unsigned upload preset (Settings > Upload > Upload presets).
     No API secret is ever stored here. */
  CLOUDINARY: {
    cloud_name: "YOUR_CLOUD_NAME",                    // <<< CHANGE
    upload_preset: "YOUR_UNSIGNED_PRESET",            // <<< CHANGE
    folder: "koncept_junction"
  },

  /* Teacher Upload lock (Setup Code + PIN). Values are SHA-256 hashes.
     Defaults:  Setup Code = KJ-SETUP-2026   PIN = 1234
     Make your own hashes with tools/hash_tool.html and paste them here. */
  TEACHER_LOCK: {
    setup_code_sha256: "0ec1d7b4ccd5fe266b3875f02a09dd967b99acb6ffd2aa705a889d35c13eaf67",
    pin_sha256: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"
  },

  /* V4: Google Sheet student register (Apps Script web app – see tools/google_apps_script_students.gs) */
  SHEET: {
    webapp_url: "YOUR_APPS_SCRIPT_WEB_APP_URL"        // <<< CHANGE  (https://script.google.com/macros/s/…/exec)
  },

  DEFAULT_LANG: "bi",          // "en" | "te" | "bi" (bilingual English + Telugu)
  DAILY_QUIZ_SIZE: 10
};
