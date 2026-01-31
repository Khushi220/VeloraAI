// pages/api/recommend.js
import OpenAI from "openai";

export default async function handler(req, res) {
  // only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // DEBUG: print small masked snippet so we can confirm it's loaded (won't print whole key)
  const key = process.env.OPENAI_API_KEY;
  console.log("DEBUG: OPENAI_API_KEY present:", !!key, "prefix:", key ? key.slice(0,6) + "..." : "N/A");

  if (!key) {
    console.error("Missing OPENAI_API_KEY — check .env.local and restart dev server");
    return res.status(500).json({ error: "Server misconfiguration: missing OPENAI_API_KEY" });
  }

  // create client inside handler (ensures fresh reading of env)
  const client = new OpenAI({ apiKey: key });

  try {
    const { formData } = req.body || {};
    if (!formData) return res.status(400).json({ error: "Missing formData in request body" });

    const prompt = `User skin profile:\n${JSON.stringify(formData, null, 2)}\n\nProvide a short, friendly routine.`;

    // Use chat completion via the installed SDK interface
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // change if you need a different model
      messages: [
        { role: "system", content: "You are a skincare expert." },
        { role: "user", content: prompt }
      ],
      max_tokens: 400,
    });

    const recommendation = completion?.choices?.[0]?.message?.content ?? "No recommendation returned";
    return res.status(200).json({ recommendation });
  } catch (err) {
    console.error("OpenAI call failed:", err);
    // return a helpful error message in dev
    const payload = { error: "OpenAI request failed" };
    if (process.env.NODE_ENV === "development") payload.detail = String(err);
    return res.status(500).json(payload);
  }
}