# AroRano Translation Integration Analysis

**Generated:** April 19, 2026  
**Project:** AroRano IoT Water Monitoring System  
**Scope:** Frontend React application (Next.js)

---

## 1. REACT COMPONENTS & PAGES INVENTORY

### Pages (in `frontend/pages/`)

#### **index.tsx** - Homepage/Landing Page
- **Location:** [frontend/pages/index.tsx](frontend/pages/index.tsx)
- **Key Text Content:**
  - Hero title: "Smart Water Monitoring"
  - Subtitle: "Real-time reservoir monitoring with intelligent sensors and analytics"
  - Feature cards: "Real-time Monitoring", "Multi-Sensor Support", "Smart Alerts"
  - System status section with health/error messages
  - CTA: "Start Monitoring Now", "Go to Dashboard"
- **Current Implementation:** Mixed i18n usage - uses `t()` function for some text but many strings are hardcoded in English
- **Translation Status:** ⚠️ **Partial** - Some strings use `t()`, many are hardcoded

#### **dashboard.tsx** - Device Monitoring Dashboard
- **Location:** [frontend/pages/dashboard.tsx](frontend/pages/dashboard.tsx)
- **Key Text Content (EXTENSIVE):**
  - Loading states: "Loading reservoirs..."
  - Error messages: "Connection is slow", "Connection Issue"
  - Device labels and status
  - Reservoir visualization: "Reservoir Representation", "Optimal", "Normal", "Low"
  - Statistics labels: "Current Water Level", "Average", "Latest Read", "Maximum", "Minimum"
  - Hardware section title: "Matériel utilisé" (French!)
  - Hardware descriptions: "Capteur de pluie", "Buzzer", "Pompe à eau", etc. (All in French!)
  - WebSocket status: "WebSocket Connected", "WebSocket Disconnected"
  - Measurement values and units
- **Current Implementation:** Uses `t()` for some UI elements but hardware list and many labels are hardcoded
- **Translation Status:** ⚠️ **Critical** - Dashboard has extensive French hardware labels without translation

#### **_app.tsx** - App Root Component
- **Location:** [frontend/pages/_app.tsx](frontend/pages/_app.tsx)
- **Purpose:** App initialization with LanguageProvider
- **Translation Status:** ✅ **Setup** - LanguageProvider correctly configured

### Components (in `frontend/components/`)

#### **AppHeader.tsx** - Top Navigation Bar
- **Location:** [frontend/components/AppHeader.tsx](frontend/components/AppHeader.tsx)
- **Key Text:**
  - Language selector label with native language names
  - Uses language metadata from i18n
- **Translation Status:** ✅ **Good** - Uses language context and i18n metadata properly
- **Features:**
  - Language dropdown menu
  - Displays available languages (filters to English + Malagasy for auto-translate)
  - Shows current language with native name

#### **Sidebar.tsx** - Navigation Sidebar
- **Location:** [frontend/components/Sidebar.tsx](frontend/components/Sidebar.tsx)
- **Key Text:**
  - Nav items: "Home", "Dashboard"
  - Accessibility labels (aria-label)
- **Translation Status:** ⚠️ **Missing** - Nav labels are hardcoded English without translation keys

#### **Layout.tsx** - Main Layout Container
- **Location:** [frontend/components/Layout.tsx](frontend/components/Layout.tsx)
- **Text Content:** Minimal (structural component)
- **Translation Status:** ✅ **N/A** - No user-facing text

#### **LanguageSwitcher.tsx** - Language Selection
- **Location:** [frontend/components/LanguageSwitcher.tsx](frontend/components/LanguageSwitcher.tsx)
- **Key Text:**
  - "Select Language"
  - Language names: "English", "Malagasy"
  - Flags: 🇬🇧 🇲🇬
- **Translation Status:** ✅ **Good** - Uses context and hardcoded language list (minimal, acceptable)

#### **WaveAnimation.tsx** - Visual Component
- **Location:** [frontend/components/WaveAnimation.tsx](frontend/components/WaveAnimation.tsx)
- **Text Content:** None (SVG/CSS animation)
- **Translation Status:** ✅ **N/A** - No user-facing text

