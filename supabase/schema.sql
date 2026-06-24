-- Supabase Database Schema for Medicine Tracker
-- Run this in the Supabase SQL Editor to update your tables

-- Drop the old table if it exists (warning: this deletes old data)
DROP TABLE IF EXISTS dose_logs CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;

-- Create medicines table
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    remaining_quantity INTEGER NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'Morning, Afternoon, Night',
    schedule_type TEXT NOT NULL,
    schedule_days TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    low_stock_threshold INTEGER DEFAULT 10,
    prescription_image TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dose_logs table
CREATE TABLE dose_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('taken', 'missed')),
    tablets_taken NUMERIC NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own medicines" 
ON medicines FOR ALL USING (auth.uid() = user_id);

-- For dose logs, we check if the user owns the medicine
CREATE POLICY "Users can manage logs for their medicines" 
ON dose_logs FOR ALL USING (
    EXISTS (
        SELECT 1 FROM medicines 
        WHERE medicines.id = dose_logs.medicine_id 
        AND medicines.user_id = auth.uid()
    )
);
