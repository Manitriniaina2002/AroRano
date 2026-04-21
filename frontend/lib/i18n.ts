export type Language = 'en' | 'mg' | 'tdx';

// Language metadata for display and fallback
export const languageMetadata: Record<Language, { name: string; nativeName: string; fallback: Language }> = {
  en: { name: 'English', nativeName: 'English', fallback: 'en' },
  mg: { name: 'Malagasy (Standard)', nativeName: 'Malagasy', fallback: 'en' },
  tdx: { name: 'Antandroy (Tandroy Dialect)', nativeName: 'Tandroy', fallback: 'mg' },
};

// Translation metadata for tracking uncertain terms, variants, and review status
// interface TranslationMeta {
//   value: string;
//   needsReview?: boolean; // Marks uncertain translations
//   variants?: string[]; // Alternative valid translations
//   notes?: string; // Context or explanation
//   contributor?: string; // Who contributed this translation
// }

export const translations: Record<Language, any> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      add: 'Add',
      delete: 'Delete',
      edit: 'Edit',
      save: 'Save',
      sending: 'Sending...',
      close: 'Close',
      connected: 'Connected',
      disconnected: 'Disconnected',
      status: 'Status',
      type: 'Type',
      location: 'Location',
      name: 'Name',
      value: 'Value',
      unit: 'Unit',
      latest: 'Latest',
      average: 'Average',
      minimum: 'Minimum',
      maximum: 'Maximum',
      ok: 'OK',
      serverRunning: 'Server is running',
      systemReady: 'System is ready',
      expandSidebar: 'Expand sidebar',
      collapseSidebar: 'Collapse sidebar',
      logoAlt: 'AroRano logo',
      login: 'Welcome Back',
      signIn: 'Sign in to your AroRano account',
      email: 'Email',
      enterEmail: 'your@email.com',
      password: 'Password',
      enterPassword: 'Enter your password',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
      createAccount: 'Create Account',
      joinArorano: 'Join AroRano to manage your water system',
      fillInDetails: 'Fill in your details to get started',
      firstName: 'First Name',
      lastName: 'Last Name',
      confirmPassword: 'Confirm Password',
      passwordMismatch: 'Passwords do not match',
      creating: 'Creating account...',
      haveAccount: 'Already have an account?',
      profile: 'Profile',
      manageAccount: 'Manage your account information',
      role: 'Role',
      logout: 'Logout',
      logoutDesc: 'Sign out from this account',
      or: 'Or',
    },
    api: {
      welcome: 'Welcome to AroRano API!',
      serverHealth: 'Server is running',
    },
    dashboard: {
      title: 'Water Monitoring Dashboard',
      devices: 'Water Devices',
      deviceCount: 'Devices ({count})',
      noDevices: 'No devices yet',
      addDevice: 'Add Device',
      cancelAdd: 'Cancel',
      deviceName: 'Device name',
      selectType: 'Select device type',
      location: 'Location',
      createDevice: 'Create Device',
      deleteDevice: 'Delete Device',
      confirmDelete: 'Are you sure you want to delete this device?',
      selectDevice: 'Select a device to view details',
      statistics: 'Statistics',
      liveReadings: 'Live Data',
      waterReservoir: 'Water Reservoir',
      liveDataStream: 'Live Data Stream',
      waterStatus: 'Water Status',
      pumpStatus: 'Pump',
      alertStatus: 'Alert',
      systemStatus: 'System Status',
      currentWaterLevelDisplay: 'Current Water Level',
      liveConnected: 'Live Connected',
      waitingForData: 'Waiting for sensor data...',
      noReadings: 'No data yet',
      justNow: 'Just now',
      temperature: 'Temperature',
      humidity: 'Humidity',
      motion: 'Motion',
      pressure: 'Pressure',
      light: 'Light',
      websocketStatus: 'Connection Status',
      websocketConnected: 'Connected',
      websocketDisconnected: 'Disconnected',
      reservoirRepresentation: 'Water Level Indicator',
      reservoirOptimal: 'Optimal',
      reservoirNormal: 'Normal',
      reservoirLow: 'Low',
      currentWaterLevel: 'Current Water Level',
      waterSystemSetup: 'System Setup',
      setupDescription: 'Equipment connected to this monitoring',
      loadingReservoirs: 'Loading water data...',
      connectionSlow: 'Connection is slow',
      addReservoirManually: 'You can add a water system manually while the backend reconnects.',
      monitoringReady: 'Ready to monitor',
      firstMeasurement: 'A water system appears here even before the first reading arrives.',
      noReservoirs: 'No water systems available to monitor yet',
      hardwareUsed: 'Equipment Used',
      hardwareDescription: 'Physical equipment connected to this system',
      average: 'Average',
      latestRead: 'Latest Read',
      iotControlRoom: 'IoT Control Room',
      liveTelemetry: 'Live Telemetry',
      systemHealth: 'System Health',
      waterIntelligenceTitle: 'Water Intelligence at a Glance',
      waterIntelligenceSubtitle: 'Monitor reservoirs, temperature, humidity, pump state, and alert levels from one streamlined dashboard. Built for operators who need signal, not noise.',
      noDeviceSelected: 'No device selected',
      operationalSummary: 'Operational Summary',
      refresh: 'Refresh',
      deviceCountLabel: 'Device Count',
      warnings: 'Warnings',
      healthy: 'Healthy',
      userManagement: 'User Management',
      manageOperatorsAccess: 'Manage operators and access',
      selectedDevice: 'Selected Device',
      updated: 'Updated',
      reservoirLevel: 'Reservoir Level',
      rainDetected: 'Rain detected',
      dryConditions: 'Dry conditions',
      connectedTelemetrySources: 'Connected Telemetry Sources',
      noEsp32DataYet: 'No ESP32 devices have sent data yet.',
      levelShort: 'Level',
      tempShort: 'Temp',
      liveDetails: 'Live Details',
      loadingTelemetry: 'Loading telemetry...',
      currentState: 'Current State',
      alertLabel: 'alert',
      lastUpdated: 'last updated',
      at: 'at',
      averageWaterLevel: 'Average Water Level',
      averageTemperature: 'Average Temperature',
      rainDetections: 'Rain Detections',
      latestPumpStatus: 'Latest Pump Status',
      fillReservoir: 'Fill Reservoir',
      fillingReservoir: 'Filling reservoir...',
      latestCommand: 'Latest Command',
      commandPending: 'Pending',
      commandAcknowledged: 'Acknowledged',
      commandExecuted: 'Executed',
      commandFailedStatus: 'Failed',
      commandNoData: 'No command issued yet',
      commandSent: 'Fill command sent',
      commandFailed: 'Unable to send fill command',
      commandDuration: 'Pump duration',
      recentTrend: 'Recent Trend',
      last12Readings: 'Last 12 readings from the selected device',
      noRecentReadings: 'No recent readings available.',
      metricReadings: 'Readings',
      waterLevelLabel: 'Water Level',
      unableToLoadDeviceData: 'Unable to load device data',
      unableToLoadMonitoringData: 'Unable to load monitoring data',
    },
    deviceTypes: {
      // Sensors
      waterLevel: 'Water Level Sensor',
      rainSensor: 'Rain Sensor',
      ultrasonic: 'Ultrasonic Sensor',
      dht22: 'DHT22 Sensor',
      temperature: 'Temperature Sensor',
      humidity: 'Humidity Sensor',
      // Actuators
      waterPump: 'Water Pump',
      relay: 'Relay Control',
      // Indicators
      buzzer: 'Alarm Buzzer',
      ledRGB: 'RGB LED',
      lcdScreen: 'LCD Display',
      // Control
      pushButton: 'Push Button',
      // Microcontroller
      esp32: 'ESP32 Microcontroller',
      // Legacy
      turbidity: 'Turbidity Sensor',
      ph: 'pH Sensor',
      flowRate: 'Flow Rate Sensor',
      motion: 'Motion Detector',
      pressure: 'Pressure Sensor',
      light: 'Light Sensor',
    },
    home: {
      title: 'AroRano',
      subtitle: 'Smart Water Monitoring Platform',
      landingTitle: 'Water monitoring, simplified.',
      landingDescription: 'A modern control surface for reservoir status, IoT telemetry, and operator workflows.',
      openDashboard: 'Open dashboard',
      createAccount: 'Create account',
      welcome: 'Welcome',
      serverStatus: 'Server Status',
      systemStatus: 'System Status',
      connectionIssue: 'Connection Issue',
      initializing: 'Starting up',
      loadingSystemData: 'Loading system data...',
      startMonitoring: 'Start Monitoring Now',
      accessData: 'Access real-time water data and insights',
      dashboard: 'Water Monitoring Dashboard',
      dashboardDescription: 'Monitor and manage your water reservoirs with real-time data, sensor readings, and detailed statistics.',
      goToDashboard: 'Go to Dashboard',
      smartWaterMonitoring: 'Smart Water Monitoring',
      realtimeMonitoringDesc: 'Real-time water level tracking with intelligent sensors and analytics',
      realtimeMonitoring: 'Real-time Water Tracking',
      realtimeMonitoringDetail: 'Instant water level updates and sensor data',
      multiSensorSupport: 'Multiple Sensors',
      multiSensorDetail: 'Temperature, acidity (pH), water clarity & flow monitoring',
      smartAlerts: 'Smart Alerts',
      smartAlertsDetail: 'Instant notifications for important water events',
    },
    hardware: {
      rainSensor: { name: 'Rain Detector', detail: 'Detects rainfall' },
      buzzer: { name: 'Alarm Speaker', detail: 'Sound alerts for warnings' },
      ledRGB: { name: 'Status Light', detail: 'Color status indicator' },
      waterPump: { name: 'Water Pump', detail: 'Automatic water control' },
      relay: { name: 'Power Switch', detail: 'Controls power devices' },
      esp32: { name: 'Control Unit', detail: 'Brain of the system' },
      dht22: { name: 'Weather Sensor', detail: 'Measures temperature & humidity' },
      pushButton: { name: 'Manual Button', detail: 'Manual control trigger' },
      ultrasonic: { name: 'Water Level Sensor', detail: 'Measures water depth' },
      lcdScreen: { name: 'Display Screen', detail: 'Shows status on-site' },
    },
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      scraper: 'Scraper',
      profile: 'Profile',
      users: 'Users',
    },
  },
  mg: {
    common: {
      loading: 'Miandry...',
      error: 'Diso',
      success: 'Tsara',
      cancel: 'Ajanona',
      add: 'Ampio',
      delete: 'Hofafao',
      edit: 'Hanova',
      save: 'Tehirizo',
      sending: 'Mandefa...',
      close: 'Akatona',
      connected: 'Mañendrotse',
      disconnected: 'Tsy mañendrotse',
      status: 'Toe-javatra',
      type: 'Karazana',
      location: 'Toerana',
      name: 'Anarana',
      value: 'Sanda',
      unit: 'Singa',
      latest: 'Farany indrindra',
      average: 'Salan\'isa',
      minimum: 'Kely indrindra',
      maximum: 'Lehibe indrindra',
      justNow: 'Vao hare',
      ok: 'Tsara',
      serverRunning: 'Miasa ny server',
      systemReady: 'Vonona ny rafitra',
      expandSidebar: 'Sokafy ny sisiny',
      collapseSidebar: 'Akatona ny sisiny',
      logoAlt: 'Marika AroRano',
      login: 'Tonga soa indray',
      signIn: 'Midira amin\'ny kaonty AroRano',
      email: 'Email',
      enterEmail: 'your@email.com',
      password: 'Password',
      enterPassword: 'Ampidiro ny password',
      noAccount: 'Tsy manana kaonty?',
      signUp: 'Hisoratra anarana',
      createAccount: 'Mamorona kaonty',
      joinArorano: 'Midira AroRano hitantanana ny rafitra rano',
      fillInDetails: 'Fenoy ny antsipiriany vao manomboka',
      firstName: 'Anarana',
      lastName: 'Fanampin\'anarana',
      confirmPassword: 'Hamafiso ny password',
      passwordMismatch: 'Tsy mitovy ny passwords',
      creating: 'Mamory kaonty...',
      haveAccount: 'Efa manana kaonty?',
      profile: 'Mombamomba',
      manageAccount: 'Tantano ny mombamomba ny kaontinao',
      role: 'Role',
      logout: 'Hivoaka',
      logoutDesc: 'Mivoaha amin\'ity kaonty ity',
      or: 'Na',
    },
    api: {
      welcome: 'Tongasoa amin\'ny AroRano!',
      serverHealth: 'Miasa ny server',
    },
    home: {
      title: 'AroRano',
      subtitle: 'Platform Fanaraha-maso Rano Hendry',
      landingTitle: 'Fanaraha-maso rano, natao tsotra.',
      landingDescription: 'Takelaka maoderina hanaraha-maso ny satan\'ny reservoir, telemetry IoT, ary ny asan\'ny operators.',
      openDashboard: 'Sokafy ny dashboard',
      createAccount: 'Mamorona kaonty',
      welcome: 'Tongasoa',
      serverStatus: 'Toe-javatra Server',
      systemStatus: 'Toe-javatra Rafitra',
      connectionIssue: 'Olana amin\'ny fifandraisana',
      initializing: 'Manomboka',
      loadingSystemData: 'Miandry ny angon-drano...',
      startMonitoring: 'Atombohy izao ny fanaraha-maso',
      accessData: 'Jereo ny angon-drano sy ny tatitra amin\'ny fotoana tena izy',
      dashboard: 'Takelaka fanaraha-maso',
      dashboardDescription: 'Araho sy tantano ny tahirin-dranonao miaraka amin\'ny angona tena izy, vakiteny avy amin\'ny sensor, ary statistika feno.',
      goToDashboard: 'Mankany amin\'ny takelaka fanaraha-maso',
      smartWaterMonitoring: 'Fanaraha-maso rano hendry',
      realtimeMonitoringDesc: 'Fanaraha-maso ny haavon\'ny rano amin\'ny sensor marani-tsaina sy fanadihadiana',
      realtimeMonitoring: 'Fanaraha-maso ny haavon\'ny rano',
      realtimeMonitoringDetail: 'Fanavaozana avy hatrany momba ny haavon\'ny rano sy ny angona sensor',
      multiSensorSupport: 'Sensor maro',
      multiSensorDetail: 'Hafanana, asidra (pH), fahadiovan\'ny rano ary fikorianany',
      smartAlerts: 'Fampitandremana hendry',
      smartAlertsDetail: 'Mandrefy sy mampahafantara avy hatrany ho an\'ny zava-misy manan-danja momba ny rano',
    },
    hardware: {
      rainSensor: { name: 'Mpandrefy orana', detail: 'Mandrefy ny rotsak\'orana' },
      buzzer: { name: 'Fanamafisam-peo', detail: 'Moaka fampitandremana amin\'ny feo' },
      ledRGB: { name: 'Jiro RGB', detail: 'Mampiseho ny toetry ny rafitra' },
      waterPump: { name: 'Paompy rano', detail: 'Mandoha ny rano hendry' },
      relay: { name: 'Relais', detail: 'Mifehy ny herinaratra' },
      esp32: { name: 'Mpanorona', detail: 'Foiben\'ny rafitra' },
      dht22: { name: 'Sensor toetr’andro', detail: 'Mandrefy hafanana sy hamandoana' },
      pushButton: { name: 'Bokotra tanana', detail: 'Fibaikoana amin\'ny tanana' },
      ultrasonic: { name: 'Sensor haavon\'ny rano', detail: 'Mandrefy ny halaliny' },
      lcdScreen: { name: 'Efijery LCD', detail: 'Mampiseho ny sata eo an-toerana' },
    },
    nav: {
      home: 'Fandraisana',
      dashboard: 'Takelaka fanaraha-maso',
      scraper: 'Mpanangona',
      profile: 'Mombamomba',
      users: 'Mpampiasa',
    },
    dashboard: {
      title: 'Takelaka fanaraha-maso',
      devices: 'Fitaovana rano',
      deviceCount: 'Fitaovana ({count})',
      noDevices: 'Tsy mbola misy fitaovana',
      addDevice: 'Ampio fitaovana vaovao',
      cancelAdd: 'Ajanona',
      deviceName: 'Anaran\'ny fitaovana',
      selectType: 'Fidio ny karazana fitaovana',
      location: 'Toerana',
      createDevice: 'Hamorona fitaovana',
      deleteDevice: 'Fafao ny fitaovana',
      confirmDelete: 'Tianao hofafana tokoa ve ity fitaovana ity?',
      selectDevice: 'Fidio ny fitaovana iray hijerena ny antsipiriany',
      statistics: 'Statistika',
      liveReadings: 'Vakiteny tena izy',
      waterReservoir: 'Tahirin-drano',
      liveDataStream: 'Angon-dranon\'azo-avy hare',
      waterStatus: 'Toe-javatra rano',
      pumpStatus: 'Pompy',
      alertStatus: 'Fampitandremana',
      systemStatus: 'Toe-javatra rafitra',
      currentWaterLevelDisplay: 'Haavon\'ny rano ankehitriny',
      liveConnected: 'Mañendrotse hare',
      waitingForData: 'Miandry angona avy amin\'ny sensor...',
      noReadings: 'Tsy mbola misy vakiteny',
      temperature: 'Hafanana',
      humidity: 'Hamandoana',
      motion: 'Fihetsika',
      pressure: 'Tsindry',
      light: 'Hazavana',
      websocketStatus: 'Satan\'ny fifandraisana',
      websocketConnected: 'Mifandray',
      websocketDisconnected: 'Tsy mifandray',
      reservoirRepresentation: 'Famantarana ny haavon\'ny rano',
      reservoirOptimal: 'Tsara Loatra',
      reservoirNormal: 'Mahazatra',
      reservoirLow: 'Ambany',
      currentWaterLevel: 'Haavon\'ny rano ankehitriny',
      waterSystemSetup: 'Fametrahana rafitra rano',
      setupDescription: 'Ny fitaovana mifandray amin\'ity rafitra fanaraha-maso ity',
      loadingReservoirs: 'Miandry ny angon-drano...',
      connectionSlow: 'Miadana ny fifandraisana',
      addReservoirManually: 'Afaka manampy rafitra rano ianao raha mbola miverina ny backend.',
      monitoringReady: 'Vonona ny fanaraha-maso',
      firstMeasurement: 'Aseho eto ny rafitra rano na dia mbola tsy tonga aza ny vakiteny voalohany.',
      noReservoirs: 'Tsy mbola misy rafitra rano azo arahi-maso',
      hardwareUsed: 'Fitaovana nampiasaina',
      hardwareDescription: 'Ny fitaovana ara-batana mifandray amin\'ity rafitra ity',
      average: 'Salan\'isa',
      latestRead: 'Vakiteny farany',
      iotControlRoom: 'Efitra fanaraha-maso IoT',
      liveTelemetry: 'Telemetry mivantana',
      systemHealth: 'Fahasalamana rafitra',
      waterIntelligenceTitle: 'Fanaraha-maso rano amin\'ny fijery tokana',
      waterIntelligenceSubtitle: 'Araho amin\'ny dashboard iray ny reservoir, temperature, humidity, toetry ny pump, ary alert levels. Natao ho an\'ny operators mila signal mazava.',
      noDeviceSelected: 'Tsy misy device voafidy',
      operationalSummary: 'Topi-maso ny rafitra',
      refresh: 'Havaozy',
      deviceCountLabel: 'Isan\'ny Device',
      warnings: 'Warnings',
      healthy: 'Salama',
      userManagement: 'Fitantanana mpampiasa',
      manageOperatorsAccess: 'Tantano ny operators sy access',
      selectedDevice: 'Device voafidy',
      updated: 'Nohavaozina',
      reservoirLevel: 'Haavon\'ny Reservoir',
      rainDetected: 'Nisy orana',
      dryConditions: 'Maina',
      connectedTelemetrySources: 'Loharanon\'angona telemetry mifandray',
      noEsp32DataYet: 'Mbola tsy nandefa angona ny ESP32.',
      levelShort: 'Haavo',
      tempShort: 'Temp',
      liveDetails: 'Antsipiriany mivantana',
      loadingTelemetry: 'Miandry telemetry...',
      currentState: 'Toetry ny rafitra',
      alertLabel: 'alert',
      lastUpdated: 'nohavaozina farany',
      at: 'tamin\'ny',
      averageWaterLevel: 'Salan\'isan\'ny haavon\'ny rano',
      averageTemperature: 'Salan\'isan\'ny temperature',
      rainDetections: 'Isan\'ny fahitana orana',
      latestPumpStatus: 'Toetry ny Pump farany',
      fillReservoir: 'Fenoy ny reservoir',
      fillingReservoir: 'Mampandeha ny famenoana...',
      latestCommand: 'Baiko farany',
      commandPending: 'Miandry',
      commandAcknowledged: 'Voaray',
      commandExecuted: 'Vita',
      commandFailedStatus: 'Nisy lesoka',
      commandNoData: 'Tsy mbola nisy baiko nalefa',
      commandSent: 'Nalefa ny baiko famenoana',
      commandFailed: 'Tsy afaka nandefa ny baiko famenoana',
      commandDuration: 'Fe-potoanan’ny paompy',
      recentTrend: 'Firona farany',
      last12Readings: 'Vakiteny 12 farany amin\'ity device ity',
      noRecentReadings: 'Tsy misy vakiteny farany.',
      metricReadings: 'Vakiteny',
      waterLevelLabel: 'Haavon\'ny Rano',
      unableToLoadDeviceData: 'Tsy voa-load ny angona device',
      unableToLoadMonitoringData: 'Tsy voa-load ny angona fanaraha-maso',
    },
    deviceTypes: {
      // Sensors
      waterLevel: 'Water Level Sensor',
      rainSensor: 'Rain Sensor',
      ultrasonic: 'Ultrasonic Sensor',
      dht22: 'DHT22 Sensor',
      temperature: 'Temperature Sensor',
      humidity: 'Humidity Sensor',
      // Actuators
      waterPump: 'Water Pump',
      relay: 'Relay Control',
      // Indicators
      buzzer: 'Alarm Buzzer',
      ledRGB: 'RGB LED',
      lcdScreen: 'LCD Display',
      // Control
      pushButton: 'Push Button',
      // Microcontroller
      esp32: 'ESP32 Microcontroller',
      // Legacy
      turbidity: 'Turbidity Sensor',
      ph: 'pH Sensor',
      flowRate: 'Flow Rate Sensor',
      motion: 'Motion Detector',
      pressure: 'Pressure Sensor',
      light: 'Light Sensor',
    },
  },
  tdx: {
    // Antandroy (Tandroy) dialect translations
    // Note: Antandroy is the southern Malagasy dialect (sourced from motmalgache.org)
    common: {
      loading: 'Miandry...',
      error: 'Diso',
      success: 'Tsara',
      cancel: 'Ajanona',
      add: 'Ampio',
      delete: 'Fafao',
      edit: 'Hanova',
      save: 'Tehirizo',
      sending: 'Mandefa...',
      close: 'Akatona',
      connected: 'Mañendrotse',
      disconnected: 'Tsy mañendrotse',
      status: 'Toe-javatra',
      type: 'Karazany',
      location: 'Toerana',
      name: 'Anarana',
      value: 'Sanda',
      unit: 'Singa',
      latest: 'Farany indrindra',
      average: 'Salan\'isa',
      minimum: 'Kely indrindra',
      maximum: 'Lehibe indrindra',
      justNow: 'Vao hare',
      ok: 'Tsara',
      serverRunning: 'Miasa ny server',
      systemReady: 'Vonona ny rafitra',
      expandSidebar: 'Sokafy ny sisiny',
      collapseSidebar: 'Akatona ny sisiny',
      logoAlt: 'Marika AroRano',
      login: 'Tonga soa indray',
      signIn: 'Midira amin\'ny kaonty AroRano',
      email: 'Email',
      enterEmail: 'your@email.com',
      password: 'Password',
      enterPassword: 'Ampidiro ny password',
      noAccount: 'Tsy manana kaonty?',
      signUp: 'Hisoratra anarana',
      createAccount: 'Mamorona kaonty',
      joinArorano: 'Midira AroRano hitantanana ny rafitra rano',
      fillInDetails: 'Fenoy ny antsipiriany vao manomboka',
      firstName: 'Anarana',
      lastName: 'Fanampin\'anarana',
      confirmPassword: 'Hamafiso ny password',
      passwordMismatch: 'Tsy mitovy ny passwords',
      creating: 'Mamory kaonty...',
      haveAccount: 'Efa manana kaonty?',
      profile: 'Mombamomba',
      manageAccount: 'Tantano ny mombamomba ny kaontinao',
      role: 'Role',
      logout: 'Hivoaka',
      logoutDesc: 'Mivoaha amin\'ity kaonty ity',
      or: 'Na',
    },
    home: {
      title: 'AroRano',
      subtitle: 'Platform fanaraha-maso rano hendry',
      landingTitle: 'Fanaraha-maso rano, natao tsotra.',
      landingDescription: 'Takelaka maoderina hanaraha-maso ny satan\'ny reservoir, telemetry IoT, ary ny asan\'ny operators.',
      openDashboard: 'Sokafy ny dashboard',
      createAccount: 'Mamorona kaonty',
      welcome: 'Tongasoa',
      serverStatus: 'Toe-javatra Server',
      systemStatus: 'Toe-javatra Rafitra',
      connectionIssue: 'Mandoha tsy tsara ny ma\u00f1endrotse',
      initializing: 'Manomboka',
      loadingSystemData: 'Miandry ny angon-drano...',
      startMonitoring: 'Atombohy izao ny fanaraha-maso',
      accessData: 'Jereo ny angon-drano sy ny tatitra amin\'ny fotoana tena izy',
      dashboard: 'Takelaka fanaraha-maso',
      dashboardDescription: 'Araho sy tantano ny tahirin-dranonao miaraka amin\'ny angona tena izy, vakiteny avy amin\'ny sensor, ary statistika feno.',
      goToDashboard: 'Mankany amin\'ny takelaka fanaraha-maso',
      smartWaterMonitoring: 'Fanaraha-maso rano hendry',
      realtimeMonitoringDesc: 'Fanaraha-maso ny haavon\'ny rano amin\'ny sensor marani-tsaina sy fanadihadiana',
      realtimeMonitoring: 'Fanaraha-maso ny haavon\'ny rano',
      realtimeMonitoringDetail: 'Fanavaozana avy hatrany momba ny haavon\'ny rano sy ny angona sensor',
      multiSensorSupport: 'Sensor maro',
      multiSensorDetail: 'Hafanana, asidra (pH), fahadiovan\'ny rano ary fikorianany',
      smartAlerts: 'Fampitandremana hendry',
      smartAlertsDetail: 'Fampandrenesana avy hatrany ho an\'ny zava-misy manan-danja momba ny rano',
    },
    hardware: {
      rainSensor: { name: 'Mpandrefy orana', detail: 'Mandrefy ny rotsak’orana' },
      buzzer: { name: 'Fanamafisam-peo', detail: 'Moaka fampitandremana amin\'ny feo' },
      ledRGB: { name: 'Jiro RGB', detail: 'Maneho ny toetry ny rafitra' },
      waterPump: { name: 'Paompy rano', detail: 'Mandoha ny rano hendry' },
      relay: { name: 'Relais', detail: 'Mifehy ny herinaratra' },
      esp32: { name: 'Mpanorona', detail: 'Foiben\'ny rafitra' },
      dht22: { name: 'Sensor toetr’andro', detail: 'Mandrefy hafanana sy hamandoana' },
      pushButton: { name: 'Bokotra tanana', detail: 'Fibaikoana amin\'ny tanana' },
      ultrasonic: { name: 'Sensor haavon\'ny rano', detail: 'Mandrefy ny halaliny' },
      lcdScreen: { name: 'Efijery LCD', detail: 'Mampiseho ny sata eo an-toerana' },
    },
    nav: {
      home: 'Fandraisana',
      dashboard: 'Takelaka fanaraha-maso',
    },
    dashboard: {
      title: 'Takelaka fanaraha-maso',
      devices: 'Fitaovana rano',
      deviceCount: 'Amboafaritra ({count})',
      noDevices: 'Tsy mbola misy fitaovana',
      addDevice: 'Ampio fitaovana vaovao',
      cancelAdd: 'Ajanona',
      deviceName: 'Anaran\'ny fitaovana',
      selectType: 'Fidio ny karazana fitaovana',
      location: 'Toerana',
      createDevice: 'Hamorona fitaovana',
      deleteDevice: 'Fafao ny fitaovana',
      confirmDelete: 'Tianao hofafana tokoa ve ity fitaovana ity?',
      selectDevice: 'Fidio ny fitaovana iray hijerena ny antsipiriany',
      statistics: 'Mpanoratana zava-dehibe',
      liveReadings: 'Vakiteny mangarantoka',
      noReadings: 'Tsy mbola misy vakiteny',
      temperature: 'Hafanana',
      humidity: 'Hamandoana',
      motion: 'Fihetsika',
      pressure: 'Tsindry',
      light: 'Hazavana',
      websocketStatus: 'Satan\'ny ma\u00f1endrotse',
      websocketConnected: 'Ma\u00f1endrotse',
      websocketDisconnected: 'Tsy ma\u00f1endrotse',
      reservoirRepresentation: 'Famantarana ny haavon\'ny rano',
      reservoirOptimal: 'Tsara Loatra',
      reservoirNormal: 'Mahazatra',
      reservoirLow: 'Ambany',
      currentWaterLevel: 'Haavon\'ny rano ankehitriny',
      waterSystemSetup: 'Fametrahana rafitra rano',
      setupDescription: 'Ny fitaovana mifandray amin\'ity rafitra fanaraha-maso ity',
      loadingReservoirs: 'Miandry ny angon-drano...',
      connectionSlow: 'Miadana ny ma\u00f1endrotse',
      addReservoirManually: 'Afaka manampy rafitra rano ianao raha mbola miverina ny backend.',
      monitoringReady: 'Vonona ny fanaraha-maso',
      firstMeasurement: 'Aseho eto ny rafitra rano na dia mbola tsy tonga aza ny vakiteny voalohany.',
      noReservoirs: 'Tsy mbola misy rafitra rano azo arahi-maso',
      hardwareUsed: 'Fitaovana nampiasaina',
      hardwareDescription: 'Ny fitaovana ara-batana mifandray amin\'ity rafitra ity',
      average: 'Salan\'isa',
      latestRead: 'Vakiteny farany',
      iotControlRoom: 'Efitra fanaraha-maso IoT',
      liveTelemetry: 'Telemetry mivantana',
      systemHealth: 'Fahasalamana rafitra',
      waterIntelligenceTitle: 'Fanaraha-maso rano amin\'ny fijery tokana',
      waterIntelligenceSubtitle: 'Araho amin\'ny dashboard iray ny reservoir, temperature, humidity, toetry ny pump, ary alert levels. Natao ho an\'ny operators mila signal mazava.',
      noDeviceSelected: 'Tsy misy device voafidy',
      operationalSummary: 'Topi-maso ny rafitra',
      refresh: 'Havaozy',
      deviceCountLabel: 'Isan\'ny Device',
      warnings: 'Warnings',
      healthy: 'Salama',
      userManagement: 'Fitantanana mpampiasa',
      manageOperatorsAccess: 'Tantano ny operators sy access',
      selectedDevice: 'Device voafidy',
      updated: 'Nohavaozina',
      reservoirLevel: 'Haavon\'ny Reservoir',
      rainDetected: 'Nisy orana',
      dryConditions: 'Maina',
      connectedTelemetrySources: 'Loharanon\'angona telemetry mifandray',
      noEsp32DataYet: 'Mbola tsy nandefa angona ny ESP32.',
      levelShort: 'Haavo',
      tempShort: 'Temp',
      liveDetails: 'Antsipiriany mivantana',
      loadingTelemetry: 'Miandry telemetry...',
      currentState: 'Toetry ny rafitra',
      alertLabel: 'alert',
      lastUpdated: 'nohavaozina farany',
      at: 'tamin\'ny',
      averageWaterLevel: 'Salan\'isan\'ny haavon\'ny rano',
      averageTemperature: 'Salan\'isan\'ny temperature',
      rainDetections: 'Isan\'ny fahitana orana',
      latestPumpStatus: 'Toetry ny Pump farany',
      fillReservoir: 'Fenoy ny reservoir',
      fillingReservoir: 'Mampandeha ny famenoana...',
      latestCommand: 'Baiko farany',
      commandPending: 'Miandry',
      commandAcknowledged: 'Voaray',
      commandExecuted: 'Vita',
      commandFailedStatus: 'Nisy lesoka',
      commandNoData: 'Tsy mbola nisy baiko nalefa',
      commandSent: 'Nalefa ny baiko famenoana',
      commandFailed: 'Tsy afaka nandefa ny baiko famenoana',
      commandDuration: 'Fe-potoanan’ny paompy',
      recentTrend: 'Firona farany',
      last12Readings: 'Vakiteny 12 farany amin\'ity device ity',
      noRecentReadings: 'Tsy misy vakiteny farany.',
      metricReadings: 'Vakiteny',
      waterLevelLabel: 'Haavon\'ny Rano',
      unableToLoadDeviceData: 'Tsy voa-load ny angona device',
      unableToLoadMonitoringData: 'Tsy voa-load ny angona fanaraha-maso',
    },
    deviceTypes: {
      // Sensors
      waterLevel: 'Water Level Sensor',
      rainSensor: 'Rain Sensor',
      ultrasonic: 'Ultrasonic Sensor',
      dht22: 'DHT22 Sensor',
      temperature: 'Temperature Sensor',
      humidity: 'Humidity Sensor',
      // Actuators
      waterPump: 'Water Pump',
      relay: 'Relay Control',
      // Indicators
      buzzer: 'Alarm Buzzer',
      ledRGB: 'RGB LED',
      lcdScreen: 'LCD Display',
      // Control
      pushButton: 'Push Button',
      // Microcontroller
      esp32: 'ESP32 Microcontroller',
      // Legacy
      turbidity: 'Turbidity Sensor',
      ph: 'pH Sensor',
      flowRate: 'Flow Rate Sensor',
      motion: 'Motion Detector',
      pressure: 'Pressure Sensor',
      light: 'Light Sensor',
    },
  },
};

