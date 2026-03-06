/* ── API barrel export ── */
export { apiRequest, get, post, put, patch, del, ApiError, getAccessToken, setTokens, clearTokens, restoreTokens } from './client';
export { authApi } from './auth';
export { patientApi } from './patients';
export { visitApi } from './visits';
export { vitalApi } from './vitals';
export { triageApi } from './triage';
export { clinicalNoteApi } from './clinicalNotes';
export { diagnosisApi } from './diagnoses';
export { investigationApi } from './investigations';
export { medicationApi } from './medications';
export { iotApi } from './iot';
export { alertApi } from './alerts';
export { hospitalApi } from './hospitals';
export { userApi } from './users';
export { shiftApi } from './shifts';
export { connectWebSocket, disconnectWebSocket, subscribeToVitals, subscribeToAlerts, subscribeToZoneAlerts, subscribeToUserAlerts, subscribeToDevices, subscribeToTriageChanges } from './websocket';
export type * from './types';
