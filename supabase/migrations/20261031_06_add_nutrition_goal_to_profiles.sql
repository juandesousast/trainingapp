-- Migration: Add nutrition_goal to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nutrition_goal TEXT DEFAULT 'fat_loss';
