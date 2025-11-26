const fs = require("fs");

const data = JSON.parse(fs.readFileSync("captures.json", "utf8"));

let docId = "";
let sessionToken = "";

for (const entry of data.entries || []) {
  const captures = Array.isArray(entry.captures) ? entry.captures : [];
  for (const cap of captures) {
    if (cap && cap.name === "doc_id" && cap.value !== undefined) {
      docId = String(cap.value);
    }
    if (cap && cap.name === "session_token" && cap.value) {
      sessionToken = String(cap.value);
    }
  }
}

console.log("DOC_ID=" + docId);
console.log("SESSION_TOKEN=" + sessionToken);
