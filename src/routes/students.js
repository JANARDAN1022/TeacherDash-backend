const express = require("express");
const { validationResult } = require("express-validator");
const { createOrUpdate } = require("../validators/students");
const auth = require("../middleware/auth");
const { run, all, get } = require("../db");

const router = express.Router();

router.use(auth);

router.get("/", async (req, res) => {
  try {
    const rows = await all("SELECT * FROM students ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const student = await get("SELECT * FROM students WHERE id = ?", [id]);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/", createOrUpdate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  const { name, email, subject, grade } = req.body;
  const normalizedEmail = (email || "").toLowerCase().trim();
  try {
    // check unique email
    const existing = await get("SELECT id FROM students WHERE email = ?", [
      normalizedEmail,
    ]);
    if (existing)
      return res.status(400).json({ error: "Email must be unique" });
    const now = new Date().toISOString();
    const r = await run(
      "INSERT INTO students (name,email,subject,grade,created_at) VALUES (?,?,?,?,?)",
      [name, normalizedEmail, subject, grade, now]
    );
    const student = await get("SELECT * FROM students WHERE id = ?", [r.id]);
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

router.put("/:id", createOrUpdate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  const { name, email, subject, grade } = req.body;
  const normalizedEmail = (email || "").toLowerCase().trim();
  try {
    const existing = await get(
      "SELECT id FROM students WHERE email = ? AND id != ?",
      [normalizedEmail, id]
    );
    if (existing)
      return res.status(400).json({ error: "Email must be unique" });
    const now = new Date().toISOString();
    const r = await run(
      "UPDATE students SET name=?, email=?, subject=?, grade=?, updated_at=? WHERE id=?",
      [name, normalizedEmail, subject, grade, now, id]
    );
    if (r.changes === 0) return res.status(404).json({ error: "Not found" });
    const student = await get("SELECT * FROM students WHERE id = ?", [id]);
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const r = await run("DELETE FROM students WHERE id = ?", [id]);
    if (r.changes === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
