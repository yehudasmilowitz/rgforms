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

export type AppScreen = 'landing' | 'dashboard' | 'builder' | 'provisioning' | 'result';

export interface AppState {
  screen: AppScreen;
  auth: AuthState;
  formConfig: FormConfig;
  steps: ProvisioningStep[];
  result: ProvisioningResult | null;
  provisionError: string | null;
  appsScriptApiDisabled: boolean;
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
  | { type: 'APPS_SCRIPT_API_DISABLED' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };
