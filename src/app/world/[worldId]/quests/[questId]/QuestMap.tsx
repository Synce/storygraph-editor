'use client';

import {instance} from '@viz-js/viz';
import Link from 'next/link';
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

  return (
    <>
      {initialNodes.length === 0 && (
        <h2 className="absolute left-1/2 top-1/2 z-50 text-2xl text-red-500">
          {'Brak produkcji dla tej misji'}
        </h2>
      )}
      <div
        className={cn(
          'relative flex w-full grow',
          !loaded && 'pointer-events-none opacity-0 ',
        )}>
        <Link
          className="absolute z-10"
          href={`/world/${worldId}/quests/${questId}/create`}>
          <Button>{'Dodaj Produkcję'}</Button>
        </Link>

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
      </div>{' '}
    </>
  );
};

export default QuestMap;
