
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY missing" });

    const raw = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
    const model = raw.model || "gpt-4o-mini";
    const prompt = raw.prompt || "";
    const max_tokens = raw.max_tokens || 500;
    const temperature = (typeof raw.temperature !== "undefined") ? raw.temperature : 0.1;

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: prompt,
        max_tokens,
        temperature
      })
    });

    const data = await r.json();

    let text = "";
    if (data.output_text) text = data.output_text;
    else if (Array.isArray(data.output) && data.output.length) {
      const out0 = data.output[0];
      if (out0 && Array.isArray(out0.content)) {
        for (const c of out0.content) {
          if (c.type === "output_text" && c.text) text += c.text;
          else if (c.text) text += c.text;
        }
      } else if (out0 && out0.content && out0.content[0] && out0.content[0].text) {
        text = out0.content[0].text;
      }
    }

    return res.status(r.ok ? 200 : 500).json({ raw: data, text });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