---

## 2. TRANSLATION INTEGRATION POINTS

### Critical Gaps (Priority 1 - Must Translate)

| Component | Location | Text Type | Current | Priority |
|-----------|----------|-----------|---------|----------|
| **dashboard.tsx** | Hardware items list | French descriptions | Hardcoded | 🔴 **CRITICAL** |
| **dashboard.tsx** | Reservoir status | Status labels | Hardcoded | 🔴 **CRITICAL** |
| **dashboard.tsx** | Error/loading messages | UI feedback | Mixed | 🟠 **HIGH** |
| **index.tsx** | Hero section | Marketing text | Hardcoded | 🟠 **HIGH** |
| **index.tsx** | Feature descriptions | Marketing text | Hardcoded | 🟠 **HIGH** |
| **Sidebar.tsx** | Navigation labels | UI text | Hardcoded | 🟠 **HIGH** |
| **dashboard.tsx** | Statistics labels | UI text | Mixed | 🟠 **HIGH** |
| **dashboard.tsx** | Reservoir section headers | UI text | Hardcoded | 🟡 **MEDIUM** |

### Devices/IoT Hardware Text (HIGH PRIORITY)

**Current Issue:** Dashboard hardcodes French hardware descriptions:
```
{ name: 'Capteur de pluie', detail: 'Détection des précipitations', ... }
{ name: 'Buzzer', detail: 'Alerte sonore', ... }
{ name: 'Pompe à eau', detail: 'Actionnement du débit', ... }
{ name: 'Relais 1 canal', detail: 'Commande de puissance', ... }
{ name: 'ESP32', detail: 'Microcontrôleur principal', ... }
{ name: 'DHT22', detail: 'Température et humidité', ... }
{ name: 'Capteur ultrason', detail: 'Mesure du niveau d\'eau', ... }
```

**Needed:** Translation for 10 hardware items × 2 languages (English + Malagasy)

### Semi-Implemented Areas (Already Using i18n)

| Area | Status | Usage |
|------|--------|-------|
| Common buttons | ✅ Partial | `t('common.add')`, `t('common.delete')`, etc. |
| Device names | ✅ Partial | `t('deviceTypes.temperature')`, etc. |
| Dashboard title | ✅ Partial | Some sections use `t()` |
| Status messages | ⚠️ Mixed | Some hardcoded, some use `t()` |

---

## 3. CURRENT TRANSLATION API ENDPOINT USAGE

### Existing Endpoints

#### **POST /api/translate** - Claude (Anthropic) AI Translation
- **Location:** [frontend/app/api/translate/route.ts](frontend/app/api/translate/route.ts)
- **Status:** ✅ **Active**
- **Purpose:** High-quality translation using Claude Sonnet
- **Features:**
  - Accepts Rakibolana terms for domain-specific accuracy
  - Returns: `{ success, translated }`
  - Requires: `ANTHROPIC_API_KEY` environment variable
- **Best For:** Complex UI strings, marketing copy, documentation
- **Limitations:** Requires paid API key

#### **POST /api/translate-libre** - MyMemory Free API
- **Location:** [frontend/app/api/translate-libre/route.ts](frontend/app/api/translate-libre/route.ts)
- **Status:** ✅ **Active**
- **Purpose:** Free translation using MyMemory + Rakibolana terms
- **Features:**
  - No API keys needed
  - Supports term replacement
  - Returns: `{ success, translated }`
- **Best For:** Real-time translations, high-volume translations
- **Limitations:** Lower quality than Claude, limited context awareness

#### **POST /api/translate-google** (In Progress)
- **Location:** [frontend/app/api/translate-google/route.ts](frontend/app/api/translate-google/route.ts)
- **Status:** ⏳ **Setup Phase** (per session memory)
- **Purpose:** Google Cloud Translation API
- **Features:**
  - 500k free characters/month
  - Rakibolana term injection
  - Good balance of quality and cost
- **Status:** Awaiting Google Cloud credentials setup

### No Current Usage in Frontend

