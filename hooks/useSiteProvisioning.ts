'use client';

import { useApp } from '@/context/AppContext';
import { createSite, SITE_PROVISION_STEPS } from '@/lib/createSite';
import { AppsScriptUserSettingError } from '@/lib/core/provisionHelpers';
import type { CreateSiteInput, SiteStarterModuleProgress } from '@/types';

/**
 * Runs the full site provisioning flow against the signed-in account,
 * streaming step progress into app state. Shared by the initial launch
 * (SiteStarter) and the retry path on the provisioning screen
 * (SiteStarterProgress), which re-runs with the stored launch input
 * after the user enables the Apps Script API.
 */
export function useSiteProvisioning() {
  const { state, dispatch } = useApp();
  const token = state.auth.accessToken;

  return async function provision(input: CreateSiteInput): Promise<void> {
    if (!token) return;

    const progress: SiteStarterModuleProgress[] = SITE_PROVISION_STEPS.map((s) => ({
      moduleType: s.id,
      moduleName: s.label,
      status:     'pending' as const,
    }));

    dispatch({ type: 'START_SITE_STARTER_PROVISIONING', payload: { progress, input } });

    try {
      const manifest = await createSite(token, input, (step, status, error, errorCode) => {
        const label = SITE_PROVISION_STEPS.find((s) => s.id === step)?.label ?? step;
        dispatch({
          type:    'UPDATE_SITE_STARTER_MODULE',
          payload: { moduleType: step, moduleName: label, status, error, errorCode },
        });
      });

      dispatch({ type: 'SET_SITE_MANIFEST', payload: manifest });
    } catch (err) {
      if (err instanceof AppsScriptUserSettingError) {
        // Stay on the provisioning screen — the inline callout there links to
        // the Google account setting and offers a retry.
      } else {
        dispatch({ type: 'SITE_MANIFEST_ERROR', payload: (err as Error).message });
      }
    }
  };
}
