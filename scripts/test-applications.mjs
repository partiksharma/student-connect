import test from 'node:test';
import assert from 'node:assert/strict';

// Test application deduplication algorithm
function mergeApplications(initial = [], incoming = []) {
  const map = new Map();
  const idToComposite = new Map();

  const processApp = (app) => {
    if (!app || !app.project_id || !app.student_id) return;
    const compositeKey = `${app.project_id}::${app.student_id}`;
    const existing = map.get(compositeKey);

    if (!existing) {
      map.set(compositeKey, app);
      idToComposite.set(app.id, compositeKey);
    } else {
      const existingIsTemp = String(existing.id).startsWith('app-');
      const incomingIsTemp = String(app.id).startsWith('app-');
      const chosenId = (!incomingIsTemp && existingIsTemp) ? app.id : (existingIsTemp ? app.id : existing.id);

      const isIncomingNewer = new Date(app.updated_at || app.created_at).getTime() >= new Date(existing.updated_at || existing.created_at).getTime();

      const merged = {
        ...existing,
        ...app,
        id: chosenId,
        status: app.status && app.status !== 'pending' ? app.status : existing.status,
        pitch_note: app.pitch_note || existing.pitch_note,
        updated_at: isIncomingNewer ? (app.updated_at || new Date().toISOString()) : existing.updated_at,
      };

      map.set(compositeKey, merged);
      idToComposite.set(chosenId, compositeKey);
    }
  };

  initial.forEach(processApp);
  incoming.forEach(processApp);

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

test('Single active application per student per project: Deduplication Test', () => {
  const optimisticApp = {
    id: 'app-1710000000000',
    project_id: 'proj-123',
    student_id: 'student-abc',
    pitch_note: 'Initial pitch draft',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const serverApp = {
    id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51',
    project_id: 'proj-123',
    student_id: 'student-abc',
    pitch_note: 'Initial pitch draft',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Merge optimistic and server app
  const result = mergeApplications([optimisticApp], [serverApp]);

  // Assert exactly ONE application is returned
  assert.equal(result.length, 1, 'Should contain exactly 1 application');
  // Assert authoritative server UUID is kept
  assert.equal(result[0].id, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51');
  assert.equal(result[0].student_id, 'student-abc');
  assert.equal(result[0].project_id, 'proj-123');
});

test('Multiple applications from DIFFERENT students to same project are preserved', () => {
  const app1 = {
    id: 'app-1',
    project_id: 'proj-123',
    student_id: 'student-1',
    pitch_note: 'Pitch from student 1',
    status: 'pending',
    created_at: '2026-03-01T10:00:00.000Z',
    updated_at: '2026-03-01T10:00:00.000Z',
  };

  const app2 = {
    id: 'app-2',
    project_id: 'proj-123',
    student_id: 'student-2',
    pitch_note: 'Pitch from student 2',
    status: 'pending',
    created_at: '2026-03-01T11:00:00.000Z',
    updated_at: '2026-03-01T11:00:00.000Z',
  };

  const result = mergeApplications([app1], [app2]);
  assert.equal(result.length, 2, 'Should preserve both unique student applicants');
});

test('Status update preservation (accepted over pending)', () => {
  const pendingApp = {
    id: 'app-1',
    project_id: 'proj-100',
    student_id: 'student-100',
    pitch_note: 'My pitch',
    status: 'pending',
    created_at: '2026-03-01T10:00:00.000Z',
    updated_at: '2026-03-01T10:00:00.000Z',
  };

  const acceptedApp = {
    id: 'app-1',
    project_id: 'proj-100',
    student_id: 'student-100',
    pitch_note: 'My pitch',
    status: 'accepted',
    created_at: '2026-03-01T10:00:00.000Z',
    updated_at: '2026-03-01T12:00:00.000Z',
  };

  const result = mergeApplications([pendingApp], [acceptedApp]);
  assert.equal(result.length, 1);
  assert.equal(result[0].status, 'accepted');
});

// Project deduplication algorithm
function mergeProjects(initial = [], incoming = []) {
  const map = new Map();
  const idToComposite = new Map();

  const processProj = (proj) => {
    if (!proj || !proj.title) return;
    const cleanTitle = proj.title.trim().toLowerCase();
    const compositeKey = proj.business_id ? `${proj.business_id}::${cleanTitle}` : proj.id;
    
    const existing = map.get(compositeKey) || (proj.id && idToComposite.has(proj.id) ? map.get(idToComposite.get(proj.id)) : undefined);

    if (!existing) {
      map.set(compositeKey, proj);
      if (proj.id) idToComposite.set(proj.id, compositeKey);
    } else {
      const existingIsTemp = String(existing.id).startsWith('proj-') && String(existing.id).length > 10;
      const incomingIsTemp = String(proj.id).startsWith('proj-') && String(proj.id).length > 10;
      const chosenId = (!incomingIsTemp && existingIsTemp) ? proj.id : (existingIsTemp ? proj.id : existing.id);

      const isIncomingNewer = new Date(proj.updated_at || proj.created_at).getTime() >= new Date(existing.updated_at || existing.created_at).getTime();

      const merged = {
        ...existing,
        ...proj,
        id: chosenId,
        business_id: proj.business_id || existing.business_id,
        status: proj.status && proj.status !== 'pending_approval' ? proj.status : (existing.status || proj.status),
        applicant_count: Math.max(proj.applicant_count || 0, existing.applicant_count || 0),
        updated_at: isIncomingNewer ? (proj.updated_at || new Date().toISOString()) : existing.updated_at,
      };

      map.set(compositeKey, merged);
      if (chosenId) idToComposite.set(chosenId, compositeKey);
      if (proj.id && proj.id !== chosenId) idToComposite.set(proj.id, compositeKey);
    }
  };

  initial.forEach(processProj);
  incoming.forEach(processProj);

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

test('Project Deduplication: optimistic temp ID merged into persistent server UUID', () => {
  const optimisticProj = {
    id: 'proj-1760000000000',
    business_id: 'biz-user-123',
    title: 'Brand Refresh & Social Graphics',
    description: 'Design brand assets',
    status: 'open',
    applicant_count: 0,
    created_at: '2026-03-01T10:00:00.000Z',
    updated_at: '2026-03-01T10:00:00.000Z',
  };

  const serverProj = {
    id: '7b98d249-fa1e-4c7b-b5d1-9f5793bfcf11',
    business_id: 'biz-user-123',
    title: 'Brand Refresh & Social Graphics',
    description: 'Design brand assets',
    status: 'open',
    applicant_count: 1,
    created_at: '2026-03-01T10:00:00.000Z',
    updated_at: '2026-03-01T10:00:05.000Z',
  };

  const result = mergeProjects([optimisticProj], [serverProj]);

  assert.equal(result.length, 1, 'Should eliminate duplicate project');
  assert.equal(result[0].id, '7b98d249-fa1e-4c7b-b5d1-9f5793bfcf11', 'Should retain authoritative server UUID');
  assert.equal(result[0].applicant_count, 1);
});

test('Project Deduplication: different projects from same business are preserved', () => {
  const projA = {
    id: 'proj-a',
    business_id: 'biz-user-123',
    title: 'Project A: Web Dev',
    status: 'open',
    created_at: '2026-03-01T10:00:00.000Z',
  };

  const projB = {
    id: 'proj-b',
    business_id: 'biz-user-123',
    title: 'Project B: SEO Audit',
    status: 'open',
    created_at: '2026-03-01T11:00:00.000Z',
  };

  const result = mergeProjects([projA], [projB]);
  assert.equal(result.length, 2, 'Should preserve both unique project listings');
});

// Test alias normalization logic
const PROJECT_ALIASES = {
  'p-101': 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
  'p-102': 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42',
  'proj-thumbnail-designer': 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45',
};

const USER_ALIASES = {
  'nextphase-client-id': 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a36',
};

function resolveProjectId(id) {
  if (!id) return '';
  return PROJECT_ALIASES[id.trim()] || id.trim();
}

function resolveUserId(id) {
  if (!id) return '';
  return USER_ALIASES[id.trim()] || id.trim();
}

test('Alias normalization: legacy p-101 maps to canonical Supabase UUID', () => {
  assert.equal(resolveProjectId('p-101'), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41');
  assert.equal(resolveProjectId('proj-thumbnail-designer'), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45');
  assert.equal(resolveUserId('nextphase-client-id'), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a36');
  // Pass-through for valid UUIDs
  assert.equal(resolveProjectId('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41'), 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41');
});

test('Cross-Device Client Dashboard Filter: Client sees applications regardless of mobile alias or UUID', () => {
  const clientUser = { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a36', role: 'business' };
  const clientProjects = [
    {
      id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45',
      business_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a36',
      title: 'Thumbnail Designer for YouTube & Social Media',
    }
  ];

  // Applications from mobile devices (some submitted with alias, some with UUID)
  const incomingApplications = [
    {
      id: 'app-mobile-1',
      project_id: 'proj-thumbnail-designer', // submitted from mobile using alias
      student_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      pitch_note: 'Mobile student pitch note',
      status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a56',
      project_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', // from desktop using UUID
      student_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
      pitch_note: 'Desktop student pitch note',
      status: 'pending',
      created_at: new Date().toISOString(),
    }
  ];

  const currentBizId = resolveUserId(clientUser.id);
  const myProjectCanonicalIds = new Set();
  clientProjects.forEach((p) => {
    myProjectCanonicalIds.add(p.id);
    myProjectCanonicalIds.add(resolveProjectId(p.id));
  });

  const visibleApps = incomingApplications.filter((a) => {
    const aProjId = resolveProjectId(a.project_id);
    return myProjectCanonicalIds.has(a.project_id) || myProjectCanonicalIds.has(aProjId);
  });

  // Client must see BOTH applications
  assert.equal(visibleApps.length, 2, 'Client should see both mobile-submitted and desktop-submitted applications');
  assert.equal(visibleApps[0].student_id, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');
  assert.equal(visibleApps[1].student_id, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23');
});