❌ **The translation endpoints are NOT being called from React components**

**Current i18n System:**
- Uses static translations from `frontend/lib/i18n.ts`
- Only has English (en) and Malagasy (mg) pre-translated strings
- Covers: common terms, dashboard labels, device types
- Does NOT cover: dynamic text, hardware descriptions, marketing copy

**Gap:** No component currently calls the translate API endpoints for dynamic content

---

## 4. MYMEMORY TRANSLATION SYSTEM INTEGRATION NEEDED

### Current Library Implementation
- **File:** [frontend/lib/translate-mymemory.ts](frontend/lib/translate-mymemory.ts)
- **Status:** ✅ **Complete** - Ready to use
- **Exports:**
  - `translateWithMyMemory(text, options?)` - Translate with Rakibolana terms
  - `applyRakibTerms()` - Apply domain-specific term substitution

### How It Should Be Integrated

#### **Option A: Static Component Approach** (Recommended for Most Text)
Use pre-translated strings in `i18n.ts` for UI text:
```typescript
// Already implemented
import { t } from '@/lib/i18n';

// In component
<h1>{t('dashboard.title')}</h1>
<span>{t('dashboard.websocketConnected')}</span>
```

#### **Option B: Dynamic Translation Approach** (For User-Generated Content)
Use MyMemory API for real-time translation:
```typescript
// For dynamic content from backend or user input
import { translateWithMyMemory } from '@/lib/translate-mymemory';

const translated = await translateWithMyMemory(dynamicText, {
  terms: rakibolanaTerms,
  timeout: 30000
});
```

#### **Option C: API Endpoint Approach** (Best for React Components)
Use the `/api/translate-libre` endpoint:
```typescript
const response = await fetch('/api/translate-libre', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Pompe à eau',
    terms: [{ fr: 'Pompe à eau', mg: 'fampihoaran\'rano' }]
  })
});
const { translated } = await response.json();
```

### Rakibolana Terms Already Embedded

**Current Coverage:** 50+ water/IoT system terms in `frontend/lib/translate-mymemory.ts`:

| Category | Example Terms |
|----------|---------------|
| **Water/Hydrology** | eau→rano, réservoir→taolan'rano, pompe→fampihoaran'rano, barrage→fivadiana |
| **Operations** | irrigation→fanampiana, démarrer→hampamikingy, arrêter→hatsahatra |
| **Status** | actif→miasa, inactif→tsy miasa, critique→mahatalora |
| **Measurements** | température→hafana, humidité→mangatsiaka, débit→fiboran |
| **UI Common** | enregistrer→tehirizo, supprimer→fafao, modifier→havaozina |

---

## 5. EXISTING TRANSLATION IMPLEMENTATIONS

### ✅ Implemented Features

1. **Language Detection & Persistence**
   - File: [frontend/lib/ai-translate.ts](frontend/lib/ai-translate.ts)
   - Detects browser language
   - Saves user preference to localStorage
   - Functions: `detectBrowserLanguage()`, `getSavedLanguage()`, `saveLanguage()`, `getUserLanguage()`

2. **Language Context System**
   - File: [frontend/lib/LanguageContext.tsx](frontend/lib/LanguageContext.tsx)
   - React Context for language state management
   - Hook: `useLanguage()` for accessing language in components
   - Auto-detects user language on first load

3. **Static i18n Translations**
   - File: [frontend/lib/i18n.ts](frontend/lib/i18n.ts)
   - Pre-translated strings for:
     - Common UI (loading, error, success, cancel, etc.)
     - Home page texts
     - Dashboard labels
     - Device types
   - Languages: English (en), Malagasy (mg), Tandroy dialect (tdx)
   - Exports: `t(key, language)` function, `getLanguage()`, `getAvailableLanguages()`

4. **AppHeader Language Switcher**
   - File: [frontend/components/AppHeader.tsx](frontend/components/AppHeader.tsx)
   - Dropdown to select language
   - Triggers page reload to apply changes
   - Shows native language names (e.g., "Malagasy" shows as "Malagasy")

