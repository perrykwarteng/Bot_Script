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
