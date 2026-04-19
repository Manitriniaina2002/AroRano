#!/usr/bin/env node

/**
 * AroRano System Health Check
 * 
 * Verifies that all backend components are running and responsive.
 * Run from the root directory: node test-system.js
 */

const http = require('http');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}\n`),
};

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

let testsPassed = 0;
let testsFailed = 0;

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 5000,
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testBackendHealth() {
  log.header('🏥 Backend Health Check');

  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    if (response.status === 200) {
      const data = JSON.parse(response.body);
      log.success(`Backend is healthy: ${data.message}`);
      testsPassed++;
      return true;
    } else {
      log.error(`Backend returned status ${response.status}`);
      testsFailed++;
      return false;
    }
  } catch (error) {
    log.error(`Cannot connect to backend at ${BACKEND_URL}`);
    log.info('Make sure to run: docker-compose up -d');
    testsFailed++;
    return false;
  }
}

async function testDevicesEndpoint() {
  log.header('📱 Devices Endpoint Check');

  try {
    const response = await makeRequest(`${BACKEND_URL}/api/devices`);
    if (response.status === 200) {
      const devices = JSON.parse(response.body);
      log.success(`Found ${devices.length} devices`);
      
      if (devices.length > 0) {
        log.info('Devices:');
        devices.forEach((device, idx) => {
          console.log(`  ${idx + 1}. ${device.name} (${device.type})`);
        });
        testsPassed++;
        return true;
      } else {
        log.warn('No devices found - run: npm run seed');
        testsFailed++;
        return false;
      }
    }
  } catch (error) {
    log.error(`Error fetching devices: ${error.message}`);
    testsFailed++;
    return false;
  }
}

async function testFrontendServer() {
  log.header('🖥️  Frontend Server Check');

  try {
    const response = await makeRequest(FRONTEND_URL);
    if (response.status === 200) {
      log.success(`Frontend is running at ${FRONTEND_URL}`);
      testsPassed++;
      return true;
    }
  } catch (error) {
    log.error(`Cannot connect to frontend at ${FRONTEND_URL}`);
    log.info('Make sure frontend is running');
    testsFailed++;
    return false;
  }
}

async function testSensorReadingEndpoint() {
  log.header('📊 Sensor Reading Endpoint Check');

  try {
    const response = await makeRequest(`${BACKEND_URL}/api/devices`);
    if (response.status === 200) {
      const devices = JSON.parse(response.body);
      
      if (devices.length === 0) {
        log.warn('No devices available to test');
        return false;
      }

      const deviceId = devices[0].id;
      
      // Try to send a test reading
      const testReading = {
        value: 42.5,
        unit: 'test',
      };

      const readingResponse = await makeRequest(
        `${BACKEND_URL}/api/devices/${deviceId}/readings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: testReading,
        }
      );

      if (readingResponse.status === 201 || readingResponse.status === 200) {
        log.success(`Successfully sent test reading to ${devices[0].name}`);
        testsPassed++;
        return true;
      } else {
        log.error(`Failed to send reading (status ${readingResponse.status})`);
        testsFailed++;
        return false;
      }
    }
  } catch (error) {
    log.error(`Error testing sensor reading: ${error.message}`);
    testsFailed++;
    return false;
  }
}

async function testDeviceStats() {
  log.header('📈 Device Statistics Endpoint Check');

  try {
    const response = await makeRequest(`${BACKEND_URL}/api/devices`);
    if (response.status === 200) {
      const devices = JSON.parse(response.body);
      
      if (devices.length === 0) {
        log.warn('No devices available to test');
        return false;
      }

      const deviceId = devices[0].id;
      const statsResponse = await makeRequest(
        `${BACKEND_URL}/api/devices/${deviceId}/stats`
      );

      if (statsResponse.status === 200) {
        const stats = JSON.parse(statsResponse.body);
        log.success(`Retrieved stats for ${devices[0].name}`);
        console.log(`  Average: ${stats.average?.toFixed(2) || 'N/A'}`);
        console.log(`  Min: ${stats.min?.toFixed(2) || 'N/A'}`);
        console.log(`  Max: ${stats.max?.toFixed(2) || 'N/A'}`);
        testsPassed++;
        return true;
      } else {
        log.error(`Failed to get stats (status ${statsResponse.status})`);
        testsFailed++;
        return false;
      }
    }
  } catch (error) {
    log.error(`Error fetching stats: ${error.message}`);
    testsFailed++;
    return false;
  }
}

async function runAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}AroRano System Health Check${colors.reset}\n`);

  const backendHealthy = await testBackendHealth();
  
  if (backendHealthy) {
    await testDevicesEndpoint();
    await testFrontendServer();
    await testSensorReadingEndpoint();
    await testDeviceStats();
  }

  // Summary
  log.header('📋 Summary');
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);

  if (testsFailed === 0) {
    console.log(`\n${colors.green}${colors.bright}✨ All systems operational!${colors.reset}\n`);
    console.log('Next steps:');
    console.log('1. Open dashboard: http://localhost:3000/dashboard');
    console.log('2. Flash ESP32 with Arduino code');
    console.log('3. Watch real-time data updates');
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bright}⚠️  Some tests failed${colors.reset}\n`);
    console.log('Troubleshooting:');
    console.log('1. Ensure Docker containers are running: docker-compose ps');
    console.log('2. Check logs: docker-compose logs -f backend');
    console.log('3. Verify network connectivity');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
