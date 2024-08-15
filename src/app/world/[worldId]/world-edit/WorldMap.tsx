'use client';

import {instance} from '@viz-js/viz';
import {useCallback, useEffect, useState} from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from 'reactflow';

import 'reactflow/dist/style.css';

import {type GraphvizJson} from '@/interfaces/IGraphViz';
import {api} from '@/trpc/react';
import {type RouterOutputs} from '@/trpc/shared';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {cn} from '@utils/cn';
import {convertToDot, graphvizToReactFlow} from '@utils/misc';

import CustomConnectionLine from './CustomConnectionLine';
import FloatingEdge from './FloatingEdge';
import LocationNode from './LocationNode';
import {MarkerDefinition} from './MarkerDefinition';

type NodeData = NonNullable<
  RouterOutputs['worldMap']['getWorldMap']['nodes'][number]
>;

type ExtendedNode = Node<NodeData['data']>;

type WorldMapProps = {
  edges: Edge[];
  nodes: NodeData[];
  worldId: string;
};

const nodeTypes = {worldNode: LocationNode};

const edgeTypes = {
  floating: FloatingEdge,
};

const defaultEdgeOptions = {
  style: {strokeWidth: 3, stroke: 'gray'},
  deletable: true,
  focusable: true,

  type: 'floating',
};
const connectionLineStyle = {
  strokeWidth: 3,
  stroke: 'gray',
};

const WorldMap = ({
  worldId,
  nodes: initialNodes,
  edges: initialEdges,
}: WorldMapProps) => {
  const [nodes, setNodes] = useState<ExtendedNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const dotString = convertToDot(initialNodes, initialEdges);
    void instance().then(viz => {
      const json = viz.renderJSON(dotString, {engine: 'fdp'});
      const {nodes, edges} = graphvizToReactFlow(json as GraphvizJson);
      setNodes(nodes);
      setEdges(edges);
      setLoaded(true);
    });
  }, [initialNodes, initialEdges]);

  const {fitView, setCenter} = useReactFlow();
  const {toast} = useToast();
  const root = api.world.getWorldRoot.useQuery({Id: worldId});

  const addConnection = api.world.addConnection.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Sukces',
        description: 'Połączono',
      });
    },
  });
  const removeConnection = api.world.removeConnection.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Sukces',
        description: 'usunięto',
      });
    },
  });

  const removeNode = api.world.removeNode.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Sukces',
        description: 'usunięto lokacje',
      });
    },
  });

  const onNodesChange: OnNodesChange = useCallback(
    changes => {
      changes.forEach(change => {
        if (change.type === 'remove') {
          const node = nodes.find(edge => edge.id === change.id);
          if (!node) return;

          void removeNode
            .mutateAsync({
              Id: node.data.Id,
            })
            .then(() => {
              setNodes(nds => applyNodeChanges(changes, nds));
            });
        } else {
          setNodes(nds => applyNodeChanges(changes, nds));
        }
      });
    },
    [nodes, removeNode],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    changes => {
      changes.forEach(change => {
        if (change.type === 'remove') {
          const edge = edges.find(edge => edge.id === change.id);
          if (!edge) return;
          removeConnection.mutate({
            sourceId: edge.source,
            targetId: edge.target,
          });
        }
      });

      setEdges(eds => applyEdgeChanges(changes, eds));
    },
    [edges, removeConnection],
  );
  const onConnect: OnConnect = useCallback(
    connection => {
      if (connection.source === connection.target) return;
      if (!connection.source || !connection.target) return;
      void addConnection
        .mutateAsync({
          sourceId: connection.source,
          targetId: connection.target,
        })
        .then(() => {
          setEdges(eds => addEdge(connection, eds));
        });
    },
    [addConnection],
  );

  useEffect(() => {
    if (loaded) setTimeout(() => fitView({duration: 300}), 1000);
  }, [fitView, loaded]);

  const addNode = api.world.addNode.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: node => {
      const mapNode = {
        id: node.WorldContent.Id,
        type: 'worldNode',
        data: {
          Id: node.WorldContent.Id,
          Name: node.WorldContent.Name,
          Type: node.type,
        },
        position: {
          x: Math.random() * 100,
          y: Math.random() * 100,
        },
      };

      setNodes(state => [...state, mapNode]);
      setTimeout(() => {
        setCenter(mapNode.position.x, mapNode.position.y, {
          duration: 500,
          zoom: 1,
        });
      }, 500);
      toast({
        title: 'Sukces',
        description: 'dodano',
      });
    },
  });

  return (
    <div
      className={cn(
        'flex w-full grow ',
        !loaded && 'pointer-events-none opacity-0 ',
      )}>
      <Button
        onClick={() => {
          if (root.data)
            addNode.mutate({
              parentWorldNodeId: root.data.id,
              Type: 'Location',
            });
        }}
        className="absolute z-10">
        {'Dodaj lokacje'}
      </Button>

      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        maxZoom={10}
        minZoom={0.00001}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineComponent={CustomConnectionLine}
        connectionLineStyle={connectionLineStyle}>
        <MarkerDefinition color="gray" id="edge-marker-gray" />
        <MarkerDefinition color="#ef4444" id="edge-marker-red" />

        <Background />
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
};

export default WorldMap;