5. **Translation API Endpoints**
   - Claude endpoint: `/api/translate`
   - MyMemory endpoint: `/api/translate-libre`
   - Both support Rakibolana term injection

### ⚠️ Partially Implemented

1. **Hardware Items Translation**
   - Currently HARDCODED in French in dashboard.tsx
   - Should be moved to i18n.ts with translations
   - 10 items × 2 languages needed

2. **Dynamic Content Translation**
   - Endpoints exist but not used in UI
   - MyMemory library ready but not integrated into components

### ❌ Not Implemented

1. **Automatic String Detection & Translation**
   - No system to find untranslated strings
   - No build-time translation validation

2. **Backend API Response Translation**
   - API returns English/untranslated text
   - Frontend doesn't auto-translate API responses

3. **Real-time Device Data Translation**
   - Device names, locations, metadata not translated
   - Sensor reading units could be localized

---

## 6. INTEGRATION ROADMAP - RECOMMENDED APPROACH

### Phase 1: Fix Critical Gaps (Hardware Items & Status Labels)

**Files to Update:**
1. **frontend/lib/i18n.ts** - Add hardware items to translations
2. **frontend/pages/dashboard.tsx** - Use i18n for hardware list

**Hardware Items to Translate:**
```
Capteur de pluie (Rain sensor)
Buzzer
LED RGB (RGB LED)
Pompe à eau (Water pump)
Relais 1 canal (1-channel relay)
ESP32 (Microcontroller)
DHT22 (Temp/humidity sensor)
Capteur ultrason (Ultrasonic sensor)
Écran LCD (LCD screen)
Bouton poussoir (Push button)
```

### Phase 2: Translate Marketing/Home Page Text

**Files to Update:**
1. **frontend/lib/i18n.ts** - Add home page strings
2. **frontend/pages/index.tsx** - Use i18n for all hardcoded text

**Strings to Add:**
- Hero section (title, subtitle)
- Feature cards (3 cards)
- CTA text
- Status section headers

### Phase 3: Fix Navigation & Sidebar

**Files to Update:**
1. **frontend/lib/i18n.ts** - Add nav labels
2. **frontend/components/Sidebar.tsx** - Use i18n

**Strings to Add:**
- "Home"
- "Dashboard"
- Accessibility labels

### Phase 4: Implement Dynamic Translation (Future)

**Use Cases:**
- Device names (from API)
- Custom locations
- User-entered descriptions
- Real-time data labels

**Implementation:**
- Create `useTranslate()` hook
- Call `/api/translate-libre` for dynamic content
- Cache translations locally
- Provide loading states

---

## 7. FILE LIST WITH TRANSLATION STATUS

### ✅ Ready (No Changes Needed)
- [frontend/components/AppHeader.tsx](frontend/components/AppHeader.tsx) - Language switcher ✅
- [frontend/lib/LanguageContext.tsx](frontend/lib/LanguageContext.tsx) - Language context ✅
- [frontend/lib/i18n.ts](frontend/lib/i18n.ts) - i18n system (but needs new entries) ⚠️
- [frontend/app/api/translate-libre/route.ts](frontend/app/api/translate-libre/route.ts) - Free API ✅
- [frontend/app/api/translate/route.ts](frontend/app/api/translate/route.ts) - Claude API ✅

### ⚠️ Needs Translation Integration
- [frontend/pages/index.tsx](frontend/pages/index.tsx) - Add i18n calls 🔴 **HIGH**
- [frontend/pages/dashboard.tsx](frontend/pages/dashboard.tsx) - Add i18n calls 🔴 **CRITICAL**
- [frontend/components/Sidebar.tsx](frontend/components/Sidebar.tsx) - Add i18n calls 🟠 **HIGH**
- [frontend/lib/i18n.ts](frontend/lib/i18n.ts) - Add missing translations 🔴 **CRITICAL**

---

## 8. CURRENT INTEGRATION FLOW

```
User Opens App
    ↓
LanguageProvider initializes
    ↓
getUserLanguage() → localStorage → browser detect → 'en'
    ↓
AppHeader renders language switcher
    ↓
User changes language → setLanguage() → page reload
    ↓
Components call t('key', language)
    ↓
i18n.ts returns pre-translated string
    ↓
UI displays in selected language
```

