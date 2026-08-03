import { db, SyncedCompany } from './dexieDB';

export const saveSyncedCompanySession = async (userProfile: {
  user_id: string;
  company_id: string;
  company_name?: string;
  email: string;
  role: string;
  full_name: string;
  currency?: string;
  plan?: string;
}) => {
  try {
    const offlineToken = `offline_${userProfile.user_id}_${Date.now()}`;
    const syncedEntry: SyncedCompany = {
      company_id: userProfile.company_id,
      company_name: userProfile.company_name || 'VENDIX Local',
      user_id: userProfile.user_id,
      email: userProfile.email.toLowerCase().trim(),
      role: userProfile.role || 'admin',
      full_name: userProfile.full_name || 'Administrador',
      currency: userProfile.currency || 'EUR',
      plan: userProfile.plan || 'Starter',
      offline_token: offlineToken,
      synced_at: Date.now()
    };

    await db.synced_companies.put(syncedEntry);
    console.log('✅ Sesión local sincronizada en DexieDB:', syncedEntry.company_id);
  } catch (err) {
    console.warn('⚠️ Error guardando empresa sincronizada en DexieDB:', err);
  }
};

export const getLatestSyncedCompany = async (): Promise<SyncedCompany | null> => {
  try {
    const companies = await db.synced_companies.orderBy('synced_at').reverse().toArray();
    return companies.length > 0 ? companies[0] : null;
  } catch (err) {
    console.warn('⚠️ Error consultando empresas sincronizadas en DexieDB:', err);
    return null;
  }
};

export const performOfflineCompanyLogin = async (email?: string): Promise<SyncedCompany | null> => {
  try {
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const match = await db.synced_companies.where('email').equals(cleanEmail).first();
      if (match) return match;
    }
    return await getLatestSyncedCompany();
  } catch (err) {
    console.warn('⚠️ Error en login offline DexieDB:', err);
    return null;
  }
};
