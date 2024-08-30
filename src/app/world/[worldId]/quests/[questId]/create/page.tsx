import {api} from '@/trpc/server';

import NodeForm from '../NodeForm';

type NodeCreateProps = {
  params: {
    worldId: string;
    questId: string;
  };
};

const NodeCreate = async ({params: {worldId, questId}}: NodeCreateProps) => {
  const productions = await api.productions.getProductions({worldId});
  const productionNames = productions.map(item => item.Title);

  const nodeTypes = await api.quests.getQuestNodeTypes();

  return (
    <div className="flex  w-full grow flex-col bg-slate-700">
      <NodeForm
        worldId={worldId}
        questId={questId}
        productionNames={productionNames}
        nodeTypes={nodeTypes}
      />
    </div>
  );
};

export default NodeCreate;
