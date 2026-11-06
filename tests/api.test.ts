import assert from 'assert';
import pool from '../src/db/pool';

const BASE_URL = process.env.APP_URL || 'http://localhost:3020';

async function runTests() {
  console.log('🧪 Starting ArthaAI Automated Verification Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      process.stdout.write(`• ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err: any) {
      console.log('❌ FAILED');
      console.error(`  Error: ${err.message}`);
      failed++;
    }
  }

  // Test 1: API Health Check
  await test('GET /api/health returns 200 and healthy status', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = (await res.json()) as any;
    assert.strictEqual(data.status, 'healthy');
  });

  // Test 2: Database Connection Pool
  await test('PostgreSQL pool executes query on arthafin_db', async () => {
    const res = await pool.query('SELECT 1 as test_val');
    assert.strictEqual(res.rows[0].test_val, 1);
  });

  // Test 3: Pinterest-Style Email Check Endpoint
  await test('POST /api/auth/check-email detects non-existent email', async () => {
    const uniqueEmail = `test_${Date.now()}@domain.com`;
    const res = await fetch(`${BASE_URL}/api/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail }),
    });
    assert.strictEqual(res.status, 200);
    const data = (await res.json()) as any;
    assert.strictEqual(data.exists, false);
  });

  // Test 4: Registration with Password
  const testEmail = `auto_test_${Date.now()}@arthafin.ai`;
  let authToken = '';

  await test('POST /api/auth/register creates user with bcrypt hash & JWT', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassword123!',
        confirm_password: 'SecurePassword123!',
        name: 'Automated Tester',
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = (await res.json()) as any;
    assert.strictEqual(data.success, true);
    assert.ok(data.token, 'Token must be returned');
    authToken = data.token;
  });

  // Test 5: Check Email for Existing Account
  await test('POST /api/auth/check-email detects registered user', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    assert.strictEqual(res.status, 200);
    const data = (await res.json()) as any;
    assert.strictEqual(data.exists, true);
    assert.strictEqual(data.has_password, true);
  });

  // Test 6: Login with Valid Password
  await test('POST /api/auth/login succeeds with correct password', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassword123!',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = (await res.json()) as any;
    assert.strictEqual(data.success, true);
  });

  // Test 7: Login Rejection with Invalid Password
  await test('POST /api/auth/login rejects incorrect password (401)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword!',
      }),
    });
    assert.strictEqual(res.status, 401);
    const data = (await res.json()) as any;
    assert.strictEqual(data.success, false);
  });

  // Test 8: Get Authenticated User Profile
  await test('GET /api/auth/me resolves user from JWT Bearer token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = (await res.json()) as any;
    assert.strictEqual(data.user.email, testEmail);
  });

  // Cleanup test user
  await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
  await pool.end();

  console.log(`\n======================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
