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

import commonPt from './pt/common.json';
import authPt from './pt/auth.json';
import dashboardPt from './pt/dashboard.json';
import productsPt from './pt/products.json';
import customersPt from './pt/customers.json';
import inventoryPt from './pt/inventory.json';
import cashPt from './pt/cash.json';
import ticketsPt from './pt/tickets.json';
import settingsPt from './pt/settings.json';
import subscriptionsPt from './pt/subscriptions.json';
import helpPt from './pt/help.json';
import errorsPt from './pt/errors.json';
import validationPt from './pt/validation.json';
import notificationsPt from './pt/notifications.json';
import cloudPt from './pt/cloud.json';
import aiPt from './pt/ai.json';
import reportsPt from './pt/reports.json';
import emailsPt from './pt/emails.json';

export type LanguageCode = 'es' | 'en' | 'pt';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

const combineModules = (...modules: Record<string, any>[]) => {
  return modules.reduce((acc, mod) => ({ ...acc, ...mod }), {});
};

const createNestedNamespace = (modules: Record<string, Record<string, any>>) => {
  const merged: Record<string, any> = {};
  for (const [namespace, dict] of Object.entries(modules)) {
    for (const [key, val] of Object.entries(dict)) {
      merged[key] = val;
      merged[`${namespace}.${key}`] = val;
    }
  }
  return merged;
};

export const TRANSLATIONS: Record<LanguageCode, Record<string, any>> = {
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
  pt: createNestedNamespace({
    common: commonPt,
    auth: authPt,
    dashboard: dashboardPt,
    products: productsPt,
    customers: customersPt,
    inventory: inventoryPt,
    cash: cashPt,
    tickets: ticketsPt,
    settings: settingsPt,
    subscriptions: subscriptionsPt,
    help: helpPt,
    errors: errorsPt,
    validation: validationPt,
    notifications: notificationsPt,
    cloud: cloudPt,
    ai: aiPt,
    reports: reportsPt,
    emails: emailsPt,
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
