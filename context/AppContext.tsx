'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { AppState, AppAction, SiteStarterConfig } from '@/types';

const DEFAULT_SITE_STARTER_CONFIG: SiteStarterConfig = {
  template: null,
  siteName: '',
  notifyEmail: '',
};

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: AppState = {
  screen: 'landing',
  auth: { user: null, accessToken: null },
  siteStarterConfig: DEFAULT_SITE_STARTER_CONFIG,
  siteStarterProgress: [],
  siteStarterLaunchInput: null,
  siteStarterError: null,
  siteManifest: null,
  siteManifestError: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {

    case 'SIGN_IN':
      return {
        ...state,
        screen: 'site-select',
        auth: { user: action.payload.user, accessToken: action.payload.accessToken },
        siteStarterConfig: { ...state.siteStarterConfig, notifyEmail: action.payload.user.email },
      };
    case 'SIGN_OUT':
      return { ...initialState };

    case 'GO_TO_SITE_STARTER':
      return {
        ...state,
        screen: 'site-starter',
        siteStarterProgress: [],
        siteStarterLaunchInput: null,
        siteStarterError: null,
      };
    case 'SET_SITE_STARTER_CONFIG':
      return { ...state, siteStarterConfig: { ...state.siteStarterConfig, ...action.payload } };
    case 'START_SITE_STARTER_PROVISIONING':
      return {
        ...state,
        screen: 'site-starter-provisioning',
        siteStarterProgress: action.payload.progress,
        siteStarterLaunchInput: action.payload.input,
        siteStarterError: null,
      };
    case 'UPDATE_SITE_STARTER_MODULE':
      return {
        ...state,
        siteStarterProgress: state.siteStarterProgress.map((m) =>
          m.moduleType === action.payload.moduleType && m.moduleName === action.payload.moduleName
            ? { ...m, ...action.payload }
            : m,
        ),
      };
    case 'SITE_STARTER_ERROR':
      return { ...state, screen: 'site-starter', siteStarterError: action.payload };
    case 'RESET_SITE_STARTER':
      return {
        ...state,
        screen: 'site-select',
        siteStarterConfig: { ...DEFAULT_SITE_STARTER_CONFIG, notifyEmail: state.auth.user?.email ?? '' },
        siteStarterProgress: [],
        siteStarterLaunchInput: null,
        siteStarterError: null,
      };

    case 'OPEN_SITE':
    case 'SET_SITE_MANIFEST':
      return { ...state, screen: 'site-kit', siteManifest: action.payload, siteManifestError: null };
    case 'UPDATE_SITE_MANIFEST':
      return { ...state, siteManifest: action.payload };
    case 'SITE_MANIFEST_ERROR':
      return { ...state, screen: 'site-starter', siteManifestError: action.payload };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
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
