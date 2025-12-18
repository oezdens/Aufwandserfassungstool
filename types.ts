
export enum AppView {
  TRACKING = 'Aufwandserfassung',
  BOOKINGS = 'Meine Buchungen',
  TEAM = 'Mein Team',
  OVERVIEW = 'Übersichtsseite',
  MASTER_DATA = 'Stammdaten'
}

export enum BookingStatus {
  OPEN = 'Geöffnet',
  SAVED = 'Gespeichert',
  SUBMITTED = 'Eingereicht',
  APPROVED = 'Genehmigt',
  REJECTED = 'Abgelehnt'
}

export interface User {
  id: string;
  name: string;
  email: string;
  managerId?: string;
  managerEmail?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Performance {
  id: string;
  categoryId: string;
  name: string;
}

export interface PspElement {
  id: string;
  performanceId: string;
  code: string;
  description: string;
}

export interface TimeEntry {
  id: string;
  categoryId: string;
  performanceId: string;
  pspElementId: string;
  hours: number[]; 
}

export interface TimeCard {
  id: string;
  userId: string;
  weekLabel: string; 
  startDate: string; 
  endDate: string;
  entries: TimeEntry[];
  status: BookingStatus;
  rejectionReason?: string;
}

export interface MasterDataState {
  categories: Category[];
  performances: Performance[];
  pspElements: PspElement[];
  users: User[];
}
