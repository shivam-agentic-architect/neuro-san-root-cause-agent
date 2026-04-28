import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Neuro-SAN Orchestrator instance
  // Moved to frontend for better API key integration in AI Studio

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
        status: "healthy", 
        version: "2.5.0",
        engine: "Neuro-SAN Studio (Client Orchestrated)"
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n================================================`);
    console.log(`🚀 NEURO-SAN STUDIO RUNNING AT http://localhost:${PORT}`);
    console.log(`================================================\n`);
  });
}

startServer();
