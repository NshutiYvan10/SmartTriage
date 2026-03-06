import { useState, useMemo, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Shield, Clock, Edit3, Camera, Save,
  Award, Briefcase, Calendar, Globe, Lock, Bell, Palette,
  ChevronRight, LogOut, KeyRound, FileText, Activity, CheckCircle,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { ROLE_META } from '../../types/roles';
import type { UserRole } from '../../types/roles';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  designation: string;
  department: string;
  employeeId: string;
  specialization: string;
  joinDate: string;
  location: string;
  language: string;
  bio: string;
  avatar: string;
}

/* ── Role-specific profile defaults ── */
const ROLE_PROFILES: Record<UserRole, {
  specialization: string;
  bio: string;
  employeeId: string;
  phone: string;
  language: string;
  joinDate: string;
}> = {
  SUPER_ADMIN: {
    specialization: 'System Architecture & Medical Informatics',
    bio: 'System administrator overseeing multi-tenant SmartTriage deployments across Rwanda. Responsible for platform reliability, security policies, and cross-hospital configuration.',
    employeeId: 'SYS-2023-001',
    phone: '+250 788 100 001',
    language: 'English, Kinyarwanda, French',
    joinDate: '2023-01-10',
  },
  HOSPITAL_ADMIN: {
    specialization: 'Hospital Operations & Staff Management',
    bio: 'Hospital administrator managing user accounts, department configuration, and operational KPIs for King Faisal Hospital\'s emergency department.',
    employeeId: 'ADM-2023-002',
    phone: '+250 788 200 002',
    language: 'English, Kinyarwanda, French',
    joinDate: '2023-03-15',
  },
  DOCTOR: {
    specialization: 'Emergency Medicine & Trauma',
    bio: 'Senior emergency physician with 12+ years of experience in trauma care and emergency triage. Reviews triage results and makes disposition decisions at King Faisal Hospital.',
    employeeId: 'DOC-2024-003',
    phone: '+250 788 300 003',
    language: 'English, Kinyarwanda, French',
    joinDate: '2023-06-01',
  },
  NURSE: {
    specialization: 'Emergency Nursing & Primary Triage',
    bio: 'Experienced emergency nurse performing primary triage assessments and recording patient vitals. Skilled in TEWS scoring and rapid patient evaluation.',
    employeeId: 'NUR-2024-004',
    phone: '+250 788 400 004',
    language: 'English, Kinyarwanda',
    joinDate: '2024-01-10',
  },
  TRIAGE_OFFICER: {
    specialization: 'Emergency Triage & Patient Prioritization',
    bio: 'Dedicated triage officer in the emergency department. Manages patient flow, assigns priority categories, and coordinates with clinical teams for rapid patient assessment.',
    employeeId: 'TRG-2024-005',
    phone: '+250 788 500 005',
    language: 'English, Kinyarwanda',
    joinDate: '2024-02-20',
  },
  READ_ONLY: {
    specialization: 'Quality Assurance & Compliance',
    bio: 'Quality assurance analyst monitoring triage outcomes, patient flow metrics, and department compliance. Provides data-driven insights for continuous improvement.',
    employeeId: 'QA-2024-006',
    phone: '+250 788 600 006',
    language: 'English, Kinyarwanda, French',
    joinDate: '2024-04-01',
  },
};

