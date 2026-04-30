import OpenAI from "openai";

export const dynamic = 'force-dynamic';

import { convertNgnToUsdc } from "@/lib/currency";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const DEFAULT_MODEL = "openai/gpt-4o-mini";

export async function POST(request: Request) {
  try {
    let body: { idea?: string; category?: string; format?: string; productTitle?: string; productDescription?: string };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return Response.json({ error: "invalid JSON payload" }, { status: 400 });
    }

    const idea = typeof body.idea === "string" ? body.idea.trim() : "";
    if (!idea) {
      return Response.json({ error: "idea is required" }, { status: 400 });
    }

    const category = typeof body.category === "string" ? body.category.trim() : undefined;
    const format = typeof body.format === "string" ? body.format.trim() : "PDF guide";
    const productTitle = typeof body.productTitle === "string" ? body.productTitle.trim() : "Digital Product";
    const productDescription = typeof body.productDescription === "string" ? body.productDescription.trim() : "";

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
    }

    // Generate content based on format
    let systemPrompt = "";
    let userPrompt = "";

    switch (format) {
      case "PDF guide":
        systemPrompt = `You are an expert content creator specializing in digital guides. Write complete, actionable content that provides genuine value. Include sections, steps, and practical advice. Format with clear headings and structure. The content should be substantial - aim for 800-1500 words minimum.`;
        userPrompt = `Create a complete digital guide based on this idea/concept: "${idea}"
        
Product Title: "${productTitle}"
Description: "${productDescription}"

Include:
1. A compelling introduction
2. Clear sections with actionable steps
3. Practical tips and examples
4. A strong conclusion with next steps

IMPORTANT: Write complete, usable content. This will be delivered directly to buyers who have paid for this guide.`;
        break;

      case "template pack":
        systemPrompt = `You are an expert at creating digital templates and worksheets. Create content that can be adapted for practical use. Include template structures, prompts, and examples.`;
        userPrompt = `Create template content for: "${idea}"

Product Title: "${productTitle}"
Description: "${productDescription}"

Include:
1. Clear instructions on how to use the templates
2. Template structures with placeholders
3. Example entries
4. Tips for customization

This is a template pack - make the content actionable and reusable.`;
        break;

      case "ebook":
        systemPrompt = `You are an expert e-book author. Write comprehensive, engaging content that teaches and informs. Include chapters, lessons, and actionable advice.`;
        userPrompt = `Create e-book content for: "${idea}"

Product Title: "${productTitle}"
Description: "${productDescription}"

Include:
1. A compelling book introduction
2. Multiple chapters/sections with substantive content
3. Practical exercises or reflections
4. A concluding chapter with takeaways

This is an e-book - make the content substantial and educational.`;
        break;

      case "mini resources":
        systemPrompt = `You are an expert at creating concise, valuable mini-resources. Create content that provides quick wins and actionable insights.`;
        userPrompt = `Create mini-resource content for: "${idea}"

Product Title: "${productTitle}"
Description: "${productDescription}"

Include:
1. Quick-start guide
2. Key tips and strategies (5-10 items)
3. Actionable steps
4. Resources for further learning

This is a mini-resource - make it concise but high-value.`;
        break;

      default:
        systemPrompt = `You are an expert content creator. Write complete, actionable content that provides genuine value.`;
        userPrompt = `Create content for: "${idea}"

Product Title: "${productTitle}"
Description: "${productDescription}"

Write substantial, valuable content that will be delivered to paying customers.`;
    }

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return Response.json({ error: "model returned empty output" }, { status: 502 });
    }

    return Response.json({
      content,
      format,
      wordCount: content.split(/\s+/).length,
    });
  } catch (error) {
    console.error("[generate-content] error:", error);
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}