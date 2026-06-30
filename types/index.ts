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

// ─── Spam protection (captcha) ────────────────────────────────────────────────
// Project-level. Verification runs server-side inside Apps Script via
// UrlFetchApp, so it depends on the `script.external_request` scope being
// granted at provision time (see `capabilities.captcha`). The secret lives in
// the owner's own private Sheet manifest; only the public siteKey reaches the
// browser. `enabled` is a live runtime switch — flip it any time from the UI
// (it just rewrites the manifest); the granted scope is what can't change later.

export type CaptchaProvider = 'turnstile';

export interface CaptchaConfig {
  provider: CaptchaProvider;
  enabled:  boolean;   // runtime on/off — validation is skipped entirely when false
  siteKey:  string;    // public; safe to embed in the form HTML
  secret:   string;    // private; stays in the owner's Sheet, never sent to the browser
}

// Which sensitive Apps Script scopes were granted when the project was
// provisioned. These gate whether the generated script *can* send mail / make
// external requests at all; the per-feature runtime switches live elsewhere
// (notification_email for email, captcha.enabled for spam protection).
export interface SiteCapabilities {
  email:   boolean;   // script.send_mail
  captcha: boolean;   // script.external_request
}

export interface SiteManifest {
  project_slug:          string;
  site_name:             string;
  created_at:            string;
  google_account:        string;
  script_id?:            string;
  script_url:            string;
  sheet_id:              string;
  sheet_url:             string;
  drive_root_folder_id:  string;
  drive_root_folder_url: string;
  notification_email:    string;
  capabilities?:         SiteCapabilities;
  captcha?:              CaptchaConfig;
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
  errorCode?: string;
}

export interface CreateSiteInput {
  siteName:              string;
  notifyEmail:           string;
  googleAccount:         string;
  formLabel:             string;
  formConfig:            SiteTabFormConfig;
  notificationsEnabled:  boolean;
  // Spam protection — opt-in at provision time. When true, the
  // script.external_request scope is granted and the Turnstile verify code is
  // included. Validation itself stays OFF until captcha.enabled is flipped on
  // (after the consumer adds the widget), so provisioning never breaks a form.
  captchaEnabled:        boolean;
  captchaSiteKey:        string;
  captchaSecret:         string;
}

// ─── App State ───────────────────────────────────────────────────────────────

export interface AppState {
  screen: AppScreen;
  auth: AuthState;
  siteStarterConfig: SiteStarterConfig;
  siteStarterProgress: SiteStarterModuleProgress[];
  siteStarterLaunchInput: CreateSiteInput | null;
  siteStarterError: string | null;
  siteManifest: SiteManifest | null;
  siteManifestError: string | null;
}

export type AppAction =
  | { type: 'SIGN_IN'; payload: { user: GoogleUser; accessToken: string } }
  | { type: 'SIGN_OUT' }
  | { type: 'GO_TO_SITE_STARTER' }
  | { type: 'SET_SITE_STARTER_CONFIG'; payload: Partial<SiteStarterConfig> }
  | { type: 'START_SITE_STARTER_PROVISIONING'; payload: { progress: SiteStarterModuleProgress[]; input: CreateSiteInput } }
  | { type: 'UPDATE_SITE_STARTER_MODULE'; payload: Partial<SiteStarterModuleProgress> & { moduleType: string; moduleName: string } }
  | { type: 'SITE_STARTER_ERROR'; payload: string }
  | { type: 'RESET_SITE_STARTER' }
  | { type: 'SET_SITE_MANIFEST'; payload: SiteManifest }
  | { type: 'SITE_MANIFEST_ERROR'; payload: string }
  | { type: 'OPEN_SITE'; payload: SiteManifest }
  | { type: 'UPDATE_SITE_MANIFEST'; payload: SiteManifest };
