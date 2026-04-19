# Translation Integration Implementation Guide

## Quick Reference: Files & Specific Locations

---

## 📍 CRITICAL - Hardware Items Translation

### File: [frontend/pages/dashboard.tsx](frontend/pages/dashboard.tsx)

**Location:** Lines ~75-85 (hardwareItems array)

**Current Code (FRENCH):**
```typescript
const hardwareItems = [
  { name: 'Capteur de pluie', detail: 'Détection des précipitations', ... },
  { name: 'Buzzer', detail: 'Alerte sonore', ... },
  { name: 'LED rouge / verte / jaune', detail: 'Signal visuel d'état', ... },
  { name: 'Pompe à eau', detail: 'Actionnement du débit', ... },
  { name: 'Relais 1 canal', detail: 'Commande de puissance', ... },
  { name: 'ESP32', detail: 'Microcontrôleur principal', ... },
  { name: 'DHT22', detail: 'Température et humidité', ... },
  { name: 'Bouton poussoir', detail: 'Commande manuelle', ... },
  { name: 'Capteur ultrason', detail: 'Mesure du niveau d'eau', ... },
  { name: 'Écran LCD', detail: 'Affichage local', ... },
];
```

**Change Required:**
- Translate these 10 items to English and Malagasy
- Add translations to `frontend/lib/i18n.ts` under a `hardware` key
- Replace hardcoded array with: `const hardwareItems = hardwareItems.map(item => ({ ...item, name: t(`hardware.${item.key}.name`), detail: t(`hardware.${item.key}.detail`) }))`

**Translation Needed:**
| French | English | Malagasy |
|--------|---------|----------|
| Capteur de pluie | Rain sensor | Fandrefesana orana |
| Détection des précipitations | Rain detection | Fisehoan'ny orana |
| Buzzer | Buzzer | Fanampy feo |
| Alerte sonore | Sound alert | Fampitandremana mahery |
| LED rouge / verte / jaune | Red/green/yellow LED | LED mena/maintso/mavo |
| Signal visuel d'état | Status light signal | Famantarana amin'ny solafaka |
| Pompe à eau | Water pump | Fampihoaran'rano |
| Actionnement du débit | Flow control | Fitantanan'ny fiboran |
| Relais 1 canal | 1-channel relay | Relais iray tsara |
| Commande de puissance | Power control | Fitantanan'ny hery |
| ESP32 | ESP32 | ESP32 (same) |
| Microcontrôleur principal | Main microcontroller | Micropamindrahana lehibe |
| DHT22 | DHT22 | DHT22 (same) |
| Température et humidité | Temperature & humidity | Hafanana sy mangatsiaka |
| Bouton poussoir | Push button | Kengem pikilika |
| Commande manuelle | Manual control | Fitantanan'ny an-tana |
| Capteur ultrason | Ultrasonic sensor | Fandrefesana ultrason |
| Mesure du niveau d'eau | Water level measurement | Fandrefesana haavon'rano |
| Écran LCD | LCD display | Fampisehoan'ny LCD |
| Affichage local | Local display | Fampisehoan'ny akanjo |

---

## 📍 HIGH PRIORITY - Reservoir Status Labels

### File: [frontend/pages/dashboard.tsx](frontend/pages/dashboard.tsx)

**Location:** Lines ~245-260 (ReservoirCard function)

**Current Code:**
```typescript
const reservoirStatus = reservoirLevel > 70 ? 'Optimal' : reservoirLevel > 40 ? 'Normal' : 'Low';
```

**Change Required:**
- Use i18n keys instead of hardcoded strings
- Current labels: "Optimal", "Normal", "Low"
- Also: "Reservoir Representation", "Current Water Level", "Average", "Latest Read"

**Translations Needed:**
- Optimal → Mahatsara (Malagasy)
- Normal → Mahalala (Malagasy)  
- Low → Kely (Malagasy)
- Reservoir Representation → Taolan'rano Fanehoana (Malagasy)
- Current Water Level → Haavon'rano Ankehitriny (Malagasy)

---

## 📍 HIGH PRIORITY - Dashboard Error/Loading Messages

### File: [frontend/pages/dashboard.tsx](frontend/pages/dashboard.tsx)

**Locations with hardcoded messages:**

| Line | Text | Status |
|------|------|--------|
| ~380 | "Loading reservoirs..." | Hardcoded |
| ~395 | "Connection is slow" | Hardcoded |
| ~398 | "You can add a reservoir..." | Hardcoded |
| ~408 | (uses `t('common.error')`) | ✅ OK |
| ~420 | "Monitoring ready" | Hardcoded |
| ~423 | "A reservoir is shown here..." | Hardcoded |
| ~426 | "No reservoirs available..." | Hardcoded |
| ~445 | "Matériel utilisé" | **FRENCH** |
| ~446 | "Montage physique connecté..." | **FRENCH** |

