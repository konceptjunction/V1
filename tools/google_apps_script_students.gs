/* =====================================================================
   KONCEPT JUNCTION — Student register (Google Sheet master data)  V4
   ---------------------------------------------------------------------
   Paste this whole file into:  Google Sheet → Extensions → Apps Script
   Then: Deploy → New deployment → type "Web app"
         Execute as: Me      Who has access: Anyone
   Copy the Web app URL (ends with /exec) into
         assets/js/config.js → SHEET.webapp_url
   and into Teacher Upload → Settings → Google Sheet.
   ===================================================================== */

const SHEET_NAME = "Students";
const READ_KEY = "CHANGE-THIS-KEY";   // <<< CHANGE: teacher types the same key in Teacher Upload → Settings

const HEAD = ["Registered On", "Student ID", "Name", "Mail ID", "Exam", "Exam ID", "College", "Mobile",
              "Last Seen", "Days Active", "App Version", "Device"];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD.length).setFontWeight("bold").setBackground("#1b3a6b").setFontColor("#ffffff");
  }
  return sh;
}

/* stop text starting with = + - @ from running as a formula */
function clean_(v) {
  const s = String(v == null ? "" : v).slice(0, 200).trim();
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* V10: row of a student – same Student ID, or else the same Mail ID (so one mail = one row) */
function findRow_(sh, id, email) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return -1;
  const v = sh.getRange(2, 2, n, 3).getValues();          // B: Student ID, C: Name, D: Mail ID
  for (let i = 0; i < n; i++) if (id && String(v[i][0]) === String(id)) return i + 2;
  const m = String(email || "").trim().toLowerCase();
  if (m) for (let i = 0; i < n; i++) if (String(v[i][2]).trim().toLowerCase() === m) return i + 2;
  return -1;
}

/* Student app sends: {type, id, name, email, exam, examId, college, mobile, ver, ua}
   type = register | update | seen  (all keep the row up to date) */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!d.id || !d.name) return out_({ ok: false, error: "id and name required" });
    const sh = sheet_();
    const r = findRow_(sh, d.id, d.email);
    const now = new Date();
    const fields = [clean_(d.name), clean_(String(d.email || "").trim().toLowerCase()), clean_(d.exam), clean_(d.examId), clean_(d.college), clean_(d.mobile)];
    if (r < 0) {
      sh.appendRow([now, clean_(d.id)].concat(fields, [now, 1, clean_(d.ver), clean_(d.ua)]));
    } else {
      sh.getRange(r, 3, 1, 6).setValues([fields]);
      const last = sh.getRange(r, 9).getValue();
      const sameDay = last instanceof Date && last.toDateString() === now.toDateString();
      sh.getRange(r, 9).setValue(now);
      if (!sameDay) sh.getRange(r, 10).setValue((Number(sh.getRange(r, 10).getValue()) || 0) + 1);
      sh.getRange(r, 11, 1, 2).setValues([[clean_(d.ver), clean_(d.ua)]]);
    }
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ?action=count            → number of students (no key needed)
   ?action=list&key=KEY     → full list for the Teacher page */
function doGet(e) {
  const p = (e && e.parameter) || {};
  const sh = sheet_();
  if (p.action === "count") return out_({ ok: true, count: Math.max(0, sh.getLastRow() - 1) });
  if (p.action === "lookup") {                              // V10: "already registered?" check from the student app
    const r = findRow_(sh, "", p.email);
    if (r < 0) return out_({ ok: true, found: false });
    const v = sh.getRange(r, 1, 1, 7).getValues()[0];      // A..G
    return out_({ ok: true, found: true, student: {
      registeredOn: v[0] instanceof Date ? v[0].toISOString() : v[0], id: String(v[1]), name: v[2], email: v[3], exam: v[4], examId: v[5], college: v[6] } });
  }
  if (p.key !== READ_KEY) return out_({ ok: false, error: "wrong key" });
  const v = sh.getDataRange().getValues();
  const head = v.shift();
  return out_({
    ok: true, head: head,
    rows: v.map(function (r) { return r.map(function (x) { return x instanceof Date ? x.toISOString() : x; }); })
  });
}
