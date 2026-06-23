import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { ensureTable } from "./db";
import projectRoutes from "./routes";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(cors());
app.use(express.json());

// ── Static assets (built widget + dashboard) ──
const publicDir = path.resolve(__dirname, "../../../public");
app.use("/widget.js", express.static(path.join(publicDir, "widget.js")));
app.use("/chat-ui", express.static(path.join(publicDir, "chat-ui")));
app.use("/dashboard", express.static(path.join(publicDir, "dashboard")));

app.get("/dashboard", (_req, res) => {
  res.redirect("/dashboard/");
});

app.get("/chat-ui", (_req, res) => {
  res.redirect("/chat-ui/");
});

// ── Chat proxy (streams SSE response from backend through same origin) ──
app.post("/api/chat", async (req, res) => {
  const { message, sessionId, apiBase } = req.body;
  if (!message || !apiBase) {
    res.json({ reply: "Sorry, could not reach the server." });
    return;
  }
  const target = apiBase.replace(/\/+$/, "") + "/api/chat";
  try {
    const backend = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
    });
    res.writeHead(backend.status, {
      "Content-Type": backend.headers.get("content-type") || "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    if (backend.body) {
      const reader = backend.body.getReader();
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) { res.end(); return; }
            res.write(value);
          }
        } catch (err) {
          console.error("Stream error:", err);
          res.end();
        }
      };
      pump();
    } else {
      const text = await backend.text();
      res.end(text);
    }
  } catch (err) {
    console.error("Proxy error:", err, "target:", target);
    res.json({ reply: "Sorry, could not reach the server." });
  }
});

// ── API routes ──
app.use("/api/projects", projectRoutes);

// ── Start ──
async function main() {
  await ensureTable();

  app.listen(PORT, () => {
    console.log(`Chat Widget Platform running on http://localhost:${PORT}`);
    console.log(`Dashboard:  http://localhost:${PORT}/dashboard/`);
    console.log(`Widget JS:  http://localhost:${PORT}/widget.js`);
    console.log(`Chat UI:    http://localhost:${PORT}/chat-ui/`);
  });
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
