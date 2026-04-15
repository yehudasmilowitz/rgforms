import type { BaseModuleResult } from '@/lib/core/provisionHelpers';

export type { BaseModuleResult };

export interface ModuleStepDef {
  id: string;
  label: string;
  description: string;
}

export type ScriptConfig =
  | {
      mode: 'readonly';
      /** Label shown on the authorization confirmation page */
      apiLabel: string;
      /** Description shown on the authorization confirmation page */
      apiDescription: string;
      /** The JS variable name for the result array (e.g. "testimonials") */
      arrayKey: string;
      booleanKeys?: string[];
      numericKeys?: string[];
      /**
       * Apps Script code fragment injected into the row loop.
       * Available: `params` (query params), `item` (parsed row), `skip` (set to true to exclude).
       */
      filterLogic?: string;
      /**
       * Apps Script code fragment to sort the result array.
       * Available: `result` (the array).
       */
      sortLogic?: string;
    }
  | {
      mode: 'custom';
      /** Function that generates the full Apps Script source */
      generate: (moduleName: string) => string;
      /** The appsscript.json manifest object */
      manifest: object;
    };

export interface ModuleDef {
  /** Unique slug used in state keys, routes, and lookups (e.g. "testimonial") */
  type: string;
  /** Display label, e.g. "Testimonials" */
  label: string;
  /** Lowercase plural noun, e.g. "testimonials" */
  noun: string;

  // ─── Builder UI ───────────────────────────────────────────────────────────
  builderTitle: string;
  builderDescription: string;
  builderFeatures: string[];
  /** HTML string — supports <code> and <strong> inline */
  builderTip?: string;
  /** Label for the name input (default: "Module name") */
  builderInputLabel?: string;
  /** Placeholder for the name input (default: "My Site") */
  builderInputPlaceholder?: string;
  /** Hint shown below the input */
  builderInputHint: string;
  builderButtonLabel: string;

  // ─── Provisioning steps ───────────────────────────────────────────────────
  steps: ModuleStepDef[];

  // ─── Sheet creation ────────────────────────────────────────────────────────
  /** Sheet title suffix after the name, e.g. "RG Testimonials" → "MySite — RG Testimonials" */
  sheetSuffix: string;
  /** Name of the main data tab */
  tabName: string;
  /** First row = column headers; subsequent rows = sample data */
  sampleRows: (string | number | boolean)[][];

  // ─── Script ────────────────────────────────────────────────────────────────
  /** Script title suffix, e.g. "Testimonials API" → "MySite Testimonials API" */
  scriptSuffix: string;
  script: ScriptConfig;

  // ─── Result panel UI ───────────────────────────────────────────────────────
  /** Heading text after the module name, e.g. "testimonials is live" */
  resultHeadingLabel: string;
  resultSubtitle: string;
  resultCompletedItems: string[];
  /** Plain text hint shown below the endpoint CopyBlock */
  resultEndpointHint?: string;
  resultSheetLinkLabel: string;
  resultNewButtonLabel: string;
  /**
   * Factory that generates module-specific code snippets for the result panel.
   * Called with the live deploymentUrl and the module instance name.
   */
  resultCodeSnippets?: (deploymentUrl: string, moduleName: string) => Array<{
    label: string;
    content: string;
    language: 'js' | 'text' | 'shell';
    hint?: string;
  }>;
}

export type ModuleRegistry = Record<string, ModuleDef>;
