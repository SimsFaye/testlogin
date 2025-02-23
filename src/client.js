import { createClient } from '@supabase/supabase-js'  

const SUPABASE_KEY = 'SUPABASE_CLIENT_API_KEY'

const SUPABASE_URL = "https://tatdwkwtalnwafiggdrt.supabase.co"
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function loginWithGoogle() {
  supabase.auth.signInWithOAuth({
    provider: 'google',
  })
}

async function signOut() {
    const { error } = await supabase.auth.signOut()
  }
