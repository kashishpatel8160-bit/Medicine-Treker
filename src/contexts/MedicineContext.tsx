import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Medicine } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface MedicineContextType {
  medicines: Medicine[];
  loading: boolean;
  addMedicine: (medicine: Omit<Medicine, 'id' | 'logs' | 'created_at' | 'updated_at' | 'remaining_quantity'>) => Promise<void>;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => Promise<void>;
  removeMedicine: (id: string) => Promise<void>;
  markTaken: (id: string, timeSlot: string, status: 'taken' | 'missed', dateStr: string) => Promise<void>;
  removeDoseLog: (id: string, logId: string) => Promise<void>;
  refreshMedicines: () => Promise<void>;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'healthsync_medicines_fallback';

export function MedicineProvider({ children }: { children: React.ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Helper to get local medicines
  const getLocalMedicines = (): Medicine[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalMedicines = (meds: Medicine[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(meds));
    setMedicines(meds);
  };

  const fetchMedicines = useCallback(async () => {
    if (!user) {
      setMedicines([]);
      return;
    }
    
    setLoading(true);
    try {
      const { data: medsData, error: medsError } = await supabase
        .from('medicines')
        .select(`*, dose_logs (*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (medsError) throw medsError;

      const normalized: Medicine[] = (medsData || []).map((med: any) => ({
        id: med.id,
        user_id: med.user_id,
        medicine_name: med.medicine_name,
        dosage: med.dosage,
        quantity: med.quantity,
        remaining_quantity: med.remaining_quantity,
        frequency: med.frequency,
        schedule_type: med.schedule_type,
        schedule_days: med.schedule_days,
        start_date: med.start_date,
        end_date: med.end_date,
        low_stock_threshold: med.low_stock_threshold,
        prescription_image: med.prescription_image,
        created_at: med.created_at,
        updated_at: med.updated_at,
        notes: med.notes,
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
      console.warn("Supabase fetch failed, falling back to local storage.", err);
      // Fallback to local storage
      const local = getLocalMedicines();
      const userLocal = local.filter(m => m.user_id === user.id || !m.user_id);
      setMedicines(userLocal);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMedicines();

    if (!user) return;

    const channel = supabase.channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medicines', filter: `user_id=eq.${user.id}` },
        () => { fetchMedicines(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dose_logs' },
        () => { fetchMedicines(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMedicines, user]);

  const addMedicine = async (med: Omit<Medicine, 'id' | 'logs' | 'created_at' | 'updated_at' | 'remaining_quantity'>) => {
    if (!user) return;
    const now = new Date().toISOString();
    
    const payload = {
      user_id: String(user.id),
      medicine_name: med.medicine_name,
      dosage: med.dosage,
      quantity: med.quantity,
      remaining_quantity: med.quantity, // starts full
      frequency: med.frequency,
      schedule_type: med.schedule_type,
      schedule_days: med.schedule_days,
      start_date: med.start_date,
      end_date: med.end_date,
      low_stock_threshold: med.low_stock_threshold,
      prescription_image: med.prescription_image,
      notes: med.notes
    };

    try {
      const { error } = await supabase.from('medicines').insert(payload);
      if (error) throw error;
      await fetchMedicines();
    } catch (err) {
      console.warn("Supabase insert failed, falling back to local storage.", err);
      const local = getLocalMedicines();
      const newMed: Medicine = {
        ...payload,
        id: uuidv4(),
        created_at: now,
        updated_at: now,
        logs: []
      };
      saveLocalMedicines([newMed, ...local]);
    }
  };

  const updateMedicine = async (id: string, med: Partial<Medicine>) => {
    if (!user) return;
    const target = medicines.find(m => m.id === id);
    if (!target) return;
    
    try {
      const payload: any = {};
      if (med.medicine_name !== undefined) payload.medicine_name = med.medicine_name;
      if (med.dosage !== undefined) payload.dosage = med.dosage;
      if (med.quantity !== undefined) payload.quantity = med.quantity;
      if (med.remaining_quantity !== undefined) payload.remaining_quantity = med.remaining_quantity;
      if (med.frequency !== undefined) payload.frequency = med.frequency;
      if (med.schedule_type !== undefined) payload.schedule_type = med.schedule_type;
      if (med.schedule_days !== undefined) payload.schedule_days = med.schedule_days;
      if (med.start_date !== undefined) payload.start_date = med.start_date;
      if (med.end_date !== undefined) payload.end_date = med.end_date;
      if (med.low_stock_threshold !== undefined) payload.low_stock_threshold = med.low_stock_threshold;
      if (med.prescription_image !== undefined) payload.prescription_image = med.prescription_image;
      if (med.notes !== undefined) payload.notes = med.notes;
      payload.updated_at = new Date().toISOString();

      const { error } = await supabase.from('medicines').update(payload).eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      await fetchMedicines();
    } catch (err) {
      console.warn("Supabase update failed, falling back to local storage.", err);
      const local = getLocalMedicines();
      const updatedLocal = local.map(m => m.id === id ? { ...m, ...med, updated_at: new Date().toISOString() } : m);
      saveLocalMedicines(updatedLocal);
    }
  };

  const removeMedicine = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('medicines').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      await fetchMedicines();
    } catch (err) {
      console.warn("Supabase delete failed, falling back to local storage.", err);
      const local = getLocalMedicines();
      saveLocalMedicines(local.filter(m => m.id !== id));
    }
  };

  const markTaken = async (id: string, timeSlot: string, status: 'taken' | 'missed', dateStr: string) => {
    if (!user) return;
    const target = medicines.find(m => m.id === id);
    if (!target) return;
    
    const dosageNum = parseFloat(target.dosage) || 1; 
    const tabletsTaken = status === 'taken' ? dosageNum : 0;
    const newStock = Math.max(0, target.remaining_quantity - tabletsTaken);

    try {
      const { error: logError } = await supabase.from('dose_logs').insert({
        medicine_id: id,
        date: dateStr,
        time_slot: timeSlot,
        status: status,
        tablets_taken: tabletsTaken
      });
      if (logError) throw logError;
      
      if (status === 'taken') {
        const { error: updateError } = await supabase.from('medicines').update({ remaining_quantity: newStock }).eq('id', id).eq('user_id', user.id);
        if (updateError) throw updateError;
      }
      await fetchMedicines();
    } catch (err) {
      console.warn("Supabase log failed, falling back to local storage.", err);
      const local = getLocalMedicines();
      const targetLocal = local.find(m => m.id === id);
      if (targetLocal) {
        const newLog = {
          id: uuidv4(),
          date: dateStr,
          timeSlot: timeSlot,
          status,
          tabletsTaken,
          timestamp: new Date().toISOString()
        };
        targetLocal.logs = [...(targetLocal.logs || []), newLog];
        if (status === 'taken') {
          targetLocal.remaining_quantity = Math.max(0, targetLocal.remaining_quantity - tabletsTaken);
        }
        saveLocalMedicines(local);
      }
    }
  };

  const removeDoseLog = async (id: string, logId: string) => {
    if (!user) return;
    const target = medicines.find(m => m.id === id);
    const log = target?.logs?.find(l => l.id === logId);
    if (!target || !log) return;
    
    try {
      const { error: logError } = await supabase.from('dose_logs').delete().eq('id', logId).eq('medicine_id', id);
      if (logError) throw logError;
      
      if (log.status === 'taken') {
        const newStock = target.remaining_quantity + log.tabletsTaken;
        const { error: updateError } = await supabase.from('medicines').update({ remaining_quantity: newStock }).eq('id', id).eq('user_id', user.id);
        if (updateError) throw updateError;
      }
      await fetchMedicines();
    } catch (err) {
      console.warn("Supabase log delete failed, falling back to local storage.", err);
      const local = getLocalMedicines();
      const targetLocal = local.find(m => m.id === id);
      if (targetLocal && targetLocal.logs) {
        const localLog = targetLocal.logs.find(l => l.id === logId);
        if (localLog && localLog.status === 'taken') {
          targetLocal.remaining_quantity += localLog.tabletsTaken;
        }
        targetLocal.logs = targetLocal.logs.filter(l => l.id !== logId);
        saveLocalMedicines(local);
      }
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
