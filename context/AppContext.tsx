'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import type {
  AppState,
  AppAction,
  FormConfig,
  ContentModuleConfig,
  ProvisioningStep,
  GoogleUser,
  ProvisioningResult,
  ContentModuleResult,
} from '@/types';
import { CONTENT_PROVISIONING_STEPS } from '@/lib/contentProvision';

// ─── Form defaults ────────────────────────────────────────────────────────────

const DEFAULT_FORM_CONFIG: FormConfig = {
  name: '',
  notifyEmail: '',
  fields: [
    { id: 'field-1', label: 'Name',    type: 'text',     required: true },
    { id: 'field-2', label: 'Email',   type: 'email',    required: true },
    { id: 'field-3', label: 'Message', type: 'textarea', required: true },
  ],
};

const PROVISIONING_STEPS: ProvisioningStep[] = [
  { id: 'sheet',  label: 'Creating Google Sheet',       description: 'Setting up your submission spreadsheet',    status: 'pending' },
  { id: 'script', label: 'Creating Apps Script',        description: 'Initializing your form handler project',    status: 'pending' },
  { id: 'config', label: 'Adding configuration',        description: 'Writing field schema and notification settings', status: 'pending' },
  { id: 'code',   label: 'Uploading handler code',      description: 'Deploying the doPost() email handler',      status: 'pending' },
  { id: 'deploy', label: 'Publishing web app',          description: 'Making your form endpoint live',            status: 'pending' },
];

// ─── Content module defaults ──────────────────────────────────────────────────

const DEFAULT_CONTENT_CONFIG: ContentModuleConfig = {
  name: '',
  fields: [
    { id: 'cf-1', label: 'Title', key: 'title', type: 'text', required: true },
  ],
  hasSlug: true,
  hasPublished: true,
};

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: AppState = {
  screen: 'landing',
  auth: { user: null, accessToken: null },
  formConfig: DEFAULT_FORM_CONFIG,
  steps: PROVISIONING_STEPS,
  result: null,
  provisionError: null,
  appsScriptApiDisabled: false,
  builderInitialStep: 1,
  // Content module
  contentModuleConfig: DEFAULT_CONTENT_CONFIG,
  contentResult: null,
  contentProvisionError: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // ── Auth ──────────────────────────────────────────────────────────────────
    case 'SIGN_IN':
      return {
        ...state,
        screen: 'dashboard',
        auth: { user: action.payload.user, accessToken: action.payload.accessToken },
        formConfig: { ...state.formConfig, notifyEmail: action.payload.user.email },
      };
    case 'SIGN_OUT':
      return { ...initialState };

    // ── Forms ─────────────────────────────────────────────────────────────────
    case 'SET_FORM_CONFIG':
      return { ...state, formConfig: { ...state.formConfig, ...action.payload } };
    case 'GO_TO_BUILDER':
      return {
        ...initialState,
        screen: 'builder',
        auth: state.auth,
        formConfig: { ...DEFAULT_FORM_CONFIG, notifyEmail: state.auth.user?.email ?? '' },
        contentModuleConfig: state.contentModuleConfig,
        contentResult: state.contentResult,
      };
    case 'START_PROVISIONING':
      return { ...state, screen: 'provisioning', steps: PROVISIONING_STEPS, provisionError: null };
    case 'UPDATE_STEP':
      return {
        ...state,
        steps: state.steps.map((step) =>
          step.id === action.payload.id
            ? { ...step, status: action.payload.status, error: action.payload.error }
            : step,
        ),
      };
    case 'SET_RESULT':
      return { ...state, screen: 'result', result: action.payload };
    case 'PROVISION_ERROR':
      return { ...state, screen: 'builder', provisionError: action.payload, builderInitialStep: 3 };
    case 'PROVISION_FAILED_API_DISABLED':
      return { ...state, screen: 'builder', appsScriptApiDisabled: true, builderInitialStep: 3 };
    case 'CLEAR_ERROR':
      return { ...state, provisionError: null, appsScriptApiDisabled: false };
    case 'RESET':
      return {
        ...initialState,
        screen: 'dashboard',
        auth: state.auth,
        formConfig: { ...DEFAULT_FORM_CONFIG, notifyEmail: state.auth.user?.email ?? '' },
        contentModuleConfig: state.contentModuleConfig,
        contentResult: state.contentResult,
      };

    // ── Content modules ───────────────────────────────────────────────────────
    case 'GO_TO_CONTENT_BUILDER':
      return {
        ...state,
        screen: 'content-builder',
        contentModuleConfig: { ...DEFAULT_CONTENT_CONFIG },
        contentResult: null,
        contentProvisionError: null,
        steps: CONTENT_PROVISIONING_STEPS,
      };
    case 'SET_CONTENT_CONFIG':
      return {
        ...state,
        contentModuleConfig: { ...state.contentModuleConfig, ...action.payload },
      };
    case 'START_CONTENT_PROVISIONING':
      return {
        ...state,
        screen: 'content-provisioning',
        steps: CONTENT_PROVISIONING_STEPS,
        contentProvisionError: null,
      };
    case 'SET_CONTENT_RESULT':
      return { ...state, screen: 'content-result', contentResult: action.payload };
    case 'CONTENT_PROVISION_ERROR':
      return {
        ...state,
        screen: 'content-builder',
        contentProvisionError: action.payload,
      };
    case 'RESET_CONTENT':
      return {
        ...state,
        screen: 'dashboard',
        contentModuleConfig: { ...DEFAULT_CONTENT_CONFIG },
        contentResult: null,
        contentProvisionError: null,
        steps: CONTENT_PROVISIONING_STEPS,
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useAuth() {
  const { state } = useApp();
  return state.auth;
}

export function useFormConfig() {
  const { state, dispatch } = useApp();
  return { formConfig: state.formConfig, dispatch };
}