/** Recent activities per role */
const ROLE_ACTIVITIES: Record<UserRole, { action: string; time: string; color: string }[]> = {
  SUPER_ADMIN: [
    { action: 'Updated system-wide TEWS thresholds', time: '20 min ago', color: 'bg-violet-500' },
    { action: 'Onboarded new hospital tenant', time: '1h ago', color: 'bg-cyan-600' },
    { action: 'Reviewed platform audit logs', time: '2h ago', color: 'bg-blue-500' },
    { action: 'Deployed configuration update', time: '4h ago', color: 'bg-emerald-500' },
    { action: 'Managed user role assignments', time: '6h ago', color: 'bg-amber-500' },
  ],
  HOSPITAL_ADMIN: [
    { action: 'Added 3 new nursing staff accounts', time: '30 min ago', color: 'bg-indigo-500' },
    { action: 'Updated department shift schedule', time: '1h ago', color: 'bg-cyan-600' },
    { action: 'Reviewed monthly triage report', time: '2h ago', color: 'bg-emerald-500' },
    { action: 'Configured alert thresholds', time: '3h ago', color: 'bg-amber-500' },
    { action: 'Approved equipment request', time: '5h ago', color: 'bg-blue-500' },
  ],
  DOCTOR: [
    { action: 'Reviewed triage for patient Marie K.', time: '10 min ago', color: 'bg-cyan-600' },
    { action: 'Made disposition decision – Bay 5', time: '35 min ago', color: 'bg-emerald-500' },
    { action: 'Added clinical note for Jean P.', time: '1h ago', color: 'bg-blue-500' },
    { action: 'Acknowledged critical alert', time: '2h ago', color: 'bg-red-500' },
    { action: 'Completed shift handoff', time: '4h ago', color: 'bg-amber-500' },
  ],
  NURSE: [
    { action: 'Triaged patient Emmanuel H.', time: '15 min ago', color: 'bg-cyan-600' },
    { action: 'Updated vital signs for Bay 3', time: '42 min ago', color: 'bg-emerald-500' },
    { action: 'Acknowledged critical alert', time: '1h ago', color: 'bg-red-500' },
    { action: 'Completed shift handoff', time: '3h ago', color: 'bg-blue-500' },
    { action: 'Registered new patient', time: '4h ago', color: 'bg-amber-500' },
  ],
  TRIAGE_OFFICER: [
    { action: 'Assigned priority – RED to Bay 1', time: '5 min ago', color: 'bg-red-500' },
    { action: 'Triaged walk-in patient', time: '25 min ago', color: 'bg-cyan-600' },
    { action: 'Reassessed patient in queue', time: '50 min ago', color: 'bg-amber-500' },
    { action: 'Coordinated ambulance arrival', time: '1h ago', color: 'bg-emerald-500' },
    { action: 'Updated triage queue order', time: '2h ago', color: 'bg-blue-500' },
  ],
  READ_ONLY: [
    { action: 'Viewed monthly triage report', time: '20 min ago', color: 'bg-blue-500' },
    { action: 'Exported patient flow data', time: '1h ago', color: 'bg-cyan-600' },
    { action: 'Reviewed audit trail entries', time: '2h ago', color: 'bg-emerald-500' },
    { action: 'Checked compliance metrics', time: '4h ago', color: 'bg-amber-500' },
    { action: 'Downloaded shift summary', time: '6h ago', color: 'bg-violet-500' },
  ],
};

function buildProfileFromAuth(user: { fullName: string; email: string; role: UserRole; designationLabel?: string; department?: string; hospital?: string }): UserProfile {
  const nameParts = user.fullName.split(' ');
  const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  const roleMeta = ROLE_META[user.role];
  const roleDefaults = ROLE_PROFILES[user.role];

  return {
    firstName,
    lastName,
    email: user.email,
    phone: roleDefaults.phone,
    role: roleMeta.label,
    designation: user.designationLabel || 'Not set',
    department: user.department || 'General',
    employeeId: roleDefaults.employeeId,
    specialization: roleDefaults.specialization,
    joinDate: roleDefaults.joinDate,
    location: user.hospital ? `${user.hospital}, Kigali` : 'Kigali, Rwanda',
    language: roleDefaults.language,
    bio: roleDefaults.bio,
    avatar: '',
  };
}

