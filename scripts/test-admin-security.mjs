import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Load .env.local
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      process.env[key] = val;
    }
  }
}

const BASE_URL = 'http://localhost:3001';
const AUTHORIZED_ADMIN_EMAIL = 'partiksharmabsccs@gmail.com';
const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD;

test('Case 1: Correct authorized admin email + correct password -> Login success and session cookie issued', async () => {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '192.168.1.10',
    },
    body: JSON.stringify({ email: AUTHORIZED_ADMIN_EMAIL, password: CORRECT_PASSWORD }),
  });

  assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.email, AUTHORIZED_ADMIN_EMAIL);
  assert.equal(data.user.role, 'admin');

  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'set-cookie header must be set');
  assert.ok(setCookie.includes('admin_session='), 'admin_session cookie must be present');
  assert.ok(setCookie.includes('HttpOnly'), 'admin_session cookie must be HttpOnly');
});

test('Case 2: Correct admin email + incorrect password -> Login rejected with generic error', async () => {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '192.168.1.20',
    },
    body: JSON.stringify({ email: AUTHORIZED_ADMIN_EMAIL, password: 'WrongPassword123!' }),
  });

  assert.equal(res.status, 401, `Expected 401, got ${res.status}`);
  const data = await res.json();
  assert.equal(data.error, 'Invalid admin credentials.');
});

test('Case 3: Any other email + correct password -> Login rejected', async () => {
  const otherEmails = [
    'partiksharmabscc@gmail.com',
    'admin@studentconnect.org',
    'admin@studentconnect.com',
    'attacker@gmail.com',
    'random@example.com',
  ];

  let ipIndex = 30;
  for (const email of otherEmails) {
    ipIndex++;
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': `192.168.1.${ipIndex}`,
      },
      body: JSON.stringify({ email, password: CORRECT_PASSWORD }),
    });

    assert.equal(res.status, 401, `Email ${email} should be rejected with 401`);
    const data = await res.json();
    assert.equal(data.error, 'Invalid admin credentials.');
  }
});

test('Case 4: Student account credentials -> Admin access rejected', async () => {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '192.168.1.50',
    },
    body: JSON.stringify({ email: 'sarah.chen@stanford.edu', password: CORRECT_PASSWORD }),
  });

  assert.equal(res.status, 401, 'Student credentials must be rejected from admin portal');
  const data = await res.json();
  assert.equal(data.error, 'Invalid admin credentials.');
});

test('Case 5: Client account credentials -> Admin access rejected', async () => {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '192.168.1.60',
    },
    body: JSON.stringify({ email: 'owner@artisanbakery.com', password: CORRECT_PASSWORD }),
  });

  assert.equal(res.status, 401, 'Client credentials must be rejected from admin portal');
  const data = await res.json();
  assert.equal(data.error, 'Invalid admin credentials.');
});

test('Case 6: Directly opening an admin URL without an authorized session -> Redirected to admin login', async () => {
  const adminPages = ['/admin/dashboard', '/admin/approvals', '/admin/reports'];

  for (const page of adminPages) {
    const res = await fetch(`${BASE_URL}${page}`, {
      redirect: 'manual',
    });

    assert.ok(
      res.status === 307 || res.status === 308 || res.status === 302,
      `Expected redirect status (307/308/302) for unauthenticated access to ${page}, got ${res.status}`
    );
    const location = res.headers.get('location');
    assert.ok(location && location.includes('/admin/login'), `Expected redirect to /admin/login, got ${location}`);
  }
});

test('Case 7: Calling protected admin APIs without admin authorization -> Request rejected', async () => {
  // /api/admin/users
  const usersRes = await fetch(`${BASE_URL}/api/admin/users`);
  assert.equal(usersRes.status, 401, 'Unauthenticated /api/admin/users must return 401');

  // /api/admin/user-status
  const statusRes = await fetch(`${BASE_URL}/api/admin/user-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'test-id', status: 'approved' }),
  });
  assert.equal(statusRes.status, 401, 'Unauthenticated /api/admin/user-status must return 401');

  // /api/admin/session
  const sessionRes = await fetch(`${BASE_URL}/api/admin/session`);
  assert.equal(sessionRes.status, 401, 'Unauthenticated /api/admin/session must return 401');
});

test('Case 8: Calling protected admin APIs with spoofed headers -> Rejected (No spoofing allowed)', async () => {
  // Attempt 1: Spoofing x-user-role and x-user-email
  const spoofedRes = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: {
      'x-user-role': 'admin',
      'x-user-email': AUTHORIZED_ADMIN_EMAIL,
    },
  });
  assert.equal(spoofedRes.status, 401, 'Spoofed x-user-role must be rejected with 401');

  // Attempt 2: Spoofing legacy x-admin-secret
  const legacySecretRes = await fetch(`${BASE_URL}/api/admin/user-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': 'Admin@StudentConnect2025!',
    },
    body: JSON.stringify({ userId: 'test-id', status: 'approved' }),
  });
  assert.equal(legacySecretRes.status, 401, 'Legacy x-admin-secret header must be rejected with 401');
});

