import { NextRequest, NextResponse } from 'next/server';
import { lookupGlossary } from '@/lib/translation-glossary';

type DictionaryTarget = 'mg' | 'tdx';

interface TranslateDictionaryRequest {
  text: string;
  source?: 'en';
  target?: DictionaryTarget;
}

interface MyMemoryResponse {
  responseStatus: number;
  responseData?: {
    translatedText?: string;
    match?: number;
  };
  matches?: Array<{
    segment?: string;
    translation?: string;
    match?: number;
  }>;
}

interface SourceCandidates {
  glossary: string[];
  glosbe: string[];
  wiktionary: string[];
  rakibolana: string[];
  mymemory: string[];
  malagasyword: string[];
}

const REQUEST_TIMEOUT_MS = 7000;
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

const EN_PIVOT_HINTS: Record<string, string[]> = {
  woman: ['vehivavy'],
  female: ['vehivavy'],
  girl: ['ampela', 'zazavavy', 'vavy'],
};

const MG_PIVOT_EXPANSIONS: Record<string, string[]> = {
  vehivavy: ['ampela', 'vavy'],
  vavy: ['ampela', 'vehivavy'],
  barera: ['vehivavy', 'ampela'],
};

const NOISE_WORDS = new Set([
  'add',
  'translation',
  'translations',
  'dictionary',
  'glosbe',
  'login',
  'log in',
  'noun',
  'verb',
  'no',
  'grammar',
  'empty',
  'automatic',
]);

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function toPlainText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, '\n')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\n{2,}/g, '\n')
  );
}

