import { buildMockGeneratedProduct } from "@/lib/mock-data";
import type { GenerateRequestBody } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<GenerateRequestBody>;
    const idea = typeof body.idea === "string" ? body.idea.trim() : "";

    if (!idea) {
      return Response.json({ error: "idea is required" }, { status: 400 });
    }

    const category = typeof body.category === "string" ? body.category.trim() : undefined;
    const generatedProduct = buildMockGeneratedProduct(idea, category);

    return Response.json(generatedProduct);
  } catch {
    return Response.json({ error: "invalid JSON payload" }, { status: 400 });
  }
}
