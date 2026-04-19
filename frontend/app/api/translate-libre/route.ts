/**
 * POST /api/translate-libre
 * Free translation endpoint using MyMemory + Rakibolana
 * 100% free, no API keys needed, unlimited requests
 */

import { translateWithMyMemory } from "@/lib/translate-mymemory";
import { NextRequest, NextResponse } from "next/server";

interface TranslateRequest {
  text: string;
  terms?: Array<{
    fr: string;
    mg: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: TranslateRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate text field
    if (!body.text) {
      return NextResponse.json(
        { success: false, error: "text field is required" },
        { status: 400 }
      );
    }

    if (typeof body.text !== "string") {
      return NextResponse.json(
        { success: false, error: "text must be a string" },
        { status: 400 }
      );
    }

    if (body.text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "text cannot be empty" },
        { status: 400 }
      );
    }

    if (body.text.length > 5000) {
      return NextResponse.json(
        { success: false, error: "text exceeds maximum length of 5000 characters" },
        { status: 400 }
      );
    }

    // Validate terms if provided
    if (body.terms !== undefined) {
      if (!Array.isArray(body.terms)) {
        return NextResponse.json(
          { success: false, error: "terms must be an array" },
          { status: 400 }
        );
      }

      if (body.terms.length > 100) {
        return NextResponse.json(
          { success: false, error: "terms array cannot exceed 100 items" },
          { status: 400 }
        );
      }

      for (const term of body.terms) {
        if (!term.fr || !term.mg) {
          return NextResponse.json(
            { success: false, error: "each term must have 'fr' and 'mg' fields" },
            { status: 400 }
          );
        }
      }
    }

    // Perform translation
    const translated = await translateWithMyMemory(body.text, {
      terms: body.terms,
      timeout: 30000,
    });

    return NextResponse.json(
      { success: true, translated },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Check if it's a timeout error
    if (errorMessage.includes("timeout")) {
      return NextResponse.json(
        { success: false, error: `Translation timeout: ${errorMessage}` },
        { status: 408 }
      );
    }

    // Check if MyMemory service is unavailable
    if (errorMessage.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "MyMemory translation service is unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    console.error("Translation error:", error);
    return NextResponse.json(
      { success: false, error: `Translation error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