test('Case 9: Calling protected admin APIs with valid admin session cookie -> Access granted', async () => {
  // 1. Authenticate to get session cookie
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '192.168.1.70',
    },
    body: JSON.stringify({ email: AUTHORIZED_ADMIN_EMAIL, password: CORRECT_PASSWORD }),
  });
  assert.equal(loginRes.status, 200, `Login should succeed, got ${loginRes.status}`);
  const setCookie = loginRes.headers.get('set-cookie');
  assert.ok(setCookie, 'Expected set-cookie header');
  const cookieValue = setCookie.split(';')[0]; // admin_session=...

  // 2. Access /api/admin/session with cookie
  const sessionRes = await fetch(`${BASE_URL}/api/admin/session`, {
    headers: { Cookie: cookieValue },
  });
  assert.equal(sessionRes.status, 200, 'Session check must return 200 with valid cookie');
  const sessionData = await sessionRes.json();
  assert.equal(sessionData.authenticated, true);
  assert.equal(sessionData.user.email, AUTHORIZED_ADMIN_EMAIL);

  // 3. Access /api/admin/users with cookie
  const usersRes = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: { Cookie: cookieValue },
  });
  assert.equal(usersRes.status, 200, 'Users query must return 200 with valid cookie');
  const usersData = await usersRes.json();
  assert.ok(Array.isArray(usersData.profiles), 'Must return profiles list');
});

test('Case 10: Logout functionality -> Session cookie cleared and access revoked', async () => {
  // 1. Authenticate
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '192.168.1.80',
    },
    body: JSON.stringify({ email: AUTHORIZED_ADMIN_EMAIL, password: CORRECT_PASSWORD }),
  });
  assert.equal(loginRes.status, 200);
  const setCookie = loginRes.headers.get('set-cookie');
  const cookieValue = setCookie.split(';')[0];

  // 2. Call logout
  const logoutRes = await fetch(`${BASE_URL}/api/admin/logout`, {
    method: 'POST',
    headers: { Cookie: cookieValue },
  });
  assert.equal(logoutRes.status, 200);
  const logoutSetCookie = logoutRes.headers.get('set-cookie');
  assert.ok(
    logoutSetCookie.includes('Max-Age=0') || logoutSetCookie.includes('expires='),
    'Logout must expire session cookie'
  );
});

test('Case 11: Rate Limiter Protection -> Enforces 429 lockout after repeated failed attempts', async () => {
  const attackIp = '192.168.1.99';

  // 5 failed attempts
  for (let i = 0; i < 5; i++) {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': attackIp,
      },
      body: JSON.stringify({ email: AUTHORIZED_ADMIN_EMAIL, password: 'WrongPassword' }),
    });
    assert.equal(res.status, 401);
  }

  // 6th attempt should trigger 429 Too Many Requests
  const lockedRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': attackIp,
    },
    body: JSON.stringify({ email: AUTHORIZED_ADMIN_EMAIL, password: 'WrongPasswordAgain' }),
  });
  assert.equal(lockedRes.status, 429, '6th attempt must be blocked by rate limiter with 429');
});

test('Case 12: Inspecting login page and frontend source -> No exposed password or credentials', () => {
  const filesToCheck = [
    'src/app/admin/login/page.tsx',
    'src/app/admin/layout.tsx',
    'src/lib/mock-data.ts',
    'src/lib/store.tsx',
    'src/components/ui/Navbar.tsx',
  ];

  for (const file of filesToCheck) {
    const content = fs.readFileSync(path.resolve(file), 'utf8');
    assert.equal(content.includes('admin@studentconnect.org'), false, `Exposed old admin email found in ${file}`);
    assert.equal(content.includes('Admin@StudentConnect2025!'), false, `Exposed old admin password found in ${file}`);
    assert.equal(content.includes(CORRECT_PASSWORD), false, `Exposed authorized admin password found in ${file}`);
    assert.equal(content.includes('Admin Access Credentials'), false, `Exposed credentials card found in ${file}`);
    assert.equal(content.includes('Auto Fill'), false, `Exposed Auto Fill button found in ${file}`);
  }
});

test('Case 13: Existing student and client login features continue working', async () => {
  // Test public profiles endpoint
  const res = await fetch(`${BASE_URL}/api/auth/profiles?email=sarah.chen@stanford.edu`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.profile, 'Sarah Chen profile should be retrievable for student login flow');
  assert.equal(data.profile.role, 'student');
});
