import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface DoseLog {
  id: string;
  date: string;
  timeSlot: string;
  status: 'taken' | 'missed';
  tabletsTaken: number;
  timestamp: string;
}

export interface Medicine {
  id: string;
  name: string;
  totalTablets: number;
  currentStock: number;
  dosagePerTime: number;
  schedule: string[];
  startDate: string;
  notes?: string;
  logs: DoseLog[];
  createdAt: string;
}

interface MedicineContextType {
  medicines: Medicine[];
  loading: boolean;
  addMedicine: (medicine: Omit<Medicine, 'id' | 'logs' | 'createdAt' | 'currentStock'>) => Promise<void>;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => Promise<void>;
  removeMedicine: (id: string) => Promise<void>;
  markTaken: (id: string, timeSlot: string, status: 'taken' | 'missed', dateStr: string) => Promise<void>;
  removeDoseLog: (id: string, logId: string) => Promise<void>;
  refreshMedicines: () => Promise<void>;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export function MedicineProvider({ children }: { children: React.ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchMedicines = useCallback(async () => {
    if (!user) {
      setMedicines([]);
      return;
    }
    
    setLoading(true);
    try {
      const { data: medsData, error: medsError } = await supabase
        .from('medicines')
        .select(`
          *,
          dose_logs (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (medsError) throw medsError;

      const normalized = (medsData || []).map((med: any) => ({
        id: med.id,
        name: med.name,
        totalTablets: med.total_tablets,
        currentStock: med.current_stock,
        dosagePerTime: med.dosage_per_time,
        schedule: typeof med.schedule === 'string' ? JSON.parse(med.schedule) : med.schedule || [],
        startDate: med.start_date,
        notes: med.notes,
        createdAt: med.created_at,
        logs: (med.dose_logs || []).map((l: any) => ({
          id: l.id,
          date: l.date,
          timeSlot: l.time_slot,
          status: l.status,
          tabletsTaken: l.tablets_taken,
          timestamp: l.timestamp
        }))
      }));
      setMedicines(normalized);
    } catch (err) {
      console.error("Failed to fetch medicines", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const addMedicine = async (med: Omit<Medicine, 'id' | 'logs' | 'createdAt' | 'currentStock'>) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('medicines').insert({
        user_id: user.id,
        name: med.name,
        total_tablets: med.totalTablets,
        current_stock: med.totalTablets,
        dosage_per_time: med.dosagePerTime,
        schedule: med.schedule,
        start_date: med.startDate,
        notes: med.notes
      });
      if (error) throw error;
      await fetchMedicines();
    } catch (err) {
      console.error("Error adding medicine", err);
      throw err;
    }
  };

  const updateMedicine = async (id: string, med: Partial<Medicine>) => {
    if (!user) return;
    const target = medicines.find(m => m.id === id);
    if (!target) return;
    
    try {
      const payload = {
        name: med.name ?? target.name,
        total_tablets: med.totalTablets ?? target.totalTablets,
        current_stock: med.currentStock ?? target.currentStock,
        dosage_per_time: med.dosagePerTime ?? target.dosagePerTime,
        schedule: med.schedule ?? target.schedule,
        start_date: med.startDate ?? target.startDate,
        notes: med.notes ?? target.notes
      };
      
      const { error } = await supabase.from('medicines').update(payload).eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      await fetchMedicines();
    } catch (err) {
      console.error("Error updating medicine", err);
      throw err;
    }
  };

  const removeMedicine = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('medicines').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      await fetchMedicines();
    } catch (err) {
      console.error("Error deleting medicine", err);
      throw err;
    }
  };

  const markTaken = async (id: string, timeSlot: string, status: 'taken' | 'missed', dateStr: string) => {
    if (!user) return;
    const target = medicines.find(m => m.id === id);
    if (!target) return;
    
    try {
      const tabletsTaken = status === 'taken' ? target.dosagePerTime : 0;
      
      const { error: logError } = await supabase.from('dose_logs').insert({
        medicine_id: id,
        date: dateStr,
        time_slot: timeSlot,
        status: status,
        tablets_taken: tabletsTaken
      });
      
      if (logError) throw logError;
      
      if (status === 'taken') {
        const newStock = Math.max(0, target.currentStock - tabletsTaken);
        const { error: updateError } = await supabase.from('medicines').update({ current_stock: newStock }).eq('id', id).eq('user_id', user.id);
        if (updateError) throw updateError;
      }
      
      await fetchMedicines();
    } catch (err) {
      console.error("Error marking dose", err);
      throw err;
    }
  };

  const removeDoseLog = async (id: string, logId: string) => {
    if (!user) return;
    const target = medicines.find(m => m.id === id);
    const log = target?.logs.find(l => l.id === logId);
    if (!target || !log) return;
    
    try {
      const { error: logError } = await supabase.from('dose_logs').delete().eq('id', logId).eq('medicine_id', id);
      if (logError) throw logError;
      
      if (log.status === 'taken') {
        const newStock = target.currentStock + log.tabletsTaken;
        const { error: updateError } = await supabase.from('medicines').update({ current_stock: newStock }).eq('id', id).eq('user_id', user.id);
        if (updateError) throw updateError;
      }
      
      await fetchMedicines();
    } catch (err) {
      console.error("Error removing dose log", err);
      throw err;
    }
  };

  return (
    <MedicineContext.Provider
      value={{ 
        medicines, 
        loading,
        addMedicine, 
        updateMedicine, 
        removeMedicine, 
        markTaken,
        removeDoseLog,
        refreshMedicines: fetchMedicines
      }}
    >
      {children}
    </MedicineContext.Provider>
  );
}

export function useMedicines() {
  const context = useContext(MedicineContext);
  if (context === undefined) {
    throw new Error('useMedicines must be used within a MedicineProvider');
  }
  return context;
}
