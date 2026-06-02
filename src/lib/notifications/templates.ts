export type TemplateKey = 'checkin' | 'session_reminder' | 'invoice_sent';
export type MessageTemplates = Record<TemplateKey, string>;

export const TEMPLATE_KEYS: TemplateKey[] = [
  'checkin',
  'session_reminder',
  'invoice_sent',
];

export const TEMPLATE_VARIABLES: Record<TemplateKey, string[]> = {
  checkin: ['client_name', 'trainer_name', 'link'],
  session_reminder: ['client_name', 'trainer_name', 'date', 'time'],
  invoice_sent: ['client_name', 'trainer_name', 'invoice_number', 'amount', 'link'],
};

/** Sensible defaults used until a trainer customises them. */
export const DEFAULT_TEMPLATES: MessageTemplates = {
  checkin:
    "Hi {{client_name}} 👋 It's time for your weekly check-in with {{trainer_name}}. It only takes a minute: {{link}}",
  session_reminder:
    'Reminder: you have a training session with {{trainer_name}} on {{date}} at {{time}}. See you there! 💪',
  invoice_sent:
    'Hi {{client_name}}, your invoice {{invoice_number}} for {{amount}} from {{trainer_name}} is ready. View & pay here: {{link}}',
};

export function renderTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? '');
}

export function getTemplate(templates: unknown, key: TemplateKey): string {
  const stored = (templates as Partial<MessageTemplates> | null | undefined)?.[key];
  return stored || DEFAULT_TEMPLATES[key];
}

export function normalizeTemplates(templates: unknown): MessageTemplates {
  const t = (templates ?? {}) as Partial<MessageTemplates>;
  const out = {} as MessageTemplates;
  for (const key of TEMPLATE_KEYS) {
    out[key] = t[key] || DEFAULT_TEMPLATES[key];
  }
  return out;
}
