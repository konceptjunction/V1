# KONCEPT JUNCTION — State Level Competitive Exams PWA
**DREAM TO ACHIEVE** · Pack: `KJ_V23_upload_select_publish_logout_pack` · Build 2026-10-24

V23 includes everything from V22, V21, V20, V19, V18, V17, V16, V15 and down to V2. *Old packs:* ~~`KJ_V22_upload_math_powers_pack`~~ · ~~`KJ_V21_upload_docx_pack`~~ · ~~`KJ_V20_upload_option_cleanup_pack`~~ · ~~`KJ_V19_upload_timer_restart_pack`~~ · ~~`KJ_V18_upload_share_qr_pack`~~ · ~~`KJ_V17_upload_fresh_timer_clear_all_pack`~~ · ~~`KJ_V16_upload_subject_exam_first_pack`~~ · ~~`KJ_V15_upload_reupload_choice_pack`~~ · ~~`KJ_V14_upload_match_table_view_pack`~~ · ~~`KJ_V13_upload_telugu_typing_tables_pack`~~ · ~~`KJ_V12_upload_back_to_test_pack`~~ · ~~`KJ_V11_upload_hide_teacher_login_pack`~~ · ~~`KJ_V10_upload_registered_mail_check_pack`~~ · ~~`KJ_V9_upload_bulk_import_layout_pack`~~ · ~~`KJ_V8_upload_exam_hall_buttons_pack`~~ · ~~`KJ_V7_upload_pdf_import_pack`~~ · ~~`KJ_V6_upload_topic_test_bundle_import_pack`~~ · ~~`KJ_V5_upload_teacher_settings_exam_form_pack`~~ · ~~`KJ_V4_upload_student_register_sheet_pack`~~ · ~~`KJ_V3_upload_student_nav_performance_pack`~~ · ~~`KJ_V2_upload_fix_pin_entry_pack`~~ · ~~`KJ_V1_upload_initial_state_exam_pack`~~

> Marking used in this file: $\color{red}{\textbf{*NEW*}}$ = added/changed in this pack.
> Old items are kept (struck-through or under *Old version*) so you can see what changed.
> (GitHub shows the red tag. In other viewers it may show as plain `\color{red}` text.)

---

## 0. $\color{red}{\textbf{*NEW*}}$ What changed in V23 (2026-10-24) – 🎯 Choose what to publish (Teacher) + 🚪 Logout (Student)

### A. Teacher → 🚀 Publish → 🎯 Choose what to publish

| Place | Old version (V1–V22) | $\color{red}{\textbf{*NEW*}}$ V23 |
|---|---|---|
| 🚀 Publish | ~~Everything in Teacher Mode went live at once~~ | New card **🎯 Choose what to publish** with an **ON / OFF switch** |
| Switch OFF | – | All Topic Tests are published (same as before) |
| Switch ON | – | All tests are listed **by Subject → Topic → Test** with tick boxes. Tick a whole **subject**, a whole **topic**, or single tests. **Tick all / Untick all** buttons. |
| Unticked tests | – | Kept as **📝 drafts**: not shown to students, and **their questions are also kept out of Subjects practice**. They stay in Teacher Mode (on every device) until you tick them and Publish again. |
| Summary | – | *"✔ 2 test(s) will be published · 📝 1 kept as draft (35 question(s) hidden from students)"*, and the button says *Publish 13 file(s) – 2 test(s) live, 1 draft* |
| 🎯 Topic Tests tab | – | Draft tests have a dashed border and a **📝 Draft – not published** label |
| After 🧹 Clear all tests | – | Import the new papers → Publish → switch ON → tick only the tests that are ready → Publish |

Drafts are saved in the repository as `data/drafts.json` (the student app never reads it), so a teacher on another laptop sees the same drafts.

### B. Student → 👤 Profile → 🚪 Logout

| Place | Old version (V1–V22) | $\color{red}{\textbf{*NEW*}}$ V23 |
|---|---|---|
| 👤 Profile (top-right) | ~~Only "Reset everything" (deletes all data)~~ | **🚪 Logout** button (next to Performance / Home) |
| Logout pop-up | – | *"Your results, bookmarks and progress stay saved on this phone and come back when you log in again with ravi@gmail.com."* It also warns if a test is not submitted (kept, timer paused) or details are not yet sent to the teacher. |
| After Logout | – | The first page (Name, Mail, Exam, College) opens, so **another student can use the same phone** and gets an empty result list |
| Logging in again | – | With the same Mail ID, **all earlier results, Performance and the unsubmitted test come back**. |

**Files changed in V23:**
```
KJ_V23_upload_select_publish_logout_pack/
├── teacher.html             *NEW* ON/OFF switch + publish list styles
├── sw.js                    *NEW* cache kj-v23
├── README.md                *NEW* this section
└── assets/js/
    ├── teacher.js           *NEW* 🎯 Choose what to publish, drafts (data/drafts.json), draft label
    ├── app.js               *NEW* 🚪 Logout + results kept per Mail ID
    └── config.js            *NEW* VERSION V23 (keep your own config.js – optional)
```
⚠ The zip has **no `data/` folder** (your tests are safe). Keep your own `config.js`. V22 (maths powers) and all older changes are included.

**Upload steps:**
1. Unzip. In GitHub → **Add file → Upload files** → drag `home.html`, `teacher.html`, `sw.js`, `README.md` and the whole `assets` folder → **Commit changes**.
2. Wait 1–2 minutes, open the app and reload.

**Publishing only some tests:**
1. 🚀 Publish → 🎯 Choose what to publish → switch **ON**.
2. Untick the tests, topics or subjects that are not ready.
3. Press **Publish**.
4. Later, tick them and press Publish again. To go back, switch **OFF**, which publishes everything.

**Tested:**
- Teacher, with a stand-in GitHub:
  - 3 tests imported, History unticked → published 2 tests.
  - `drafts.json` holds History (35 Qs), and `history.json` has none of its questions.
  - The student saw 2 tests.
  - A fresh teacher device showed 3 tests with History as Draft.
  - Ticking History and publishing → 3 tests live, drafts empty.
- Student:
  - Ravi took a test, left one unsubmitted, then logged out → the first page opened, with 0 results.
  - Sita registered on the same phone → 0 results.
  - Sita logged out and Ravi logged in again → his 1 result and the unsubmitted test came back.
- No script errors.

---

## 0.1 Old version – what changed in V22 (2026-10-23) – maths: powers, equations and expressions kept exactly (Word, PDF, typed)

| In the paper (`KJ_SAMPLE_APTITUDE_AND_REASONING.docx`) | Old version (V21) | V22 |
|---|---|---|
| Powers typed with Word superscript: 2⁶⁰, 3⁴⁸, 4³⁶, 5²⁴ | ~~260, 348, 436, 524 (power lost – wrong answer!)~~ | **2⁶⁰, 3⁴⁸, 4³⁶, 5²⁴** – in Teacher preview, student test (phone/PC), review and print |
| BODMAS expression line `[7+7×(7+7÷7)]+7÷7` | ~~removed (V20 junk cleaner thought `[ ]` was junk)~~ | **Kept** and shown in EN, EN+తె and తెలుగు (after the Telugu line, as in the paper) |
| Series line `1210, 648, 294, 100, ?` | ~~English view only~~ | **Shown in all 3 language views** |
| Equations `5x+2y-9=0`, `k=2`, `a=b+c`, `14%`, `₹18,240` | – | Kept exactly (`= % * ^ [ ] { } < >` are maths, never junk) |
| Raised full stop after a question number ("3." with "." raised) | – | Read as normal "3." |
| **Word Equation Editor** (Insert → Equation) | ~~letters only, structure lost~~ | Fraction → `(a+b)/c`, power → `x²+y²=r²`, root → `√144+³√27`, subscript → `H₂O`, `10⁻³`, ∑ ∫ brackets |
| Word symbols (Symbol font × ÷ ± ≤ ≥ √ π θ …) | – | Converted to the real characters |
| **Typing in ➕ Add / Edit** (and pasted / PDF text) | – | `2^60` → 2⁶⁰ · `x^2` → x² · `a^{n+1}` → aⁿ⁺¹ · `H_{2}O` → H₂O (shown everywhere; `_____` blanks stay). LaTeX `$…$` still works for big formulas. |

**Files changed in V22:**
```
KJ_V22_upload_math_powers_pack/
├── sw.js                    *NEW* cache kj-v22
├── README.md                *NEW* this section
└── assets/js/
    ├── common.js            *NEW* powers/subscripts display, expression lines in every language, print, junk rule fix
    ├── teacher.js           *NEW* Word superscript/subscript, Word equations (OMML), symbols, expression lines, Add/Edit hint
    └── config.js            *NEW* VERSION V22 (keep your own config.js – optional)
```
⚠ The zip has **no `data/` folder** (your tests are safe). Keep your own `config.js`. V21 (Word upload) and all older changes are included.

**Upload steps:**
1. Unzip. In GitHub → **Add file → Upload files** → drag `home.html`, `teacher.html`, `sw.js`, `README.md` and the whole `assets` folder → **Commit changes**.
2. Wait 1–2 minutes, open teacher.html and reload.
3. **Re-import the Aptitude paper.** It was saved with the powers missing.
   1. 📥 Bulk Import → ① Subject (Quantitative Aptitude / Reasoning) + Exam Type.
   2. ② **📝 Read Word (.docx) paper** → `KJ_SAMPLE_APTITUDE_AND_REASONING.docx`.
   3. Type the answer key → ③ Import → **🔁 Reupload** → 🚀 Publish.

**Tested:**
- `KJ_SAMPLE_APTITUDE_AND_REASONING.docx` (your paper):
  - All 9 questions read, with every term in place.
  - The 4 options with powers show as powers.
  - The BODMAS line and the series line show in EN / EN+తె / తెలుగు.
  - On the phone, Q2 shows 2⁶⁰ 3⁴⁸ 4³⁶ 5²⁴.
- A Word file with Equation Editor fractions / powers / roots / subscripts.
- Typed `2^60`, `a^{n+1}`, `H_{2}O` in Add / Edit.
- Earlier tests still pass: V21 Word paper + notes, V20 cleanup (Q7 junk removed), and 117 correct questions unchanged.
- No script errors.

---

## 0.2 Old version – what changed in V21 (2026-10-23) – upload Word (.docx) test papers and notes in Teacher Mode

| Place | Old version (V1–V20) | V21 |
|---|---|---|
| 📥 Bulk Import ② | ~~📄 Read PDF · 📂 CSV / JSON / Topic Test file · paste text~~ | **📝 Read Word (.docx) paper** added (next to Read PDF) |
| What is read from Word | – | **Exact** English + తెలుగు text (no OCR mistakes) · Word **automatic numbering** (1. 2. 3. / A) B) C) D) / i. ii.) · **tables** → match-the-following table · **pictures** (diagrams) attached to their question · options typed on one line with Tab (A) In ⇥ B) On …) split · **"Answer Key"** at the end of the file fills the answer key box · header / footer / watermark ignored |
| Title / Set | – | Taken from the file name and the Set letter (e.g. `KJ_Geography_Set_S.docx` → *Geography – Set S*) |
| Steps | – | Same as V16: **① Subject + Exam Type → ② 📝 Word paper → check → ③ Import** (Already Uploaded → 🔁 Reupload / ✋ No need of upload still works) |
| 📒 Notes & Concepts | ~~PDF only~~ | **📝 Upload Word (.docx) notes**: the Word file becomes a **notes page** (KJ header, exact Telugu, tables, pictures, phone size, dark mode) uploaded to GitHub `media/notes/…html`. Then press **Add**. |
| Student → Notes | ~~Open PDF~~ | Word notes show **📄 Open notes** (opens inside the app). **⬇ Save offline** works too. PDFs still show *Open PDF*. |
| Old Word files (.doc) | – | Message: *"In Word use File → Save As → Word Document (.docx)"* |

