const express = require("express");
const { all, get } = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const totalRow = await get("SELECT COUNT(*) as count FROM students");
    const avgBySubject = await all(
      "SELECT subject, AVG(grade) as average, COUNT(*) as count FROM students GROUP BY subject"
    );
    const recent = await all(
      "SELECT * FROM students ORDER BY created_at DESC LIMIT 5"
    );
    res.json({
      total: totalRow.count || 0,
      averageBySubject: avgBySubject,
      recent,
    });
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
