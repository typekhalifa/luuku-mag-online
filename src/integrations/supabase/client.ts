// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nzdtjhnwkrsyerghdppm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZHRqaG53a3JzeWVyZ2hkcHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxOTg1MjUsImV4cCI6MjA2MDc3NDUyNX0.JC-mU_B_kQvi7Pm0zZgbE4OjE5utbm2ObFHRG1axY1M";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);