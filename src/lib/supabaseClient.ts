import { createClient, type SupabaseClient, type Session, type User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)

export async function getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

export async function getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}
