'use client';

import ELK from 'elkjs/lib/elk.bundled.js';
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

import {api} from '@/trpc/react';
import {type RouterOutputs} from '@/trpc/shared';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {cn} from '@utils/cn';

import CustomConnectionLine from './CustomConnectionLine';
import FloatingEdge from './FloatingEdge';
import LocationNode from './LocationNode';
import {MarkerDefinition} from './MarkerDefinition';

type NodeData = NonNullable<
  RouterOutputs['world']['getWorldMap']['nodes'][number]['data']
>;

type ExtendedNode = Node<NodeData>;

type WorldMapProps = {
  edges: Edge[];
  nodes: ExtendedNode[];
  worldId: string;
};

const elk = new ELK();

// - https://www.eclipse.org/elk/reference/options.html
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '130',
  'elk.spacing.nodeNode': '80',
};

const getLayoutedElements = async (nodes: ExtendedNode[], edges: Edge[]) => {
  const graph = {
    id: 'root',
    layoutOptions: elkOptions,
    children: nodes.map(node => ({
      ...node,
      // Adjust the target and source handle positions based on the layout
      // direction.
      targetPosition: 'top',
      sourcePosition: 'bottom',

      // Hardcode a width and height for elk to use when layouting.
      width: 130,
      height: 80,
    })),
    edges,
  };
  // @ts-expect-error: https://reactflow.dev/examples/layout/elkjs
  const layoutedGraph = await elk.layout(graph);

  return {
    nodes: (layoutedGraph?.children?.map(node => ({
      ...node,
      // React Flow expects a position property on the node instead of `x`
      // and `y` fields.
      position: {x: node.x, y: node.y},
    })) ?? []) as ExtendedNode[],

    edges: (layoutedGraph.edges ?? []) as unknown as Edge[],
  };
};

const nodeTypes = {location: LocationNode};

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
  const [nodes, setNodes] = useState<ExtendedNode[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const {fitView, setCenter} = useReactFlow();
  const {toast} = useToast();

  const [loaded, setLoaded] = useState(false);

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

  const removeLocation = api.world.removeNode.useMutation({
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

          removeLocation.mutate({
            Id: node.data.Id,
            Type: 'location',
          });
        }
      });
      setNodes(nds => applyNodeChanges(changes, nds));
    },
    [nodes, removeLocation],
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
            worldId,
          });
        }
      });

      setEdges(eds => applyEdgeChanges(changes, eds));
    },
    [edges, removeConnection, worldId],
  );
  const onConnect: OnConnect = useCallback(
    connection => {
      if (connection.source === connection.target) return;
      if (!connection.source || !connection.target) return;
      addConnection.mutate({
        sourceId: connection.source,
        targetId: connection.target,
        worldId,
      });
      setEdges(eds => addEdge(connection, eds));
    },
    [addConnection, worldId],
  );

  const onLayout = useCallback(() => {
    const ns = nodes;
    const es = edges;

    void getLayoutedElements(ns, es).then(
      ({nodes: layoutedNodes, edges: layoutedEdges}) => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setLoaded(true);
      },
    );
  }, [nodes, edges]);

  useEffect(() => {
    onLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loaded) fitView({duration: 300});
  }, [fitView, loaded]);

  const updateLocation = api.world.addLocation.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: node => {
      setNodes(state => [...state, node]);
      setTimeout(() => {
        setCenter(node.position.x, node.position.y, {
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
          updateLocation.mutate({Id: worldId});
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
