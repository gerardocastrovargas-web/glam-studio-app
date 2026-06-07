import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './supabaseMock'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const useMock = true // Cambiar a false cuando quieras conectar a Supabase real

export const supabase = useMock
  ? mockSupabase
  : createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: 'estetica' }
    })