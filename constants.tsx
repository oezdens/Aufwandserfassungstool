
import React from 'react';
import { Category, Performance, PspElement, User } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Projekt' },
  { id: 'cat2', name: 'Interne Leistung' },
  { id: 'cat3', name: 'Abwesenheit' },
];

export const INITIAL_PERFORMANCES: Performance[] = [
  { id: 'perf1', categoryId: 'cat1', name: 'Entwicklung' },
  { id: 'perf2', categoryId: 'cat1', name: 'Design' },
  { id: 'perf3', categoryId: 'cat2', name: 'Meeting' },
  { id: 'perf4', categoryId: 'cat3', name: 'Urlaub' },
];

export const INITIAL_PSP_ELEMENTS: PspElement[] = [
  { id: 'psp1', performanceId: 'perf1', code: 'IM-006-R1026-00', description: 'NSU, R' },
  { id: 'psp2', performanceId: 'perf1', code: 'IM-007-A2000-01', description: 'AUDI, Q4' },
  { id: 'psp3', performanceId: 'perf2', code: 'UX-2024-DESIGN', description: 'UX Design Global' },
];

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Serhat Özden', email: 'serhat.oezden@schwarz-immobilien.de', managerEmail: 'zoe.gotthardt@schwarz-immobilien.de' },
  { id: 'u2', name: 'Zoe Gotthardt', email: 'zoe.gotthardt@schwarz-immobilien.de' },
  { id: 'u3', name: 'Maximilian Mustermann', email: 'm.mustermann@schwarz-immobilien.de', managerEmail: 'zoe.gotthardt@schwarz-immobilien.de' },
];

export const Icons = {
  Tracking: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  Bookings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
  ),
  Team: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
  ),
  Overview: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  ),
  MasterData: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ),
};
