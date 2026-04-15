'use client';

import { useApp } from '@/context/AppContext';
import SimpleResultPanel from '@/components/modules/SimpleResultPanel';
import { MODULE_REGISTRY } from '@/lib/modules/registry';

export default function DynamicResultPanel() {
  const { state, dispatch } = useApp();
  const type = state.activeModuleType;
  const def = type ? MODULE_REGISTRY[type] : null;
  if (!def) return null;

  const moduleState = state.modules[type!];
  if (!moduleState?.result) return null;

  const { result, builderName } = moduleState;

  return (
    <SimpleResultPanel
      moduleName={builderName}
      headingLabel={def.resultHeadingLabel}
      subtitle={def.resultSubtitle}
      completedItems={def.resultCompletedItems}
      deploymentUrl={result.deploymentUrl}
      sheetUrl={result.sheetUrl}
      scriptUrl={result.scriptUrl}
      endpointHint={def.resultEndpointHint}
      codeSnippets={def.resultCodeSnippets?.(result.deploymentUrl, builderName)}
      sheetLinkLabel={def.resultSheetLinkLabel}
      newButtonLabel={def.resultNewButtonLabel}
      onNew={() => dispatch({ type: 'GO_TO_MODULE_BUILDER', moduleType: def.type })}
      onDone={() => dispatch({ type: 'RESET_MODULE', moduleType: def.type })}
    />
  );
}
