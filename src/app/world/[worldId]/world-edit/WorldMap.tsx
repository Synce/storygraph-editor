'use client';

import {instance} from '@viz-js/viz';
import ELK from 'elkjs/lib/elk.bundled.js';
import {useCallback, useEffect, useMemo, useState} from 'react';
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
  RouterOutputs['worldMap']['getWorldMap']['nodes'][number]['data']
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
  const [nodes, setNodes] = useState<ExtendedNode[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  useEffect(() => {
    const dotString = convertToDot(initialNodes, initialEdges);

    void instance().then(viz => {
      const json = viz.renderJSON(dotString, {engine: 'fdp'});
      const {nodes, edges} = graphvizToReactFlow(json as GraphvizJson);
      console.log('ZAŁADOWANO');
      setNodes(nodes);
      setEdges(edges);
    });
  }, [initialNodes, initialEdges]);

  const {fitView, setCenter} = useReactFlow();
  const {toast} = useToast();
  const root = api.world.getWorldRoot.useQuery({Id: worldId});

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

  const onLayout = useCallback(() => {
    const ns = nodes;
    const es = edges;

    void getLayoutedElements(ns, es).then(
      ({nodes: layoutedNodes, edges: layoutedEdges}) => {
        // setNodes(layoutedNodes);
        // setEdges(layoutedEdges);
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
