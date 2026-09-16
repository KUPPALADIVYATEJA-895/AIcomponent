export type UserRole =
  | 'VIEWER'
  | 'ENGINEER'
  | 'SENIOR_ENGINEER'
  | 'ADMIN'
  | 'SECURITY_ADMIN';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userRole: UserRole;
  action: string;
  target: string;
  status: 'ALLOWED' | 'DENIED';
  detail: string;
}

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

// In-memory persistent data store on server
export const memoryStore = {
  users: [
    { id: 'usr-1', name: 'Commander Alex', role: 'ADMIN' as UserRole, email: 'alex@aura.space', status: 'ACTIVE' as const },
    { id: 'usr-2', name: 'Dr. Elena Rostova', role: 'SENIOR_ENGINEER' as UserRole, email: 'elena@aura.space', status: 'ACTIVE' as const },
    { id: 'usr-3', name: 'Eng. Marcus Vance', role: 'ENGINEER' as UserRole, email: 'marcus@aura.space', status: 'ACTIVE' as const },
    { id: 'usr-4', name: 'Officer Chen', role: 'SECURITY_ADMIN' as UserRole, email: 'chen@aura.space', status: 'ACTIVE' as const },
    { id: 'usr-5', name: 'Flight Observer Lee', role: 'VIEWER' as UserRole, email: 'lee@aura.space', status: 'ACTIVE' as const },
  ],
  auditLogs: [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userRole: 'ADMIN' as UserRole,
      action: 'SYSTEM_BOOT',
      target: 'AURA Core',
      status: 'ALLOWED' as const,
      detail: 'Spacecraft power telemetry engine booted.',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      userRole: 'ENGINEER' as UserRole,
      action: 'INVESTIGATE_CHAMBER',
      target: 'Chamber A (PWR-01)',
      status: 'ALLOWED' as const,
      detail: 'Inspected chamber telemetry metrics.',
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      userRole: 'VIEWER' as UserRole,
      action: 'APPROVE_RECOMMENDATION',
      target: 'Coolant Purge',
      status: 'DENIED' as const,
      detail: 'Blocked: Viewer role cannot approve actions (OWASP default deny).',
    },
  ] as AuditLogEntry[],
  approvedRecommendations: [] as string[],
};

export function logAuditEvent(
  userRole: UserRole,
  action: string,
  target: string,
  status: 'ALLOWED' | 'DENIED',
  detail: string
) {
  const entry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    userRole,
    action,
    target,
    status,
    detail,
  };
  memoryStore.auditLogs.unshift(entry);
  if (memoryStore.auditLogs.length > 200) {
    memoryStore.auditLogs.pop();
  }
}
