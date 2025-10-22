#!/usr/bin/env node

/**
 * Browser Integration Test
 * Tests that the frontend can successfully communicate with the backend
 * Run this from the browser console or as a Node script
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

let passed = 0;
let failed = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testPass(name) {
  log(`✓ ${name}`, 'green');
  passed++;
}

function testFail(name, error) {
  log(`✗ ${name}`, 'red');
  if (error) log(`  Error: ${error}`, 'red');
  failed++;
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function runTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║     BROWSER INTEGRATION TEST                               ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝\n', 'blue');

  // Test 1: Backend Health
  log('Testing backend health...', 'blue');
  try {
    const res = await makeRequest(`${BACKEND_URL}/health`);
    if (res.status === 200 && res.data.status === 'healthy') {
      testPass('Backend health check');
    } else {
      testFail('Backend health check', 'Invalid response');
    }
  } catch (e) {
    testFail('Backend health check', e.message);
  }

  // Test 2: CORS Headers
  log('\nTesting CORS headers...', 'blue');
  try {
    const res = await makeRequest(`${BACKEND_URL}/health`);
    if (res.headers['access-control-allow-origin'] === 'http://localhost:5173') {
      testPass('CORS allows frontend origin');
    } else {
      testFail('CORS allows frontend origin', 'Wrong origin');
    }
    
    if (res.headers['access-control-allow-credentials'] === 'true') {
      testPass('CORS allows credentials');
    } else {
      testFail('CORS allows credentials');
    }
  } catch (e) {
    testFail('CORS configuration', e.message);
  }

  // Test 3: Motions API
  log('\nTesting Motions API...', 'blue');
  try {
    const res = await makeRequest(`${BACKEND_URL}/api/motions`);
    if (res.status === 200 && res.data.success) {
      const count = res.data.data?.motions?.length || 0;
      testPass(`Motions API (${count} motions)`);
    } else {
      testFail('Motions API', 'Invalid response');
    }
  } catch (e) {
    testFail('Motions API', e.message);
  }

  // Test 4: Surveys API
  log('\nTesting Surveys API...', 'blue');
  try {
    const res = await makeRequest(`${BACKEND_URL}/api/surveys`);
    if (res.status === 200 && res.data.success) {
      const count = res.data.data?.surveys?.length || 0;
      testPass(`Surveys API (${count} surveys)`);
    } else {
      testFail('Surveys API', 'Invalid response');
    }
  } catch (e) {
    testFail('Surveys API', e.message);
  }

  // Test 5: Authentication
  log('\nTesting authentication...', 'blue');
  try {
    const res = await makeRequest(`${BACKEND_URL}/api/admin/users`);
    if (res.status === 401) {
      testPass('Protected routes require authentication');
    } else {
      testFail('Protected routes require authentication', `Got status ${res.status}`);
    }
  } catch (e) {
    testFail('Protected routes require authentication', e.message);
  }

  // Test 6: Error Handling
  log('\nTesting error handling...', 'blue');
  try {
    const res = await makeRequest(`${BACKEND_URL}/api/nonexistent`);
    if (res.status === 404 && res.data.success === false) {
      testPass('404 error handling');
    } else {
      testFail('404 error handling');
    }
  } catch (e) {
    testFail('404 error handling', e.message);
  }

  // Test 7: Login Validation
  log('\nTesting login validation...', 'blue');
  try {
    const res = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      body: { email: 'test@test.com', password: 'wrong' }
    });
    if (res.status === 400 || res.status === 401) {
      testPass('Login validation');
    } else {
      testFail('Login validation', `Got status ${res.status}`);
    }
  } catch (e) {
    testFail('Login validation', e.message);
  }

  // Test 8: Data Structure
  log('\nTesting data structure...', 'blue');
  try {
    const res = await makeRequest(`${BACKEND_URL}/api/motions`);
    const motion = res.data.data?.motions?.[0];
    if (motion && motion.id && motion.title && motion.description) {
      testPass('Motion data structure valid');
    } else {
      testFail('Motion data structure valid', 'Missing required fields');
    }
  } catch (e) {
    testFail('Motion data structure valid', e.message);
  }

  // Summary
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║                    SUMMARY                                 ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  log(`\nPassed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`Total: ${passed + failed}\n`);

  if (failed === 0) {
    log('✅ ALL TESTS PASSED - Frontend can communicate with backend!', 'green');
    process.exit(0);
  } else {
    log('❌ SOME TESTS FAILED', 'red');
    process.exit(1);
  }
}

runTests().catch(err => {
  log(`Fatal error: ${err.message}`, 'red');
  process.exit(1);
});
