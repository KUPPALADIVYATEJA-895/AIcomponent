import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, ROLE_DEFINITIONS } from '../types/rbac';

interface RbacContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  canInvestigate: boolean;
  canApproveRecommendations: boolean;
  canManageUsers: boolean;
  canViewSecurityAudit: boolean;
  canInjectFaults: boolean;
  canExecuteMitigations: boolean;
}

const RbacContext = createContext<RbacContextType | undefined>(undefined);

const STORAGE_KEY = 'aura_rbac_current_role';

export const RbacProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as UserRole | null;
      if (saved && ROLE_DEFINITIONS[saved]) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'ENGINEER'; // default role
  });

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch {
      // ignore
    }
  };

  // Viewer: Can only view dashboards
  // Engineer: Investigate components (inspect modal, change parameters)
  // Senior Engineer: Approve recommendations + investigate
  // Admin: Manage users/system + full operational control
  // Security Admin: Security/audit controls + inspect logs

  const canInvestigate =
    currentRole === 'ENGINEER' ||
    currentRole === 'SENIOR_ENGINEER' ||
    currentRole === 'ADMIN';

  const canApproveRecommendations =
    currentRole === 'SENIOR_ENGINEER' || currentRole === 'ADMIN';

  const canManageUsers = currentRole === 'ADMIN';

  const canViewSecurityAudit =
    currentRole === 'SECURITY_ADMIN' || currentRole === 'ADMIN';

  const canInjectFaults =
    currentRole === 'ENGINEER' ||
    currentRole === 'SENIOR_ENGINEER' ||
    currentRole === 'ADMIN';

  const canExecuteMitigations =
    currentRole === 'SENIOR_ENGINEER' || currentRole === 'ADMIN';

  return (
    <RbacContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        canInvestigate,
        canApproveRecommendations,
        canManageUsers,
        canViewSecurityAudit,
        canInjectFaults,
        canExecuteMitigations,
      }}
    >
      {children}
    </RbacContext.Provider>
  );
};

export const useRbac = () => {
  const ctx = useContext(RbacContext);
  if (!ctx) {
    throw new Error('useRbac must be used within an RbacProvider');
  }
  return ctx;
};
