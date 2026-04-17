export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'tel' | 'select';
  required: boolean;
  options?: string[]; // for select fields only
}

export interface FormConfig {
  name: string;
  notifyEmail: string;
  fields: FormField[];
  ccEmails?: string[];
  bccEmails?: string[];
  emailSubject?: string;
  senderName?: string;
  replyToFieldId?: string;
  enableHoneypot?: boolean;
}

export interface ProvisioningResult {
  sheetId: string;
  sheetUrl: string;
  scriptId: string;
  scriptUrl: string;
  deploymentUrl: string;
}

export type StepStatus = 'pending' | 'running' | 'complete' | 'error';

export interface ProvisioningStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
  error?: string;
}

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

export interface AuthState {
  user: GoogleUser | null;
  accessToken: string | null;
}

export interface FormSummary {
  sheetId: string;
  sheetUrl: string;
  formName: string;
  createdAt: string;
  scriptId?: string;
  scriptUrl?: string;
  deploymentUrl?: string;
  fields?: FormField[];
  enableHoneypot?: boolean;
  projectId: string;
}

export type AppScreen =
  | 'landing'
  // Project layer — shown after sign-in before the dashboard
  | 'project-select'
  | 'project-provisioning'
  | 'dashboard'
  | 'builder'
  | 'provisioning'
  | 'result'
  | 'content-builder'
  | 'content-provisioning'
  | 'content-result'
  | 'asset-builder'
  | 'asset-provisioning'
  | 'asset-result'
  | 'siteconfig-builder'
  | 'siteconfig-provisioning'
  | 'siteconfig-result'
  | 'calendar-builder'
  | 'calendar-provisioning'
  | 'calendar-result'
  | 'gallery-builder'
  | 'gallery-provisioning'
  | 'gallery-result'
  // Generic module screens (replaces per-module screens)
  | 'module-builder'
  | 'module-provisioning'
  | 'module-result'
  // Site Starter / Projects screens
  | 'site-starter'
  | 'site-starter-provisioning'
  | 'site-kit';

// ─── Calendar Module Types ────────────────────────────────────────────────────

export interface CalendarResult {
  sheetId: string;
  sheetUrl: string;
  scriptId: string;
  scriptUrl: string;
  deploymentUrl: string;
}

export interface CalendarModuleSummary {
  sheetId: string;
  sheetUrl: string;
  moduleName: string;
  createdAt: string;
  scriptId?: string;
  scriptUrl?: string;
  deploymentUrl?: string;
  projectId: string;
}

// ─── Gallery Module Types ─────────────────────────────────────────────────────

export interface GalleryResult {
  sheetId: string;
  sheetUrl: string;
  scriptId: string;
  scriptUrl: string;
  deploymentUrl: string;
}

export interface GalleryModuleSummary {
  sheetId: string;
  sheetUrl: string;
  moduleName: string;
  createdAt: string;
  scriptId?: string;
  scriptUrl?: string;
  deploymentUrl?: string;
  projectId: string;
}

// ─── Site Config Module Types ─────────────────────────────────────────────────

export interface SiteConfigResult {
  sheetId: string;
  sheetUrl: string;
  scriptId: string;
  scriptUrl: string;
  deploymentUrl: string;
}

export interface SiteConfigModuleSummary {
  sheetId: string;
  sheetUrl: string;
  moduleName: string;
  createdAt: string;
  scriptId?: string;
  scriptUrl?: string;
  deploymentUrl?: string;
  projectId: string;
}

// ─── Asset Module Types ───────────────────────────────────────────────────────

export interface AssetModuleResult {
  sheetId: string;
  sheetUrl: string;
  scriptId: string;
  scriptUrl: string;
  folderId: string;
  folderUrl: string;
  deploymentUrl: string;
}

export interface AssetModuleSummary {
  sheetId: string;
  sheetUrl: string;
  moduleName: string;
  createdAt: string;
  folderId: string;
  folderUrl: string;
  scriptId?: string;
  scriptUrl?: string;
  deploymentUrl?: string;
  projectId: string;
}

