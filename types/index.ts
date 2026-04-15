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
  replyToFieldId?: string; // ID of the email-type field whose value becomes the reply-to address
  enableHoneypot?: boolean; // Add a hidden website field; submissions that fill it are silently discarded
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
}

export type AppScreen =
  | 'landing'
  | 'dashboard'
  | 'builder'
  | 'provisioning'
  | 'result'
  | 'content-builder'
  | 'content-provisioning'
  | 'content-result'
  | 'asset-builder'
  | 'asset-provisioning'
  | 'asset-result';

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
  key: string;          // auto-normalized from label: lowercase + underscores
  type: ContentFieldType;
  required: boolean;
}

export interface ContentModuleConfig {
  name: string;
  fields: ContentField[];
  hasSlug: boolean;     // auto-adds a 'slug' column
  hasPublished: boolean; // auto-adds a 'published' boolean column
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
  | { type: 'RESET_ASSET' };
