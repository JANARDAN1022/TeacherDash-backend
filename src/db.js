const sqlite3 = require("sqlite3").verbose();
const { DB_FILE } = require("./config");
const fs = require("fs");
const path = require("path");

const dir = path.dirname(DB_FILE);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new sqlite3.Database(DB_FILE);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Database schema and initialization
const initDatabase = async () => {
  try {
    // Create students table
    await run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL CHECK(length(name) >= 2),
        email TEXT UNIQUE NOT NULL CHECK(email LIKE '%_@_%'),
        subject TEXT NOT NULL CHECK(subject IN ('Math', 'Science', 'English', 'History')),
        grade INTEGER NOT NULL CHECK(grade >= 0 AND grade <= 100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on email for faster lookups
    await run(`
      CREATE INDEX IF NOT EXISTS idx_students_email ON students(email)
    `);

    // Create index on subject for filtering
    await run(`
      CREATE INDEX IF NOT EXISTS idx_students_subject ON students(subject)
    `);

    // Create index on created_at for sorting
    await run(`
      CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at)
    `);

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

// Initialize database on startup
initDatabase();

module.exports = { db, run, get, all, initDatabase };
