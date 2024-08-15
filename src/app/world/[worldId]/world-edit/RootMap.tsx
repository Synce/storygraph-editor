'use client';

import {useState} from 'react';
import {ReactFlowProvider} from 'reactflow';

import {api} from '@/trpc/react';
import {Button} from '@components/ui/Button';

import WorldMap from './WorldMap';

type RootMapProps = {
  Id: string;
};

const RootMap = ({Id}: RootMapProps) => {
  const [showFullMap, setShowFullMap] = useState(true);

  const getWorldMap = api.worldMap.getWorldNodesMap.useQuery({Id});

  const getLocationMap = api.worldMap.getWorldMap.useQuery({Id});

  const data = showFullMap ? getWorldMap.data : getLocationMap.data;

  return (
    <ReactFlowProvider>
      {!!data && (
        <WorldMap nodes={data.nodes} edges={data.edges} worldId={Id} />
      )}

      <Button
        onClick={() => {
          setShowFullMap(state => !state);
        }}
        className="absolute right-2 top-36">
        {showFullMap ? 'Pokaż tylko lokacje' : 'Pokaż cały świat'}
      </Button>
    </ReactFlowProvider>
  );
};

export default RootMap;
