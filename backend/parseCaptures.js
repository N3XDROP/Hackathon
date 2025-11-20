const fs = require("fs");

const data = JSON.parse(fs.readFileSync("captures.json", "utf8"));

let docId = "";
let sessionCookie = "";

// Hurl --json estructura: entries[i].captures es un arreglo [{name, value}]
for (const entry of data.entries || []) {
  const captures = Array.isArray(entry.captures) ? entry.captures : [];
  for (const cap of captures) {
    if (cap && cap.name === "doc_id" && cap.value !== undefined) {
      docId = String(cap.value);
    }
    if (cap && cap.name === "session_cookie" && cap.value) {
      // cap.value es el Set-Cookie completo; extrae solo "connect.sid=..."
      const m = String(cap.value).match(/connect\.sid=[^;]+/);
      if (m) sessionCookie = m[0];
    }
  }
}

console.log("DOC_ID=" + docId);
console.log("SESSION_COOKIE=" + sessionCookie);
