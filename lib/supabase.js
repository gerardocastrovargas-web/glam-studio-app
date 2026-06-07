import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './supabaseMock'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const useMock = !supabaseUrl || supabaseUrl.includes('your-project-ref')

export const supabase = useMock
  ? mockSupabase
  : createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: 'estetica' }
    })