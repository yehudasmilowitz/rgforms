import type {
  SiteStarterConfig,
  SiteStarterModuleProgress,
  SiteStarterResult,
  ProjectTemplate,
  ContentModuleConfig,
  ContentField,
} from '@/types';
import { provisionSiteConfig }    from './siteConfigProvision';
import { provisionGallery }       from './galleryProvision';
import { provisionContentModule } from './contentProvision';
import { provisionCalendar }      from './calendarProvision';
import { provision }              from './provision';
import { provisionModule as provisionRegistryModule } from './modules/provisionModule';
import { MODULE_REGISTRY }        from './modules/registry';
import { getOrCreateRegistry, saveProject } from './projectsRegistry';

// ─── Template definitions ─────────────────────────────────────────────────────

export const TEMPLATE_DEFINITIONS: Record<ProjectTemplate, Array<{ moduleType: string; nameSuffix: string }>> = {
  portfolio: [
    { moduleType: 'siteconfig', nameSuffix: 'Config' },
    { moduleType: 'gallery',    nameSuffix: 'Gallery' },
    { moduleType: 'content',    nameSuffix: 'Projects' },
    { moduleType: 'form',       nameSuffix: 'Contact Form' },
  ],
  restaurant: [
    { moduleType: 'siteconfig', nameSuffix: 'Config' },
    { moduleType: 'menu',       nameSuffix: 'Menu' },
    { moduleType: 'gallery',    nameSuffix: 'Photos' },
    { moduleType: 'calendar',   nameSuffix: 'Events' },
    { moduleType: 'form',       nameSuffix: 'Reservations' },
  ],
  saas: [
    { moduleType: 'siteconfig',  nameSuffix: 'Config' },
    { moduleType: 'testimonial', nameSuffix: 'Testimonials' },
    { moduleType: 'faq',         nameSuffix: 'FAQ' },
    { moduleType: 'newsletter',  nameSuffix: 'Waitlist' },
    { moduleType: 'form',        nameSuffix: 'Contact' },
  ],
  nonprofit: [
    { moduleType: 'siteconfig', nameSuffix: 'Config' },
    { moduleType: 'content',    nameSuffix: 'Blog' },
    { moduleType: 'calendar',   nameSuffix: 'Events' },
    { moduleType: 'gallery',    nameSuffix: 'Gallery' },
    { moduleType: 'form',       nameSuffix: 'Volunteer' },
  ],
  agency: [
    { moduleType: 'siteconfig', nameSuffix: 'Config' },
    { moduleType: 'content',    nameSuffix: 'Services' },
    { moduleType: 'content',    nameSuffix: 'Case Studies' },
    { moduleType: 'gallery',    nameSuffix: 'Work' },
    { moduleType: 'form',       nameSuffix: 'Inquiry' },
  ],
};

// ─── Initial progress state ───────────────────────────────────────────────────

export function getInitialProgress(config: SiteStarterConfig): SiteStarterModuleProgress[] {
  if (!config.template) return [];
  const defs = TEMPLATE_DEFINITIONS[config.template];
  return defs.map(({ moduleType, nameSuffix }) => ({
    moduleType,
    moduleName: `${config.siteName} ${nameSuffix}`,
    status: 'pending' as const,
  }));
}

// ─── Content config builder ───────────────────────────────────────────────────

function buildContentConfig(siteName: string, nameSuffix: string): ContentModuleConfig {
  const name = `${siteName} ${nameSuffix}`;

  if (nameSuffix === 'Projects' || nameSuffix === 'Blog') {
    const fields: ContentField[] = [
      { id: 'cf-1', label: 'Title',       key: 'title',       type: 'text',     required: true },
      { id: 'cf-2', label: 'Description', key: 'description', type: 'markdown', required: false },
      { id: 'cf-3', label: 'Tags',        key: 'tags',        type: 'tags',     required: false },
      { id: 'cf-4', label: 'Link',        key: 'link',        type: 'url',      required: false },
    ];
    return { name, fields, hasSlug: true, hasPublished: true };
  }

  if (nameSuffix === 'Services') {
    const fields: ContentField[] = [
      { id: 'cf-1', label: 'Title',       key: 'title',       type: 'text',     required: true },
      { id: 'cf-2', label: 'Description', key: 'description', type: 'markdown', required: false },
      { id: 'cf-3', label: 'Price',       key: 'price',       type: 'text',     required: false },
      { id: 'cf-4', label: 'Icon',        key: 'icon',        type: 'url',      required: false },
    ];
    return { name, fields, hasSlug: true, hasPublished: true };
  }

  if (nameSuffix === 'Case Studies') {
    const fields: ContentField[] = [
      { id: 'cf-1', label: 'Title',       key: 'title',       type: 'text',     required: true },
      { id: 'cf-2', label: 'Client',      key: 'client',      type: 'text',     required: false },
      { id: 'cf-3', label: 'Description', key: 'description', type: 'markdown', required: false },
      { id: 'cf-4', label: 'Results',     key: 'results',     type: 'markdown', required: false },
    ];
    return { name, fields, hasSlug: true, hasPublished: true };
  }

  // Generic fallback
  const fields: ContentField[] = [
    { id: 'cf-1', label: 'Title',       key: 'title',       type: 'text',     required: true },
    { id: 'cf-2', label: 'Description', key: 'description', type: 'markdown', required: false },
  ];
  return { name, fields, hasSlug: true, hasPublished: true };
}

