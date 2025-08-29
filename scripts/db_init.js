const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { DB_FILE } = require("../src/config");

const dir = path.dirname(DB_FILE);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new sqlite3.Database(DB_FILE);

const schema = `
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  grade INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT
);
`;

db.serialize(() => {
  db.exec(schema, (err) => {
    if (err) {
      console.error("Failed to create schema", err);
      process.exit(1);
    }
    console.log("Database initialized at", DB_FILE);
    db.close();
  });
});
