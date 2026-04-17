import type { FormConfig, ProvisioningResult, ProvisioningStep } from '@/types';
import { generateAppsScript, APPS_SCRIPT_MANIFEST } from './scriptTemplate';
import {
  runProvisionPipeline,
  createModuleSheet,
  AppsScriptApiDisabledError,
} from './core/provisionHelpers';
import type { StepCallback } from './core/provisionHelpers';

export { AppsScriptApiDisabledError };

export const FORM_PROVISIONING_STEPS: ProvisioningStep[] = [
  { id: 'sheet',  label: 'Creating Google Sheet',  description: 'Setting up your submission spreadsheet', status: 'pending', scopes: [{ label: 'drive.file' }] },
  { id: 'script', label: 'Creating Apps Script',   description: 'Initializing your form handler project',  status: 'pending', scopes: [{ label: 'script.projects', sensitive: true }] },
  { id: 'code',   label: 'Uploading handler code', description: 'Deploying the doPost() email handler',     status: 'pending', scopes: [{ label: 'script.projects', sensitive: true }] },
  { id: 'deploy', label: 'Publishing web app',     description: 'Making your form endpoint live',           status: 'pending', scopes: [{ label: 'script.deployments', sensitive: true }] },
];

export async function provision(
  accessToken: string,
  config: FormConfig,
  onStepUpdate: StepCallback,
  projectId: string,
): Promise<ProvisioningResult> {
  const headers = [...config.fields.map((f) => f.label), 'Timestamp'];

  return runProvisionPipeline<ProvisioningResult>(accessToken, config.name, onStepUpdate, {
    createSheet: (token, name) =>
      createModuleSheet(token, name, 'Submissions', [headers]),
    scriptTitle: `${config.name} Form Handler`,
    generateScript: () => generateAppsScript(config),
    manifest: APPS_SCRIPT_MANIFEST,
    moduleType: 'form',
    projectId,
    extraConfigRows: [
      ['formName',       config.name],
      ['notifyEmail',    config.notifyEmail],
      ['fields',         JSON.stringify(config.fields)],
      ['ccEmails',       JSON.stringify(config.ccEmails ?? [])],
      ['bccEmails',      JSON.stringify(config.bccEmails ?? [])],
      ['emailSubject',   config.emailSubject ?? ''],
      ['senderName',     config.senderName ?? ''],
      ['replyToFieldId', config.replyToFieldId ?? ''],
      ['enableHoneypot', config.enableHoneypot ? 'true' : ''],
    ],
  });
}