**i18n Keys to Add:**
```typescript
dashboard: {
  loadingReservoirs: 'Loading reservoirs...',
  connectionSlow: 'Connection is slow',
  addReservoirManually: 'You can add a reservoir manually while the backend reconnects.',
  monitoringReady: 'Monitoring ready',
  firstMeasurement: 'A reservoir is shown here even before the first measurement arrives.',
  noReservoirs: 'No reservoirs available for monitoring yet',
  hardwareUsed: 'Matériel utilisé',
  hardwareDescription: 'Montage physique connecté à cette solution de surveillance',
  // ... translations in Malagasy
}
```

---

## 📍 HIGH PRIORITY - Home Page Marketing Text

### File: [frontend/pages/index.tsx](frontend/pages/index.tsx)

**Hardcoded Text Locations:**

| Line | Text | Type |
|------|------|------|
| ~65 | "Smart Water Monitoring" | Title |
| ~66 | "Real-time reservoir monitoring..." | Subtitle |
| ~77 | "Real-time Monitoring" | Feature 1 |
| ~78 | "Instant water level tracking..." | Feature 1 desc |
| ~85 | "Multi-Sensor Support" | Feature 2 |
| ~86 | "Temperature, pH, turbidity..." | Feature 2 desc |
| ~93 | "Smart Alerts" | Feature 3 |
| ~94 | "Instant notifications..." | Feature 3 desc |
| ~148 | "System Status" | Section title |
| ~150 | (message from health endpoint) | Dynamic |
| ~161 | "Welcome" | Section title |
| ~164 | (message from API endpoint) | Dynamic |
| ~172 | "Connection Issue" | Error title |
| ~176 | "Initializing" | Loading state |
| ~177 | "Loading system data..." | Loading message |
| ~185 | "Start Monitoring Now" | CTA title |
| ~186 | "Access real-time reservoir..." | CTA description |
| ~189 | "Go to Dashboard" | CTA button |

**i18n Keys to Add:**
```typescript
home: {
  heroTitle: 'Smart Water Monitoring',
  heroSubtitle: 'Real-time reservoir monitoring with intelligent sensors and analytics',
  
  features: [
    {
      title: 'Real-time Monitoring',
      description: 'Instant water level tracking and sensor data'
    },
    {
      title: 'Multi-Sensor Support',
      description: 'Temperature, pH, turbidity & flow monitoring'
    },
    {
      title: 'Smart Alerts',
      description: 'Instant notifications for critical events'
    }
  ],
  
  systemStatus: 'System Status',
  welcome: 'Welcome',
  connectionIssue: 'Connection Issue',
  initializing: 'Initializing',
  loadingSystemData: 'Loading system data...',
  
  ctaTitle: 'Start Monitoring Now',
  ctaDescription: 'Access real-time reservoir data and insights',
  ctaButton: 'Go to Dashboard',
}
```

---

## 📍 MEDIUM PRIORITY - Sidebar Navigation

### File: [frontend/components/Sidebar.tsx](frontend/components/Sidebar.tsx)

**Hardcoded Navigation Labels:**

**Location:** Lines ~42-50 (navItems array)

```typescript
const navItems = [
  {
    label: 'Home',  // ← Hardcoded
    icon: FiHome,
    href: '/',
  },
  {
    label: 'Dashboard',  // ← Hardcoded
    icon: FiActivity,
    href: '/dashboard',
  },
];
```

**Change Required:**
- Use i18n keys for labels
- Can either: (A) use `t()` directly in component, or (B) add to i18n and reference

**i18n Keys to Add:**
```typescript
nav: {
  home: 'Home',
  dashboard: 'Dashboard',
}
```

**Translations:**
- Home → Fandraisana (Malagasy)
- Dashboard → Tableau de bord / Faritra fahita (Malagasy)

---

## 📍 REFERENCE - i18n.ts Current Structure

### File: [frontend/lib/i18n.ts](frontend/lib/i18n.ts)

**Current Keys Already Defined:**

**English (en):**
```
common: { loading, error, success, cancel, add, delete, edit, save, close, connected, disconnected, status, type, location, name, value, unit, latest, average, minimum, maximum }

home: { title, subtitle, welcome, serverStatus, dashboard, dashboardDescription, goToDashboard }

dashboard: { 
  title, devices, deviceCount, noDevices, addDevice, cancelAdd, deviceName, selectType, location, 
  createDevice, deleteDevice, confirmDelete, selectDevice, statistics, liveReadings, noReadings, 
  justNow, temperature, humidity, motion, pressure, light, websocketStatus, websocketConnected, 
  websocketDisconnected 
}

deviceTypes: { temperature, humidity, motion, pressure, light }
```

