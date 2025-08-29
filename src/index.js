const express = require("express");
const cors = require("cors");
const bodyParser = require("express").json;
const { PORT } = require("./config");

const authRoutes = require("./routes/auth");
const studentsRoutes = require("./routes/students");
const analyticsRoutes = require("./routes/analytics");

const app = express();
// Allow flexible origins in development so Electron (file://) or localhost dev server can connect.
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser());

app.use("/auth", authRoutes);
app.use("/students", studentsRoutes);
app.use("/analytics", analyticsRoutes);

app.get("/", (req, res) => res.json({ ok: true }));

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} in use, attempting to listen on a random free port instead.`
    );
    const fallback = 0; // 0 tells OS to pick a free port
    const fallbackServer = app.listen(fallback, () =>
      console.log(`Server running on port ${fallbackServer.address().port}`)
    );
    fallbackServer.on("error", (e) => {
      console.error("Failed to start server on fallback port", e.message);
      process.exit(1);
    });
  } else {
    console.error("Server error", err);
    process.exit(1);
  }
});
