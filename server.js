const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// rota raiz p/ teste
app.get("/", (_req, res) => {
  res.type("text/plain").send("mcp-clickup up");
});

// health/status (Render e você usam para checar)
app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.get("/status", (_req, res) => res.json({ ok: true }));

// SSE exigido pelo conector
app.get("/sse", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  // handshake
  res.write(`event: ready\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  // keep-alive
  const ping = setInterval(() => {
    res.write(`event: ping\ndata: ${Date.now()}\n\n`);
  }, 25000);

  req.on("close", () => clearInterval(ping));
});

app.listen(PORT, () => console.log("MCP ClickUp listening on", PORT));
