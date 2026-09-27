#!/usr/bin/env node
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

function notFound(res) {
  const custom = path.join(ROOT, "404.html");
  if (fs.existsSync(custom)) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    fs.createReadStream(custom).pipe(res);
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("404 Not Found");
}

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const cleanPath = urlPath.replace(/\/+$/, "") || "/index";
  const requested = cleanPath === "/index" ? "/index" : cleanPath;

  // Resolve within ROOT only — reject any path that escapes it.
  const resolved = path.normalize(path.join(ROOT, requested));
  if (!resolved.startsWith(ROOT)) return notFound(res);

  // Clean URL first ("/work" -> "work.html"), then fall back to an exact
  // static file ("/robots.txt", future css/js/images) served as-is.
  const candidates = [resolved + ".html", resolved];

  for (const candidate of candidates) {
    try {
      const stat = fs.statSync(candidate);
      if (stat.isFile()) return serveFile(res, candidate);
    } catch (_) {
      // try next candidate
    }
  }
  notFound(res);
}).listen(PORT, () => {
  console.log(`Forman Production site running at http://localhost:${PORT}`);
});