**How to type a Word paper** (see `KJ_Word_Paper_Template_Set_S.docx`):
```
S                                   ← Set letter on its own line (optional)
1. English question?                ← typed or Word numbering
తెలుగు ప్రశ్న?
A) English / తెలుగు                  ← typed or Word A) B) C) D) numbering
B) …   C) …   D) …
2. Match the following …            ← put the two lists in a 2-column Word table:
   | List–I: … / జాబితా–I | List–II: … / జాబితా–II |
   | a) … / …             | i) … / …               |
A) a–iii, b–i, c–iv, d–ii …
3. Question with a diagram           ← insert the picture under the question
Answer Key                          ← optional, at the end
1-B 2-C 3-A
```

**Files changed in V21:**
```
KJ_V21_upload_docx_pack/
├── sw.js                    *NEW* cache kj-v21
├── README.md                *NEW* this section
└── assets/js/
    ├── teacher.js           *NEW* 📝 Read Word paper, 📝 Word notes, Word tables/pictures/numbering
    ├── app.js               *NEW* "📄 Open notes" for Word notes
    └── config.js            *NEW* VERSION V21 (keep your own config.js – optional)
```
⚠ The zip has **no `data/` folder** (your tests are safe). Keep your own `config.js`. V20 (OCR cleanup), V19 (fresh timer), V18 (📤 Share) and older are included.
Word reading uses two free libraries loaded the first time (JSZip from cdnjs, Mammoth from jsDelivr), then kept offline.

**Upload steps:**
1. Unzip. In GitHub → **Add file → Upload files** → drag `home.html`, `teacher.html`, `sw.js`, `README.md` and the whole `assets` folder → **Commit changes**.
2. Wait 1–2 minutes, open teacher.html and reload.
3. **Word test paper:** 📥 Bulk Import → ① Subject + Exam Type → ② **📝 Read Word (.docx) paper** → check the text + key → **③ Import** → 🚀 Publish.
4. **Word notes:** 📒 Notes & Concepts → Type, Subject, Title → **📝 Upload Word (.docx) notes** → **Add** → 🚀 Publish. (Needs the GitHub token in ⚙️ Settings, like PDF upload.)

**Tested:**
- Test Word paper with Word numbering, Telugu, Tab options, a 2-column table, a picture and an answer key:
  - 4 questions were read exactly, and the answer key 1-B 2-C 3-A 4-D was filled in.
  - Title *Test Word Paper – Set S*.
  - Imported 4 Qs + 1 Topic Test.
- On the phone:
  - The match table showed in EN+తె and తెలుగు (with a) / i) labels and జాబితా-I heading).
  - The diagram showed in Q4.
- Word notes:
  - Became a page with the table, the picture and Telugu text.
  - Uploaded to `media/notes/` (stand-in GitHub).
  - Students see 📄 Open notes.
- No script errors.

---

## 0.3 Old version – what changed in V20 (2026-10-23) – options read from a PDF are cleaned (match codes, junk text, Telugu as numbers)

| Problem seen (PDF read with OCR) | Old version (V7–V19) | V20 |
|---|---|---|
| Match codes misread | ~~`a-iii, 0-1 c-ii` · `2-1, 0-ఴ, c-iii` · `a-iv, b-iii, 6-1 d-ii` · `a-iv, bi, c-iii, d-ii`~~ | **Repaired from the table:** letters a, b, c, d are taken from the table rows. 1 / 11 / 111 / l / \| become i / ii / iii. One unreadable value is filled in. → `a-iii, b-i, c-ii` · `a-i, b-ii, c-iii` · `a-iv, b-iii, c-i, d-ii` · `a-iv, b-i, c-iii, d-ii` |
| Extra unwanted text after option D | ~~`a-ii, bi, c-iii, d-iv nr an sr "1, ANAL EE = hid … \| \| … dn .. 14` (watermark / page edge read as text)~~ | **Removed** → `a-ii, b-i, c-iii, d-iv` |
| Telugu shown as numbers | ~~`Certiorari / 288558`~~ | Numbers dropped, **English shown** (`Certiorari`), and the teacher is told: *"option B: Telugu not readable – type it"* |
| Junk at the end of a Telugu line | ~~`ఎంపికలు క క... క`~~ | `ఎంపికలు` |
| Table heading above the table | ~~`జాబితా-I (తీరం) [IS-II (State) / జాబితా-II (రాష్ట్రం)` shown as text~~ | Heading row **inside the table** (a Latin "I" in *జాబితా-I* no longer breaks it) |
| Teacher → 📥 Bulk Import → Preview | – | Cleaned options shown, plus **⚠ Check after import:** *Q.. – option C: check the match code* when OCR lost too much to repair safely |
| Teacher → 📚 Question Bank | – | **🔧 Fix OCR mistakes** button: cleans every question already uploaded and lists anything to check by hand. Then 🚀 Publish. |
| Correct questions | – | **Not changed.** Checked on all 117 questions of the 4 Set S papers and the sample bank: 0 changes. |

**Files changed in V20:**
```
KJ_V20_upload_option_cleanup_pack/
├── sw.js                    *NEW* cache kj-v20
├── README.md                *NEW* this section
└── assets/js/
    ├── common.js            *NEW* KJ.cleanQ – match codes, junk, Telugu as numbers
    ├── teacher.js           *NEW* PDF reader uses it, Preview warnings, 🔧 Fix OCR mistakes, table heading fix
    └── config.js            *NEW* VERSION V20 (keep your own config.js – optional)
```
⚠ The zip has **no `data/` folder** (your tests are safe). Keep your own `config.js`. V19 (fresh timer), V18 (📤 Share) and older are included.

**Upload steps:**
1. Unzip. In GitHub → **Add file → Upload files** → drag `home.html`, `teacher.html`, `sw.js`, `README.md` and the whole `assets` folder → **Commit changes**.
2. Wait 1–2 minutes, open teacher.html and reload (V19+ phones update by themselves).

**Fix the papers you already uploaded:**
- **Geography (best):**
  1. 📥 Bulk Import → ① Geography + Exam Type.
  2. ② Choose `KJ_Geography_Polity_Set_S_topic_test.json`.
  3. ③ Import → **🔁 Reupload**. This file is typed exactly, with no OCR.
  4. 🚀 Publish.
- **Any other paper read from a PDF:**
  1. 📚 Question Bank → **🔧 Fix OCR mistakes**.
  2. Open the questions it lists in ➕ Add / Edit and correct them. Use the Telugu typing tool (F2) for missing Telugu.
  3. 🚀 Publish.

**Tested:**
- The exact texts from the phone screenshots: Geography Q7 now matches the paper in all 4 options, Q1 has 3 of 4 repaired and option C is flagged to check, and the Polity "Certiorari" option shows English and is flagged.
- 🔧 Fix OCR mistakes repaired an old broken question in the bank.
- 117 correct questions were unchanged.
- The student timer still starts fresh.
- No script errors.

---

## 0.4 Old version – what changed in V19 (2026-10-23) – timer starts fresh at every new test (and phones always get the newest app)

| Place | Old version (V1–V18) | V19 |
|---|---|---|
| Student → start any test (Topic Test, Retake, Mock, Daily, Custom, Retest) | ~~V1–V16: timer kept running from an old start time. V17–V18: fresh, but phones that still ran an old cached `exam.js` kept the old timer.~~ | **Timer is set to the full time every time a new test starts** (e.g. 35:00, 10:00) and a message shows: **"⏱ Timer started – 35:00 for this test"** |
| Leaving a test and tapping ⏳ Resume | (V17) paused | Same – continues from where the student left |
| Getting new versions on phones | ~~App code (`.js`, `.css`) taken from the phone's cache first, so a phone could keep an old version after you uploaded a new one~~ | **App code is always loaded fresh from the internet first** (the cache is used only when offline). The phone checks for updates each time the app is opened and **reloads itself once** to the new version. It never reloads during a test or in Teacher Mode. |
| Everything from V18 (📤 Share, QR, WhatsApp / Mail), V17 (🧹 Clear all), V16, V15 | – | Included |

**Files changed in V19:**
```
KJ_V19_upload_timer_restart_pack/
├── sw.js                    *NEW* cache kj-v19, app code network-first
├── README.md                *NEW* this section
└── assets/js/
    ├── exam.js              *NEW* full time at every new test + "Timer started" message
    ├── common.js            *NEW* update check + one automatic reload to the new version
    └── config.js            *NEW* VERSION V19 (keep your own config.js – optional)
```
⚠ The zip has **no `data/` folder** (your tests are safe). Keep your own `config.js`.

**Upload steps:**
1. Unzip. In GitHub → **Add file → Upload files** → drag `home.html`, `teacher.html`, `sw.js`, `README.md` and the whole `assets` folder (the V18 Share files are inside too) → **Commit changes**.
2. Wait 1–2 minutes. On each phone, open the app and **reload twice** (or close the app fully and open it again twice). This is needed only this one time. From V19 on, phones update by themselves.
3. Check: start any Topic Test. You should see **"⏱ Timer started – … for this test"** and the full time.

**Tested** (phone size):

| Step | Timer |
|---|---|
| Start History | 34:59 |
| After 4 s | 34:55 |
| Submit, then start General Science | 09:59 |
| Leave without submitting, start History again | 34:59 |
| Same test again | 34:59 |
| Page reload during a test (resume) | 34:58 |
| Retake | 09:59 |

Update path, with the service worker on as on a real phone:
- A phone running V18 got the V19 `exam.js` after one reload.
- A later update arrived and reloaded by itself.
- No script errors.

---

## 0.5 Old version – what changed in V18 (2026-10-23) – 📤 Share (WhatsApp / Mail) + QR scanner for students

| Place | Old version (V1–V17) | V18 |
|---|---|---|
| Student Mode – top-right | ~~Language · Theme · 👤 Profile~~ | Language · Theme · **📤 Share** · 👤 Profile |
| 📤 Share page | – | **QR code** of the app: a friend scans it with the phone camera / Google Lens and the app opens |
| Main buttons | – | **🟢 WhatsApp** (opens WhatsApp with the message + link ready) · **✉️ Mail** (opens Gmail / mail app with subject + message + link) |
| More buttons | – | **📋 Copy link** · **⬇ QR poster** (PNG with KJ logo, *DREAM TO ACHIEVE*, big QR, *Scan to join / స్కాన్ చేసి యాప్ తెరవండి*, to print for the notice board or send) · **📷 Scan a QR** (camera scanner inside the app on Android Chrome; on iPhone it tells you to use the Camera app) · **📤 More apps** (phone share sheet: Telegram, SMS …, on phones that have it) |
| Message sent | – | *📘 KONCEPT JUNCTION – DREAM TO ACHIEVE · Free practice app for APPSC / TGPSC Group-I, II, IV, Police SI, AE/AEE – English + తెలుగు… Shared by <student name>. Open / install: <link>* |
| Link used | – | This app's own address (your GitHub Pages link, e.g. `https://<user>.github.io/<repo>/home.html`). Optional: set `SHARE_URL` in `config.js` to another link. |
| Offline | – | The QR is drawn on the phone (`assets/js/vendor/qrcode.js`, MIT licence). No internet QR service is used. |

