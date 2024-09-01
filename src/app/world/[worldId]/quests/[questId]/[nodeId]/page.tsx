import {api} from '@/trpc/server';

import NodeForm from '../NodeForm';

type EditNodePageProps = {
  params: {
    worldId: string;
    questId: string;
    nodeId: string;
  };
};

const EditNodePage = async ({
  params: {worldId, questId, nodeId},
}: EditNodePageProps) => {
  const productions = await api.productions.getProductions({worldId});
  const productionNames = productions.map(item => item.Title);
  const node = await api.quests.getNode({worldId, questId, nodeId});
  const nodeTypes = await api.quests.getQuestNodeTypes();

  return (
    <div className="flex  w-full grow flex-col bg-slate-700">
      <NodeForm
        worldId={worldId}
        questId={questId}
        productionNames={productionNames}
        node={node}
        nodeTypes={nodeTypes}
      />
    </div>
  );
};

export default EditNodePage;
