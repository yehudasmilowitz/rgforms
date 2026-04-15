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
import { ASSET_PROVISIONING_STEPS } from '@/lib/assetProvision';
import { SITE_CONFIG_PROVISIONING_STEPS } from '@/lib/siteConfigProvision';
import { CALENDAR_PROVISIONING_STEPS } from '@/lib/calendarProvision';
import { GALLERY_PROVISIONING_STEPS } from '@/lib/galleryProvision';

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
  // Asset module
  assetBuilderName: '',
  assetResult: null,
  assetProvisionError: null,
  // Site Config module
  siteConfigBuilderName: '',
  siteConfigResult: null,
  siteConfigProvisionError: null,
  // Calendar module
  calendarBuilderName: '',
  calendarResult: null,
  calendarProvisionError: null,
  // Gallery module
  galleryBuilderName: '',
  galleryResult: null,
  galleryProvisionError: null,
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

    // ── Asset modules ─────────────────────────────────────────────────────────
    case 'GO_TO_ASSET_BUILDER':
      return { ...state, screen: 'asset-builder', assetBuilderName: '', assetResult: null, assetProvisionError: null, steps: ASSET_PROVISIONING_STEPS };
    case 'SET_ASSET_BUILDER_NAME':
      return { ...state, assetBuilderName: action.payload };
    case 'START_ASSET_PROVISIONING':
      return { ...state, screen: 'asset-provisioning', steps: ASSET_PROVISIONING_STEPS, assetProvisionError: null };
    case 'SET_ASSET_RESULT':
      return { ...state, screen: 'asset-result', assetResult: action.payload };
    case 'ASSET_PROVISION_ERROR':
      return { ...state, screen: 'asset-builder', assetProvisionError: action.payload };
    case 'RESET_ASSET':
      return { ...state, screen: 'dashboard', assetBuilderName: '', assetResult: null, assetProvisionError: null };

    // ── Site Config modules ───────────────────────────────────────────────────
    case 'GO_TO_SITECONFIG_BUILDER':
      return { ...state, screen: 'siteconfig-builder', siteConfigBuilderName: '', siteConfigResult: null, siteConfigProvisionError: null, steps: SITE_CONFIG_PROVISIONING_STEPS };
    case 'SET_SITECONFIG_BUILDER_NAME':
      return { ...state, siteConfigBuilderName: action.payload };
    case 'START_SITECONFIG_PROVISIONING':
      return { ...state, screen: 'siteconfig-provisioning', steps: SITE_CONFIG_PROVISIONING_STEPS, siteConfigProvisionError: null };
    case 'SET_SITECONFIG_RESULT':
      return { ...state, screen: 'siteconfig-result', siteConfigResult: action.payload };
    case 'SITECONFIG_PROVISION_ERROR':
      return { ...state, screen: 'siteconfig-builder', siteConfigProvisionError: action.payload };
    case 'RESET_SITECONFIG':
      return { ...state, screen: 'dashboard', siteConfigBuilderName: '', siteConfigResult: null, siteConfigProvisionError: null };

    // ── Calendar modules ──────────────────────────────────────────────────────
    case 'GO_TO_CALENDAR_BUILDER':
      return { ...state, screen: 'calendar-builder', calendarBuilderName: '', calendarResult: null, calendarProvisionError: null, steps: CALENDAR_PROVISIONING_STEPS };
    case 'SET_CALENDAR_BUILDER_NAME':
      return { ...state, calendarBuilderName: action.payload };
    case 'START_CALENDAR_PROVISIONING':
      return { ...state, screen: 'calendar-provisioning', steps: CALENDAR_PROVISIONING_STEPS, calendarProvisionError: null };
    case 'SET_CALENDAR_RESULT':
      return { ...state, screen: 'calendar-result', calendarResult: action.payload };
    case 'CALENDAR_PROVISION_ERROR':
      return { ...state, screen: 'calendar-builder', calendarProvisionError: action.payload };
    case 'RESET_CALENDAR':
      return { ...state, screen: 'dashboard', calendarBuilderName: '', calendarResult: null, calendarProvisionError: null };

    // ── Gallery modules ───────────────────────────────────────────────────────
    case 'GO_TO_GALLERY_BUILDER':
      return { ...state, screen: 'gallery-builder', galleryBuilderName: '', galleryResult: null, galleryProvisionError: null, steps: GALLERY_PROVISIONING_STEPS };
    case 'SET_GALLERY_BUILDER_NAME':
      return { ...state, galleryBuilderName: action.payload };
    case 'START_GALLERY_PROVISIONING':
      return { ...state, screen: 'gallery-provisioning', steps: GALLERY_PROVISIONING_STEPS, galleryProvisionError: null };
    case 'SET_GALLERY_RESULT':
      return { ...state, screen: 'gallery-result', galleryResult: action.payload };
    case 'GALLERY_PROVISION_ERROR':
      return { ...state, screen: 'gallery-builder', galleryProvisionError: action.payload };
    case 'RESET_GALLERY':
      return { ...state, screen: 'dashboard', galleryBuilderName: '', galleryResult: null, galleryProvisionError: null };

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
