export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY missing" });
    const { model, payload } = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
    if (!model || !payload) return res.status(400).json({ error: "Invalid body. Need { model, payload }" });
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await r.json();
    return res.status(r.ok ? 200 : 500).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