let currentLanguage: Language = 'en';
const LANGUAGE_STORAGE_KEY = 'arorano_language';
const LEGACY_LANGUAGE_STORAGE_KEY = 'language';

/**
 * Set the current language (legacy - use LanguageContext instead)
 */
export function setLanguage(lang: Language) {
  currentLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    // Keep a backward-compatible write while older code paths may still exist.
    localStorage.setItem(LEGACY_LANGUAGE_STORAGE_KEY, lang);
    localStorage.setItem('languageTimestamp', new Date().toISOString());
  }
}

/**
 * Get the current language (legacy - use useLanguage hook instead)
 */
export function getLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = (localStorage.getItem(LANGUAGE_STORAGE_KEY) || localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY)) as Language;
    if (stored && (stored === 'en' || stored === 'mg' || stored === 'tdx')) {
      return stored;
    }
  }
  return 'en';
}

/**
 * Get user language preference with auto-detection support
 */
export function getUserLanguagePreference(): Language {
  if (typeof window === 'undefined') return 'en';
  
  // Check localStorage first
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) || localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY);
  if (saved && (saved === 'en' || saved === 'mg' || saved === 'tdx')) {
    return saved as Language;
  }
  
  // Auto-detect from browser language
  const browserLang = navigator.language?.split('-')[0].toLowerCase() || 'en';
  if (browserLang === 'mg') return 'mg';
  
  return 'en';
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

