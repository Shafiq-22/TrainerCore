import type { Locale } from './config';

export type Dictionary = Record<string, string>;

const en: Dictionary = {
  'app.name': 'TrainerCore',
  'app.tagline': 'Run your personal training business',

  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.clients': 'Clients',
  'nav.plans': 'Workout Plans',
  'nav.schedule': 'Schedule',
  'nav.billing': 'Billing',
  'nav.checkins': 'Check-ins',
  'nav.settings': 'Settings',
  'nav.subscription': 'Subscription',
  'nav.signout': 'Sign out',

  // Common
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.create': 'Create',
  'common.search': 'Search',
  'common.loading': 'Loading…',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.continue': 'Continue',
  'common.skip': 'Skip',
  'common.finish': 'Finish',
  'common.confirm': 'Confirm',
  'common.actions': 'Actions',
  'common.status': 'Status',
  'common.none': 'None',
  'common.today': 'Today',
  'common.all': 'All',
  'common.optional': 'Optional',
  'common.required': 'Required',
  'common.saving': 'Saving…',

  // Auth
  'auth.login': 'Log in',
  'auth.signup': 'Sign up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.fullName': 'Full name',
  'auth.loginTitle': 'Welcome back',
  'auth.loginSubtitle': 'Log in to your TrainerCore account',
  'auth.signupTitle': 'Create your account',
  'auth.signupSubtitle': 'Start your 14-day free trial',
  'auth.noAccount': "Don't have an account?",
  'auth.hasAccount': 'Already have an account?',
  'auth.verifyTitle': 'Check your email',
  'auth.verifySubtitle': 'We sent you a confirmation link to verify your email address.',
  'auth.resend': 'Resend email',

  // Dashboard
  'dash.title': 'Dashboard',
  'dash.activeClients': 'Active clients',
  'dash.sessionsWeek': 'Sessions this week',
  'dash.revenueMonth': 'Revenue this month',
  'dash.pendingInvoices': 'Pending invoices',
  'dash.responseRate': 'Check-in response rate',
  'dash.revenue': 'Revenue',
  'dash.activity': 'Recent activity',
  'dash.attention': 'Needs attention',
  'dash.allGood': 'Everything looks good. No clients need attention right now.',

  // Clients
  'clients.title': 'Clients',
  'clients.new': 'New client',
  'clients.empty': 'No clients yet. Add your first client to get started.',
  'clients.overview': 'Overview',
  'clients.progress': 'Progress',
  'clients.plan': 'Workout Plan',
  'clients.sessions': 'Sessions',
  'clients.invoices': 'Invoices',
  'clients.goal': 'Goal',
  'clients.package': 'Package',
  'clients.medical': 'Medical notes',

  // Plans
  'plans.title': 'Workout Plans',
  'plans.new': 'New plan',
  'plans.templates': 'Templates',
  'plans.empty': 'No workout plans yet. Build your first plan.',

  // Schedule
  'schedule.title': 'Schedule',
  'schedule.newSession': 'New session',

  // Billing
  'billing.title': 'Billing',
  'billing.new': 'New invoice',
  'billing.empty': 'No invoices yet.',
  'billing.subtotal': 'Subtotal',
  'billing.vat': 'VAT (5%)',
  'billing.total': 'Total',

  // Check-ins
  'checkins.title': 'Check-ins',
  'checkins.energy': 'Energy',
  'checkins.sleep': 'Sleep',
  'checkins.nutrition': 'Nutrition',
  'checkins.stress': 'Stress',
  'checkins.weight': 'Weight (kg)',
  'checkins.notes': 'Anything you want to share?',
  'checkins.submit': 'Submit check-in',
  'checkins.thanks': 'Thank you!',
  'checkins.thanksBody': 'Your check-in has been recorded. Keep up the great work!',
  'checkins.invalid': 'This check-in link is invalid or has already been used.',
  'checkins.intro': 'Your weekly check-in helps your trainer support you better.',
  'checkins.rate': 'Rate from 1 (low) to 5 (high)',

  // Settings
  'settings.title': 'Settings',
  'settings.profile': 'Profile',
  'settings.business': 'Business',
  'settings.whatsapp': 'WhatsApp',
  'settings.templates': 'Templates',

  // Subscription
  'sub.title': 'Subscription',
  'sub.currentPlan': 'Current plan',
  'sub.usage': 'Usage',
  'sub.upgrade': 'Upgrade',
  'sub.manageBilling': 'Manage billing',
  'sub.limitReached': 'Client limit reached',
  'sub.limitBody':
    'You have reached the client limit for your plan. Upgrade to add more clients.',
};

export const dictionaries: Record<Locale, Dictionary> = { en };
