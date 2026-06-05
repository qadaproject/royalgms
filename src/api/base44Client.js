import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId: appId || '',
  token: token || '',
  functionsVersion: functionsVersion || 'v1',
  serverUrl: appBaseUrl || '',
  requiresAuth: false,
});
