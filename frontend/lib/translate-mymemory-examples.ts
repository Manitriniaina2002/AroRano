/**
 * MyMemory + Rakibolana Translation Examples
 * Practical usage patterns for your AroRano water system
 */

import { translateWithMyMemory, translateBatchMyMemory } from "@/lib/translate-mymemory";

// ========================================
// 1. RAKIBOLANA DICTIONARY EXAMPLES
// ========================================

/** Water system terminology */
export const WATER_SYSTEM_TERMS = [
  // Pumps and equipment
  { fr: "pompe à eau", mg: "fampihoaran'rano" },
  { fr: "pompe", mg: "pompy" },
  { fr: "réservoir", mg: "taolan'rano" },
  { fr: "citerne", mg: "bahoa rano" },
  { fr: "tuyau", mg: "fantsona" },
  { fr: "vanne", mg: "valitara" },
  
  // Operations
  { fr: "démarrer", mg: "hampamikingy" },
  { fr: "arrêter", mg: "hatsahatra" },
  { fr: "niveau", mg: "haavo" },
  { fr: "débit", mg: "fifindran'rano" },
  { fr: "pression", mg: "hery" },
  
  // Conditions
  { fr: "critique", mg: "mahafaty" },
  { fr: "normal", mg: "mahazatra" },
  { fr: "faible", mg: "kely" },
  { fr: "élevé", mg: "avo" },
];

/** Sensor and IoT terminology */
export const IOT_TERMS = [
  { fr: "capteur", mg: "famantarana" },
  { fr: "batterie", mg: "bateria" },
  { fr: "connexion", mg: "fifandraisana" },
  { fr: "signal", mg: "signal" },
  { fr: "perte de signal", mg: "fahaverezana signal" },
  { fr: "état", mg: "fitoeram-pokonolona" },
  { fr: "alerte", mg: "fampitandremana" },
];

/** Combined dictionary for irrigation system */
export const COMBINED_TERMS = [
  ...WATER_SYSTEM_TERMS,
  ...IOT_TERMS,
];

// ========================================
// 2. SIMPLE TRANSLATION EXAMPLES
// ========================================

/** Basic usage without terms */
export async function basicTranslationExample() {
  console.log("=== Basic Translation Example ===");
  
  const french = "Bonjour, comment allez-vous?";
  const malagasy = await translateWithMyMemory(french);
  
  console.log(`French:   ${french}`);
  console.log(`Malagasy: ${malagasy}`);
}

/** Translation with Rakibolana terms */
export async function translationWithTermsExample() {
  console.log("=== Translation with Rakibolana Terms ===");
  
  const french = "La pompe à eau a arrêté. Le niveau du réservoir est critique.";
  const malagasy = await translateWithMyMemory(french, {
    terms: WATER_SYSTEM_TERMS,
  });
  
  console.log(`French:   ${french}`);
  console.log(`Malagasy: ${malagasy}`);
}

// ========================================
// 3. PRACTICAL USE CASES
// ========================================

/** Water system alert message */
export async function waterSystemAlertExample() {
  console.log("=== Water System Alert Translation ===");
  
  const alert = "Alerte: La pompe à eau s'est arrêtée. Le débit est anormal.";
  const translation = await translateWithMyMemory(alert, {
    terms: WATER_SYSTEM_TERMS,
  });
  
  console.log(`Alert FR: ${alert}`);
  console.log(`Alert MG: ${translation}`);
  
  return translation;
}

/** Sensor status message */
export async function sensorStatusExample() {
  console.log("=== Sensor Status Translation ===");
  
  const status = "Le capteur de niveau détecte un état critique. Perte de signal détectée.";
  const translation = await translateWithMyMemory(status, {
    terms: COMBINED_TERMS,
  });
  
  console.log(`Status FR: ${status}`);
  console.log(`Status MG: ${translation}`);
  
  return translation;
}

/** Maintenance instruction */
export async function maintenanceInstructionExample() {
  console.log("=== Maintenance Instruction Translation ===");
  
  const instruction = "Vérifier la pression de la pompe. Inspecter tous les tuyaux pour détecter les fuites.";
  const translation = await translateWithMyMemory(instruction, {
    terms: WATER_SYSTEM_TERMS,
  });
  
  console.log(`Instruction FR: ${instruction}`);
  console.log(`Instruction MG: ${translation}`);
  
  return translation;
}

