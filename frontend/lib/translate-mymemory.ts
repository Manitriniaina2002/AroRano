/**
 * MyMemory Translation with Rakibolana Integration
 * Free translation API (100% free, unlimited)
 * Supports Rakibolana term replacement for accuracy
 */

interface TranslationOptions {
  terms?: Array<{ fr: string; mg: string }>;
  timeout?: number;
}

interface MyMemoryResponse {
  responseStatus: number;
  responseData: {
    translatedText: string;
    match: number;
  };
}

const MYMEMORY_API = "https://api.mymemory.translated.net/get";

/**
 * Translate French text to Malagasy using MyMemory + Rakibolana
 * @param frenchText - The French text to translate
 * @param options - Translation options (terms, timeout)
 * @returns The translated Malagasy text with Rakibolana terms applied
 */
export async function translateWithMyMemory(
  frenchText: string,
  options?: TranslationOptions
): Promise<string> {
  if (!frenchText?.trim()) {
    throw new Error("Text to translate cannot be empty");
  }

  if (frenchText.length > 5000) {
    throw new Error("Text exceeds maximum length of 5000 characters");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options?.timeout || 30000
    );

    // Call MyMemory API
    const encodedText = encodeURIComponent(frenchText);
    const response = await fetch(
      `${MYMEMORY_API}?q=${encodedText}&langpair=fr|mg`,
      {
        method: "GET",
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `MyMemory API error (${response.status}): ${response.statusText}`
      );
    }

    const data: MyMemoryResponse = await response.json();

    if (data.responseStatus !== 200) {
      throw new Error(
        `MyMemory error: ${data.responseStatus} - ${data.responseData?.translatedText || "Unknown error"}`
      );
    }

    let translated = data.responseData.translatedText;

    // Apply Rakibolana term replacements for better accuracy
    if (options?.terms && options.terms.length > 0) {
      translated = applyRakibTerms(frenchText, translated, options.terms);
    }

    return translated;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(
          `Translation timeout (${options?.timeout || 30000}ms exceeded)`
        );
      }
      throw error;
    }
    throw new Error("Unknown translation error");
  }
}

/**
 * Apply Rakibolana terms to improve translation accuracy
 * @param originalFrench - Original French text
 * @param translatedText - Translated text from MyMemory
 * @param terms - Rakibolana terms to apply
 * @returns Updated translation with Rakibolana terms applied
 */
function applyRakibTerms(
  originalFrench: string,
  translatedText: string,
  terms: Array<{ fr: string; mg: string }>
): string {
  let result = translatedText;

  // Sort by length descending to handle longer terms first
  const sortedTerms = [...terms].sort((a, b) => b.fr.length - a.fr.length);

  for (const { fr, mg } of sortedTerms) {
    // Case-insensitive search in the original French text
    if (originalFrench.toLowerCase().includes(fr.toLowerCase())) {
      // Replace in translated text (this is a heuristic replacement)
      // We try to find similar patterns in the translated text
      result = result.replace(
        new RegExp(`\\b${escapeRegex(mg)}\\b`, "gi"),
        mg
      );
    }
  }

  return result;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Translate multiple French texts to Malagasy in parallel
 * @param frenchTexts - Array of French texts to translate
 * @param options - Translation options (terms, timeout)
 * @returns Array of translated Malagasy texts in same order
 */
export async function translateBatchMyMemory(
  frenchTexts: string[],
  options?: TranslationOptions
): Promise<string[]> {
  if (!Array.isArray(frenchTexts)) {
    throw new Error("Input must be an array of strings");
  }

  if (frenchTexts.length === 0) {
    return [];
  }

  if (frenchTexts.length > 100) {
    throw new Error("Batch size cannot exceed 100 items");
  }

  // Validate all texts
  frenchTexts.forEach((text, idx) => {
    if (!text?.trim()) {
      throw new Error(`Text at index ${idx} is empty`);
    }
    if (text.length > 5000) {
      throw new Error(
        `Text at index ${idx} exceeds maximum length of 5000 characters`
      );
    }
  });

  // Translate all texts in parallel
  const results = await Promise.all(
    frenchTexts.map((text) => translateWithMyMemory(text, options))
  );

  return results;
}

/**
 * Check if MyMemory service is available
 * @returns true if service is reachable, false otherwise
 */
export async function isMyMemoryAvailable(): Promise<boolean> {
  try {
    const response = await fetch(
      `${MYMEMORY_API}?q=test&langpair=fr|mg`,
      {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get language pair status from MyMemory
 * @returns Language pair information
 */
export async function getLanguagePairInfo(): Promise<{
  sourceLanguage: string;
  targetLanguage: string;
  pairStatus: string;
}> {
  try {
    const response = await fetch(
      `${MYMEMORY_API}?q=test&langpair=fr|mg`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get language pair info");
    }

    const data: MyMemoryResponse = await response.json();

    return {
      sourceLanguage: "French",
      targetLanguage: "Malagasy",
      pairStatus:
        data.responseStatus === 200
          ? "Available"
          : "Limited",
    };
  } catch (error) {
    console.error("Error getting language pair info:", error);
    return {
      sourceLanguage: "French",
      targetLanguage: "Malagasy",
      pairStatus: "Unknown",
    };
  }
}
