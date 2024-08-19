'use client';

import {ReactFlowProvider} from 'reactflow';

import {api} from '@/trpc/react';

import ProductionMap from './ProductionMap';

type RootMapProps = {
  Id: string;
};

const RootMap = ({Id}: RootMapProps) => {
  const getProductionsMap = api.productions.getMap.useQuery({worldId: Id});

  const {data} = getProductionsMap;

  return (
    <ReactFlowProvider>
      {!!data && (
        <ProductionMap nodes={data.nodes} edges={data.edges} worldId={Id} />
      )}
    </ReactFlowProvider>
  );
};

export default RootMap;
