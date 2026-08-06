import commonEs from './es/common.json';
import authEs from './es/auth.json';
import dashboardEs from './es/dashboard.json';
import productsEs from './es/products.json';
import customersEs from './es/customers.json';
import inventoryEs from './es/inventory.json';
import cashEs from './es/cash.json';
import ticketsEs from './es/tickets.json';
import settingsEs from './es/settings.json';
import subscriptionsEs from './es/subscriptions.json';
import helpEs from './es/help.json';
import errorsEs from './es/errors.json';
import validationEs from './es/validation.json';
import notificationsEs from './es/notifications.json';
import cloudEs from './es/cloud.json';
import aiEs from './es/ai.json';
import reportsEs from './es/reports.json';
import emailsEs from './es/emails.json';

import commonEn from './en/common.json';
import authEn from './en/auth.json';
import dashboardEn from './en/dashboard.json';
import productsEn from './en/products.json';
import customersEn from './en/customers.json';
import inventoryEn from './en/inventory.json';
import cashEn from './en/cash.json';
import ticketsEn from './en/tickets.json';
import settingsEn from './en/settings.json';
import subscriptionsEn from './en/subscriptions.json';
import helpEn from './en/help.json';
import errorsEn from './en/errors.json';
import validationEn from './en/validation.json';
import notificationsEn from './en/notifications.json';
import cloudEn from './en/cloud.json';
import aiEn from './en/ai.json';
import reportsEn from './en/reports.json';
import emailsEn from './en/emails.json';

export type LanguageCode = 'es' | 'en';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  name?: string;
  nativeName?: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'es', label: 'Español', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', name: 'English', nativeName: 'English', flag: '🇬🇧' },
];

function createNestedNamespace(nsObj: Record<string, any>): Record<string, string> {
  const result: Record<string, string> = {};
  function traverse(current: any, prefix: string) {
    if (!current || typeof current !== 'object') return;
    Object.entries(current).forEach(([k, v]) => {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'string') {
        result[fullKey] = v;
      } else if (typeof v === 'object' && v !== null) {
        traverse(v, fullKey);
      }
    });
  }
  Object.entries(nsObj).forEach(([nsName, content]) => {
    traverse(content, nsName);
  });
  return result;
}

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  es: createNestedNamespace({
    common: commonEs,
    auth: authEs,
    dashboard: dashboardEs,
    products: productsEs,
    customers: customersEs,
    inventory: inventoryEs,
    cash: cashEs,
    tickets: ticketsEs,
    settings: settingsEs,
    subscriptions: subscriptionsEs,
    help: helpEs,
    errors: errorsEs,
    validation: validationEs,
    notifications: notificationsEs,
    cloud: cloudEs,
    ai: aiEs,
    reports: reportsEs,
    emails: emailsEs,
  }),
  en: createNestedNamespace({
    common: commonEn,
    auth: authEn,
    dashboard: dashboardEn,
    products: productsEn,
    customers: customersEn,
    inventory: inventoryEn,
    cash: cashEn,
    tickets: ticketsEn,
    settings: settingsEn,
    subscriptions: subscriptionsEn,
    help: helpEn,
    errors: errorsEn,
    validation: validationEn,
    notifications: notificationsEn,
    cloud: cloudEn,
    ai: aiEn,
    reports: reportsEn,
    emails: emailsEn,
  }),
};

export function resolveTranslation(
  lang: LanguageCode,
  key: string,
  params?: Record<string, string | number>
): string {
  const activeDict = TRANSLATIONS[lang] || TRANSLATIONS.es;
  const fallbackDict = TRANSLATIONS.es;
  let text = activeDict[key] || fallbackDict[key] || key;

  if (params && typeof text === 'string') {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(value));
      text = text.replace(new RegExp(`{\\s*${paramKey}\\s*}`, 'g'), String(value));
    });
  }

  return text;
}