**Files changed in V18:**
```
KJ_V18_upload_share_qr_pack/
├── home.html                *NEW* 📤 Share button + 2 scripts
├── sw.js                    *NEW* cache kj-v18 (share files cached for offline)
├── README.md                *NEW* this section
└── assets/
    ├── css/app.css          *NEW* Share button, QR, WhatsApp / Mail buttons
    └── js/
        ├── share.js         *NEW FILE* Share page, QR, poster, scanner
        ├── vendor/
        │   └── qrcode.js    *NEW FILE* QR code maker (offline)
        └── config.js        *NEW* VERSION V18 + optional SHARE_URL (keep your own config.js)
```
⚠ The zip has **no `data/` folder** (your tests are safe). Keep your own `config.js` (adding `SHARE_URL` is optional). V17 (fresh timer, 🧹 Clear all), V16 and V15 are included.

**Upload steps:**
1. Unzip. In GitHub → **Add file → Upload files** → drag `home.html`, `sw.js`, `README.md` and the `assets` folder (it now has a new `vendor` folder) → **Commit changes**.
2. Wait 1–2 minutes, open the app and **reload twice** (cache `kj-v18`). On a phone, close the app fully and open again.
3. Student Mode → tap **📤** (next to your profile letter) → WhatsApp or Mail, or show the QR to a friend.
4. Teacher tip: tap **⬇ QR poster** once, print it and put it on the class notice board.

**Tested** (Pixel 7 size):
- The 📤 button shows next to the profile.
- The QR and the downloaded poster both decode to the app link.
- The WhatsApp link carries the message + link.
- The Mail link carries the subject + message.
- Copy link works.
- The scanner shows a fallback message on a browser without a camera scanner.
- No script errors.

---

## 0.6 Old version – what changed in V17 (2026-10-23) – fresh timer for every test (Student) + 🧹 Clear all tests (Teacher) · includes V16 + V15

| Place | Old version (V1–V16) | V17 |
|---|---|---|
| Student → any test (Topic Test, Mock, Daily, Custom, Retake) | ~~Timer kept running from the moment the test was opened, even when the student left the test; a test left unfinished carried on with less time~~ | **Every test starts with a fresh, full timer** (e.g. 35:00 for a 35-minute test), counted from the first question on screen |
| Student leaves a test (Home, other app, phone locked, app closed) | ~~Timer kept running~~ | **Timer pauses.** ⏳ *Resume* on Home continues from the same time. |
| Starting a new test while one is not submitted | ~~Mock only asked; Topic Tests silently replaced it~~ | Asks *"… is not submitted yet. Discard it and start this test with a fresh timer?"* |
| Result → time used | ~~Clock time since opening~~ | **Real time spent** (paused time not counted) |
| Exam instructions | ~~"…resume later (timer keeps running)"~~ | *"Every test starts with a fresh full timer. If you leave the test, the timer pauses…"* |
| Teacher → 🎯 Topic Tests | – | **🧹 Clear all tests** button: deletes **every Topic Test and its questions**. A tick box also clears the **whole Question Bank**. You must type **CLEAR** to confirm. Notes, Current Affairs, Announcements, Exam Patterns and Settings are kept. Then 🚀 Publish. |
| V16 (included) | – | ① Subject + Exam Type first → ② upload paper → ③ Import, with the *"Select the subject name and Exam type"* pop-up |
| V15 (included) | – | Already Uploaded pop-up: 🔁 Reupload / ✋ No need of upload |

**Files changed in V17** (V15 + V16 files are inside this pack too):
```
KJ_V17_upload_fresh_timer_clear_all_pack/
├── teacher.html             (V16) lock / highlight styles
├── sw.js                    *NEW* cache kj-v17
├── README.md                *NEW* this section
└── assets/js/
    ├── exam.js              *NEW* fresh timer per test, pause on leave, real time used
    ├── app.js               *NEW* exam instruction text, one discard question for all tests
    ├── teacher.js           *NEW* 🧹 Clear all tests  + (V16) Subject/Exam first + (V15) Reupload
    └── config.js            *NEW* VERSION V17 (keep your own config.js – optional)
```
⚠ The zip has **no `data/` folder** (your tests are safe). Keep your own `config.js`.

**Upload steps (from V14 or older, upload all of these; from V16, the same list):**
1. Unzip. In GitHub → **Add file → Upload files** → drag `teacher.html`, `sw.js`, `README.md` and the `assets` folder → **Commit changes**.
2. Wait 1–2 minutes, open the app and **reload twice** (cache `kj-v17`). On a phone, close the app fully and open again.

**Clear all and upload again:**
1. Teacher → 🎯 Topic Tests → **🧹 Clear all tests**. Optionally tick *whole Question Bank*.
2. Type **CLEAR** → **🧹 Clear all**.
3. 📥 Bulk Import → ① Subject + Exam Type → ② choose paper → ③ Import (repeat for each paper).
4. 🚀 **Publish**.

**Tested** (student on a phone-size screen):
- Fresh timer:
  - History started at 34:59, and after 3 s showed 34:56.
  - Home for 4 s, then Resume showed 34:55, so the timer had paused.
  - Starting another test asked to discard, and General Science started fresh at 09:59.
  - Starting the same test again started fresh too.
- Clear all:
  - The CLEAR button stayed disabled until the word was typed.
  - 3 tests and 65 questions were deleted; the other bank questions were kept.
- No script errors.

---

## 0.7 Old version – what changed in V16 (2026-10-23) – Bulk Import: select Subject + Exam Type first, then upload, then Import

| Place | Old version (V1–V15) | V16 |
|---|---|---|
| Bulk Import order | ~~Paper first; Subject defaulted to the first subject; Exams optional~~ | **① Select Subject & Exam Type** → **② Upload paper** (📄 PDF / 📂 file / paste) → **③ Import** |
| Subject box | ~~Pre-filled with the first subject~~ | **— Select subject —** (must choose) · marked * |
| Exams | ~~"Exams", optional~~ | **Exam Type *** – tick one or more (must choose) |
| Upload before choosing | ~~Allowed~~ | **Pop-up "⚠ Select the subject name and Exam type"** with ✔/✖ for each, and **OK – select now**, which jumps to the ① box and makes it flash. The file window does not open. |
| ② box until ① is done | – | Greyed, with a 🔒 note *First select Subject and Exam Type in ① →* (on a phone the ① box comes first, ↑) |
| 📂 Topic Test / JSON / CSV file | ~~Imported as soon as the file was chosen~~ | **Waits:** *"file is ready: 22 questions + Topic Test … → now press ③ Import"* (with a *cancel* link). It is added only when you press **③ Import**. |
| Applied on Import | – | The **Topic Test subject = the subject you chose** (students see it under that subject). The **chosen Exam Type(s)** are added to the test and to every imported question. |
| Remembered | – | The chosen Subject + Exam Type stay after switching tabs, ready for the next paper of the same subject |
| Already Uploaded pop-up (V15) | – | Still works, on ③ Import |

**Files changed in V16:**
```
KJ_V16_upload_subject_exam_first_pack/
├── teacher.html             *NEW* lock / highlight styles, ① box first on phone
├── sw.js                    *NEW* cache kj-v16
├── README.md                *NEW* this section
└── assets/js/
    ├── teacher.js           *NEW* Subject + Exam Type check, pop-up, file waits for ③ Import
    └── config.js            *NEW* VERSION V16 (keep your own config.js – optional)
```
⚠ The zip has **no `data/` folder** (your tests are safe). Keep your own `config.js`. Everything from V15 and older is included (section 0.8).

**Upload steps:**
1. Unzip. In GitHub → **Add file → Upload files** → drag `teacher.html`, `sw.js`, `README.md` and the `assets` folder → **Commit changes**.
2. Wait 1–2 minutes, open teacher.html and **reload twice** (cache `kj-v16`).

**Using it (Teacher → 📥 Bulk Import):**
1. **①** Choose the **Subject** (e.g. Geography) and tick the **Exam Type** (e.g. APPSC Group-II). Tick *Also create a Topic Test* and type Set + title if it is a pasted / PDF paper.
2. **②** Click 📄 **Read PDF** or 📂 **CSV / JSON / Topic Test file** (or paste text). For a PDF, check the text and type the answer key.
3. Press **③ Import**. If the paper is already in the app you get **🔁 Reupload / ✋ No need of upload**.
4. 🚀 **Publish**.

**Tested:**
- Before ① was done:
  - PDF click: the pop-up appeared and the file window stayed closed.
  - File chosen: pop-up.
  - Import: pop-up.
- Subject only: *"Tick the exam type."*
- Subject + exam type: the ② box unlocked.
- Geography file: it waited at "ready" (0 tests added), and ③ Import then added 22 Qs + 1 test (subject geography, exam appsc_g2).
- The selection stayed after a tab switch.
- Pasted paper imported.
- Phone layout checked.
- No script errors.

---

## 0.8 Old version – what changed in V15 (2026-10-23) – "Already Uploaded" asks: Reupload or No need of upload

| Place | Old version (V13–V14) | V15 |
|---|---|---|
| "⚠ Already Uploaded" pop-up | ~~Only a message + Close. Nothing imported; to upload again you had to delete the old test by hand in 🎯 Topic Tests first~~ | **Two buttons: ✋ No need of upload · 🔁 Reupload** |
| ✋ No need of upload | – | The old paper is kept, nothing is added. (After 📄 Read PDF the text box is also cleared.) |
| 🔁 Reupload | – | The old test **and its questions** are removed and the paper is **uploaded once again** as a fresh copy (no duplicates). Questions used in other tests are kept. |
| Works for | – | 📂 Topic Test file / JSON / CSV, 📄 Read PDF (choose Reupload, check text + key, press Import), and pasted text → Import |

**Files changed in V15:**
```
KJ_V15_upload_reupload_choice_pack/
├── sw.js                    *NEW* cache kj-v15
├── README.md                *NEW* this section
└── assets/js/
    ├── teacher.js           *NEW* Reupload / No need of upload pop-up
    └── config.js            *NEW* VERSION V15 (keep your own config.js – optional)
```
⚠ The zip has **no `data/` folder** (your tests are safe). Keep your own `config.js`. The match-table view from V14 (section 0.9) and everything older is included.

**Upload steps:**
1. Unzip. In GitHub → **Add file → Upload files** → drag `sw.js`, `README.md` and the `assets` folder → **Commit changes**.
2. Wait 1–2 minutes, open teacher.html and **reload twice** (cache `kj-v15`).
3. To replace a paper: 📥 Bulk Import → choose the file (or Read PDF) → pop-up → **🔁 Reupload** → 🚀 **Publish**.

**Tested:**
- Geography Topic Test file imported, then chosen again, and the pop-up appeared.
- ✋ No need of upload: nothing changed (64 Qs, 2 tests).
- 🔁 Reupload: the paper uploaded again with no duplicates (still 64 Qs, 2 tests).
- Pasted paper: No need, then Reupload, gave the same result (66 Qs, 3 tests).
- Pop-up checked on phone width.
- No script errors.

---

## 0.9 Old version – what changed in V14 (2026-10-23) – Match-the-following shown as a bordered table (all question views)

