const express = require("express");

const app = express();
app.use(express.json());

const CLICKUP_TOKEN = process.env.CLICKUP_TOKEN;
const TEAM_ID = process.env.CLICKUP_TEAM_ID;

// SSE para o conector
app.get("/sse", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });
  res.flushHeaders?.();

  // handshake simples
  res.write(`event: ready\ndata: ${JSON.stringify({ ok: true, tools: ["listSpaces", "listTasks"] })}\n\n`);

  const ping = setInterval(() => {
    res.write(`event: ping\ndata: ${Date.now()}\n\n`);
  }, 25000);

  req.on("close", () => clearInterval(ping));
});

// ferramentas de exemplo (úteis p/ testar)
app.get("/status", (_req, res) => res.json({ ok: true }));

app.post("/run", async (req, res) => {
  const { tool, params } = req.body || {};
  try {
    if (!CLICKUP_TOKEN || !TEAM_ID) {
      return res.status(500).json({ ok: false, error: "Variáveis de ambiente faltando" });
    }

    if (tool === "listSpaces") {
      const r = await fetch(`https://api.clickup.com/api/v2/team/${TEAM_ID}/space`, {
        headers: { Authorization: CLICKUP_TOKEN }
      });
      const data = await r.json();
      return res.json({ ok: true, data });
    }

    if (tool === "listTasks") {
      const page = params?.page || 0;
      const r = await fetch(`https://api.clickup.com/api/v2/team/${TEAM_ID}/task?page=${page}`, {
        headers: { Authorization: CLICKUP_TOKEN }
      });
      const data = await r.json();
      return res.json({ ok: true, data });
    }

    return res.status(400).json({ ok: false, error: "Ferramenta desconhecida" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("MCP ClickUp em", port));
