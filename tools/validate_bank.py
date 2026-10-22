"""KONCEPT JUNCTION – offline data checker.
Run from the pack folder:   python tools/validate_bank.py
Checks every JSON file, duplicate question ids, answers, options and paper references."""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def load(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f: return json.load(f)
err, warn = [], []
subs = load("data/subjects.json"); exams = load("data/exams.json"); papers = load("data/papers.json")
sid = {s["id"] for s in subs}; eid = {e["id"] for e in exams}; ids = {}
for s in subs:
    try: bank = load(s["file"])
    except Exception as e: err.append(f"{s['file']}: {e}"); continue
    for q in bank:
        i = q.get("id", "?")
        if i in ids: err.append(f"duplicate id {i} ({s['file']} and {ids[i]})")
        ids[i] = s["file"]
        if q.get("subject") != s["id"]: warn.append(f"{i}: subject '{q.get('subject')}' sits in {s['file']}")
        if not (q.get("q", {}).get("en") or q.get("q", {}).get("te")): err.append(f"{i}: empty question")
        if q.get("type", "mcq") == "mcq":
            n = len(q.get("o", {}).get("en", []))
            if n < 2: err.append(f"{i}: fewer than 2 options")
            if not isinstance(q.get("a"), int) or not 0 <= q["a"] < n: err.append(f"{i}: answer index {q.get('a')} out of range")
            te = q.get("o", {}).get("te", [])
            if te and len(te) != n: warn.append(f"{i}: Telugu options count differs")
        for x in q.get("exams", []):
            if x not in eid: warn.append(f"{i}: unknown exam tag {x}")
for e in exams:
    for sct in e["sections"]:
        if sct["subject"] not in sid: err.append(f"exam {e['id']}: unknown subject {sct['subject']}")
for p in papers:
    if p.get("subject") and p["subject"] not in sid: warn.append(f"topic test {p['id']}: unknown subject {p['subject']}")
    for q in p["qids"]:
        if q not in ids: err.append(f"paper {p['id']}: missing question {q}")
for f in ["data/notes.json", "data/current_affairs.json", "data/announcements.json"]:
    try: load(f)
    except Exception as e: err.append(f"{f}: {e}")
print(f"Questions: {len(ids)}  Subjects: {len(subs)}  Exams: {len(exams)}  Papers: {len(papers)}")
for w in warn: print("WARN ", w)
for e in err: print("ERROR", e)
print("OK – data is valid" if not err else f"{len(err)} error(s)")
sys.exit(1 if err else 0)
