// Canonical UUID mappings and normalization helpers for legacy seed IDs and aliases

export const PROJECT_ALIASES: Record<string, string> = {
  'p-101': 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
  'p-102': 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42',
  'p-103': 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43',
  'p-104': 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'proj-thumbnail-designer': 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45',
  'p-pending-1': 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a46',
  'p-pending-2': 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a47',
  'p-rejected-1': 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a48',
};

export const USER_ALIASES: Record<string, string> = {
  'nextphase-client-id': 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a36',
};

/**
 * Validates whether a string is a standard RFC-4122 UUID format.
 */
export function isValidUUID(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id.trim());
}

/**
 * Resolves any legacy or aliased project ID to its canonical UUID.
 * Returns the resolved UUID or the original ID if no alias exists.
 */
export function resolveProjectId(id: string | null | undefined): string {
  if (!id) return '';
  const trimmed = id.trim();
  return PROJECT_ALIASES[trimmed] || trimmed;
}

/**
 * Resolves any legacy or aliased user ID to its canonical UUID.
 * Returns the resolved UUID or the original ID if no alias exists.
 */
export function resolveUserId(id: string | null | undefined): string {
  if (!id) return '';
  const trimmed = id.trim();
  return USER_ALIASES[trimmed] || trimmed;
}