// Cascading fallback: try primary language, then fallback chain, then English
export function t(key: string, lang?: Language): string {
  const language = lang || currentLanguage;
  const keys = key.split('.');
  
  // Define fallback chain for each language
  const fallbackChain: Record<Language, Language[]> = {
    en: ['en'],
    mg: ['mg', 'en'],
    tdx: ['tdx', 'mg', 'en'],
  };

  // Try each language in the fallback chain
  for (const tryLang of fallbackChain[language]) {
    let value: any = translations[tryLang];
    for (const k of keys) {
      value = value?.[k];
    }
    if (value) {
      // Handle TranslationMeta objects - extract the string value
      if (typeof value === 'object' && value.value) {
        return value.value;
      }
      if (typeof value === 'string') {
        return value;
      }
    }
  }

  // Return key as fallback if nothing found
  return key;
}

// Get all available languages with metadata
export function getAvailableLanguages(): { code: Language; name: string; nativeName: string }[] {
  return Object.entries(languageMetadata).map(([code, data]) => ({
    code: code as Language,
    name: data.name,
    nativeName: data.nativeName,
  }));
}

// Translation cache for offline/performance optimization
interface TranslationCache {
  language: Language;
  timestamp: number;
  data: Record<string, any>;
}

let translationCache: TranslationCache | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function cacheTranslations(language: Language) {
  translationCache = {
    language,
    timestamp: Date.now(),
    data: translations[language],
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        `translationCache_${language}`,
        JSON.stringify(translationCache)
      );
    } catch (e) {
      console.warn('Failed to cache translations:', e);
    }
  }
}