export interface AssetFile {
  id: string;
  name: string;
  mimeType: string;
  isImage: boolean;
  size: number;
  url: string;
  driveUrl: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Content Module Types ────────────────────────────────────────────────────

export type ContentFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'tags'
  | 'markdown'
  | 'image_url'
  | 'url';

export interface ContentField {
  id: string;
  label: string;
  key: string;
  type: ContentFieldType;
  required: boolean;
}

export interface ContentModuleConfig {
  name: string;
  fields: ContentField[];
  hasSlug: boolean;
  hasPublished: boolean;
}

export interface ContentModuleResult {
  sheetId: string;
  sheetUrl: string;
  scriptId: string;
  scriptUrl: string;
  deploymentUrl: string;
  writeToken: string;
}

export interface ContentModuleSummary {
  sheetId: string;
  sheetUrl: string;
  moduleName: string;
  createdAt: string;
  scriptId?: string;
  scriptUrl?: string;
  deploymentUrl?: string;
  fields?: ContentField[];
  hasSlug: boolean;
  hasPublished: boolean;
  writeToken?: string;
  projectId: string;
}

// ─── Generic Module Types ─────────────────────────────────────────────────────

/** Generic result for any simple module provisioned via runProvisionPipeline */
export interface ModuleResult {
  sheetId: string;
  sheetUrl: string;
  scriptId: string;
  scriptUrl: string;
  deploymentUrl: string;
}

/** Generic summary for any simple module returned by listAllResources */
export interface ModuleSummary {
  sheetId: string;
  sheetUrl: string;
  moduleName: string;
  createdAt: string;
  moduleType: string;
  scriptId?: string;
  scriptUrl?: string;
  deploymentUrl?: string;
  projectId: string;
}

// Backward-compatible aliases — existing result panels still import these
export type TestimonialResult = ModuleResult;
export type FaqResult = ModuleResult;
export type MenuResult = ModuleResult;
export type NewsletterResult = ModuleResult;
export type AnnouncementResult = ModuleResult;
export type RedirectsResult = ModuleResult;

// ─── Project / Site Starter Types ────────────────────────────────────────────

/** Lightweight summary for the project-select screen — one row per Drive sheet with moduleType=project */
export interface ProjectSummary {
  sheetId: string;
  sheetUrl: string;
  projectName: string;
  createdAt: string;
  scriptId?: string;
  scriptUrl?: string;
  deploymentUrl?: string;
}

export type ProjectTemplate = 'portfolio' | 'restaurant' | 'saas' | 'nonprofit' | 'agency';

export interface ProjectModuleEntry {
  moduleType: string;
  moduleName: string;
  sheetId: string;
  deploymentUrl?: string;
  // endpoint health tracking
  authorized?: boolean;
  lastChecked?: string;
  healthMs?: number;
}

export interface Project {
  projectId: string;
  projectName: string;
  template: ProjectTemplate;
  createdAt: string;
  modules: ProjectModuleEntry[];
}

export interface SiteStarterConfig {
  template: ProjectTemplate | null;
  siteName: string;
  notifyEmail: string;
  projectId: string;
}

export interface SiteStarterModuleProgress {
  moduleType: string;
  moduleName: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  deploymentUrl?: string;
  sheetId?: string;
  sheetUrl?: string;
  error?: string;
}

export interface SiteStarterResult {
  projectId: string;
  projectName: string;
  template: ProjectTemplate;
  modules: SiteStarterModuleProgress[];
}

// ─── Developer UX Types ───────────────────────────────────────────────────────

export interface HealthCheckResult {
  sheetId: string;
  deploymentUrl: string;
  status: 'ok' | 'error' | 'unauthorized' | 'checking';
  latencyMs?: number;
  checkedAt: string;
  error?: string;
}

// ─── App State ───────────────────────────────────────────────────────────────

export interface AppState {
  screen: AppScreen;
  auth: AuthState;
  formConfig: FormConfig;
  steps: ProvisioningStep[];
  result: ProvisioningResult | null;
  provisionError: string | null;
  appsScriptApiDisabled: boolean;
  builderInitialStep: 1 | 2 | 3;
  // Content module state
  contentModuleConfig: ContentModuleConfig;
  contentResult: ContentModuleResult | null;
  contentProvisionError: string | null;
  // Asset module state
  assetBuilderName: string;
  assetResult: AssetModuleResult | null;
  assetProvisionError: string | null;
  // Site Config module state
  siteConfigBuilderName: string;
  siteConfigResult: SiteConfigResult | null;
  siteConfigProvisionError: string | null;
  // Calendar module state
  calendarBuilderName: string;
  calendarResult: CalendarResult | null;
  calendarProvisionError: string | null;
  // Gallery module state
  galleryBuilderName: string;
  galleryResult: GalleryResult | null;
  galleryProvisionError: string | null;
  /** Generic module state keyed by module type (e.g. 'testimonial', 'faq') */
  modules: Record<string, { builderName: string; result: ModuleResult | null; provisionError: string | null }>;
  /** The module type currently being shown in builder/provisioning/result screens */
  activeModuleType: string | null;
  // Site Starter state
  siteStarterConfig: SiteStarterConfig;
  siteStarterProgress: SiteStarterModuleProgress[];
  siteStarterResult: SiteStarterResult | null;
  siteStarterError: string | null;
  // Project state
  selectedProject: ProjectSummary | null;
  projectCreateName: string;
  projectProvisionError: string | null;
}

export type AppAction =
  | { type: 'SIGN_IN'; payload: { user: GoogleUser; accessToken: string } }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_FORM_CONFIG'; payload: Partial<FormConfig> }
  | { type: 'GO_TO_BUILDER' }
  | { type: 'START_PROVISIONING' }
  | { type: 'UPDATE_STEP'; payload: { id: string; status: StepStatus; error?: string } }
  | { type: 'SET_RESULT'; payload: ProvisioningResult }
  | { type: 'PROVISION_ERROR'; payload: string }
  | { type: 'PROVISION_FAILED_API_DISABLED' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' }
  // Content module actions
  | { type: 'GO_TO_CONTENT_BUILDER' }
  | { type: 'SET_CONTENT_CONFIG'; payload: Partial<ContentModuleConfig> }
  | { type: 'START_CONTENT_PROVISIONING' }
  | { type: 'SET_CONTENT_RESULT'; payload: ContentModuleResult }
  | { type: 'CONTENT_PROVISION_ERROR'; payload: string }
  | { type: 'RESET_CONTENT' }
  // Asset module actions
  | { type: 'GO_TO_ASSET_BUILDER' }
  | { type: 'SET_ASSET_BUILDER_NAME'; payload: string }
  | { type: 'START_ASSET_PROVISIONING' }
  | { type: 'SET_ASSET_RESULT'; payload: AssetModuleResult }
  | { type: 'ASSET_PROVISION_ERROR'; payload: string }
  | { type: 'RESET_ASSET' }
  // Site Config module actions
  | { type: 'GO_TO_SITECONFIG_BUILDER' }
  | { type: 'SET_SITECONFIG_BUILDER_NAME'; payload: string }
  | { type: 'START_SITECONFIG_PROVISIONING' }
  | { type: 'SET_SITECONFIG_RESULT'; payload: SiteConfigResult }
  | { type: 'SITECONFIG_PROVISION_ERROR'; payload: string }
  | { type: 'RESET_SITECONFIG' }
  // Calendar module actions
  | { type: 'GO_TO_CALENDAR_BUILDER' }
  | { type: 'SET_CALENDAR_BUILDER_NAME'; payload: string }
  | { type: 'START_CALENDAR_PROVISIONING' }
  | { type: 'SET_CALENDAR_RESULT'; payload: CalendarResult }
  | { type: 'CALENDAR_PROVISION_ERROR'; payload: string }
  | { type: 'RESET_CALENDAR' }
  // Gallery module actions
  | { type: 'GO_TO_GALLERY_BUILDER' }
  | { type: 'SET_GALLERY_BUILDER_NAME'; payload: string }
  | { type: 'START_GALLERY_PROVISIONING' }
  | { type: 'SET_GALLERY_RESULT'; payload: GalleryResult }
  | { type: 'GALLERY_PROVISION_ERROR'; payload: string }
  | { type: 'RESET_GALLERY' }
  // Generic module actions
  | { type: 'GO_TO_MODULE_BUILDER'; moduleType: string }
  | { type: 'SET_MODULE_BUILDER_NAME'; moduleType: string; name: string }
  | { type: 'START_MODULE_PROVISIONING'; moduleType: string }
  | { type: 'SET_MODULE_RESULT'; moduleType: string; result: ModuleResult }
  | { type: 'MODULE_PROVISION_ERROR'; moduleType: string; error: string }
  | { type: 'RESET_MODULE'; moduleType: string }
  // Site Starter actions
  | { type: 'GO_TO_SITE_STARTER' }
  | { type: 'SET_SITE_STARTER_CONFIG'; payload: Partial<SiteStarterConfig> }
  | { type: 'START_SITE_STARTER_PROVISIONING'; payload: SiteStarterModuleProgress[] }
  | { type: 'UPDATE_SITE_STARTER_MODULE'; payload: Partial<SiteStarterModuleProgress> & { moduleType: string; moduleName: string } }
  | { type: 'SET_SITE_STARTER_RESULT'; payload: SiteStarterResult }
  | { type: 'SITE_STARTER_ERROR'; payload: string }
  | { type: 'RESET_SITE_STARTER' }
  // Project actions
  | { type: 'SELECT_PROJECT'; payload: ProjectSummary }
  | { type: 'BACK_TO_PROJECTS' }
  | { type: 'SET_PROJECT_CREATE_NAME'; payload: string }
  | { type: 'START_PROJECT_PROVISIONING' }
  | { type: 'SET_PROJECT_RESULT'; payload: ProjectSummary }
  | { type: 'PROJECT_PROVISION_ERROR'; payload: string };