// ========================================
// 4. BATCH TRANSLATION EXAMPLES
// ========================================

/** Translate multiple system messages */
export async function batchTranslationExample() {
  console.log("=== Batch Translation Example ===");
  
  const messages = [
    "Démarrer la pompe à eau",
    "Arrêter le système d'irrigation",
    "Le niveau du réservoir est normal",
    "Vérifier la connexion du capteur",
    "Batterie faible détectée",
  ];
  
  const translations = await translateBatchMyMemory(messages, {
    terms: COMBINED_TERMS,
  });
  
  console.log("French → Malagasy:");
  messages.forEach((fr, i) => {
    console.log(`  ${fr} → ${translations[i]}`);
  });
  
  return translations;
}

// ========================================
// 5. ERROR HANDLING
// ========================================

/** Safe translation with error handling */
export async function safeTranslationExample() {
  console.log("=== Safe Translation with Error Handling ===");
  
  try {
    const french = "La pompe à eau fonctionne bien.";
    const malagasy = await translateWithMyMemory(french, {
      terms: WATER_SYSTEM_TERMS,
      timeout: 5000, // 5 second timeout
    });
    
    console.log(`✓ Success: ${malagasy}`);
    return malagasy;
  } catch (error) {
    console.error(`✗ Translation failed:`, error);
    return "Translation unavailable"; // Fallback
  }
}

// ========================================
// 6. REACT COMPONENT EXAMPLE
// ========================================

/**
 * React Component: Water System Translator
 * Usage in your Next.js app
 */
export function WaterSystemTranslatorComponent() {
  return `
// app/components/WaterSystemTranslator.tsx
"use client";

import { useState } from "react";
import { translateWithMyMemory } from "@/lib/translate-mymemory";
import { WATER_SYSTEM_TERMS } from "@/lib/translate-mymemory-examples";

export default function WaterSystemTranslator() {
  const [french, setFrench] = useState("");
  const [malagasy, setMalagasy] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const result = await translateWithMyMemory(french, {
        terms: WATER_SYSTEM_TERMS
      });
      setMalagasy(result);
    } catch (error) {
      setMalagasy("Translation failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Water System Translator</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">French Text</label>
          <textarea
            value={french}
            onChange={(e) => setFrench(e.target.value)}
            placeholder="Enter French text..."
            className="w-full h-24 border rounded p-2"
          />
        </div>
        
        <button
          onClick={handleTranslate}
          disabled={loading || !french}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Translating..." : "Translate"}
        </button>
        
        <div>
          <label className="block text-sm font-medium">Malagasy Translation</label>
          <textarea
            value={malagasy}
            readOnly
            placeholder="Translation will appear here..."
            className="w-full h-24 border rounded p-2 bg-gray-50"
          />
        </div>
      </div>
    </div>
  );
}
  `;
}

// ========================================
// 7. API USAGE EXAMPLE
// ========================================

/**
 * Backend usage example
 * How to call the /api/translate-libre endpoint
 */
export async function apiUsageExample() {
  console.log("=== API Usage Example ===");
  
  const message = "La pompe à eau fonctionne. Le niveau est normal.";
  
  try {
    const response = await fetch("/api/translate-libre", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
        terms: WATER_SYSTEM_TERMS,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`French:   ${message}`);
    console.log(`Malagasy: ${data.translated}`);
    
    return data.translated;
  } catch (error) {
    console.error("API call failed:", error);
  }
}

// ========================================
// 8. TEST ALL EXAMPLES
// ========================================

/** Run all examples */
export async function runAllExamples() {
  console.log("🌍 MyMemory + Rakibolana Translation Examples\n");
  
  try {
    await basicTranslationExample();
    console.log("\n---\n");
    
    await translationWithTermsExample();
    console.log("\n---\n");
    
    await waterSystemAlertExample();
    console.log("\n---\n");
    
    await sensorStatusExample();
    console.log("\n---\n");
    
    await maintenanceInstructionExample();
    console.log("\n---\n");
    
    await batchTranslationExample();
    console.log("\n---\n");
    
    await safeTranslationExample();
    console.log("\n---\n");
    
    await apiUsageExample();
    
    console.log("\n✅ All examples completed!");
  } catch (error) {
    console.error("❌ Example failed:", error);
  }
}
