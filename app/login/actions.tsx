// app/login/actions.tsx
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string | null
  const password = formData.get('password') as string | null
  const provider = formData.get('provider') as string | null
  if (provider) {
    // OAuth sign‑in
    const { error } = await supabase.auth.signInWithOAuth({ provider: provider as Provider })
    if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  } else {
    if (!email || !password)
      redirect(`/login?error=${encodeURIComponent('Email and password are required')}`)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/main', 'layout')
  redirect('/main/dashboard')
}