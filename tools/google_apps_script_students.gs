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

/* Student app sends: {type, id, name, email, exam, examId, college, mobile, ver, ua}
   type = register | update | seen  (all keep the row up to date) */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!d.id || !d.name) return out_({ ok: false, error: "id and name required" });
    const sh = sheet_();
    const n = sh.getLastRow() - 1;
    const ids = n > 0 ? sh.getRange(2, 2, n, 1).getValues().map(function (r) { return String(r[0]); }) : [];
    const i = ids.indexOf(String(d.id));
    const now = new Date();
    const fields = [clean_(d.name), clean_(d.email), clean_(d.exam), clean_(d.examId), clean_(d.college), clean_(d.mobile)];
    if (i < 0) {
      sh.appendRow([now, clean_(d.id)].concat(fields, [now, 1, clean_(d.ver), clean_(d.ua)]));
    } else {
      const r = i + 2;
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
  if (p.key !== READ_KEY) return out_({ ok: false, error: "wrong key" });
  const v = sh.getDataRange().getValues();
  const head = v.shift();
  return out_({
    ok: true, head: head,
    rows: v.map(function (r) { return r.map(function (x) { return x instanceof Date ? x.toISOString() : x; }); })
  });
}
