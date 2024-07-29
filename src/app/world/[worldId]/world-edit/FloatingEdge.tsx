import {useCallback} from 'react';
import {useStore, getStraightPath, type EdgeProps} from 'reactflow';

import {cn} from '@utils/cn';
import {getEdgeParams} from '@utils/mapUtils';

const FloatingEdge = ({id, source, target, style, selected}: EdgeProps) => {
  const sourceNode = useStore(
    useCallback(store => store.nodeInternals.get(source), [source]),
  );
  const targetNode = useStore(
    useCallback(store => store.nodeInternals.get(target), [target]),
  );

  if (!sourceNode || !targetNode) {
    return null;
  }

  const {sx, sy, tx, ty} = getEdgeParams(sourceNode, targetNode);

  const [edgePath] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
  });

  return (
    <path
      id={id}
      className={cn('react-flow__edge-path', selected && '!stroke-red-500')}
      d={edgePath}
      markerEnd={`url(#edge-marker-${selected ? 'red' : 'gray'})`}
      style={style}
    />
  );
};

export default FloatingEdge;
