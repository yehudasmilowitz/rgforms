import type { FormConfig } from '@/types';
import { provision } from './provision';
import { provisionGallery } from './galleryProvision';
import { provisionCalendar } from './calendarProvision';
import { provisionSiteConfig } from './siteConfigProvision';
import { provisionContentModule } from './contentProvision';
import { provisionModule } from './modules/provisionModule';
import { MODULE_REGISTRY } from './modules/registry';

export interface DuplicateModuleOptions {
  moduleType: string;
  originalName: string;
  newName: string;
  token: string;
  projectId: string;
  /** For forms: include formConfig */
  formConfig?: FormConfig;
}

type StepCallback = (stepId: string, status: 'running' | 'complete' | 'error', error?: string) => void;

const defaultFormConfig: FormConfig = {
  name: '',
  notifyEmail: '',
  fields: [
    { id: 'name', label: 'Name', type: 'text', required: true },
    { id: 'email', label: 'Email', type: 'email', required: true },
    { id: 'message', label: 'Message', type: 'textarea', required: false },
  ],
};

// Duplicate a module by provisioning a new one with the same type and a new name.
// This creates a brand new Sheet + Script + Deployment — it does NOT copy data.
export async function duplicateModule(
  options: DuplicateModuleOptions,
  onStepUpdate: StepCallback,
): Promise<{ deploymentUrl: string; sheetId: string; sheetUrl: string }> {
  const { moduleType, newName, token, projectId, formConfig } = options;

  switch (moduleType) {
    case 'gallery': {
      const result = await provisionGallery(token, newName, onStepUpdate, projectId);
      return { deploymentUrl: result.deploymentUrl, sheetId: result.sheetId, sheetUrl: result.sheetUrl };
    }

    case 'calendar': {
      const result = await provisionCalendar(token, newName, onStepUpdate, projectId);
      return { deploymentUrl: result.deploymentUrl, sheetId: result.sheetId, sheetUrl: result.sheetUrl };
    }

    case 'siteconfig': {
      const result = await provisionSiteConfig(token, newName, onStepUpdate, projectId);
      return { deploymentUrl: result.deploymentUrl, sheetId: result.sheetId, sheetUrl: result.sheetUrl };
    }

    case 'content': {
      const writeToken = crypto.randomUUID().replace(/-/g, '');
      const config = {
        name: newName,
        fields: [],
        hasSlug: true,
        hasPublished: true,
      };
      const result = await provisionContentModule(token, config, writeToken, onStepUpdate, projectId);
      return { deploymentUrl: result.deploymentUrl, sheetId: result.sheetId, sheetUrl: result.sheetUrl };
    }

    case 'form':
    default: {
      const def = MODULE_REGISTRY[moduleType];
      if (def) {
        const result = await provisionModule(def, token, newName, onStepUpdate, projectId);
        return { deploymentUrl: result.deploymentUrl, sheetId: result.sheetId, sheetUrl: result.sheetUrl };
      }
      const config: FormConfig = formConfig
        ? { ...formConfig, name: newName }
        : { ...defaultFormConfig, name: newName };
      const result = await provision(token, config, onStepUpdate, projectId);
      return { deploymentUrl: result.deploymentUrl, sheetId: result.sheetId, sheetUrl: result.sheetUrl };
    }
  }
}