function normalizeCandidate(term: string): string {
  return term
    .replace(/&[a-zA-Z0-9#]+;/g, '')
    .trim()
    .replace(/^[-*â€¢\s]+/, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/["â€œâ€]/g, '')
    .toLowerCase();
}

function isLikelyMalagasyWord(term: string): boolean {
  if (!term) return false;
  if (term.length < 3 || term.length > 48) return false;
  if (/[^a-zA-Z\-\s']/.test(term)) return false;
  if (/\b(dictionary|translation|english|malagasy)\b/i.test(term)) return false;

  const vowelCount = (term.toLowerCase().match(/[aeiouy]/g) || []).length;
  if (term.length >= 4 && vowelCount < 2) return false;

  return true;
}

function uniqueCandidates(...groups: Array<string[] | undefined>): string[] {
  const ordered: string[] = [];
  const seen = new Set<string>();

  for (const group of groups) {
    for (const term of group || []) {
      const normalized = normalizeCandidate(term);
      if (!normalized) continue;
      if (!isLikelyMalagasyWord(normalized)) continue;
      if (NOISE_WORDS.has(normalized)) continue;
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      ordered.push(normalized);
    }
  }

  return ordered;
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

function splitInlineCandidates(value: string): string[] {
  return decodeHtmlEntities(value)
    .replace(/[()[\]{}]/g, ' ')
    .replace(/\s+or\s+/gi, ',')
    .replace(/\s+\/\s+/g, ',')
    .split(/[;,|]/)
    .map((part) => normalizeCandidate(part))
    .filter(Boolean);
}

function extractFromGlosbe(html: string, query: string): string[] {
  const text = toPlainText(html);
  const compact = text.replace(/\s+/g, ' ');

  // Preferred pattern observed on Glosbe pages:
  // "Translation of \"water\" into Malagasy rano, r&aacute;no, siniben-drano are the top translations ..."
  const topMatch = compact.match(
    /Translation of\s+[â€œ"]?[^"â€]+[â€"]?\s+into Malagasy\s+(.+?)\s+are the top translations of\s+[â€œ"]?[^"â€]+[â€"]?\s+into Malagasy\.?/i
  );
  if (topMatch?.[1]) {
    const explicit = topMatch[1]
      .split(',')
      .map((chunk) => normalizeCandidate(chunk))
      .filter((item) => isLikelyMalagasyWord(item))
      .filter((item) => !NOISE_WORDS.has(item))
      .filter((item) => item !== normalizeCandidate(query));

    if (explicit.length) {
      return Array.from(new Set(explicit));
    }
  }

  // Avoid noisy UI strings from generic page text when explicit top translations are absent.
  return [];
}

function extractFromWiktionary(html: string, query: string): string[] {
  const text = toPlainText(html);
  const pivot = text.toLowerCase().indexOf('malagasy');
  const region = pivot >= 0 ? text.slice(pivot, pivot + 6000) : text.slice(0, 6000);
  const lines = region
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const candidates: string[] = [];
  for (const line of lines) {
    if (/^malagasy\b/i.test(line)) {
      const parts = line.split(/[:;,]/).slice(1);
      for (const part of parts) {
        const value = normalizeCandidate(part);
        if (!isLikelyMalagasyWord(value)) continue;
        if (value === normalizeCandidate(query)) continue;
        candidates.push(value);
      }
    }
  }

  return Array.from(new Set(candidates));
}

function extractFromMyMemory(data: MyMemoryResponse, query: string): string[] {
  const normalizedQuery = normalizeCandidate(query);
  const directCandidates = splitInlineCandidates(data.responseData?.translatedText || '');
  const matchCandidates = (data.matches || []).flatMap((match) =>
    splitInlineCandidates(match.translation || '')
  );

  return uniqueCandidates(directCandidates, matchCandidates).filter(
    (candidate) => candidate !== normalizedQuery
  );
}

async function fetchMyMemoryCandidates(query: string): Promise<string[]> {
  const data = await fetchJson<MyMemoryResponse>(
    `${MYMEMORY_API}?q=${encodeURIComponent(query)}&langpair=en|mg`
  );

  if (data.responseStatus !== 200) {
    return [];
  }

  return extractFromMyMemory(data, query);
}

function extractFromTandroy(html: string): string[] {
  const text = toPlainText(html);
  const compact = text.replace(/\s+/g, ' ');
  const matches = Array.from(
    compact.matchAll(/\[Tandroy\]\s*([^:\[\]]{2,80})(?::|\s|$)/gi)
  );

  const candidates = matches
    .map((match) => normalizeCandidate(match[1] || ''))
    .filter(Boolean)
    .filter((item) => isLikelyMalagasyWord(item));

  return Array.from(new Set(candidates));
}

function expandMalagasyPivots(seedTerms: string[]): string[] {
  const expanded = uniqueCandidates(seedTerms);
  const seen = new Set(expanded);

  for (let index = 0; index < expanded.length; index += 1) {
    const current = expanded[index];
    const related = MG_PIVOT_EXPANSIONS[current] || [];

    for (const candidate of related) {
      const normalized = normalizeCandidate(candidate);
      if (!normalized) continue;
      if (!isLikelyMalagasyWord(normalized)) continue;
      if (NOISE_WORDS.has(normalized)) continue;
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      expanded.push(normalized);
    }
  }

  return expanded;
}

function buildTandroyPivotTerms(text: string, sourceCandidates: SourceCandidates): string[] {
  const normalizedText = normalizeCandidate(text);
  const directMalagasySeed = isLikelyMalagasyWord(normalizedText)
    ? [normalizedText]
    : [];
  const hintedPivots = EN_PIVOT_HINTS[normalizedText] || [];

  const malagasySeeds = uniqueCandidates(
    directMalagasySeed,
    hintedPivots,
    sourceCandidates.glossary,
    sourceCandidates.glosbe,
    sourceCandidates.wiktionary,
    sourceCandidates.rakibolana,
    sourceCandidates.mymemory
  );

  return expandMalagasyPivots(malagasySeeds);
}

function pickBestCandidate(candidates: string[]): string | null {
  if (!candidates.length) return null;

  // Prefer concise, vowel-complete forms and penalize compound hyphenated terms.
  const sorted = [...candidates].sort((a, b) => {
    const aScore = scoreCandidate(a);
    const bScore = scoreCandidate(b);
    return aScore - bScore;
  });

  return sorted[0] || null;
}

function scoreCandidate(term: string): number {
  const words = term.split(' ').length;
  const vowels = (term.match(/[aeiouy]/gi) || []).length;
  const hyphenPenalty = term.includes('-') ? 6 : 0;
  return words * 10 + term.length + hyphenPenalty - vowels * 2;
}

function buildGlossaryResponse(term: string, target: DictionaryTarget) {
  if (target !== 'mg') {
    return null;
  }

  const glossaryEntry = lookupGlossary(term);
  if (!glossaryEntry) return null;

  return {
    success: true,
    translated: glossaryEntry.translated,
    source: 'local-glossary',
    providerUsed: 'local-glossary',
    confidence: glossaryEntry.confidence,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TranslateDictionaryRequest;
    const rawText = body.text?.trim();

    if (!rawText) {
      return NextResponse.json(
        { success: false, error: 'text is required' },
        { status: 400 }
      );
    }

    const source = body.source || 'en';
    const target = body.target || 'mg';

    if (source !== 'en' || (target !== 'mg' && target !== 'tdx')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only en -> mg or en -> tdx dictionary scraping is supported',
        },
        { status: 400 }
      );
    }

    // Dictionary scraping is optimized for words/short phrases.
    if (rawText.length > 64 || rawText.split(/\s+/).length > 4) {
      return NextResponse.json({
        success: false,
        translated: null,
        reason: 'Text too long for dictionary lookup',
      });
    }

    const term = encodeURIComponent(rawText.toLowerCase());
    const sourceCandidates: SourceCandidates = {
      glossary: [],
      glosbe: [],
      wiktionary: [],
      rakibolana: [],
      mymemory: [],
      malagasyword: [],
    };

    const glossaryHit = buildGlossaryResponse(rawText, target);
    if (glossaryHit) {
      return NextResponse.json(glossaryHit);
    }

    const glossaryEntry = lookupGlossary(rawText);
    if (glossaryEntry) {
      sourceCandidates.glossary = [glossaryEntry.translated];
    }

    // 1) Glosbe
    try {
      const html = await fetchText(`https://glosbe.com/en/mg/${term}`);
      sourceCandidates.glosbe = extractFromGlosbe(html, rawText);
    } catch {
      sourceCandidates.glosbe = [];
    }

    // 2) Wiktionary
    try {
      const html = await fetchText(`https://en.wiktionary.org/wiki/${term}`);
      sourceCandidates.wiktionary = extractFromWiktionary(html, rawText);
    } catch {
      sourceCandidates.wiktionary = [];
    }

    // 3) Rakibolana availability check (used as supporting source metadata)
    try {
      await fetchText(`https://www.rakibolana.org/rakibolana/teny/${term}`);
      sourceCandidates.rakibolana = [];
    } catch {
      sourceCandidates.rakibolana = [];
    }

    if (target === 'tdx') {
      try {
        sourceCandidates.mymemory = await fetchMyMemoryCandidates(rawText);
      } catch {
        sourceCandidates.mymemory = [];
      }

      const tandroySearchTerms = buildTandroyPivotTerms(rawText, sourceCandidates);
      const tandroyCandidates: string[] = [];

      for (const searchTerm of tandroySearchTerms) {
        const url = `http://malagasyword.org/bins/teny2/${encodeURIComponent(
          searchTerm.toLowerCase()
        )}`;

        try {
          const html = await fetchText(url);
          const extracted = extractFromTandroy(html);
          if (extracted.length) {
            sourceCandidates.malagasyword = uniqueCandidates(
              sourceCandidates.malagasyword,
              extracted
            );
            tandroyCandidates.push(...extracted);
          }
        } catch {
          // Ignore missing or non-matching entries and continue searching.
        }
      }

      const tandroyTranslated = pickBestCandidate(uniqueCandidates(tandroyCandidates));

      if (!tandroyTranslated) {
        return NextResponse.json({
          success: true,
          translated: rawText,
          source: 'preserve-english',
          providerUsed: 'preserve-english',
          confidence: 0.2,
          reason: 'No Tandroy equivalent found; preserving English',
        });
      }

      return NextResponse.json({
        success: true,
        translated: tandroyTranslated,
        source: 'tandroy-scrape',
        providerUsed: 'malagasyword.org',
        confidence: 0.68,
      });
    }

    const merged = uniqueCandidates(sourceCandidates.glosbe, sourceCandidates.wiktionary);
    const translated = pickBestCandidate(merged);

    if (!translated) {
      return NextResponse.json({
        success: true,
        translated: rawText,
        source: 'preserve-english',
        providerUsed: 'preserve-english',
        confidence: 0.2,
        reason: 'No Malagasy equivalent found; preserving English',
      });
    }

    return NextResponse.json({
      success: true,
      translated,
      source: 'dictionary-scrape',
      providerUsed: 'dictionary-scrape',
      confidence: 0.72,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Dictionary lookup failed: ${message}` },
      { status: 500 }
    );
  }
}
