import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {
  Handle,
  Position,
  useStore,
  type NodeProps,
  type ReactFlowState,
} from 'reactflow';

const connectionNodeIdSelector = (state: ReactFlowState) =>
  state.connectionNodeId;

const LocationNode = ({data, id}: NodeProps<{Name: string; Id: string}>) => {
  const connectionNodeId = useStore(connectionNodeIdSelector);

  const isConnecting = !!connectionNodeId;
  const isTarget = connectionNodeId && connectionNodeId !== id;
  const pathname = usePathname();

  return (
    <div className="before:line-h-1 before:absolute before:-top-2 before:left-1/2 before:z-50 before:h-5 before:w-10 before:-translate-x-1/2 before:rounded-md before:border-2 before:border-solid before:border-gray-600 before:bg-gray-500 before:text-xs before:text-white">
      <div
        className="border-3 relative flex h-20 w-32 flex-col items-center justify-center overflow-hidden rounded border-black text-[10px]"
        style={{
          borderStyle: isTarget ? 'dashed' : 'solid',
          backgroundColor: isTarget ? '#ffcce3' : '#ccd9f6',
        }}>
        <Link
          className="z-10 bg-red-500"
          href={`${pathname}/location/${data.Id}`}>
          {'EDYTUJ'}
        </Link>
        {!isConnecting && (
          <Handle
            className="!absolute !left-0 !top-0 !h-full !w-full !translate-y-0 !rounded-none border-none opacity-0"
            position={Position.Top}
            type="source"
          />
        )}

        <Handle
          className="!absolute !left-0 !top-0 z-10 !h-full !w-full !translate-y-0 !rounded-none border-none opacity-0 "
          position={Position.Top}
          type="target"
          isConnectableStart={false}
        />
        <pre>{data.Name}</pre>
      </div>
    </div>
  );
};
export default LocationNode;
