'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/get-trainer';
import { normalizeTemplates, type MessageTemplates } from '@/lib/notifications/templates';
import { ok, fail, type ActionResult } from '@/types';
import type { Json } from '@/lib/supabase/database.types';

export async function updateProfileAction(input: {
  fullName: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  locale: string;
}): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  const supabase = createClient();
  const { error } = await supabase
    .from('trainers')
    .update({
      full_name: input.fullName || null,
      phone: input.phone || null,
      bio: input.bio || null,
      avatar_url: input.avatarUrl || null,
      locale: input.locale === 'ar' ? 'ar' : 'en',
    })
    .eq('id', user.id);
  if (error) return fail(error.message);
  revalidatePath('/settings/profile');
  return ok();
}

export async function updateBusinessAction(input: {
  businessName: string;
  vatNumber: string;
  vatRegistered: boolean;
  address: string;
}): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  const supabase = createClient();
  const { error } = await supabase
    .from('trainers')
    .update({
      business_name: input.businessName || null,
      vat_number: input.vatNumber || null,
      vat_registered: input.vatRegistered,
      address: input.address || null,
    })
    .eq('id', user.id);
  if (error) return fail(error.message);
  revalidatePath('/settings/business');
  return ok();
}

export async function updateWhatsappAction(input: {
  whatsappEnabled: boolean;
}): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  const supabase = createClient();
  const { error } = await supabase
    .from('trainers')
    .update({ whatsapp_enabled: input.whatsappEnabled })
    .eq('id', user.id);
  if (error) return fail(error.message);
  revalidatePath('/settings/whatsapp');
  return ok();
}

export async function updateTemplatesAction(
  templates: MessageTemplates,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return fail('Not authenticated');
  const supabase = createClient();
  const normalized = normalizeTemplates(templates);
  const { error } = await supabase
    .from('trainers')
    .update({ message_templates: normalized as unknown as Json })
    .eq('id', user.id);
  if (error) return fail(error.message);
  revalidatePath('/settings/templates');
  return ok();
}