**Malagasy (mg):**
- Same keys, with Malagasy translations

**Where to Add New Keys:**
- Add to BOTH the `en` object and the `mg` object
- Keep keys in alphabetical order within sections
- Follow existing naming conventions (camelCase)

---

## 📍 API Integration Points

### File: [frontend/app/api/translate-libre/route.ts](frontend/app/api/translate-libre/route.ts)

**Usage Pattern (if dynamic translation needed):**
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

**Currently Used:** ❌ Not called from any React component

**Should Be Used For:**
- Device names from API
- Custom user-entered text
- Real-time dynamic content

---

## 🎯 IMPLEMENTATION CHECKLIST

### Step 1: Update i18n.ts
- [ ] Add `hardware` section with 10 items (name + detail) for en + mg
- [ ] Add `home.features` array for feature cards (en + mg)
- [ ] Add `home.cta*` keys for call-to-action (en + mg)
- [ ] Add `home.systemStatus`, `home.welcome`, `home.connectionIssue`, etc. (en + mg)
- [ ] Add `dashboard.*` keys for error/loading messages (en + mg)
- [ ] Add `nav.home`, `nav.dashboard` (en + mg)

### Step 2: Update dashboard.tsx
- [ ] Replace hardcoded hardware items with i18n
- [ ] Replace status labels with i18n
- [ ] Replace section headers with i18n
- [ ] Replace error/loading messages with i18n

### Step 3: Update index.tsx
- [ ] Replace hero title/subtitle with i18n
- [ ] Replace feature card titles/descriptions with i18n
- [ ] Replace CTA text with i18n
- [ ] Replace section headers with i18n

### Step 4: Update Sidebar.tsx
- [ ] Replace nav labels with i18n

### Step 5: Testing
- [ ] Switch to English - verify all text shows in English
- [ ] Switch to Malagasy - verify all text shows in Malagasy
- [ ] Check that no hardcoded text remains
- [ ] Test on mobile viewport

---

## 📊 Translation Progress Tracker

| Area | Files | Strings | Status | Priority |
|------|-------|---------|--------|----------|
| Hardware Items | dashboard.tsx | 20 | ❌ Not started | 🔴 CRITICAL |
| Home Page | index.tsx | 15 | ❌ Not started | 🟠 HIGH |
| Dashboard Errors | dashboard.tsx | 8 | ❌ Not started | 🟠 HIGH |
| Navigation | Sidebar.tsx | 2 | ❌ Not started | 🟡 MEDIUM |
| i18n Setup | i18n.ts | 45 | ⏳ Partial | 🔴 CRITICAL |
| Language Context | LanguageContext.tsx | N/A | ✅ Done | ✅ Complete |
| AppHeader | AppHeader.tsx | N/A | ✅ Done | ✅ Complete |
| **TOTAL** | | **90** | **~50% Done** | |

---

## 💾 File References for Easy Navigation

### To Translate (Priority Order)

1. **[frontend/lib/i18n.ts](frontend/lib/i18n.ts)** - Add all missing translation keys
2. **[frontend/pages/dashboard.tsx](frontend/pages/dashboard.tsx)** - Update to use i18n
3. **[frontend/pages/index.tsx](frontend/pages/index.tsx)** - Update to use i18n
4. **[frontend/components/Sidebar.tsx](frontend/components/Sidebar.tsx)** - Update to use i18n

### Already Good (No Changes)

- ✅ [frontend/lib/LanguageContext.tsx](frontend/lib/LanguageContext.tsx)
- ✅ [frontend/components/AppHeader.tsx](frontend/components/AppHeader.tsx)
- ✅ [frontend/app/api/translate-libre/route.ts](frontend/app/api/translate-libre/route.ts)
- ✅ [frontend/app/api/translate/route.ts](frontend/app/api/translate/route.ts)

---

## 🚀 Quick Start Commands

Once translations are added to i18n.ts:

```bash
# To test language switching locally:
cd frontend
npm run dev

# Then in browser:
# 1. Open http://localhost:3000
# 2. Click language switcher in header
# 3. Verify all text changes
```

---

## 📝 Notes

- **Rakibolana Terms:** Already embedded in translate-mymemory.ts and translate-google.ts
- **Backend:** Returns English text; frontend handles translation
- **Caching:** Consider caching translations in localStorage for performance
- **RTL Support:** Not needed (both English and Malagasy are LTR)
- **Pluralization:** Use simple approach (no complex i18n pluralization needed yet)