### What's Missing

```
❌ Hardware items stay in French (not in i18n)
❌ Dynamic content not translated
❌ No fallback for missing translations
❌ No translation of API responses
```

---

## 9. RECOMMENDED TRANSLATION STRATEGY

### For Static UI Text: Use i18n.ts (Current Approach) ✅
- Fast (no API calls)
- Reliable (pre-translated)
- SEO-friendly
- No latency

**Implementation:**
1. Add all strings to i18n.ts
2. Import `t` function
3. Call `t('key')`

### For Dynamic Content: Use /api/translate-libre 📋
- For user-generated content
- For device names/descriptions from API
- For future expansion

**Implementation:**
1. Create `useTranslate()` hook
2. Call endpoint
3. Cache results
4. Show loading state

### For High-Quality Translations: Use Claude API 💎
- Complex strings
- Marketing copy
- First-time translations
- Batch translations

**Implementation:**
1. Can be called at build-time
2. Results stored in i18n.ts
3. No runtime API calls needed

---

## 10. SUMMARY TABLE

| Aspect | Status | Details |
|--------|--------|---------|
| **Language Detection** | ✅ Done | Browser + localStorage |
| **Language Switching** | ✅ Done | AppHeader dropdown |
| **i18n System** | ✅ Done | i18n.ts with en/mg |
| **API Endpoints** | ✅ Done | Claude + MyMemory ready |
| **Static Text** | ⚠️ Partial | Some using i18n, many hardcoded |
| **Hardware Labels** | ❌ Missing | All in French, needs translation |
| **Navigation** | ❌ Missing | Hardcoded English |
| **Marketing Copy** | ❌ Missing | Hardcoded English |
| **Dynamic Content** | ❌ Not Used | Endpoints exist, not integrated |
| **Real-time Data** | ❌ Not Translated | Device names, units stay in English |

---

## 11. NEXT STEPS (FOR USER)

### Immediate Actions
1. **Add hardware items translations** to i18n.ts (10 items × 2 languages)
2. **Update dashboard.tsx** to use i18n for hardware list
3. **Update index.tsx** to use i18n for marketing text
4. **Update Sidebar.tsx** to use i18n for nav labels
5. **Test** language switching works for all text

### Future Enhancements
1. Add Tandroy (tdx) dialect translations
2. Create `useTranslate()` hook for dynamic content
3. Implement translation caching
4. Add build-time translation validation
5. Support for API response translation
6. Device metadata translation

---

## APPENDIX: Translation Keys Needed

### For i18n.ts Addition

```typescript
// Hardware items (dashboard.tsx)
hardware: {
  rainSensor: { name: '...', detail: '...' },
  buzzer: { name: '...', detail: '...' },
  ledRGB: { name: '...', detail: '...' },
  waterPump: { name: '...', detail: '...' },
  relay: { name: '...', detail: '...' },
  esp32: { name: '...', detail: '...' },
  dht22: { name: '...', detail: '...' },
  ultrasonicSensor: { name: '...', detail: '...' },
  lcdScreen: { name: '...', detail: '...' },
  pushButton: { name: '...', detail: '...' },
},

// Home page (index.tsx)
home: {
  heroTitle: '...',
  heroSubtitle: '...',
  feature1Name: '...',
  feature1Desc: '...',
  feature2Name: '...',
  feature2Desc: '...',
  feature3Name: '...',
  feature3Desc: '...',
  ctaTitle: '...',
  ctaDescription: '...',
  ctaButton: '...',
  systemStatusTitle: '...',
  welcomeTitle: '...',
  connectionIssueTitle: '...',
},

// Navigation (Sidebar.tsx)
nav: {
  home: '...',
  dashboard: '...',
},

// Dashboard - additional (dashboard.tsx)
dashboard: {
  reservoirRepresentation: '...',
  hardwareUsed: '...',
  hardwareDescription: '...',
  // ... other missing keys
},
```