| Place | Old version (V1–V13) | V14 |
|---|---|---|
| Student exam hall (phone and PC) | ~~Match rows shown as plain lines, e.g. `a) Green Revolution \| i) Fish production` with a `\|` in the middle; on a phone the two lists ran into each other~~ | **Bordered 2-column table**: List-I on the left, List-II on the right. Each cell holds `English / తెలుగు`, for example **a) Green Revolution / హరిత విప్లవం ‖ i) Fish production / చేపల ఉత్పత్తి**. The header row (List-I / List-II) is bold and shaded. |
| Language switch EN+తె / EN / తెలుగు | ~~Lines only~~ | **The same table** in English only or Telugu only |
| Subjects practice + Review answers after a test | ~~Plain lines~~ | **Same table** |
| Teacher ➕ Add / Edit preview | ~~Plain lines~~ | **Same table**, so you can see exactly what students will see |
| 🖨 Question paper / With answer key / Question Bank print | ~~Plain lines~~ | **Bordered table** in the printed paper |
| Applies to | – | **Every question** whose text has rows written as `left \| right`: Match the following, List-I / List-II, Assertion tables, 2-column data. Text before the table (the question) and after it (e.g. *Choose the correct answer*) stays above and below. Ordinary questions look the same as before. |
| Teacher typing hint | – | Under the Telugu question box: *Match the following: put each table row on its own line with ' \| ' between the two columns.* |

**How to type a match question yourself** (➕ Add / Edit). English box:
```
Match the following revolutions with their associated products.
List-I: Revolution | List-II: Associated product
a) Green Revolution | i) Fish production
b) Blue Revolution | ii) Fertilizer production
c) Yellow Revolution | iii) Oilseed production
d) Grey Revolution | iv) Food-grain production
```
Telugu box: the same rows in Telugu (`a) హరిత విప్లవం | i) చేపల ఉత్పత్తి` …). Keep the same number of rows in both boxes.
Questions read from a PDF with V13 already use this `|` format, so they show as tables automatically.

**Files changed in V14:**
```
KJ_V14_upload_match_table_view_pack/
├── sw.js                    *NEW* cache kj-v14
├── README.md                *NEW* this section
└── assets/
    ├── css/app.css          *NEW* table style (.mt) for phone and PC
    └── js/
        ├── common.js        *NEW* KJ.splitTable / KJ.tableHtml / KJ.qHtml + print tables
        ├── exam.js          *NEW* question shown with table
        ├── app.js           *NEW* practice + review shown with table
        ├── teacher.js       *NEW* preview with table + typing hint
        └── config.js        *NEW* VERSION V14 (keep your own config.js – optional)
```
⚠ The zip has **no `data/` folder** (your tests are safe). Keep your own `config.js` (change only `VERSION: "V14"` if you like). Telugu typing, Already Uploaded and the 25 MB limit from V13 are all included (section 0.10).

**Upload steps:**
1. Unzip. In GitHub → your repository → **Add file → Upload files** → drag `sw.js`, `README.md` and the `assets` folder (GitHub keeps the folder paths) → **Commit changes**.
2. Wait 1–2 minutes, then open the app and **reload twice** (the app moves to cache `kj-v14`). On a phone: close the app fully and open again.
3. **Fix the old Geography test** (if it still shows mixed-up match rows): Teacher → 🎯 Topic Tests → **🗑 Delete test + its questions** → 📥 Bulk Import → choose the new `KJ_Geography_Polity_Set_S_topic_test.json` (from `KJ_Topic_Tests_Set_S.zip`) → 🚀 **Publish**. Do the same for History if you imported it before V13.

**Tested** (phone Pixel 7 size + PC):
- Geography Q1 (coasts) and Q7 (revolutions) and History Q6 showed as 2-column bordered tables in EN+తె, EN and తెలుగు.
- A PDF-style pasted paper became a table too.
- Teacher preview showed 1 table; the printed paper showed 2 tables.
- No script errors.

---

## 0.10 Old version – what changed in V13 (2026-10-23) – Teacher Mode: Telugu typing, tables, "Already Uploaded", 25 MB GitHub limit

### 1. Telugu typing tool
| | Old version | V13 |
|---|---|---|
| Typing Telugu | ~~needed a Telugu keyboard on the computer~~ | Header button **అ Telugu typing: OFF/ON** (or **F2**). Type the sound in English letters; the word becomes Telugu at **space / Enter / punctuation**, and a live hint shows `bhaarata → భారత`. |
| Where it works | – | Only Telugu boxes: question, options and explanation in తెలుగు, Telugu titles (Topic Tests, Notes, Current Affairs, Announcements, Exam names) and the Bulk Import text box. They get a dashed yellow outline while ON. English boxes are never changed. |
| Keep a word in English | – | start it with `\` → `\APPSC` stays APPSC |
| Help | – | **?** button: full letter chart + examples + a practice pad with Copy |

Examples: `amma` అమ్మ · `telugu` తెలుగు · `praSna` ప్రశ్న · `samaadhaanaM` సమాధానం · `aaMdhrapradES` ఆంధ్రప్రదేశ్ · `kRuShNa` కృష్ణ · `jnaanaM` జ్ఞానం · `kriMdi` క్రింది.
Rules: capital letters matter (t త / T ట, d ద / D డ, n న / N ణ, l ల / L ళ, s స / S శ / Sh ష), `aa ii uu` or `A I U` for long vowels, `E O` for ఏ ఓ, `M` = ం, `H` = ః. The virama ్ is added automatically.

### 2. Match-the-following tables from PDFs
| | Old version (V7–V12) | V13 |
|---|---|---|
| Table border lines | ~~read as text, or the whole table skipped (History Q6)~~ | **Erased before OCR**, so the cells are read |
| Two-column rows | ~~split at the first "/", so the left Telugu was glued to the right column's English~~ | Each row is split into left and right: English line `a) Green Revolution  \|  i) Fish production`, Telugu line `a) హరిత విప్లవం  \|  i) చేపల ఉత్పత్తి` |
| Row markers | ~~OCR gave `1)`, `11)`, `1)` for i, ii, d~~ | **Renumbered in order**: a b c d / i ii iii iv / 1 2 3 4 / A B C D. Headers become List-I / List-II and జాబితా-I / జాబితా-II. |

Tested on your PDFs: Geography Q1 (Coast–State) and Q7 (Revolution–Product), History Q6 (Mahajanapada–Capital). All rows are correct in English and Telugu.

### 3. "Already Uploaded"
Before anything is imported (Topic Test file, CSV/JSON, PDF or pasted text) the app checks the database:
- the **same test title + Set** already exists, **or**
- **60% or more of the questions** are already in the question bank.

If so, a pop-up says **⚠ Already Uploaded**, names the existing test, and nothing is imported. A PDF shows the pop-up as soon as it is read. If only a few questions are repeats, they are skipped and the rest are imported ("skipped N already in the bank").

### 4. 🗑 Delete test + its questions (🎯 Topic Tests)
| Old version | V13 |
|---|---|
| ~~Delete removed only the test; the questions stayed in the bank~~ | **Delete test** (as before) and **🗑 Delete test + its questions**. It removes the test and its questions, but keeps questions that other tests also use. Then Publish. |

### 5. GitHub limit raised to 25 MB per file (like Power Pulse)
| | Old version (V1–V12) | V13 |
|---|---|---|
| Publish method | ~~Contents API, one file at a time (comfortable only up to 1 MB per file)~~ | **Git Data API (blobs → tree → commit): all changed files in ONE commit**, any data file **up to 25 MB**. If it fails, it falls back to the old method. |
| PDFs for Notes & Concepts | ~~Cloudinary only~~ | also **⬆ Upload PDF to GitHub (≤ 25 MB)** → saved in the repo's `media/notes/` folder |
| Question image / video upload | ~~Cloudinary only (error if not set)~~ | if Cloudinary is not set, uploads go **to GitHub automatically** (`media/images/`, `media/videos/`, ≤ 25 MB). For longer videos use a YouTube (unlisted) link. |
| Settings reminder | ~~"Not set yet: Cloudinary"~~ | Cloudinary is **optional** now |
| Phone cache | – | big PDFs and videos are loaded from the network, not copied into every phone's cache (*Save offline* still works for PDFs) |
| Storage report | sizes only | shows the 25 MB limit and the largest data file |
| Big imports | ~~very slow for thousands of questions~~ | fast (4,000 questions in about 2 s). If a change is too big to keep in the browser, a message says to Publish before closing. |

GitHub itself: files over 100 MB are refused and the whole site should stay under 1 GB. Big PDFs every week will fill that, so use Cloudinary or Google Drive links for very large media.

**Files changed in V13:**
```
KJ_V13_upload_telugu_typing_tables_pack/
├── teacher.html             *NEW* Telugu typing button + ?, styles
├── sw.js                    *NEW* cache kj-v13, big media not cached
├── README.md                *NEW* this section
└── assets/js/
    ├── telugu.js            *NEW FILE* Telugu typing (offline)
    ├── teacher.js           *NEW* tables, Already Uploaded, delete test + questions, 25 MB GitHub publish/upload, fast import
    └── config.js            *NEW* VERSION V13 (keep your own config.js – optional)
```
⚠ The zip has **no `data/` folder** (your tests are safe). Keep your own `config.js` (change only `VERSION: "V13"` if you like).

**Fix your Geography test** (the one imported from the PDF with mixed-up tables):
1. Upload V13, then reload teacher.html twice.
2. 🎯 Topic Tests → on that test click **🗑 Delete test + its questions**.
3. 📥 Bulk Import → either choose `KJ_Geography_Polity_Set_S_topic_test.json` (exact text, answers and explanations), or **📄 Read PDF** again (tables now correct) + answer key → Import.
4. 🚀 Publish.

**Tested:**
- Real PDFs: Geography 18 pages (60 s) and History 11 pages (68 s); tables correct.
- Already Uploaded: the same Topic Test file twice, then the same paper as PDF, then Import, gave the pop-up each time with nothing added.
- 🗑 Delete test + its questions removed the test and its 30 questions.
- Telugu typing: క్రింది వాక్యాలను పరిశీలించండి., `\APPSC` kept, English box unchanged, live hint, practice pad.
- GitHub, with a stand-in API: a 3.87 MB data file in one commit, a 3 MB PDF to `media/notes/`, a 27 MB file refused, and an image sent to GitHub when Cloudinary isn't set.
- No script errors.

---

## 0.11 Old version – what changed in V12 (2026-10-23) – Back to Test + phone button grid (Student Mode, exam hall)

| Place | Old version (V8–V11) | V12 |
|---|---|---|
| Palette, below *Submit Test* | ~~nothing (phone: tap outside or ☰ again to close)~~ | **↩ Back to Test** button (Telugu: పరీక్షకు తిరిగి వెళ్లు), on phone and PC. Phone: closes the palette and shows the question. PC: goes to the top of the current question with a short highlight. |
| Phone – 4 buttons under the question | ~~uneven sizes, wrapped in two untidy rows~~ | **Equal 2 × 2 grid**: *Mark for Review & Next* · *Edit Answer* / *◀ Previous* · *Save & Next ▶*. Same width and height (46 px), text centred, clear of the phone's bottom bar. |
| PC – button bar | (V8 layout) | unchanged |
| Palette name | ~~showed "Candidate" until the next question~~ | student's name from the start |
| Language switch in exam hall | ~~question only~~ | also relabels the 4 buttons, Submit Test and Back to Test |

**Files changed in V12:**
```
KJ_V12_upload_back_to_test_pack/
├── sw.js                    *NEW* cache kj-v12
├── README.md                *NEW* this section
└── assets/
    ├── css/app.css          *NEW* phone 2 × 2 grid, highlight
    └── js/
        ├── exam.js          *NEW* Back to Test, name, relabel
        ├── common.js        *NEW* label "Back to Test" (EN + TE)
        └── config.js        *NEW* VERSION V12
