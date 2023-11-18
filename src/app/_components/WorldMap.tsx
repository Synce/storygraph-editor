'use client';

import {useCallback, useState} from 'react';
import ReactFlow, {
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type Edge,
  type Node,
  MiniMap,
} from 'reactflow';

import LocationNode from './LocationNode';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {id: '1', data: {label: 'Node 1'}, position: {x: 5, y: 5}, type: 'location'},
  {
    id: '2',
    data: {label: 'Node 2'},
    position: {x: 5, y: 100},
    type: 'location',
  },
];
const initialEdges = [{id: '1-2', source: '1', target: '2', type: 'step'}];
const nodeTypes = {location: LocationNode};

const WorldMap = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    changes => setNodes(nds => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    changes => setEdges(eds => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect: OnConnect = useCallback(
    params => setEdges(eds => addEdge(params, eds)),
    [],
  );

  return (
    <div className="flex-1">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView>
        <Background />
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
};

export default WorldMap;
