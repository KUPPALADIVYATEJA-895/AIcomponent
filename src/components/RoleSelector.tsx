import React, { useState } from 'react';
import { useRbac } from '../context/RbacContext';
import { ROLE_DEFINITIONS, UserRole } from '../types/rbac';
import { Users, Shield, Check, ChevronDown } from 'lucide-react';

export const RoleSelector: React.FC = () => {
  const { currentRole, setCurrentRole } = useRbac();
  const [isOpen, setIsOpen] = useState(false);

  const activeDef = ROLE_DEFINITIONS[currentRole];

  const rolesList: UserRole[] = [
    'VIEWER',
    'ENGINEER',
    'SENIOR_ENGINEER',
    'ADMIN',
    'SECURITY_ADMIN',
  ];

  return (
    <div className="relative inline-block text-left">
      <button
        id="rbac-role-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141d2b] hover:bg-[#1f2b3e] border border-[#232f42] text-xs font-mono text-slate-200 transition-colors cursor-pointer"
        title="Switch active user role"
      >
        <Shield className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-400 text-[10px]">Role:</span>
        <span className="font-bold text-white">{activeDef.label}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="rbac-role-dropdown-menu"
            className="absolute right-0 mt-1.5 w-64 rounded-xl bg-[#0f141f] border border-[#232f42] shadow-2xl z-50 p-1.5 text-xs font-mono"
          >
            <div className="px-2.5 py-1.5 text-[10px] text-slate-400 border-b border-[#1e2838] uppercase font-bold tracking-wider">
              Select User Role (RBAC)
            </div>

            <div className="py-1 space-y-0.5">
              {rolesList.map((roleKey) => {
                const def = ROLE_DEFINITIONS[roleKey];
                const isSelected = roleKey === currentRole;
                return (
                  <button
                    key={roleKey}
                    id={`rbac-role-option-${roleKey.toLowerCase()}`}
                    onClick={() => {
                      setCurrentRole(roleKey);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 text-white border border-blue-500/40'
                        : 'hover:bg-[#182130] text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>{def.label}</span>
                        {isSelected && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                        Access: {def.access}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