```
⚠ The zip has **no `data/` folder** (your tests are safe). If your Google Sheet URL is already in `config.js` on GitHub, don't overwrite it; change only `VERSION: "V12"` there.

**Tested:**
- **Phone (Pixel 7):** the 4 buttons are 190 × 46 each, two per row. ☰ opens the palette, and *Back to Test* closes it with the question showing.
- **PC (1920 px):** *Back to Test* stays on the current question.
- **Telugu:** the label changes to పరీక్షకు తిరిగి వెళ్లు.
- No script errors.

---

## 0.12 Old version – what changed in V11 (2026-10-23) – Teacher login removed from Student Mode

| Place | Old version (V1–V10) | V11 |
|---|---|---|
| Student → 👤 Profile, last card | ~~KONCEPT JUNCTION V… · build … / Contact: mail · phone / **Teacher login** link~~ | **Card removed.** Profile now ends with *Data on this phone*. No link to the Teacher page anywhere in Student Mode. |
| How the teacher opens Teacher Upload | ~~Profile → Teacher login~~ | Type or bookmark **`https://konceptjunction.github.io/V1/teacher.html`** (still protected by Setup Code + PIN) |

**Files changed in V11:**
```
KJ_V11_upload_hide_teacher_login_pack/
├── sw.js                    *NEW* cache kj-v11
├── README.md                *NEW* this section
└── assets/js/
    ├── app.js               *NEW* Profile card removed
    ├── common.js            *NEW* comment no longer names the teacher page
    └── config.js            *NEW* VERSION V11
```
⚠ The zip has **no `data/` folder** (your tests are safe). If your Google Sheet URL is already in `config.js` on GitHub, don't overwrite it; change only `VERSION: "V11"` there. If you haven't done the one-time Google Sheet script update from V10 yet, see section 0.12.

**Tested:** Profile shows no "Teacher login", no contact or version line, and no link to the teacher page. Save and *Data on this phone* still work. `teacher.html` still opens directly with the PIN screen. No script errors.

---

## 0.13 Old version – what changed in V10 (2026-10-23) – already-registered students are recognised by Mail ID

| Place | Old version (V4–V9) | V10 |
|---|---|---|
| First page order | ~~Name, Mail ID, Exam, College~~ | **Mail ID first**, then Name, Exam, College. Line added: *"Already registered? Type the same Mail ID."* (EN + TE) |
| Typing a known Mail ID | ~~student had to register again, which added a second row in the sheet~~ | App checks the sheet → green notice **"✔ Ravi Kumar, you are already registered (Police SI…)" + [Continue as Ravi]**. Name, Exam and College fill in automatically. One tap opens the app with the **same student record**. |
| Pressing Continue with a known mail | ~~new student created~~ | Treated as the same student: no new row. Any changed exam or college updates the existing row. |
| Capital letters in the mail | ~~Ravi.K@Gmail.com ≠ ravi.k@gmail.com~~ | Same student. Mails are saved in small letters. |
| Google Sheet script | ~~matched rows by Student ID only~~ | **Matches by Student ID, or else by Mail ID**, so one mail = one row. New `?action=lookup&email=` check for the app. |
| No internet / sheet not set | – | Registration still works on the phone and is sent later (same as before) |

### ⚠ One-time: update the Google Sheet script (needed for V10)
1. Open your **KONCEPT JUNCTION – Students** sheet → **Extensions → Apps Script**.
2. Select all the old code in `Code.gs` and delete it → paste the whole new `tools/google_apps_script_students.gs`.
3. Put **your own READ_KEY** back in the line `const READ_KEY = "…";` (same key as in Teacher Settings) → 💾 Save.
4. **Deploy → Manage deployments → ✏️ (Edit) → Version: New version → Deploy.** The `/exec` URL stays the same, so config.js and Teacher Settings need no change. Don't use "New deployment", because that gives a new URL.
5. Check: open `your-exec-URL?action=lookup&email=YOUR-TEST-MAIL` in a browser → `{"ok":true,"found":true,…}`.

Students who registered twice before V10 already have 2 rows; delete the extra row in the sheet if you like. From V10 on, no new duplicates are made.

**Files changed in V10:**
```
KJ_V10_upload_registered_mail_check_pack/
├── sw.js                                  *NEW* cache kj-v10
├── README.md                              *NEW* this section
├── assets/css/app.css                     *NEW* green "already registered" notice
├── assets/js/app.js                       *NEW* Mail ID check on the first page
├── assets/js/config.js                    *NEW* VERSION V10
└── tools/google_apps_script_students.gs   *NEW* lookup + one row per mail
```
⚠ The zip has **no `data/` folder** (your tests are safe). If your Google Sheet URL is already in `config.js` on GitHub, don't overwrite it; change only `VERSION: "V10"` there.

Privacy note: the lookup gives back only name, exam and college for an exact Mail ID, never mobile or the full list. The full list still needs the READ_KEY.

**Tested:**
- The sheet script, run against a mock sheet: finds `Ravi.K@Gmail.com` as `ravi.k@gmail.com`, an unknown mail returns not found, and the same mail from a 2nd phone keeps 1 row with the exam updated.
- In the browser, 5 phones against a stand-in sheet:
  1. A new mail registers (1 row).
  2. A 2nd phone with the same mail shows the notice and fills in the details; *Continue as Ravi* opens Home with the same ID (still 1 row).
  3. A 3rd phone filling the form and pressing Continue uses the same ID and updates the exam (still 1 row).
  4. A different mail adds a 2nd row.
  5. With no sheet set, registration still works.
- No script errors.

---

## 0.14 Old version – what changed in V9 (2026-10-23) – Bulk Import screen layout (Teacher Mode)

| Place | Old version (V6–V8) | V9 |
|---|---|---|
| Right card heading and help text | ~~📊 CSV / JSON / Topic Test file + explanation + CSV column list~~ | **Removed** |
| ⬇ CSV template and Choose file buttons | ~~in the right card~~ | **Left card, same row as 📄 Read PDF question paper**: `📄 Read PDF question paper · ⬇ CSV template · 📂 CSV / JSON / Topic Test file`. Their messages show just below that row. |
| Subject, Topic, Exams, Also create a Topic Test, Visible, Set, Test title | ~~left card, under the answer key~~ | **Right card "🎯 Subject & Topic Test"** |
| Left card now | – | buttons → help line → text box → Answer key → Preview / Import → preview list |
| Teacher page width | ~~1180 px~~ | **1320 px**, so the three buttons fit in one row on a laptop |

How it works is unchanged: a Topic Test file still brings its own subject and test settings, while PDF and pasted text use the right card.

**Files changed in V9:**
```
KJ_V9_upload_bulk_import_layout_pack/
├── teacher.html             *NEW* page width 1320 px
├── sw.js                    *NEW* cache kj-v9
├── README.md                *NEW* this section
└── assets/js/
    ├── teacher.js           *NEW* Bulk Import layout
    └── config.js            *NEW* VERSION V9
```
⚠ The zip has **no `data/` folder**, so your published questions and Topic Tests are safe. If your Google Sheet URL is already in `config.js` on GitHub, don't overwrite it; change only `VERSION: "V9"` there.

**Tested** (1920 px laptop, 400 px phone): the red-marked text is gone, the three buttons sit in one row, and every right-card field is in the right card. CSV template downloads. The Topic Test file imported 30 Qs and created the test. The English PDF was read (Set S and title filled in on the right), imported, and Publish showed 2 changes. No sideways scroll on the phone, no script errors.

---

## 0.15 Old version – what changed in V8 (2026-10-23) – exam hall buttons (Student Mode)

| Place | Old version (V1–V7) | V8 |
|---|---|---|
| 2nd button | ~~Clear Response~~ | **✏️ Edit Answer** (Telugu: సమాధానం మార్చు) – frees the saved answer of this question so the student can choose again; message *"Choose your new answer, then press Save & Next"* |
| Button bar position | ~~full width, under the palette too; Previous / Save & Next at the far right corner~~ | **Only under the question area.** Left: *Mark for Review & Next*, then a gap, then *✏️ Edit Answer*. Right of the question area: *◀ Previous* and *Save & Next ▶*. The palette column now runs full height. |
| Palette button | ~~Submit~~ | **Submit Test** (Telugu: పరీక్ష సమర్పించు) |
| Phone | – | Buttons wrap to two rows: Mark / Edit Answer, then Previous / Save & Next on the right |

**Files changed in V8:**
```
KJ_V8_upload_exam_hall_buttons_pack/
├── sw.js                    *NEW* cache kj-v8
├── README.md                *NEW* this section
└── assets/
    ├── css/app.css          *NEW* button bar under the question area
    └── js/
        ├── exam.js          *NEW* new layout, Edit Answer
        ├── common.js        *NEW* labels Edit Answer / Submit Test (EN + TE)
        └── config.js        *NEW* VERSION V8
```
⚠ If your Google Sheet URL is already in `config.js` on GitHub, don't overwrite it; change only `VERSION: "V8"` there. Your questions and Topic Tests (`data/`) are not touched. Don't upload the pack's `data/` folder, because it would replace the tests you published.

**Tested** (1920 px desktop and Pixel 7 phone): Q1 answered B → Save & Next → Previous → Edit Answer cleared the choice → chose C → Save & Next, and the saved answer is C. The bar ends where the palette starts, the palette shows *Submit Test*, there's no sideways scroll on the phone, and no script errors.

---

## 0.16 Old version – what changed in V7 (2026-10-22) – read a PDF question paper directly

| Place | Old version (V1–V6) | V7 |
|---|---|---|
| Teacher → 📥 Bulk Import | ~~Only pasted text (from Word) or prepared JSON files; PDFs not accepted~~ | **📄 Read PDF question paper** button. English-only PDFs are read as text (exact, ~1 s). PDFs with Telugu or scanned PDFs are read with **OCR English + Telugu** (~5–10 s per page on a laptop). The text fills the box for you to check. |
| Paper format understood | ~~Options A) … only; "1. 2. 3." statement lists inside a question were wrongly split into new questions~~ | Questions only start at the **next number** (1, 2, 3 …), so statement lists stay inside. Options may be `A)`, `(A)`, `(1)`, or all on one line `(A) In (B) On (C) At (D) By`. A second Telugu `A)–D)` list is joined to the same options. `(A): statement` lines stay in the question. |
| OCR mistakes fixed automatically | – | Header/footer and watermark text removed. Misread option letters `0)`, `(9)`, `(8)`, `DY` are corrected to the expected B/C/D. `4,` becomes `4.`. Arrows read as `>` become `→`. |
| Set and title | – | Set letter (e.g. **S** in the top-right box) and title taken from the PDF. *Also create a Topic Test* is ticked. |
| Topic Test from paste/PDF | ~~created hidden~~ | **Visible to students** checkbox (ticked by default) |
| Preview | count only | Shows in red how many questions have **no answer key**, and lists questions without 4 options |

