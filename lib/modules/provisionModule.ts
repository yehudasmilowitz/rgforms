import { runProvisionPipeline, createModuleSheet } from '@/lib/core/provisionHelpers';
import type { StepCallback, BaseModuleResult } from '@/lib/core/provisionHelpers';
import { generateReadOnlyScript, DEFAULT_MANIFEST } from '@/lib/core/scriptHelpers';
import type { ModuleDef } from './types';

export async function provisionModule(
  def: ModuleDef,
  token: string,
  moduleName: string,
  onStepUpdate: StepCallback,
  projectId: string,
): Promise<BaseModuleResult> {
  const manifest = def.script.mode === 'custom' ? def.script.manifest : DEFAULT_MANIFEST;

  const generateScript = (name: string): string => {
    if (def.script.mode === 'custom') {
      return def.script.generate(name);
    }
    return generateReadOnlyScript({
      apiLabel: def.script.apiLabel,
      apiDescription: def.script.apiDescription,
      tabName: def.tabName,
      arrayKey: def.script.arrayKey,
      moduleName: name,
      booleanKeys: def.script.booleanKeys,
      numericKeys: def.script.numericKeys,
      filterLogic: def.script.filterLogic,
      sortLogic: def.script.sortLogic,
    });
  };

  return runProvisionPipeline<BaseModuleResult>(token, moduleName, onStepUpdate, {
    createSheet: (t, name) =>
      createModuleSheet(t, `${name} \u2014 ${def.sheetSuffix}`, def.tabName, def.sampleRows),
    scriptTitle: `${moduleName} ${def.scriptSuffix}`,
    generateScript,
    manifest,
    moduleType: def.type,
    projectId,
  });
}
