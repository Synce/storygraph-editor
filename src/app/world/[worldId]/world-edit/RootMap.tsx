'use client';

import {ReactFlowProvider} from 'reactflow';

import {api} from '@/trpc/react';

import WorldMap from './WorldMap';

type RootMapProps = {
  Id: string;
};

const RootMap = ({Id}: RootMapProps) => {
  const getWorldMap = api.worldMap.getWorldNodesMap.useQuery({Id});

  const {data} = getWorldMap;

  return (
    <ReactFlowProvider>
      {!!data && (
        <WorldMap nodes={data.nodes} edges={data.edges} worldId={Id} />
      )}
    </ReactFlowProvider>
  );
};

export default RootMap;
