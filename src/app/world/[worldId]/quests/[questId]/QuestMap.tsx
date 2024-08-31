/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

'use client';

import {instance} from '@viz-js/viz';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect, useState, useCallback} from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type OnEdgesChange,
  type OnConnect,
  addEdge,
  applyEdgeChanges,
  MarkerType,
  MiniMap,
  useEdgesState,
  useNodesState,
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
import {MarkerDefinition} from './MarkerDefinition';
import QuestNode from './QuestNode';

type NodeData = NonNullable<
  RouterOutputs['quests']['getSelectedQuestMap']['nodes'][number]
>;

type QuestMapProps = {
  edges: Edge[];
  nodes: NodeData[];
  worldId: string;
  questId: string;
};

const nodeTypes = {customNode: QuestNode};

const defaultEdgeOptions = {
  style: {strokeWidth: 3, stroke: 'grey'},
  deletable: true,
  focusable: true,
  markerEnd: {
    type: MarkerType.Arrow,
  },
  type: 'straight',
};

const connectionLineStyle = {
  strokeWidth: 3,
  stroke: 'red',
};

const QuestMap = ({
  worldId,
  questId,
  nodes: initialNodes,
  edges: initialEdges,
}: QuestMapProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [loaded, setLoaded] = useState(false);

  const router = useRouter();
  const {toast} = useToast();

  useEffect(() => {
    if (initialNodes.length === 0) return;
    const dotString = convertToDot(initialNodes, initialEdges);
    void instance().then(viz => {
      const json = viz.renderJSON(dotString, {engine: 'dot'});
      let {nodes} = graphvizToReactFlow(json as GraphvizJson);

      nodes = nodes.map(node => ({
        ...node,
        position: {
          x: node.position.x * 2,
          y: node.position.y,
        },
      }));

      setNodes(nodes);
      setEdges(initialEdges);
      setLoaded(true);
    });
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const {fitView} = useReactFlow();

  useEffect(() => {
    if (loaded) setTimeout(() => fitView({duration: 300}), 1000);
  }, [fitView, loaded]);

  const deleteQuestMutation = api.quests.deleteQuest.useMutation({
    onSuccess: () => {
      router.push(`/world/${worldId}/quests`);
    },
    onError: error => {
      console.error('Failed to delete quest:', error);
    },
  });

  const handleDeleteQuest = () => {
    // eslint-disable-next-line no-alert, no-restricted-globals
    if (confirm('Czy na pewno chcesz usunąć tę misję?')) {
      deleteQuestMutation.mutate({worldId, questId});
    }
  };

  const addConnection = api.quests.addConnection.useMutation({
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
  const removeConnection = api.quests.removeConnection.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Sukces',
        description: 'Usunięto połączenie',
      });
    },
  });

  const onEdgesChange: OnEdgesChange = useCallback(
    changes => {
      changes.forEach(change => {
        if (change.type === 'remove') {
          const edge = edges.find(edge => edge.id === change.id);
          if (!edge) return;

          const sourceNode = nodes.find(
            node => node.data.OriginalId === edge.source,
          );
          const targetNode = nodes.find(
            node => node.data.OriginalId === edge.target,
          );

          if (!sourceNode || !targetNode) return;

          removeConnection.mutate(
            {
              questId,
              sourceId: sourceNode.data.Id,
              targetId: targetNode.data.Id,
            },
            {
              onError: error => {
                console.error('Failed to remove connection:', error);
              },
            },
          );
        }
      });

      setEdges(eds => applyEdgeChanges(changes, eds));
    },
    [edges, removeConnection, setEdges, nodes, questId],
  );

  const onConnect: OnConnect = useCallback(
    connection => {
      if (connection.source === connection.target) return;
      if (!connection.source || !connection.target) return;

      const sourceNode = nodes.find(
        node => node.data.OriginalId === connection.source,
      );
      const targetNode = nodes.find(
        node => node.data.OriginalId === connection.target,
      );

      if (!sourceNode || !targetNode) return;

      void addConnection
        .mutateAsync({
          questId,
          sourceId: sourceNode.data.Id,
          targetId: targetNode.data.Id,
        })
        .then(() => {
          setEdges(eds => addEdge(connection, eds));
        });
    },
    [addConnection, setEdges, questId, nodes],
  );

  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(prevId => (prevId === edge.id ? null : edge.id));
    event.stopPropagation();
  };

  const onPaneClick = () => {
    setSelectedEdgeId(null);
  };

  return (
    <>
      {initialNodes.length === 0 && (
        <>
          <h2 className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform text-2xl text-red-500">
            {'Brak produkcji dla tej misji'}
          </h2>

          <Link
            className="z-60 top-100 absolute"
            href={`/world/${worldId}/quests/${questId}/create`}>
            <Button>{'Dodaj Produkcję'}</Button>
          </Link>

          <Button
            className="z-60 top-100 absolute right-0 bg-red-500"
            onClick={handleDeleteQuest}>
            {'Usuń misję'}
          </Button>
        </>
      )}
      <div
        className={cn(
          'relative flex w-full grow',
          !loaded && 'pointer-events-none opacity-0',
        )}>
        <Link
          className="absolute left-4 top-4 z-50"
          href={`/world/${worldId}/quests/${questId}/create`}>
          <Button>{'Dodaj Produkcję'}</Button>
        </Link>

        <Button
          className="absolute right-4 top-4 z-50 bg-red-500"
          onClick={handleDeleteQuest}>
          {'Usuń misję'}
        </Button>

        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges.map(edge => ({
            ...edge,
            style: {
              stroke: edge.id === selectedEdgeId ? 'red' : 'grey',
              strokeWidth: 3,
            },
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          defaultEdgeOptions={defaultEdgeOptions}
          onConnect={onConnect}
          maxZoom={10}
          minZoom={0.00001}
          connectionLineComponent={CustomConnectionLine}
          connectionLineStyle={connectionLineStyle}>
          <MarkerDefinition color="gray" id="edge-marker-gray" />
          <MarkerDefinition color="#ef4444" id="edge-marker-red" />
          <Background />
          <Controls />
          <MiniMap zoomable pannable />
        </ReactFlow>
      </div>
    </>
  );
};

export default QuestMap;
