const http = require("http");

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  try {
    const root = await request({
      hostname: "localhost",
      port: 3001,
      path: "/",
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    console.log("/ ->", root.status, root.body);

    const login = await request(
      {
        hostname: "localhost",
        port: 3001,
        path: "/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { username: "teacher", password: "password123" }
    );
    console.log("/auth/login ->", login.status, login.body);
  } catch (err) {
    console.error("Smoke test error", err.message);
    process.exit(1);
  }
})();