export function getCachedTranslations(language: Language): TranslationCache | null {
  if (translationCache?.language === language) {
    if (Date.now() - translationCache.timestamp < CACHE_DURATION) {
      return translationCache;
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`translationCache_${language}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          translationCache = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to retrieve cached translations:', e);
    }
  }

  return null;
}

// Community translation suggestion system
interface TranslationSuggestion {
  language: Language;
  key: string;
  suggestedValue: string;
  reason?: string;
  userEmail?: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

let suggestions: TranslationSuggestion[] = [];

export function suggestTranslation(
  language: Language,
  key: string,
  suggestedValue: string,
  reason?: string,
  userEmail?: string
) {
  const suggestion: TranslationSuggestion = {
    language,
    key,
    suggestedValue,
    reason,
    userEmail,
    timestamp: Date.now(),
    status: 'pending',
  };
  suggestions.push(suggestion);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('translationSuggestions', JSON.stringify(suggestions));
    } catch (e) {
      console.warn('Failed to save translation suggestion:', e);
    }
  }

  return suggestion;
}

export function getPendingSuggestions(): TranslationSuggestion[] {
  return suggestions.filter((s) => s.status === 'pending');
}

export function approveSuggestion(index: number) {
  if (suggestions[index]) {
    suggestions[index].status = 'approved';
    if (typeof window !== 'undefined') {
      localStorage.setItem('translationSuggestions', JSON.stringify(suggestions));
    }
  }
}

export function rejectSuggestion(index: number) {
  if (suggestions[index]) {
    suggestions[index].status = 'rejected';
    if (typeof window !== 'undefined') {
      localStorage.setItem('translationSuggestions', JSON.stringify(suggestions));
    }
  }
}

// Initialize language from localStorage on client side
if (typeof window !== 'undefined') {
  const canonicalStored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
  const legacyStored = localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY) as Language | null;
  const stored = canonicalStored || legacyStored;

  if (stored && (stored === 'en' || stored === 'mg' || stored === 'tdx')) {
    currentLanguage = stored;
    // Migrate old key to canonical key and keep both in sync during transition.
    localStorage.setItem(LANGUAGE_STORAGE_KEY, stored);
    localStorage.setItem(LEGACY_LANGUAGE_STORAGE_KEY, stored);
  } else {
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (browserLang === 'mg') {
      currentLanguage = 'mg';
    } else if (browserLang === 'tdx') {
      currentLanguage = 'tdx';
    } else {
      currentLanguage = 'en';
    }
    localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    localStorage.setItem(LEGACY_LANGUAGE_STORAGE_KEY, currentLanguage);
  }
  
  // Cache the current language translations
  cacheTranslations(currentLanguage);
  
  // Load suggestions from localStorage
  try {
    const stored = localStorage.getItem('translationSuggestions');
    if (stored) {
      suggestions = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load translation suggestions:', e);
  }
}

/**
 * AI-enhanced translation helper - integrates with ai-translate.ts
 * Provides static translations first, then AI translation for dynamic content
 */
export async function tAI(key: string, lang?: Language): Promise<string> {
  // First try static translations
  const staticTranslation = t(key, lang);
  if (staticTranslation !== key) {
    return staticTranslation;
  }
  
  // If key not found, try AI translation (dynamic content)
  try {
    const { translateText } = await import('./ai-translate');
    const targetLang: 'en' | 'mg' | 'tdx' = lang || currentLanguage;
    return await translateText(key, targetLang);
  } catch (error) {
    console.warn(`Failed to translate "${key}" with AI:`, error);
    return key;
  }
}

/**
 * Batch translate keys using AI
 * Useful for translating multiple UI strings at once
 */
export async function tBatch(keys: string[], lang?: Language): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  for (const key of keys) {
    results[key] = await tAI(key, lang);
  }
  
  return results;
}
