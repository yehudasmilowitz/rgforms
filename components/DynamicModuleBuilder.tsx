'use client';

import { useApp } from '@/context/AppContext';
import SimpleBuilder from '@/components/modules/SimpleBuilder';
import { MODULE_REGISTRY } from '@/lib/modules/registry';
import { provisionModule } from '@/lib/modules/provisionModule';
import type { ModuleResult } from '@/types';

export default function DynamicModuleBuilder() {
  const { state, dispatch } = useApp();
  const type = state.activeModuleType;
  const def = type ? MODULE_REGISTRY[type] : null;
  if (!def) return null;

  const moduleState = state.modules[type!] ?? { builderName: '', result: null, provisionError: null };

  return (
    <SimpleBuilder
      title={def.builderTitle}
      description={def.builderDescription}
      features={def.builderFeatures}
      tip={def.builderTip}
      inputHint={def.builderInputHint}
      buttonLabel={def.builderButtonLabel}
      provisionError={moduleState.provisionError}
      isProvisioning={state.screen === 'module-provisioning'}
      provision={(token, name, onStepUpdate, projectId) => provisionModule(def, token, name, onStepUpdate, projectId)}
      projectName={state.selectedProject!.projectName}
      projectId={state.selectedProject!.sheetId}
      onSetName={(name) => dispatch({ type: 'SET_MODULE_BUILDER_NAME', moduleType: def.type, name })}
      onStart={() => dispatch({ type: 'START_MODULE_PROVISIONING', moduleType: def.type })}
      onSuccess={(result) => dispatch({ type: 'SET_MODULE_RESULT', moduleType: def.type, result: result as ModuleResult })}
      onError={(err) => dispatch({ type: 'MODULE_PROVISION_ERROR', moduleType: def.type, error: err })}
      onCancel={() => dispatch({ type: 'RESET_MODULE', moduleType: def.type })}
      accessToken={state.auth.accessToken}
      onStepUpdate={(stepId, status, err) => dispatch({ type: 'UPDATE_STEP', payload: { id: stepId, status, error: err } })}
    />
  );
}
