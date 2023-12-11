import {Handle, type NodeProps, Position} from 'reactflow';

const LocationNode = ({data}: NodeProps<unknown>) => {
  return (
    <div
      className={`group flex w-64 cursor-pointer rounded-md border-2 border-stone-400 bg-white px-4 py-2  text-slate-900 shadow-md hover:h-auto hover:shadow-md `}>
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !bg-primary"
      />
      <p>{JSON.stringify(data)}</p>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !bg-primary"
      />
    </div>
  );
};

export default LocationNode;
