'use client';

import {instance} from '@viz-js/viz';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Edge,
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
import {cn} from '@utils/cn';
import {convertToDot, graphvizToReactFlow} from '@utils/misc';

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
  style: {strokeWidth: 3, stroke: 'gray'},
  deletable: false,
  focusable: false,
  markerEnd: {
    type: MarkerType.Arrow,
  },
  type: 'straight',
};

const QuestMap = ({
  worldId,
  questId,
  nodes: initialNodes,
  edges: initialEdges,
}: QuestMapProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [loaded, setLoaded] = useState(false);

  const router = useRouter();

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
        {/* Te przyciski będą teraz zawsze widoczne */}
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
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          defaultEdgeOptions={defaultEdgeOptions}
          nodesConnectable={false}
          edgesFocusable={false}
          edgesUpdatable={false}
          maxZoom={10}
          minZoom={0.00001}>
          <Background />
          <Controls />
          <MiniMap zoomable pannable />
        </ReactFlow>
      </div>
    </>
  );
};

export default QuestMap;
