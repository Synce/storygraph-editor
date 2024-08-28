'use client';

import {ReactFlowProvider} from 'reactflow';

import {api} from '@/trpc/react';

import QuestMap from './QuestMap';

type RootMapProps = {
  worldId: string;
  questId: string;
};

const RootMap = ({worldId, questId}: RootMapProps) => {
  const getQuestMap = api.quests.getSelectedQuestMap.useQuery({
    questId,
  });

  const {data} = getQuestMap;

  return (
    <ReactFlowProvider>
      {!!data && (
        <QuestMap
          nodes={data.nodes}
          edges={data.edges}
          worldId={worldId}
          questId={questId}
        />
      )}
    </ReactFlowProvider>
  );
};

export default RootMap;
