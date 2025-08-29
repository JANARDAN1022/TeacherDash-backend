#!/usr/bin/env node

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { DB_FILE } = require("../src/config");

console.log("🔄 Starting database migration...");

const db = new sqlite3.Database(DB_FILE);

const migrations = [
  {
    version: 1,
    description: "Create initial students table",
    sql: `
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL CHECK(length(name) >= 2),
        email TEXT UNIQUE NOT NULL CHECK(email LIKE '%_@_%'),
        subject TEXT NOT NULL CHECK(subject IN ('Math', 'Science', 'English', 'History')),
        grade INTEGER NOT NULL CHECK(grade >= 0 AND grade <= 100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    version: 2,
    description: "Create indexes for performance",
    sql: `
      CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
      CREATE INDEX IF NOT EXISTS idx_students_subject ON students(subject);
      CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);
    `
  },
  {
    version: 3,
    description: "Add updated_at trigger",
    sql: `
      CREATE TRIGGER IF NOT EXISTS update_students_timestamp 
      AFTER UPDATE ON students
      BEGIN
        UPDATE students SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `
  }
];

const runMigration = (sql) => {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const getCurrentVersion = () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT version FROM schema_version ORDER BY version DESC LIMIT 1", (err, row) => {
      if (err) resolve(0); // No schema_version table means version 0
      else resolve(row ? row.version : 0);
    });
  });
};

const setVersion = (version) => {
  return new Promise((resolve, reject) => {
    db.run("INSERT OR REPLACE INTO schema_version (version, applied_at) VALUES (?, CURRENT_TIMESTAMP)", [version], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const migrate = async () => {
  try {
    // Create schema_version table if it doesn't exist
    await runMigration(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const currentVersion = await getCurrentVersion();
    console.log(`📊 Current database version: ${currentVersion}`);

    const pendingMigrations = migrations.filter(m => m.version > currentVersion);
    
    if (pendingMigrations.length === 0) {
      console.log("✅ Database is up to date");
      return;
    }

    console.log(`🔄 Found ${pendingMigrations.length} pending migration(s)`);

    for (const migration of pendingMigrations) {
      console.log(`🔄 Applying migration ${migration.version}: ${migration.description}`);
      await runMigration(migration.sql);
      await setVersion(migration.version);
      console.log(`✅ Migration ${migration.version} applied successfully`);
    }

    console.log("🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    db.close();
  }
};

migrate();