**What the PDF button cannot do** (you still do these):
1. **Answer key** – the PDFs have none. Type it in the *Answer key* box: `1-B 2-C 3-D …`.
2. **Diagrams** (e.g. a circuit) are not read. After import, open the question in ➕ Add / Edit and ⬆ Upload the picture.
3. **Explanations** are empty. Add them in Add / Edit if you want students to see them.
4. **Telugu spelling** – OCR is about 95% right. Read the box and correct words such as `8908` → `క్రింది` before pressing Import.
5. **One subject per import** – questions go into the subject you choose (e.g. History). The ready-made Topic Test files from section 0.11 keep each question's own subject.

**Files changed in V7:**
```
KJ_V7_upload_pdf_import_pack/
├── sw.js                    *NEW* cache kj-v7
├── README.md                *NEW* this section
└── assets/js/
    ├── teacher.js           *NEW* PDF reader, smarter paper parser
    └── config.js            *NEW* VERSION V7
```
Uses pdf.js 3.11.174 (cdnjs) and tesseract.js 5.1.1 (jsdelivr). Both load only when you press the PDF button; the Telugu reader (~15 MB) downloads once and is then cached by the browser.
⚠ If you already put your Google Sheet URL into `config.js` on GitHub, don't overwrite it; change only `VERSION: "V7"` there.

**Tested** (desktop Chrome, with the real PDFs):

| PDF | Read as | Time | Questions found | Problems left after fixes |
|---|---|---|---|---|
| KJ_ENGLISH (7 pages) | text | 1 s | 30 / 30 | none |
| GENERAL_SCIENCE (8 pages) | OCR | 50 s | 30 / 30 | a few Telugu letters; Q30 diagram must be uploaded |
| KJ_GEOGRAPHY_SET1 (18 pages) | OCR | 46 s | 22 / 22 | a few Telugu letters |
| KJ_HISTORY (11 pages) | OCR | 58 s | 35 / 35 | a few letters (e.g. Q12 "S. R. Rao") |

History was then imported with its answer key as Topic Test "History & National Movement" (Set S, 35 Qs, Visible), published to a test copy, and opened by a registered student on a phone. Q3 statements and options showed correctly. No script errors.

---

## 0.17 Old version – what changed in V6 (2026-10-22) – one-step Topic Test import

| Place | Old version (V1–V5) | V6 |
|---|---|---|
| Teacher → 📥 Bulk Import | ~~JSON import added questions only; Topic Test had to be made by hand in 🎯 Topic Tests and every question ID pasted~~ | **Topic Test file**: one file = questions **+** Topic Test (subject, topic, Set, title EN/TE, minutes, marks, negative, Visible). Choose it, and it's done. |
| Same file chosen twice | – | Asks *"already imported – import again?"* so you don't get duplicates |
| Button | ~~Choose CSV / JSON~~ | **Choose CSV / JSON / Topic Test file** (highlighted) |

**Topic Test file format** (`…_topic_test.json`):
```json
{ "topic_test": { "key": "kj-gs-set-s", "subject": "science", "topic": "Biology, Physics, Chemistry & Environment",
                  "set": "S", "title": { "en": "General Science – Set S", "te": "సాధారణ శాస్త్రం – సెట్ S" },
                  "duration_min": 30, "mark": 1, "negative": 0.25, "visible": true },
  "questions": [ { "id": "sci-0201", "type": "mcq", "subject": "science", … } ] }
```

**First four Topic Test files (Set S)**, made from BALAJI SIR's PDFs with Unicode Telugu, answers and explanations:

| File | Questions | Students see it under |
|---|---|---|
| `KJ_General_Science_Set_S_topic_test.json` | 30 (Q30 includes the circuit diagram) | 🔬 General Science |
| `KJ_English_Set_S_topic_test.json` | 30 | 🔤 General English |
| `KJ_Geography_Polity_Set_S_topic_test.json` | 22 (geography, polity, economy, AP, current affairs) | 🌏 Geography |
| `KJ_History_Set_S_topic_test.json` | 35 (history, AP history, culture) | 🏛️ Indian History |

**Files changed in V6:**
```
KJ_V6_upload_topic_test_bundle_import_pack/
├── sw.js                    *NEW* cache kj-v6
├── README.md                *NEW* this section
└── assets/js/
    ├── teacher.js           *NEW* Topic Test file import
    └── config.js            *NEW* VERSION V6
```
All earlier changes are included (sections 0.1–0.4). ⚠ If you already typed your Google Sheet URL into `config.js` on GitHub, don't overwrite it; change only `VERSION: "V6"` there. Skip `data/papers.json` if you have published your own Topic Tests.

**Tested:** all four files imported (30 + 30 + 22 + 35 questions and 4 Topic Tests, 0 missing IDs). Choosing a file again is blocked. After publishing to a test copy, a student registered, saw the tests grouped by subject, and opened General Science – Set S with a 30:00 timer. Q30 showed the circuit picture, and the test submitted and scored with −0.25 per wrong. `validate_bank.py` reports OK. No script errors.

---

## 0.18 Old version – what changed in V5 (2026-10-22) – Teacher mode fixes

| Place | Old version (V1–V4) | V5 |
|---|---|---|
| ⚙️ Settings (GitHub, Cloudinary, Google Sheet) | ~~Last tab, hidden off-screen to the right of Exams (tab row scrolled sideways)~~ | **Tabs wrap onto 2 lines, so every tab is visible.** Also a **⚙️ Settings button in the header** (top-right) and a yellow reminder bar *"Not set yet: GitHub token, Cloudinary – Open Settings"* until they are filled. |
| Exams tab | ~~🎯 Exams – raw JSON code in a text box~~ | **📋 Exam Patterns – a form for each exam:** name EN/TE, board, minutes, marks per question, **negative-marking dropdown** (none, −1/4, −1/3, −1/5, −1/2), **subject → questions table** (add ✕ remove, shows how many MCQs your bank has), note, ↑↓ order, Delete, ➕ Add exam, Undo, *Save exam patterns* with clear error messages. JSON kept only under *Advanced* (closed). |
| Tab icons | ~~Topic Tests and Exams both 🎯~~ | Topic Tests 🎯 · Exam Patterns 📋 |
| `config.js` GitHub | ~~`YOUR_GITHUB_ID` / `koncept-junction`~~ | **`konceptjunction` / `V1`** (from your link `konceptjunction.github.io/V1/`) |

**Files changed in V5:**
```
KJ_V5_upload_teacher_settings_exam_form_pack/
├── teacher.html            *NEW* tabs wrap, header ⚙️ Settings button
├── sw.js                   *NEW* cache kj-v5
├── README.md               *NEW* this section
└── assets/js/
    ├── teacher.js          *NEW* Exam Patterns form, Settings reminder
    └── config.js           *NEW* owner konceptjunction, repo V1, VERSION V5
```
All V4, V3, V2 changes are included (sections 0.1–0.3).
⚠ Skip `data/papers.json` if you have published your own Topic Tests. `config.js` is safe to upload unless you already typed your Google Sheet URL into it on GitHub; in that case copy that URL into the new file first.

**How to upload V5:** GitHub repo **V1** → Add file → Upload files → drag all contents of `KJ_V5_upload_teacher_settings_exam_form_pack` → Commit → wait 1–3 min → open `teacher.html` and reload twice.
Repo `V1` is your **permanent** repo. Keep uploading new packs into it; don't create V2/V3 repos.

**Tested:** desktop 1366 px and phone 400 px. All tabs show, including ⚙️ Settings, with no sideways scroll on the phone. The header Settings button opens Settings with konceptjunction / V1 filled in. On Exam Patterns, the minutes and negative marking change, adding a subject updates the total (155 Qs · 120 min · +1 / −0.25), a subject listed twice is blocked with a message, a new exam "DSC SGT" can be added, and Save marks *🚀 Publish (1)*. No script errors.

---

## 0.19 Old version – what changed in V4 (2026-10-22) – first-page registration + Google Sheet register

| Place | Old version (V1–V3) | V4 |
|---|---|---|
| First page | ~~App opened straight on Home~~ | **Plain, clean first page** (logo, KONCEPT JUNCTION, DREAM TO ACHIEVE, 4 fields, Continue). No top bar or bottom bar until registered. Shown **once** per phone. |
| Fields | ~~Profile: Name, Mobile (optional)~~ | **Student name · Mail ID · Exam to be prepared · College name** (all required, checked) + *Other exam* box. Mobile stays optional in Profile. |
| Exam selected | ~~chosen on Home only~~ | **Registration exam becomes the Target exam.** Changing the Target exam on Home updates the sheet too. |
| Teacher master data | ~~none~~ | **Google Sheet "Students"** filled automatically: Registered On, Student ID, Name, Mail ID, Exam, Exam ID, College, Mobile, Last Seen, Days Active, App Version, Device |
| No internet at registration | – | Saved on phone and **sent automatically** when online / next open |
| Profile (top-right) | ~~Name + Mobile~~ | **Edit the 4 details + Mobile** → Save updates the same sheet row (no duplicates). Shows *✔ Sent* or *⏳ Will be sent*. |
| Teacher Upload | – | **👥 Students tab**: Total students, New this week, Active last 7 days, Colleges, By exam, Top colleges, search, exam filter, CSV download |
| Teacher Settings | – | **📋 Google Sheet** card: Web app URL + Read key + *Test sheet* |

**Files changed in V4:**
```
KJ_V4_upload_student_register_sheet_pack/
├── sw.js                                   *NEW* cache kj-v4, Google Script not cached
├── README.md                               *NEW* this section
├── assets/
│   ├── css/app.css                         *NEW* first-page styles
│   └── js/
│       ├── app.js                          *NEW* first page, sync to sheet, Profile fields
│       ├── teacher.js                      *NEW* 👥 Students tab, Settings → Google Sheet
│       └── config.js                       *NEW* SHEET.webapp_url, VERSION V4
└── tools/
    └── google_apps_script_students.gs      *NEW* paste into the Google Sheet (Apps Script)
```
All V3 and V2 changes are included (sections 0.1 and 0.2).
⚠ `config.js`: if you already edited it on GitHub, don't overwrite it. Add the new `SHEET: { webapp_url: "…" },` block and `VERSION: "V4"` there instead. `data/papers.json` is unchanged in V4, so skip it if you have published your own tests.