// ─── Provision a single module ────────────────────────────────────────────────

async function provisionModule(
  token: string,
  moduleType: string,
  moduleName: string,
  nameSuffix: string,
  siteName: string,
  notifyEmail: string,
  projectId: string,
): Promise<{ sheetId: string; sheetUrl?: string; deploymentUrl: string }> {
  const noop = () => {};

  switch (moduleType) {
    case 'siteconfig': {
      const r = await provisionSiteConfig(token, moduleName, noop, projectId);
      return { sheetId: r.sheetId, sheetUrl: r.sheetUrl, deploymentUrl: r.deploymentUrl };
    }
    case 'gallery': {
      const r = await provisionGallery(token, moduleName, noop, projectId);
      return { sheetId: r.sheetId, sheetUrl: r.sheetUrl, deploymentUrl: r.deploymentUrl };
    }
    case 'content': {
      const writeToken = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      const config     = buildContentConfig(siteName, nameSuffix);
      const r          = await provisionContentModule(token, config, writeToken, noop, projectId);
      return { sheetId: r.sheetId, sheetUrl: r.sheetUrl, deploymentUrl: r.deploymentUrl };
    }
    case 'calendar': {
      const r = await provisionCalendar(token, moduleName, noop, projectId);
      return { sheetId: r.sheetId, sheetUrl: r.sheetUrl, deploymentUrl: r.deploymentUrl };
    }
    case 'form': {
      const formConfig = {
        name: moduleName,
        notifyEmail,
        fields: [
          { id: 'field-1', label: 'Name',    type: 'text'     as const, required: true },
          { id: 'field-2', label: 'Email',   type: 'email'    as const, required: true },
          { id: 'field-3', label: 'Message', type: 'textarea' as const, required: true },
        ],
        enableHoneypot: false,
      };
      const r = await provision(token, formConfig, noop, projectId);
      return { sheetId: r.sheetId, sheetUrl: r.sheetUrl, deploymentUrl: r.deploymentUrl };
    }
    default: {
      const def = MODULE_REGISTRY[moduleType];
      if (def) {
        const r = await provisionRegistryModule(def, token, moduleName, noop, projectId);
        return { sheetId: r.sheetId, sheetUrl: r.sheetUrl, deploymentUrl: r.deploymentUrl };
      }
      throw new Error(`Unknown module type: ${moduleType}`);
    }
  }
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

export async function runSiteStarter(
  token: string,
  config: SiteStarterConfig,
  onModuleUpdate: (
    update: Partial<SiteStarterModuleProgress> & { moduleType: string; moduleName: string }
  ) => void,
): Promise<SiteStarterResult> {
  if (!config.template) throw new Error('No template selected');

  const defs      = TEMPLATE_DEFINITIONS[config.template];
  const projectId = config.projectId;
  const createdAt = new Date().toISOString();

  // Run all modules in parallel
  const results = await Promise.allSettled(
    defs.map(async ({ moduleType, nameSuffix }) => {
      const moduleName = `${config.siteName} ${nameSuffix}`;

      // Signal start
      onModuleUpdate({ moduleType, moduleName, status: 'running' });

      try {
        const result = await provisionModule(
          token,
          moduleType,
          moduleName,
          nameSuffix,
          config.siteName,
          config.notifyEmail,
          config.projectId,
        );

        onModuleUpdate({
          moduleType,
          moduleName,
          status: 'complete',
          deploymentUrl: result.deploymentUrl,
          sheetId:  result.sheetId,
          sheetUrl: result.sheetUrl,
        });

        return { moduleType, moduleName, ...result };
      } catch (err) {
        onModuleUpdate({
          moduleType,
          moduleName,
          status: 'error',
          error: (err as Error).message,
        });
        throw err;
      }
    }),
  );

  // Build the module progress list for the result
  const modules: SiteStarterModuleProgress[] = defs.map(({ moduleType, nameSuffix }, i) => {
    const moduleName = `${config.siteName} ${nameSuffix}`;
    const settled    = results[i];
    if (settled.status === 'fulfilled') {
      return {
        moduleType,
        moduleName,
        status:        'complete',
        deploymentUrl: settled.value.deploymentUrl,
        sheetId:       settled.value.sheetId,
        sheetUrl:      settled.value.sheetUrl,
      };
    }
    return {
      moduleType,
      moduleName,
      status: 'error',
      error:  (settled.reason as Error).message,
    };
  });

  // Persist the project to the registry (best-effort)
  try {
    const registrySheetId = await getOrCreateRegistry(token);
    await saveProject(token, registrySheetId, {
      projectId,
      projectName: config.siteName,
      template:    config.template,
      createdAt,
      modules: modules.map((m) => ({
        moduleType:    m.moduleType,
        moduleName:    m.moduleName,
        sheetId:       m.sheetId ?? '',
        deploymentUrl: m.deploymentUrl,
      })),
    });
  } catch {
    // Registry save is best-effort — don't block the result
  }

  return {
    projectId,
    projectName: config.siteName,
    template:    config.template,
    modules,
  };
}
