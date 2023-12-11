'use client';

import ReactFlow, {Background, Controls, MiniMap} from 'reactflow';

import {api} from '@/trpc/react';

import LocationNode from './LocationNode';

import 'reactflow/dist/style.css';

const nodeTypes = {location: LocationNode};

type WorldMapProps = {
  Id: string;
};

const WorldMap = ({Id}: WorldMapProps) => {
  const getWorldMap = api.world.getWorldMap.useQuery({Id});

  return (
    <div className="flex w-full grow">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={getWorldMap.data?.nodes ?? []}
        edges={getWorldMap.data?.edges ?? []}
        fitView>
        <Background />
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
};

export default WorldMap;