### Google Sheet setup (one time, with the new Gmail)
1. Open **sheets.google.com** → **Blank** → name it `KONCEPT JUNCTION – Students`.
2. **Extensions → Apps Script** → delete the sample code → paste the whole of `tools/google_apps_script_students.gs`.
3. In line `const READ_KEY = "CHANGE-THIS-KEY";` type your own key (e.g. `KJ-Balaji-7391`). It lets only the Teacher page read the list.
4. 💾 **Save** → **Deploy → New deployment** → ⚙️ **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   → **Deploy** → **Authorize access** → choose the new Gmail → *Advanced → Go to (unsafe)* → **Allow** (it's your own script).
5. Copy the **Web app URL** (`https://script.google.com/macros/s/…/exec`).
6. Paste it into `assets/js/config.js`:
   ```js
   SHEET: { webapp_url: "https://script.google.com/macros/s/…/exec" },
   ```
   and upload `config.js` to GitHub (`assets/js/`).
7. Teacher Upload → **⚙️ Settings → 📋 Google Sheet** → paste the same URL + your READ_KEY → **Save settings** → **Test sheet** → *✔ Connected – N students · key OK*.
8. Open the student link on a phone → register → the row appears in the sheet within seconds → **👥 Students** tab → ⟳ Refresh.

If you edit the script later: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**, so the URL stays the same.

**How to upload V4:** GitHub repo → Add file → Upload files → drag all contents of `KJ_V4_upload_student_register_sheet_pack` (minus the ⚠ files, if they apply) → Commit → reopen the app twice.

**Tested (mobile Pixel 7 profile + a stand-in for the Google script):** first page has no top or bottom bar. Empty name, bad mail (`ravi@gmail`) and missing college each show a clear message. Registration sends one row and lands on Home with the Target exam set to the chosen exam. A reload does not ask again. A Home exam change and a Profile edit update the same row. A second phone using *Other exam (DSC SGT)* adds a second row. Teacher → Test sheet showed ✔ 2 students · key OK, and the 👥 Students tab showed counts, By exam and Top colleges. The Apps Script itself was run against a mock sheet: it adds, updates without duplicates, counts, and rejects a wrong key. No script errors.

---

## 0.20 Old version – what changed in V3 (2026-10-22) – Student Mode navigation

| Place | Old version (V1/V2) | V3 |
|---|---|---|
| Profile | ~~5th button in bottom bar~~ | **Round button at the top-right corner** of the header (shows the student's first letter after the name is saved) |
| Bottom bar – 2nd | ~~📘 Practice~~ | **📚 Subjects** (same subject → topic practice; tile now shows accuracy % per subject) |
| Bottom bar – 4th | ~~📄 Model Papers~~ | **🎯 Topic Tests** – grouped by Subject, filter chips, topic line, *Best score · attempts · View*, button changes to *Retake* |
| Bottom bar – 5th | ~~👤 Profile~~ | **📊 Performance** |
| Home tile | ~~📊 Results – n attempts~~ | **📊 Performance – n tests · accuracy** |
| Telugu labels | ~~సాధన / మోడల్ పేపర్లు / ప్రొఫైల్~~ | **సబ్జెక్టులు / టాపిక్ టెస్టులు / పనితీరు** |

**Performance screen – fields mapped**

| Field | Comes from |
|---|---|
| Tests taken, Average score, Best score, Test accuracy, Time in tests | all saved test results (was the Results list) |
| Practice Qs, Practice accuracy | Subjects practice answers |
| Daily streak | Daily Quiz |
| Score trend (last 10 tests, %) | test results |
| Subject-wise accuracy – Tests / Practice / Overall bar | cumulative per-subject counters `tstat_sub`, `pstat_sub` |
| Weak topics (below 70 %, 2+ attempts) → *Practise* button opens that topic | per-topic counters |
| Strong topics (80 %+) | per-topic counters |
| By test type – Mock / Topic Tests / Daily / Custom | test results |
| Recent tests with *View* (old Results list) | test results |
| Wrong Answers, Bookmarks shortcuts | existing lists |

Old results from V1/V2 are counted automatically the first time V3 opens. Old links `#/practice`, `#/papers`, `#/history` still open the new screens.

**Teacher Upload:** tab ~~📄 Model Papers~~ → **🎯 Topic Tests**, with new **Subject** and **Topic** fields per test. Bulk Import: ~~"Also create a Model Paper"~~ → **"Also create a Topic Test"** (takes the import's subject and topic). New test ids start `KJ-TT-` (old `KJ-MP-001` kept).

**Files changed in V3:**
```
KJ_V3_upload_student_nav_performance_pack/
├── home.html                 *NEW* profile button in header
├── sw.js                     *NEW* cache kj-v3
├── README.md                 *NEW* this section
├── assets/
│   ├── css/app.css           *NEW* profile button, performance bars, trend chart
│   └── js/
│       ├── app.js            *NEW* nav, Subjects, Topic Tests, Performance, profile button
│       ├── common.js         *NEW* labels EN/TE
│       ├── exam.js           *NEW* saves subject/topic counters after every test
│       ├── teacher.js        *NEW* Topic Tests tab + Subject/Topic fields
│       └── config.js         *NEW* VERSION V3
├── data/papers.json          *NEW* subject + topic for KJ-MP-001
└── tools/validate_bank.py    *NEW* checks topic-test subject
```
⚠ `data/papers.json`: if you already created tests in Teacher Upload and published them, **don't upload this file** (it would replace your tests). Add Subject/Topic to your existing tests in Teacher → Topic Tests instead. Same for `config.js` if you already edited it on GitHub (change only `VERSION: "V3"` there).

**How to upload V3:** GitHub repo → Add file → Upload files → drag all contents of `KJ_V3_upload_student_nav_performance_pack` (minus the files in the ⚠ note, if they apply) → Commit. After 1–3 min reopen the app twice.

**Tested (mobile Pixel 7 profile):** profile button opens Profile and shows the name's letter; bottom bar reads Home · Subjects · Mock Tests · Topic Tests · Performance; practice + topic test fill Performance (subject table, weak topic Biology 29 % with Practise link, Topic Tests 47 %); topic test card shows Best 3.75/8 · 1 attempt; old `#/history` link opens Performance; Teacher → Topic Tests shows Subject/Topic fields; no script errors.

---

## 0.21 Old version – what changed in V2 (2026-10-22)

| | Old version (V1) | V2 |
|---|---|---|
| Teacher login – PIN box | ~~Typing in the PIN box did nothing on PC or mobile. The Enter-key handler returned `false`, which blocked every key.~~ | **PIN box accepts typing. Enter in the Setup Code or PIN box unlocks.** |
| `sw.js` cache | ~~`kj-v1`~~ | **`kj-v2`**, so phones drop the old teacher.js |
| `config.js` VERSION | ~~V1 / 2026-10-21~~ | **V2 / 2026-10-22** |

**Files changed:**
```
KJ_V2_upload_fix_pin_entry_pack/
├── sw.js                    *NEW* VERSION kj-v2
├── README.md                *NEW* this section
└── assets/js/
    ├── teacher.js           *NEW* PIN fix (lock screen)
    └── config.js            *NEW* VERSION V2
```
All other files are the same as V1. If you already edited `config.js` on GitHub, don't overwrite it; change only `VERSION: "V2"` there.

**Code change in `assets/js/teacher.js` (lock screen):**
```js
// Old version (V1) – returned false for every key except Enter → keys blocked
$("#lp").onkeydown = (e) => e.key === "Enter" && go();

// *NEW* (V2)
["#lc", "#lp"].forEach((id) => {
  const f = $(id);
  if (f) f.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); go(); }
  });
});
```

**How to upload V2:**
1. GitHub repo → **Add file → Upload files**.
2. Drag **all contents** of `KJ_V2_upload_fix_pin_entry_pack` (same as the first time). GitHub replaces the changed files.
3. **Commit changes**.
4. After 1–3 min open `teacher.html` and **reload twice** (or close and reopen the app) so the new version loads.

**Tested:** real key presses in Chrome desktop and a mobile (Pixel 7) profile. V1: PIN box stays empty. V2: PIN shows, unlocks with Enter and with the Unlock button; second visit (PIN only) also works.

---

## 1. What this app is

| | Old version — Power Pulse / EEE Practice (V123, kept as is) | KONCEPT JUNCTION V1 |
|---|---|---|
| Audience | EEE students (Power Systems, Measurements) | State level competitive exams – APPSC Group-I/II, TGPSC Group-II, Group-IV/VRO, Police SI/Constable, AE/AEE Electrical |
| Language | English | **English + Telugu bilingual** (EN / తెలుగు / both) – questions, options, explanations, UI |
| Brand | POWER PULSE · Notes by BALAJI SIR | **KONCEPT JUNCTION** logo, *DREAM TO ACHIEVE* – Notes by BALAJI SIR / Quick Revision Concepts by BALAJI SIR kept |
| Student link | `vineelapc-mobileapp.github.io/V43/home.html` (unchanged) | `https://<NEW_GITHUB_ID>.github.io/koncept-junction/home.html` |
| GitHub / Mail / Cloudinary | vineelapc accounts | **new IDs** – filled in one file: `assets/js/config.js` |

The Power Pulse app is **not touched**. This is a separate repo.

---

## 2. Folder tree

```
KJ_V23_upload_select_publish_logout_pack/      ← upload the CONTENTS of this folder to the repo root
├── index.html                 redirect → home.html
├── home.html                  STUDENT MODE (PWA)
├── teacher.html               TEACHER UPLOAD (Setup Code + PIN lock)
├── manifest.json              PWA install (name, icons, colour)
├── sw.js                      offline service worker (VERSION = kj-v1)
├── README.md                  this file
├── assets/
│   ├── css/app.css            all styles (light/dark, exam hall, palette)
│   ├── icons/
│   │   ├── logo.png           KJ round logo (student header, hero, exam hall)
│   │   ├── logo_original.jpg  the logo you sent
│   │   ├── watermark.png      faint logo printed behind question papers
│   │   ├── icon-192.png       app icon
│   │   └── icon-512.png       app icon / splash
│   └── js/
│       ├── telugu.js          Telugu typing (Teacher)
│       ├── config.js          ★ ONLY file to edit for new mail / GitHub / Cloudinary / lock
│       ├── common.js          helpers, bilingual text, KaTeX, video player, PDF offline, PAPER PRINT
│       ├── exam.js            exam-hall engine, timer, palette, negative marking, result
│       ├── app.js             student screens
│       └── teacher.js         teacher upload screens + GitHub publish + Cloudinary upload
├── data/
│   ├── subjects.json          11 subjects (id, file, EN/TE names)
│   ├── exams.json             6 exam patterns (sections, minutes, marks, negative)
│   ├── papers.json            topic tests (subject, topic, Set code, question ids, visible switch)
│   ├── notes.json             Notes / Concepts PDFs (Cloudinary URLs, visible switch)
│   ├── current_affairs.json   daily current affairs (EN/TE)
│   ├── announcements.json     notices / exam calendar
│   └── questions/
│       ├── polity.json  history.json  state.json  geography.json  economy.json
│       ├── science.json reasoning.json quant.json english.json eee.json
│       └── current.json       (empty – add your current-affairs MCQs)
└── tools/
    ├── hash_tool.html         make your own Setup Code / PIN hashes (offline)
    ├── google_apps_script_students.gs   student register script for Google Sheet
    └── validate_bank.py       checks all JSON before upload
```

---

## 3. Features (V1)

### Student Mode – `home.html`
- **KONCEPT JUNCTION logo** in header, home hero, profile and exam hall (from your image)
- **Target exam selector** (APPSC Gr-II, APPSC Gr-I, TGPSC Gr-II, Group-IV/VRO, Police SI, AE/AEE) – drives Daily Quiz & Full Mock
- **Language switch**: EN + తెలుగు / English / తెలుగు (also inside exam hall)
- **Options shown like your model paper**: `B) Rhizomes / భూగర్భ కాండాలు`; long ones put Telugu on the next line
- **TCS iON-style exam hall**: section tabs, palette (Not visited / Not answered / Answered / Marked / Answered & Marked), *Save & Next* (answer saved only on Save), *Mark for Review & Next*, *Clear Response*, timer with last-5-min red, auto-submit
- **Negative marking** per exam (e.g. −1/3, −1/4, −1/5) with section-wise score table
- **Resume test** after closing the app (timer keeps running like a real exam)
- ~~**Model Papers**~~ → **Topic Tests** (Set A/B/S…, grouped by subject) – take as timed test or print the paper
- **Daily Quiz** – same 10 questions for every student each day + 🔥 streak
- **Custom Test** – choose subjects, number of Qs, minutes, negative
- **Wrong-answer bank** + **Bookmarks** → one-tap *Retest these*
- **Current Affairs** and **Announcements / exam calendar**
- **Conventional (Mains) questions** in Practice with *Show model answer*
- **Performance** screen (subject-wise, weak topics, trend) and ~~Profile tab~~ → **Profile button top-right**
- Kept from Power Pulse: exam-hall UI, KaTeX maths, video solution gating (video only after answering / in review), Notes & Concepts PDFs with BALAJI SIR branding and teacher visibility switch, offline PWA, results history, print/PDF of result
- **Save PDF offline** button for each note (opens from phone cache without internet)
- Light / dark theme button

### Teacher Upload – `teacher.html`
- Kept: **Setup Code (once per device) + PIN** lock, GitHub publish via Contents API, Cloudinary media, Tesseract OCR, Conventional type, Word/PDF export, Storage report
- Bilingual question form (EN | TE side by side) with **live student preview**
- **Exam tags** per question + PYQ year + level + topic
- **Paste model-paper text** importer – understands exactly your paper format (`1.` question, Telugu line, `A) English / తెలుగు`, Telugu on next line) + answer key `1-B 2-C 3-D` → can also create a **Model Paper with Set code** in one click
- CSV / JSON bulk import with downloadable template (Excel-friendly, Telugu safe)
- ~~**Model Papers**~~ → **Topic Tests** tab: Subject, Topic, Set, title EN/TE, minutes, marks, negative, visible switch, question order
- **Print question paper in KJ layout** – big *KONCEPT JUNCTION*, *DREAM TO ACHIEVE*, Set box (top right), watermark logo, ruled questions, footer `[KONCEPT JUNCTION ]  [CONTACT: 9494780174]`, optional answer key page
- Exams tab – edit patterns (sections, minutes, negative) with validation
- Current Affairs and Announcements editors
- Unpublished changes are kept on the device until published; **Download as ZIP** fallback for manual upload
- GitHub token and Cloudinary details are typed in **Settings** (stored only in your browser, never in the repo)

### Data supplied in V1
- 42 sample bilingual questions across 10 subjects
- Your model paper (8 General Science questions, Set **S**) typed in Unicode Telugu with answers & explanations → `KJ-MP-001`
- ⚠ Exam patterns in `exams.json` are **defaults – verify each against the latest official notification** and edit in Teacher Upload → 📋 Exam Patterns.

---

## 4. Step-by-step setup (first time)

### Step 1 – New Gmail
1. Create the new Gmail (e.g. `konceptjunction…@gmail.com`).
2. Use it for GitHub, Cloudinary and later the domain / Play Store.

### Step 2 – New GitHub account + repo
1. github.com → Sign up with the new Gmail → pick the user name (this appears in the student link).
2. **New repository** → name `koncept-junction` → **Public** → Create.
3. **Add file → Upload files** → drag **everything inside** `KJ_V1_upload_initial_state_exam_pack/` (not the folder itself) → *Commit changes*.
4. **Settings → Pages** → Source *Deploy from a branch* → Branch `main` / `(root)` → Save.
5. After 1–3 min the link works: `https://<user>.github.io/koncept-junction/home.html`

> Keep `koncept-junction` as the **permanent repo** – future packs overwrite files in it, no new version folders (same lesson as V43).

### Step 3 – GitHub token for Teacher Upload
1. GitHub → *Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token*.
2. Repository access: **Only select repositories → koncept-junction**.
3. Permissions → Repository → **Contents: Read and write** (Metadata read is automatic).
4. Expiry: 90 days (calendar reminder to regenerate). Copy the `github_pat_…` token.

### Step 4 – Cloudinary
1. cloudinary.com → sign up with the new Gmail → note the **Cloud name** (Dashboard).
2. *Settings → Upload → Upload presets → Add* → Signing mode **Unsigned** → folder `koncept_junction` → Save → note the preset name.
3. *Settings → Security* → tick **Allow delivery of PDF and ZIP files** (needed for Notes PDFs).

### Step 5 – Edit `assets/js/config.js` (the only code edit)
```js
CONTACT_EMAIL: "YOUR_NEW_MAIL@gmail.com",   // ← new Gmail
GITHUB: { owner: "YOUR_GITHUB_ID", repo: "koncept-junction", branch: "main", path_prefix: "" },
CLOUDINARY: { cloud_name: "YOUR_CLOUD_NAME", upload_preset: "YOUR_UNSIGNED_PRESET", folder: "koncept_junction" },
```
Upload the edited `config.js` to `assets/js/` in the repo (replace).

### Step 6 – Change the lock (important)
Default: Setup Code `KJ-SETUP-2026`, PIN `1234`.
1. Open `tools/hash_tool.html` in any browser → type your own code + PIN → *Make hashes*.
2. Paste the output into `config.js → TEACHER_LOCK` → upload config.js.

### Step 7 – First teacher login
1. Open `https://<user>.github.io/koncept-junction/teacher.html` (bookmark it – there is no link to it in Student Mode).
2. Enter Setup Code + PIN → **Settings** tab → paste token, check Cloudinary values → *Save* → *Test connection* (should say ✔ Connected) → *Test upload*.

### Step 8 – Daily work
1. **Add / Edit** or **Bulk Import** (paste your Word paper text + answer key).
2. **Model Papers** → set *Visible* → print with/without key.
3. **Notes & Concepts** → upload PDF → visible.
4. **Publish** → *Publish N file(s)* → log shows ✔ for each file.
5. Students reopen the app after 1–3 minutes → new content appears (works offline after that).

### Step 9 – Test locally (optional, before uploading)
```bash
cd KJ_V1_upload_initial_state_exam_pack
python tools/validate_bank.py          # must end with: OK – data is valid
python -m http.server 8000             # then open http://localhost:8000/home.html
```
(Opening `home.html` by double-click will not load data – browsers block `file://` fetches.)

### Step 10 – Student install
Open the link in Chrome (Android) → ⋮ → **Add to Home screen / Install app**.

---

## 5. Model-paper paste format (Bulk Import)
```
1. Ginger and turmeric propagate naturally through:
అల్లం మరియు పసుపు సహజంగా ఏ విధమైన కాండాల ద్వారా వ్యాప్తి చెందుతాయి?
A) Tubers / దుంపలు
B) Rhizomes / భూగర్భ కాండాలు
C) Bulbs / కాండాలు
D) Runners / నేలపై పాకే కాండాలు
```
Answer key box: `1-B 2-C 3-D 4-B` · Copy text from the **Word** file. Your `TEST_PRINT.pdf` uses a legacy Telugu font, so text copied out of the PDF comes out garbled – use the Word source, or the OCR button (English + Telugu) on a photo/scan.

## 6. Question JSON format
```json
{ "id": "sci-0101", "type": "mcq", "subject": "science", "topic": "Biology",
  "exams": ["appsc_g2","group4"], "year": "APPSC 2023", "level": "easy", "paper": "KJ-MP-001",
  "q": { "en": "…", "te": "…" },
  "o": { "en": ["…","…","…","…"], "te": ["…","…","…","…"] }, "a": 1,
  "e": { "en": "explanation", "te": "వివరణ" }, "img": "", "video": "" }
```
`a` = 0 for A, 1 for B, 2 for C, 3 for D. `type: "conv"` → no `o`/`a`, `e` holds the model answer. Maths: `$R=\dfrac{V^2}{P}$`.

## 7. Next pack rule
1. Bump `VERSION` in `config.js` and `sw.js` (`kj-v23` → `kj-v24` next) whenever code files change.
2. Upload only the changed files; data changes go through Teacher → Publish (no pack needed).
3. In this README, new lines get ; previous *NEW* tags are removed but the lines stay under their version heading.

## 8. Version history
- **V23 (2026-10-24)** – $\color{red}{\textbf{*NEW*}}$ 🎯 Choose what to publish (ON/OFF, by subject / topic / test, drafts) and 🚪 Student Logout with results kept per Mail ID (see section 0).
- **V22 (2026-10-23)** – Maths kept exactly: Word powers/subscripts, Word equations, symbols, expression lines in all languages, typed 2^60 → 2⁶⁰ (see section 0.1).
- **V21 (2026-10-23)** – Word (.docx) test papers (exact text, numbering, tables, pictures, answer key) and Word notes pages (see section 0.2).
- **V20 (2026-10-23)** – OCR option cleanup: match codes repaired, junk removed, Telugu-as-numbers reported; 🔧 Fix OCR mistakes (see section 0.3).
- **V19 (2026-10-23)** – Timer starts fresh at every new test (with message); phones always load the newest app (see section 0.4).
- **V18 (2026-10-23)** – 📤 Share next to profile: QR code, WhatsApp, Mail, copy link, QR poster, 📷 scanner (see section 0.5).
- **V17 (2026-10-23)** – Fresh full timer for every test (pauses when leaving), 🧹 Clear all tests in Teacher Mode; includes V16 + V15 (see section 0.6).
- **V16 (2026-10-23)** – Bulk Import: Subject + Exam Type first (pop-up), then upload, then ③ Import (see section 0.7).
- **V15 (2026-10-23)** – Already Uploaded pop-up: 🔁 Reupload or ✋ No need of upload (see section 0.8).
- **V14 (2026-10-23)** – Match-the-following and all 2-column rows shown as a bordered table on phone, PC, preview and print (see section 0.9).
- **V13 (2026-10-23)** – Telugu typing, PDF tables fixed, Already Uploaded, delete test + questions, 25 MB GitHub limit (see section 0.10).
- **V12 (2026-10-23)** – Back to Test button; equal 2 × 2 buttons on phone (see section 0.11).
- **V11 (2026-10-23)** – Teacher login, contact and version card removed from Student Profile (see section 0.12).
- **V10 (2026-10-23)** – Mail ID check: already-registered students go straight in; one row per mail in the sheet (see section 0.13).
- **V9 (2026-10-23)** – Bulk Import layout: buttons beside Read PDF, Subject & Topic Test card on the right (see section 0.14).
- **V8 (2026-10-23)** – Edit Answer, Previous / Save & Next under the question, Submit Test (see section 0.15).
- **V7 (2026-10-22)** – 📄 Read PDF question paper (text or OCR English + Telugu), smarter parser (see section 0.16).
- **V6 (2026-10-22)** – Topic Test file import (questions + test in one step), first 4 Set S tests (see section 0.17).
- **V5 (2026-10-22)** – Settings always visible + header button, Exam Patterns form (see section 0.18).
- **V4 (2026-10-22)** – first-page registration, Google Sheet student register, 👥 Students tab (see section 0.19).
- **V3 (2026-10-22)** – Subjects / Topic Tests / Performance, profile top-right (see section 0.20).
- **V2 (2026-10-22)** – Teacher PIN box fix + cache bump (see section 0.21).
- **V1 (2026-10-21)** – first release: everything listed in sections 1–3.
- *Reference only (separate app, unchanged):* Power Pulse V123 `V123_upload_remove_header_palette_pack`.

## 9. Security notes
- The Setup Code + PIN lock keeps students out of the teacher page; the real protection is the GitHub token, which lives only in your browser. Don't share the token, regenerate it if a device is lost.
- Students' results stay on their own phones. Only the 4 registration details (+ optional mobile) go to your Google Sheet; the Teacher page reads them with the READ_KEY.