export function ProfilePage() {
  const { isDark } = useTheme();
  const user = useAuthStore((s) => s.user);
  const roleMeta = user ? ROLE_META[user.role] : null;

  const activeProfile = useMemo(() => {
    if (!user) return null;
    return buildProfileFromAuth(user);
  }, [user?.id, user?.role]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'security'>('overview');

  // Sync profile when active user changes
  const displayProfile = profile ?? activeProfile;
  const displayEditProfile = editedProfile ?? activeProfile;

  // Reset local edits when user/role changes
  useEffect(() => {
    setProfile(null);
    setEditedProfile(null);
    setIsEditing(false);
  }, [user?.id, user?.role]);

  // Settings state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const handleSave = () => {
    setProfile(displayEditProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(displayProfile);
    setIsEditing(false);
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: User, description: 'Personal information' },
    { id: 'settings' as const, label: 'Preferences', icon: Bell, description: 'Notification & display' },
    { id: 'security' as const, label: 'Security', icon: Lock, description: 'Password & 2FA' },
  ];

  const statsCards = [
    { label: 'Patients Triaged', value: '1,247', icon: Activity, iconBg: 'bg-gradient-to-br from-slate-800 to-slate-700' },
    { label: 'Shift Hours', value: '2,340', icon: Clock, iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { label: 'Alerts Handled', value: '89', icon: Shield, iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600' },
    { label: 'Team Members', value: '12', icon: Briefcase, iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  ];

  // Guard: if no user, show nothing (shouldn't happen with auth)
  if (!displayProfile || !user) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-sm text-gray-500">No user profile available.</p>
      </div>
    );
  }

  // Compute avatar initials from current user's full name
  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-full">
      <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-4 animate-fade-in">

        {/* ── Profile Header Banner ── */}
        <div className="glass-card-dark rounded-3xl overflow-hidden animate-fade-up">
          {/* Dark Banner */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-cyan-700 px-6 py-6 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiLz48L3N2Zz4=')] opacity-50" />
            <div className="relative flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/30 shadow-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-bold text-white">{initials}</span>
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-300 hover:-translate-y-0.5">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 sm:mb-1">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {displayProfile.firstName} {displayProfile.lastName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-white/70 flex items-center gap-1.5 font-medium">
                    <Briefcase className="w-3.5 h-3.5" />
                    {displayProfile.designation !== 'Not set' ? displayProfile.designation : displayProfile.role} · {displayProfile.department}
                  </p>
                  {roleMeta && (
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md ${roleMeta.color} text-white uppercase tracking-wide`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2.5 text-xs font-bold text-white/80 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/20"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-gray-50 rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/20 hover:-translate-y-0.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="glass-card rounded-2xl p-1.5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-md shadow-slate-800/20'
                      : 'text-gray-600 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Content ── */}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {/* Personal Information */}
            <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-500 flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Personal Information</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Your professional details</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: 'Full Name', value: `${displayProfile.firstName} ${displayProfile.lastName}`, icon: User, field: 'firstName' },
                    { label: 'Email Address', value: displayProfile.email, icon: Mail, field: 'email' },
                    { label: 'Phone Number', value: displayProfile.phone, icon: Phone, field: 'phone' },
                    { label: 'Employee ID', value: displayProfile.employeeId, icon: Award, field: 'employeeId' },
                    { label: 'Specialization', value: displayProfile.specialization, icon: Shield, field: 'specialization' },
                    { label: 'Location', value: displayProfile.location, icon: MapPin, field: 'location' },
                    { label: 'Join Date', value: new Date(displayProfile.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), icon: Calendar, field: 'joinDate' },
                    { label: 'Languages', value: displayProfile.language, icon: Globe, field: 'language' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label}>
                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                          <Icon className="w-3.5 h-3.5" />
                          {item.label}
                        </label>
                        {isEditing && item.field !== 'employeeId' && item.field !== 'joinDate' ? (
                          <input
                            type="text"
                            value={(displayEditProfile as any)[item.field]}
                            onChange={(e) =>
                              setEditedProfile((prev) => ({ ...(prev ?? displayProfile!), [item.field]: e.target.value }))
                            }
                            className="w-full px-4 py-2.5 text-sm bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 shadow-sm font-medium text-gray-700"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bio */}
                <div className="mt-5 pt-5 border-t border-gray-100/60">
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={displayEditProfile!.bio}
                      onChange={(e) => setEditedProfile((prev) => ({ ...(prev ?? displayProfile!), bio: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 text-sm bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 shadow-sm font-medium text-gray-700 resize-none"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">{displayProfile.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Recent Activity */}
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {(ROLE_ACTIVITIES[user.role] ?? []).map((item, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color} mt-1.5 flex-shrink-0 ring-4 ring-white/80`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-cyan-700 transition-all duration-300">{item.action}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div
                className="rounded-2xl p-5 animate-fade-up"
                style={{
                  background: isDark ? 'rgba(12,74,110,0.18)' : 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: isDark ? '1px solid rgba(2,132,199,0.22)' : '1px solid rgba(255,255,255,0.6)',
                  boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
                }}
              >
                <div className="mb-4">
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Quick Actions</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Shortcuts & navigation</p>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Download Activity Report', sublabel: 'Export shift summary', icon: FileText, iconBg: 'rgba(6,182,212,0.12)', iconColor: 'text-cyan-600' },
                    { label: 'Change Password', sublabel: 'Update credentials', icon: KeyRound, iconBg: 'rgba(99,102,241,0.12)', iconColor: 'text-indigo-500' },
                    { label: 'Manage Notifications', sublabel: 'Alert preferences', icon: Bell, iconBg: 'rgba(251,146,60,0.12)', iconColor: 'text-orange-500' },
                    { label: 'Sign Out', sublabel: 'End current session', icon: LogOut, iconBg: 'rgba(239,68,68,0.1)', iconColor: 'text-red-500', danger: true },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:-translate-y-1 transition-all duration-400 group cursor-pointer"
                        style={{
                          background: isDark ? 'rgba(12,74,110,0.18)' : 'rgba(255,255,255,0.6)',
                          border: isDark ? '1px solid rgba(2,132,199,0.22)' : '1px solid rgba(203,213,225,0.4)',
                          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-400"
                            style={{ backgroundColor: item.iconBg }}
                          >
                            <Icon className={`w-[18px] h-[18px] ${item.iconColor}`} />
                          </div>
                          <div className="text-left">
                            <div className={`text-[13px] font-bold ${item.danger ? 'text-red-600' : 'text-slate-800'}`}>{item.label}</div>
                            <div className="text-[11px] text-slate-400 font-medium">{item.sublabel}</div>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${item.danger ? 'text-red-400' : 'text-slate-400'} group-hover:translate-x-1 transition-transform duration-300`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {/* Notification Preferences */}
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-500 flex items-center justify-center shadow-sm">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Notification Preferences</h2>
                    <p className="text-xs text-gray-500 mt-0.5">How you receive updates</p>
                  </div>
                </div>
              </div>
              <div className="p-5 divide-y divide-gray-100/60">
                <SettingToggle
                  label="Email Notifications"
                  description="Receive notification summaries via email"
                  enabled={emailNotifs}
                  onToggle={() => setEmailNotifs(!emailNotifs)}
                />
                <SettingToggle
                  label="Push Notifications"
                  description="Browser push notifications for real-time alerts"
                  enabled={pushNotifs}
                  onToggle={() => setPushNotifs(!pushNotifs)}
                />
                <SettingToggle
                  label="Sound Alerts"
                  description="Play sound for critical notifications"
                  enabled={soundAlerts}
                  onToggle={() => setSoundAlerts(!soundAlerts)}
                />
                <SettingToggle
                  label="Critical Only"
                  description="Only receive notifications for critical events"
                  enabled={criticalOnly}
                  onToggle={() => setCriticalOnly(!criticalOnly)}
                />
              </div>
            </div>

            {/* Appearance Preferences */}
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <Palette className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Appearance</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Visual & display preferences</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="divide-y divide-gray-100/60">
                  <SettingToggle
                    label="Dark Mode"
                    description="Switch to dark theme across the application"
                    enabled={darkMode}
                    onToggle={() => setDarkMode(!darkMode)}
                  />
                  <SettingToggle
                    label="Compact View"
                    description="Reduce spacing for more information density"
                    enabled={compactView}
                    onToggle={() => setCompactView(!compactView)}
                  />
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100/60">
                  <label className="text-xs font-semibold text-gray-500 mb-3 block uppercase tracking-wider">Theme Color</label>
                  <div className="flex gap-3">
                    {[
                      { color: 'bg-cyan-600', active: true },
                      { color: 'bg-blue-500', active: false },
                      { color: 'bg-emerald-500', active: false },
                      { color: 'bg-violet-500', active: false },
                      { color: 'bg-rose-500', active: false },
                      { color: 'bg-amber-500', active: false },
                    ].map((item, i) => (
                      <button
                        key={i}
                        className={`w-9 h-9 rounded-xl ${item.color} ${
                          item.active ? 'ring-2 ring-offset-2 ring-cyan-600 shadow-lg' : 'shadow-sm'
                        } transition-all duration-300 hover:scale-110 hover:-translate-y-0.5`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {/* Change Password */}
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center shadow-sm">
                    <KeyRound className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Change Password</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Keep your account secure</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 text-sm bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 shadow-sm font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 text-sm bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 shadow-sm font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 text-sm bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 shadow-sm font-medium"
                  />
                </div>
                <button className="w-full py-3 text-xs font-bold text-white bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl transition-all duration-300 shadow-lg shadow-slate-800/20 hover:shadow-xl hover:-translate-y-0.5">
                  Update Password
                </button>
              </div>
            </div>

            {/* Security Settings Column */}
            <div className="space-y-4">
              {/* Two-Factor */}
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Two-Factor Authentication</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Extra security layer for your account</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:-translate-y-0.5">
                    <Shield className="w-3.5 h-3.5" />
                    Enable 2FA
                  </button>
                </div>
              </div>

              {/* Login History */}
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">Login History</h2>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { device: 'Chrome on Windows', location: 'Kigali, Rwanda', time: 'Now', active: true },
                    { device: 'Safari on iPhone', location: 'Kigali, Rwanda', time: '2 hours ago', active: false },
                    { device: 'Chrome on Windows', location: 'Kigali, Rwanda', time: 'Yesterday', active: false },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/60 transition-all duration-300">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{session.device}</p>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                          {session.location} · {session.time}
                        </p>
                      </div>
                      {session.active && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          Active
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Premium Setting Toggle ──
interface SettingToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function SettingToggle({ label, description, enabled, onToggle }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0 ml-4 ${
          enabled
            ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 shadow-md shadow-cyan-600/30'
            : 'bg-gray-300 hover:bg-gray-400'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        >
          {enabled && (
            <CheckCircle className="w-3 h-3 text-cyan-600" />
          )}
        </span>
      </button>
    </div>
  );
}
