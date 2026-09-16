import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon, Users, RefreshCw, X, Lock } from 'lucide-react';
import { useRbac } from '../context/RbacContext';
import { AuditLogEntry, AppUser, UserRole, ROLE_DEFINITIONS } from '../types/rbac';

interface RbacManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'USERS' | 'AUDIT';
}

export const RbacManagementModal: React.FC<RbacManagementModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'USERS',
}) => {
  const { currentRole, canManageUsers, canViewSecurityAudit } = useRbac();
  const [activeTab, setActiveTab] = useState<'USERS' | 'AUDIT'>(defaultTab);

  const [users, setUsers] = useState<AppUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('ENGINEER');

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/rbac/users', {
        headers: { 'x-user-role': currentRole },
      });
      if (res.status === 403) {
        const data = await res.json();
        setErrorMessage(data.error || 'Access denied');
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setErrorMessage('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/rbac/audit-logs', {
        headers: { 'x-user-role': currentRole },
      });
      if (res.status === 403) {
        const data = await res.json();
        setErrorMessage(data.error || 'Access denied');
        return;
      }
      const data = await res.json();
      setAuditLogs(data.logs || []);
    } catch {
      setErrorMessage('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (activeTab === 'USERS') {
      fetchUsers();
    } else {
      fetchAuditLogs();
    }
  }, [isOpen, activeTab, currentRole]);

  if (!isOpen) return null;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    try {
      const res = await fetch('/api/rbac/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentRole,
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to add user');
        return;
      }

      setNewUserName('');
      setNewUserEmail('');
      fetchUsers();
    } catch {
      alert('Error adding user');
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch(`/api/rbac/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentRole,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update user');
        return;
      }
      fetchUsers();
    } catch {
      alert('Error updating user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/rbac/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-user-role': currentRole },
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to remove user');
        return;
      }
      fetchUsers();
    } catch {
      alert('Error removing user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="rbac-management-modal"
        className="bg-[#131926] border border-[#232f42] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#232f42] bg-[#0f141f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Access Control & Audit
              </h3>
              <p className="text-xs text-slate-400">
                Server-enforced role access and security audit logging
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#1b2332] text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#232f42] bg-[#0f141f]/70 px-4 pt-2 gap-2 text-xs font-mono">
          <button
            id="tab-rbac-users"
            onClick={() => setActiveTab('USERS')}
            className={`pb-2.5 px-3 border-b-2 font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'USERS'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Manage Users
          </button>

          <button
            id="tab-rbac-audit"
            onClick={() => setActiveTab('AUDIT')}
            className={`pb-2.5 px-3 border-b-2 font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'AUDIT'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Security & Audit Logs
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs font-mono space-y-4">
          {/* TAB 1: USERS */}
          {activeTab === 'USERS' && (
            <div>
              {!canManageUsers ? (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Admin Role Required</div>
                    <p className="text-[11px] text-amber-300/80 mt-0.5">
                      Your current role is <strong className="text-white">{ROLE_DEFINITIONS[currentRole].label}</strong>. Only <strong className="text-white">Administrator</strong> can add, edit, or remove users.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Add user form */}
                  <form
                    onSubmit={handleAddUser}
                    className="p-3.5 rounded-xl bg-[#0f141f] border border-[#232f42] flex flex-wrap items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="User Name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[#182130] border border-[#2c384c] text-slate-100 placeholder-slate-500 text-xs flex-1 min-w-[120px]"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[#182130] border border-[#2c384c] text-slate-100 placeholder-slate-500 text-xs flex-1 min-w-[150px]"
                      required
                    />
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#182130] border border-[#2c384c] text-slate-100 text-xs cursor-pointer"
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="ENGINEER">Engineer</option>
                      <option value="SENIOR_ENGINEER">Senior Engineer</option>
                      <option value="ADMIN">Administrator</option>
                      <option value="SECURITY_ADMIN">Security Admin</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors cursor-pointer"
                    >
                      + Add User
                    </button>
                  </form>

                  {/* Users Table */}
                  <div className="border border-[#232f42] rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#0f141f] text-slate-400 text-[10px] uppercase border-b border-[#232f42]">
                        <tr>
                          <th className="p-2.5">User</th>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5">Access Level</th>
                          <th className="p-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2838]">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-[#161f2e]">
                            <td className="p-2.5">
                              <div className="font-bold text-white">{u.name}</div>
                              <div className="text-[10px] text-slate-400">{u.email}</div>
                            </td>
                            <td className="p-2.5">
                              <select
                                value={u.role}
                                onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                                className="bg-[#182130] border border-[#2c384c] rounded px-2 py-0.5 text-[11px] text-slate-200"
                              >
                                <option value="VIEWER">Viewer</option>
                                <option value="ENGINEER">Engineer</option>
                                <option value="SENIOR_ENGINEER">Senior Engineer</option>
                                <option value="ADMIN">Administrator</option>
                                <option value="SECURITY_ADMIN">Security Admin</option>
                              </select>
                            </td>
                            <td className="p-2.5 text-slate-300 text-[11px]">
                              {ROLE_DEFINITIONS[u.role]?.access || 'Standard'}
                            </td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-rose-400 hover:text-rose-300 text-[11px] cursor-pointer"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AUDIT LOGS */}
          {activeTab === 'AUDIT' && (
            <div>
              {!canViewSecurityAudit ? (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Security Admin Role Required</div>
                    <p className="text-[11px] text-amber-300/80 mt-0.5">
                      Your current role is <strong className="text-white">{ROLE_DEFINITIONS[currentRole].label}</strong>. Only <strong className="text-white">Security Admin</strong> or <strong className="text-white">Administrator</strong> can inspect audit/security logs.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-slate-400 text-xs">
                      Server Authorization Logs ({auditLogs.length} events)
                    </span>
                    <button
                      onClick={fetchAuditLogs}
                      disabled={isLoading}
                      className="px-2.5 py-1 bg-[#182130] hover:bg-[#202c40] border border-[#2a374c] rounded text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>

                  <div className="border border-[#232f42] rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#0f141f] text-slate-400 text-[10px] uppercase border-b border-[#232f42]">
                        <tr>
                          <th className="p-2.5">Timestamp</th>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5">Action</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Target & Detail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2838] text-[11px]">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-[#161f2e]">
                            <td className="p-2.5 text-slate-400 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="p-2.5">
                              <span className="font-bold text-slate-200">
                                {ROLE_DEFINITIONS[log.userRole]?.label || log.userRole}
                              </span>
                            </td>
                            <td className="p-2.5 font-bold text-white">
                              {log.action}
                            </td>
                            <td className="p-2.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  log.status === 'ALLOWED'
                                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                    : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-300">
                              <span className="text-white font-bold mr-1">{log.target}:</span>
                              <span>{log.detail}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#232f42] bg-[#0f141f] flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Active Role: <strong className="text-cyan-400">{ROLE_DEFINITIONS[currentRole].label}</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#182130] hover:bg-[#202c40] border border-[#2a374c] rounded-lg text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
