export interface RefillRecord {
  id: string;
  date: string;
  quantityAdded: number;
  notes?: string;
}

export interface DoseLog {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "Morning" | "Afternoon" | "Evening" | "Night" or custom (e.g. "08:00 AM")
  status: 'taken' | 'missed';
  tabletsTaken: number;
  timestamp: string; // ISO String
}

export interface Medicine {
  id: string;
  name: string;
  totalTablets: number;       // Initial/Reference stock capacity
  currentStock: number;       // Remaining tablets in stock
  dosagePerTime: number;      // Number of tablets/capsules taken each time
  schedule: string[];         // Array of times: "Morning", "Night", or custom time strings
  startDate: string;          // YYYY-MM-DD
  notes?: string;
  refills: RefillRecord[];
  logs: DoseLog[];
  createdAt: string;
}

export type Language = 'en' | 'hi';

export interface TranslationDict {
  appName: string;
  appSubtitle: string;
  totalMedicines: string;
  lowStockAlerts: string;
  completedCourses: string;
  pendingDosesToday: string;
  searchPlaceholder: string;
  addNewMedicine: string;
  noMedicinesFound: string;
  selectAMedicine: string;
  medicineName: string;
  totalTablets: string;
  dailyDosageSchedule: string;
  tabletsPerDose: string;
  startDate: string;
  notes: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  remainingTablets: string;
  tabletsConsumed: string;
  remainingDays: string;
  days: string;
  sufficientStock: string;
  lowStock: string;
  almostFinished: string;
  refillStock: string;
  quantity: string;
  addStock: string;
  refillHistory: string;
  doseHistoryLogs: string;
  todaySchedule: string;
  markTaken: string;
  markMissed: string;
  taken: string;
  missed: string;
  undone: string;
  aboutToFinish: string;
  finished: string;
  allDosesTaken: string;
  noPendingDoses: string;
  activeStatus: string;
  stockStatus: string;
  historyLogs: string;
  calendarView: string;
  dashboard: string;
  medicinesList: string;
}
