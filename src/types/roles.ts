/* ─── Role-Based Access Control Types ─── */

export type UserRole =
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'TRIAGE_OFFICER'
  | 'READ_ONLY';

/** Every routable view / feature the sidebar can reference */
export type AppPage =
  | 'dashboard'
  | 'entry'
  | 'patients'
  | 'triage'
  | 'monitoring'
  | 'alerts'
  | 'audit-trail'
  | 'reports'
  | 'settings'
  | 'admin'
  | 'notifications'
  | 'profile';

/** Feature-level permissions (things that can be toggled inside a page) */
export type AppFeature =
  | 'register_patient'
  | 'start_triage'
  | 'record_vitals'
  | 'override_category'
  | 'acknowledge_alert'
  | 'add_clinical_note'
  | 'export_report'
  | 'manage_users'
  | 'manage_settings'
  | 'view_audit'
  | 'view_reports'
  | 'view_monitoring';

/** Metadata for displaying a role in the UI */
export interface RoleMeta {
  label: string;
  description: string;
  color: string;          // tailwind bg class
  textColor: string;      // tailwind text class
  borderColor: string;    // tailwind border class
}

/* ─── Role metadata ─── */
export const ROLE_META: Record<UserRole, RoleMeta> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    description: 'System-wide configuration & multi-tenant management',
    color: 'bg-violet-500',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-300',
  },
  HOSPITAL_ADMIN: {
    label: 'Hospital Admin',
    description: 'Hospital-level user & configuration management',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-300',
  },
  DOCTOR: {
    label: 'Doctor',
    description: 'Reviews triage results & makes disposition decisions',
    color: 'bg-cyan-500',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-300',
  },
  NURSE: {
    label: 'Nurse',
    description: 'Performs primary triage & records patient vitals',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-300',
  },
  TRIAGE_OFFICER: {
    label: 'Triage Officer',
    description: 'Dedicated triage responsibilities in the ED',
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-300',
  },
  READ_ONLY: {
    label: 'Read Only',
    description: 'Audit, reporting & observation-only access',
    color: 'bg-slate-500',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-300',
  },
};

/* ─── Page-level permissions per role ─── */
export const ROLE_PAGES: Record<UserRole, AppPage[]> = {
  SUPER_ADMIN: [
    'dashboard', 'entry', 'patients', 'triage', 'monitoring',
    'alerts', 'audit-trail', 'reports', 'settings', 'admin', 'notifications', 'profile',
  ],
  HOSPITAL_ADMIN: [
    'dashboard', 'entry', 'patients', 'triage', 'monitoring',
    'alerts', 'audit-trail', 'reports', 'settings', 'admin', 'notifications', 'profile',
  ],
  DOCTOR: [
    'dashboard', 'patients', 'triage', 'monitoring',
    'alerts', 'reports', 'notifications', 'profile',
  ],
  NURSE: [
    'dashboard', 'entry', 'patients', 'triage', 'monitoring',
    'alerts', 'notifications', 'profile',
  ],
  TRIAGE_OFFICER: [
    'dashboard', 'entry', 'patients', 'triage', 'monitoring',
    'alerts', 'notifications', 'profile',
  ],
  READ_ONLY: [
    'dashboard', 'patients', 'audit-trail', 'reports', 'profile',
  ],
};

/* ─── Feature-level permissions per role ─── */
export const ROLE_FEATURES: Record<UserRole, AppFeature[]> = {
  SUPER_ADMIN: [
    'register_patient', 'start_triage', 'record_vitals', 'override_category',
    'acknowledge_alert', 'add_clinical_note', 'export_report',
    'manage_users', 'manage_settings', 'view_audit', 'view_reports', 'view_monitoring',
  ],
  HOSPITAL_ADMIN: [
    'register_patient', 'start_triage', 'record_vitals', 'override_category',
    'acknowledge_alert', 'add_clinical_note', 'export_report',
    'manage_users', 'manage_settings', 'view_audit', 'view_reports', 'view_monitoring',
  ],
  DOCTOR: [
    'override_category', 'acknowledge_alert', 'add_clinical_note',
    'export_report', 'view_reports', 'view_monitoring',
  ],
  NURSE: [
    'register_patient', 'start_triage', 'record_vitals',
    'acknowledge_alert', 'add_clinical_note', 'view_monitoring',
  ],
  TRIAGE_OFFICER: [
    'register_patient', 'start_triage', 'record_vitals',
    'override_category', 'acknowledge_alert', 'add_clinical_note', 'view_monitoring',
  ],
  READ_ONLY: [
    'view_audit', 'view_reports',
  ],
};

/* ─── Helper functions ─── */

/** Check if a role has access to a given page */
export function canAccessPage(role: UserRole, page: AppPage): boolean {
  return ROLE_PAGES[role].includes(page);
}

/** Check if a role has a given feature permission */
export function hasFeature(role: UserRole, feature: AppFeature): boolean {
  return ROLE_FEATURES[role].includes(feature);
}

/** Get the default landing page for a role */
export function getDefaultPage(_role: UserRole): string {
  return 'dashboard';
}
