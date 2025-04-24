// app/signup/actions.tsx
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // pull first name, last name, age, email & password
  const firstName = formData.get('firstName') as string
  const lastName  = formData.get('lastName')  as string
  const email     = formData.get('email')     as string
  const password  = formData.get('password')  as string

  // sign up with user_metadata including age
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name:  lastName,
      },
    }
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}