/* ═══════════════════════════════════════════════════════════════
   User Management — SUPER_ADMIN / HOSPITAL_ADMIN CRUD for users
   ═══════════════════════════════════════════════════════════════ */

import { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, RefreshCw, Loader2, Pencil, Send,
  Shield, User, Mail, Phone, CheckCircle2, Building2, AlertTriangle, X, BadgeCheck,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { userApi } from '@/api/users';
import { hospitalApi } from '@/api/hospitals';
import type { UserResponse, HospitalResponse, Role, Designation } from '@/api/types';

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  SUPER_ADMIN:    { color: 'text-red-500', bg: 'bg-red-500/10' },
  HOSPITAL_ADMIN: { color: 'text-violet-500', bg: 'bg-violet-500/10' },
  DOCTOR:         { color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  NURSE:          { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  TRIAGE_NURSE:   { color: 'text-orange-500', bg: 'bg-orange-500/10' },
  REGISTRAR:      { color: 'text-blue-500', bg: 'bg-blue-500/10' },
  PARAMEDIC:      { color: 'text-amber-500', bg: 'bg-amber-500/10' },
  LAB_TECHNICIAN: { color: 'text-pink-500', bg: 'bg-pink-500/10' },
  READ_ONLY:      { color: 'text-slate-500', bg: 'bg-slate-500/10' },
};

const ROLES = ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'TRIAGE_NURSE', 'REGISTRAR', 'PARAMEDIC', 'LAB_TECHNICIAN', 'READ_ONLY'];

export function UserManagement() {
  const { glassCard, glassInner, isDark, text } = useTheme();
  const authUser = useAuthStore((s) => s.user);
  const isSuperAdmin = authUser?.role === 'SUPER_ADMIN';

  /* ── Hospital selector (SUPER_ADMIN picks hospital) ── */
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    authUser?.hospitalId || 'a0000000-0000-0000-0000-000000000001',
  );
  const hospitalId = isSuperAdmin ? selectedHospitalId : (authUser?.hospitalId || 'a0000000-0000-0000-0000-000000000001');

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  /* ── Feedback toast ── */
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const flash = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const emptyForm = { firstName: '', lastName: '', email: '', phoneNumber: '', role: 'NURSE', designation: '', password: '', hospitalId };
  const [form, setForm] = useState(emptyForm);
  const [designationOptions, setDesignationOptions] = useState<{ value: string; label: string }[]>([]);

  /* ── Load designation options when role changes ── */
  useEffect(() => {
    if (!form.role) return;
    userApi.getDesignations(form.role as Role)
      .then((opts) => {
        setDesignationOptions(opts || []);
        // Auto-clear designation if it doesn't match the new role options
        if (form.designation && opts && !opts.some((o) => o.value === form.designation)) {
          setForm((f) => ({ ...f, designation: '' }));
        }
      })
      .catch(() => setDesignationOptions([]));
  }, [form.role]);

  /* ── Load hospitals list (SUPER_ADMIN only) ── */
  useEffect(() => {
    if (!isSuperAdmin) return;
    hospitalApi.getAll(0, 100).then((res) => {
      setHospitals(res.content || []);
      if (res.content?.length && !authUser?.hospitalId) {
        setSelectedHospitalId(res.content[0].id);
      }
    }).catch(() => { /* ignore */ });
  }, [isSuperAdmin]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userApi.getByHospital(hospitalId, 0, 100);
      setUsers(data.content || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      flash('error', 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  /* Update form hospitalId when hospital changes */
  useEffect(() => {
    setForm((f) => ({ ...f, hospitalId }));
  }, [hospitalId]);

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email) return;
    setFormLoading(true);
    try {
      if (editId) {
        const { password, ...updateData } = form;
        await userApi.update(editId, updateData as any);
        flash('success', 'User updated successfully');
      } else {
        if (!form.password) return;
        await userApi.create({ ...form, hospitalId } as any);
        flash('success', 'User created successfully');
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      loadUsers();
    } catch (err: any) {
      // Show field-level errors if the server returned them
      const fieldErrors = err?.data;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const details = Object.values(fieldErrors).join(', ');
        flash('error', details || err?.message || 'Failed to save user');
      } else {
        flash('error', err?.message || 'Failed to save user');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const startEdit = (u: UserResponse) => {
    setForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      phoneNumber: u.phoneNumber || '',
      role: u.role || 'NURSE',
      designation: u.designation || '',
      password: '',
      hospitalId: u.hospitalId || hospitalId,
    });
    setEditId(u.id);
    setShowForm(true);
  };

  return (
    <div className="min-h-full">
      <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-4 animate-fade-in">

        {/* Header */}
        <div className="rounded-3xl overflow-hidden animate-fade-up" style={glassCard}>
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-wide">User Management</h1>
                  <p className="text-white/50 text-xs">Manage staff accounts and roles</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-white/10">
                  <span className="text-white/70 text-xs font-bold">{users.length} Users</span>
                </div>
                <button onClick={loadUsers} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <RefreshCw className="w-4 h-4 text-white" />
                </button>
                <button onClick={() => { setForm({ ...emptyForm, hospitalId }); setEditId(null); setShowForm(!showForm); }} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-xs font-bold shadow-lg hover:-translate-y-0.5 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add User
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold animate-fade-up ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/15 text-red-400 border border-red-500/20'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Hospital Selector (SUPER_ADMIN) */}
        {isSuperAdmin && hospitals.length > 0 && (
          <div className="rounded-2xl p-4 animate-fade-up" style={glassCard}>
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-violet-400" />
              <label className={`text-xs font-bold uppercase tracking-wider ${text.label}`}>Manage users for hospital:</label>
              <select
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                className={`flex-1 max-w-sm px-3 py-2 rounded-xl text-sm font-semibold outline-none ${isDark ? 'text-white' : 'text-slate-800'}`}
                style={glassInner}
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>{h.name} — {h.hospitalCode}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl p-5 animate-fade-up" style={glassCard}>
            <h4 className={`text-sm font-bold mb-4 ${text.heading}`}>{editId ? 'Edit User' : 'Create New User'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${text.label}`}>First Name</label>
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`} style={glassInner} />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${text.label}`}>Last Name</label>
                <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`} style={glassInner} />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${text.label}`}>Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@hospital.rw" type="email" className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`} style={glassInner} />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${text.label}`}>Phone</label>
                <input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="+250 788 000 000" className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`} style={glassInner} />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${text.label}`}>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, designation: '' })} className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${isDark ? 'text-white' : 'text-slate-800'}`} style={glassInner}>
                  {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${text.label}`}>Designation</label>
                <select value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${isDark ? 'text-white' : 'text-slate-800'}`} style={glassInner}>
                  <option value="">Select designation...</option>
                  {designationOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              {!editId && (
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${text.label}`}>Password</label>
                  <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" type="password" className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`} style={glassInner} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={handleSave} disabled={formLoading || !form.firstName || !form.lastName || !form.email || (!editId && !form.password)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-xl text-xs font-bold shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {formLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} {editId ? 'Update' : 'Create'}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className={`px-4 py-2.5 text-xs font-bold rounded-xl ${text.muted}`}>Cancel</button>
            </div>
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl p-8 text-center animate-fade-up" style={glassCard}>
            <Users className="w-10 h-10 mx-auto mb-3 text-slate-400" />
            <p className={`text-sm font-bold ${text.heading}`}>No users found</p>
            <p className={text.muted}>Create your first staff account</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden animate-fade-up" style={glassCard}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: isDark ? '1px solid rgba(2,132,199,0.15)' : '1px solid rgba(203,213,225,0.3)' }}>
                    {['Name', 'Email', 'Role', 'Designation', 'Phone', 'Status', ''].map((h) => (
                      <th key={h} className={`px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider ${text.label}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const rc = ROLE_COLORS[u.role] || ROLE_COLORS.READ_ONLY;
                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                        style={{ borderBottom: isDark ? '1px solid rgba(2,132,199,0.08)' : '1px solid rgba(203,213,225,0.15)' }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-cyan-500" />
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${text.heading}`}>{u.firstName} {u.lastName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className={`text-xs ${text.body}`}>{u.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${rc.bg} ${rc.color}`}>
                            {u.role?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.designationLabel ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg text-violet-500 bg-violet-500/10">
                              {u.designationLabel}
                            </span>
                          ) : (
                            <span className={`text-[10px] italic ${text.muted}`}>Not set</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className={`text-xs ${text.muted}`}>{u.phoneNumber || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg text-emerald-500 bg-emerald-500/10">
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => startEdit(u)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'} transition-colors`}>
                            <Pencil className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
