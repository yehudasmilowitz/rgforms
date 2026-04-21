// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

export interface AuthState {
  user: GoogleUser | null;
  accessToken: string | null;
}

// ─── Screens ──────────────────────────────────────────────────────────────────

export type AppScreen =
  | 'landing'
  | 'site-select'
  | 'site-starter'
  | 'site-starter-provisioning'
  | 'site-kit';

// ─── Form fields (shared by SiteTabFormConfig) ────────────────────────────────

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'tel' | 'select';
  required: boolean;
  options?: string[];
}

// ─── Site Manifest (v5 one-Sheet architecture) ────────────────────────────────

export interface SiteTabFormConfig {
  fields: FormField[];
  ccEmails?: string[];
  bccEmails?: string[];
  emailSubject?: string;
  senderName?: string;
  replyToField?: string;
  enableHoneypot?: boolean;
}

export interface SiteTab {
  name:             string;
  label:            string;
  type:             'key_value' | 'rows' | 'form' | 'asset';
  moduleType:       string;
  nameSuffix:       string;
  drive_folder_id?: string;
  formConfig?:      SiteTabFormConfig;
}

export interface SiteManifest {
  project_slug:          string;
  site_name:             string;
  created_at:            string;
  google_account:        string;
  script_url:            string;
  sheet_id:              string;
  sheet_url:             string;
  drive_root_folder_id:  string;
  drive_root_folder_url: string;
  notification_email:    string;
  tabs:                  SiteTab[];
}

// ─── Site Starter ─────────────────────────────────────────────────────────────

export type ProjectTemplate = 'portfolio' | 'restaurant' | 'saas' | 'nonprofit' | 'agency';

export interface SiteStarterConfig {
  template: ProjectTemplate | null;
  customModules?: Array<{ moduleType: string; nameSuffix: string }>;
  siteName: string;
  notifyEmail: string;
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

// ─── App State ───────────────────────────────────────────────────────────────

export interface AppState {
  screen: AppScreen;
  auth: AuthState;
  siteStarterConfig: SiteStarterConfig;
  siteStarterProgress: SiteStarterModuleProgress[];
  siteStarterError: string | null;
  siteManifest: SiteManifest | null;
  siteManifestError: string | null;
}

export type AppAction =
  | { type: 'SIGN_IN'; payload: { user: GoogleUser; accessToken: string } }
  | { type: 'SIGN_OUT' }
  | { type: 'GO_TO_SITE_STARTER' }
  | { type: 'SET_SITE_STARTER_CONFIG'; payload: Partial<SiteStarterConfig> }
  | { type: 'START_SITE_STARTER_PROVISIONING'; payload: SiteStarterModuleProgress[] }
  | { type: 'UPDATE_SITE_STARTER_MODULE'; payload: Partial<SiteStarterModuleProgress> & { moduleType: string; moduleName: string } }
  | { type: 'SITE_STARTER_ERROR'; payload: string }
  | { type: 'RESET_SITE_STARTER' }
  | { type: 'SET_SITE_MANIFEST'; payload: SiteManifest }
  | { type: 'SITE_MANIFEST_ERROR'; payload: string }
  | { type: 'OPEN_SITE'; payload: SiteManifest }
  | { type: 'UPDATE_SITE_MANIFEST'; payload: SiteManifest };
