import type { Locale } from '@/lib/i18n/config';

export type TemplateKey = 'checkin' | 'session_reminder' | 'invoice_sent';
export type MessageTemplates = Record<TemplateKey, Record<Locale, string>>;

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

/** Sensible bilingual defaults used until a trainer customises them. */
export const DEFAULT_TEMPLATES: MessageTemplates = {
  checkin: {
    en: "Hi {{client_name}} 👋 It's time for your weekly check-in with {{trainer_name}}. It only takes a minute: {{link}}",
    ar: 'مرحبًا {{client_name}} 👋 حان وقت متابعتك الأسبوعية مع {{trainer_name}}. تستغرق دقيقة واحدة فقط: {{link}}',
  },
  session_reminder: {
    en: 'Reminder: you have a training session with {{trainer_name}} on {{date}} at {{time}}. See you there! 💪',
    ar: 'تذكير: لديك جلسة تدريب مع {{trainer_name}} يوم {{date}} الساعة {{time}}. نراك هناك! 💪',
  },
  invoice_sent: {
    en: 'Hi {{client_name}}, your invoice {{invoice_number}} for {{amount}} from {{trainer_name}} is ready. View & pay here: {{link}}',
    ar: 'مرحبًا {{client_name}}، فاتورتك {{invoice_number}} بقيمة {{amount}} من {{trainer_name}} جاهزة. اعرضها وادفع هنا: {{link}}',
  },
};

export function renderTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? '');
}

export function getTemplate(
  templates: unknown,
  key: TemplateKey,
  locale: Locale,
): string {
  const stored = (templates as Partial<MessageTemplates> | null | undefined)?.[key]?.[
    locale
  ];
  return stored || DEFAULT_TEMPLATES[key][locale] || DEFAULT_TEMPLATES[key].en;
}

export function normalizeTemplates(templates: unknown): MessageTemplates {
  const t = (templates ?? {}) as Partial<MessageTemplates>;
  const out = {} as MessageTemplates;
  for (const key of TEMPLATE_KEYS) {
    out[key] = {
      en: t[key]?.en || DEFAULT_TEMPLATES[key].en,
      ar: t[key]?.ar || DEFAULT_TEMPLATES[key].ar,
    };
  }
  return out;
}
