export type UserRole =
  | 'VIEWER'
  | 'ENGINEER'
  | 'SENIOR_ENGINEER'
  | 'ADMIN'
  | 'SECURITY_ADMIN';

export interface RoleDefinition {
  id: UserRole;
  label: string;
  access: string;
  badgeColor: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  VIEWER: {
    id: 'VIEWER',
    label: 'Viewer',
    access: 'View dashboards',
    badgeColor: 'bg-slate-700 text-slate-200 border-slate-600',
  },
  ENGINEER: {
    id: 'ENGINEER',
    label: 'Engineer',
    access: 'Investigate components',
    badgeColor: 'bg-blue-900/80 text-blue-200 border-blue-700',
  },
  SENIOR_ENGINEER: {
    id: 'SENIOR_ENGINEER',
    label: 'Senior Engineer',
    access: 'Approve recommendations',
    badgeColor: 'bg-amber-900/80 text-amber-200 border-amber-700',
  },
  ADMIN: {
    id: 'ADMIN',
    label: 'Administrator',
    access: 'Manage users/system',
    badgeColor: 'bg-emerald-900/80 text-emerald-200 border-emerald-700',
  },
  SECURITY_ADMIN: {
    id: 'SECURITY_ADMIN',
    label: 'Security Admin',
    access: 'Security/audit controls',
    badgeColor: 'bg-rose-900/80 text-rose-200 border-rose-700',
  },
};

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
