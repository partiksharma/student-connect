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
