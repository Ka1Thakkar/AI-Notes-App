// app/signup/actions.tsx
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string | null
  const password = formData.get('password') as string | null
  const provider = formData.get('provider') as string | null

  if (provider) {
    const { error } = await supabase.auth.signInWithOAuth({ provider: provider as any })
    if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  } else {
    if (!email || !password)
      redirect(`/signup?error=${encodeURIComponent('Email and password are required')}`)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}