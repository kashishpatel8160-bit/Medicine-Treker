
export interface DoseLog {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "Morning" | "Afternoon" | "Evening" | "Night" or custom (e.g. "08:00 AM")
  status: 'taken' | 'missed';
  tabletsTaken: number;
  timestamp: string; // ISO String
}

export type ScheduleType = 'daily' | 'twice_daily' | 'three_times_daily' | 'alternate_days' | 'weekly' | 'monthly' | 'custom';

export interface Medicine {
  id: string;
  user_id?: string;
  medicine_name: string;
  dosage: string;
  quantity: number;
  remaining_quantity: number;
  frequency: string; 
  frequency_type?: 'daily' | 'alternate_days' | 'weekly' | 'custom_days';
  frequency_interval?: number;
  selected_weekdays?: string;
  custom_times?: string;
  skip_dates?: string;
  skip_date_ranges?: string;
  schedule_type: ScheduleType;
  schedule_days?: string;
  start_date: string;
  end_date?: string;
  duration_days?: number;
  low_stock_threshold: number;
  prescription_image?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  logs?: DoseLog[];
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
