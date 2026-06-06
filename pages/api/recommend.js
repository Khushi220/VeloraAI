import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import Sentiment from "sentiment";

export default async function handler(req, res) {
  try {
    const sentiment = new Sentiment();

    const { formData } = req.body;

    const skinType = formData.skinType;
    const concerns = formData.skinConcerns || [];

    // READ EXCEL FILE
    const filePath = path.join(process.cwd(), "public/data/database.xlsx");
    const file = fs.readFileSync(filePath);
    const workbook = XLSX.read(file, { type: "buffer" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const products = XLSX.utils.sheet_to_json(sheet);

    // FILTER PRODUCTS
    const matchedProducts = products.filter((p) => {
      const skin = String(p.skin_type || "").toLowerCase();
      const concernsText = String(p.concerns || "").toLowerCase();

      const concernsList = concernsText.split(",").map((c) => c.trim());

      return (
        skin === skinType.toLowerCase() &&
        concerns.some((c) => concernsList.includes(c.toLowerCase()))
      );
    });

    if (!matchedProducts.length) {
      return res.status(404).json({
        error: "No matching product found"
      });
    }

    // 🧠 SENTIMENT SCORING
    const scoredProducts = matchedProducts.map((p) => {
      const reviewText = `
${p.product_name} is a great product for ${p.skin_type}.
It helps with ${p.concerns}.
`;
      const score = sentiment.analyze(reviewText).score;

      return {
        ...p,
        sentimentScore: score
      };
    });

    // 🔥 SORT BY BEST SENTIMENT
    const sortedProducts = scoredProducts.sort(
      (a, b) => b.sentimentScore - a.sentimentScore
    );

    // TAKE TOP PRODUCTS
    const topProducts = sortedProducts.slice(0, 5);

    // BUILD PRODUCT LIST
    const productsList = topProducts
      .map(
        (p) =>
          `• ${p.product_name} (${p.category}) - ${p.brand} ⭐ ${p.sentimentScore}`
      )
      .join("\n");

    // AI CALL
    const aiResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: `Create a simple skincare routine for ${skinType} skin with concerns: ${concerns.join(", ")}. Include Morning, Night, and Weekly steps.`
            }
          ]
        })
      }
    );

    const aiData = await aiResponse.json();
    console.log("AI RESPONSE:", aiData);

    let routine = "Routine could not be generated.";

    if (
      aiData?.choices?.[0]?.message?.content
    ) {
      routine = aiData.choices[0].message.content;
    }

    // FINAL RESPONSE
    const recommendation = `
Recommended Products (Top Rated):

${productsList}

These products match your skin type (${skinType})
and concerns (${concerns.join(", ")}).

${routine}
`;

    return res.status(200).json({ recommendation });

  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({
      error: "Failed to process request",
      detail: error.message
    });
  }
}