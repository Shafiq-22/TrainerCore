'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAppUrl } from '@/lib/env';
import { ok, fail, type ActionResult } from '@/types';

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) return fail(error.message, 'invalid_credentials');
  return ok();
}

export async function signupAction(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName },
      emailRedirectTo: `${getAppUrl()}/auth/callback`,
    },
  });
  if (error) return fail(error.message);
  return ok();
}

export async function resendVerificationAction(email: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${getAppUrl()}/auth/callback` },
  });
  if (error) return fail(error.message);
  return ok();
}

export async function requestPasswordResetAction(email: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/auth/callback?next=/auth/reset`,
  });
  if (error) return fail(error.message);
  return ok();
}

export async function updatePasswordAction(password: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return fail(error.message);
  return ok();
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}
