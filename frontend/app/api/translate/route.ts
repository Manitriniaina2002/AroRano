import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { translateWithMyMemory } from "@/lib/translate-mymemory";

interface Term {
  fr: string;
  mg: string;
}

interface TranslateRequest {
  text: string;
  terms?: Term[];
}

const client = new Anthropic();

function formatTermsForPrompt(terms: Term[]): string {
  if (!terms || terms.length === 0) return "";

  const termsList = terms
    .map((term) => `- "${term.fr}" → "${term.mg}"`)
    .join("\n");

  return `Use these preferred Rakibolana (technical water/IoT terms) when translating:\n${termsList}\n`;
}

async function translateWithClaude(
  text: string,
  terms?: Term[]
): Promise<string> {
  const termsContext = formatTermsForPrompt(terms || []);

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a professional translator specializing in technical and agricultural terms for Madagascar. Your task is to translate French text to Malagasy while preserving technical meaning and formatting.

${termsContext}

Translate the following French text to Malagasy. Return ONLY the translated text, with no explanations, no quotes, and no additional commentary:

French text:
${text}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  return content.text.trim();
}

async function translateWithFallback(
  text: string,
  terms?: Term[]
): Promise<{ translated: string; providerUsed: string }> {
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);

  if (hasAnthropicKey) {
    try {
      const translated = await translateWithClaude(text, terms);
      return { translated, providerUsed: 'anthropic' };
    } catch (error) {
      console.warn('Claude translation failed, falling back to MyMemory:', error);
    }
  }

  const translated = await translateWithMyMemory(text, { terms, timeout: 30000 });
  return { translated, providerUsed: hasAnthropicKey ? 'mymemory-fallback' : 'mymemory' };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Request body must be a JSON object",
        },
        { status: 400 }
      );
    }

    const { text, terms } = body as TranslateRequest;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "text field is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "text cannot be empty",
        },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: "text exceeds maximum length of 5000 characters",
        },
        { status: 400 }
      );
    }

    if (terms !== undefined) {
      if (!Array.isArray(terms)) {
        return NextResponse.json(
          {
            success: false,
            error: "terms must be an array",
          },
          { status: 400 }
        );
      }

      const validTerms = terms.every(
        (term) =>
          term &&
          typeof term === "object" &&
          typeof term.fr === "string" &&
          typeof term.mg === "string"
      );

      if (!validTerms) {
        return NextResponse.json(
          {
            success: false,
            error: "each term must have 'fr' and 'mg' fields as strings",
          },
          { status: 400 }
        );
      }

      if (terms.length > 100) {
        return NextResponse.json(
          {
            success: false,
            error: "terms array cannot exceed 100 items",
          },
          { status: 400 }
        );
      }
    }

    const { translated, providerUsed } = await translateWithFallback(text, terms);

    return NextResponse.json(
      {
        success: true,
        translated,
        providerUsed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Translation error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        {
          success: false,
          error: `Claude API error: ${error.message}`,
          providerUsed: 'anthropic',
        },
        { status: error.status || 500 }
      );
    }

    try {
      const body = await request.clone().json();
      if (body && typeof body === 'object' && typeof (body as TranslateRequest).text === 'string') {
        const fallbackTranslated = await translateWithMyMemory((body as TranslateRequest).text, {
          terms: (body as TranslateRequest).terms,
          timeout: 30000,
        });

        return NextResponse.json(
          {
            success: true,
            translated: fallbackTranslated,
            providerUsed: 'mymemory-fallback',
          },
          { status: 200 }
        );
      }
    } catch {
      // Ignore and return the generic error below.
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during translation",
        providerUsed: 'fallback-unavailable',
      },
      { status: 500 }
    );
  }
}
