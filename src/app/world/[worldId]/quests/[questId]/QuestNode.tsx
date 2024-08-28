import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Handle, Position, type NodeProps} from 'reactflow';

const QuestNode = ({
  data,
}: NodeProps<{
  Id: number;
  OriginalId: string;
  ProductionName: string | null;
  ProductionArguments: string | null;
  MainStory: boolean;
  Type: string;
}>) => {
  const pathname = usePathname();

  return (
    <div className="before:line-h-1 before:absolute before:-top-2 before:left-1/2 before:z-50 before:h-5 before:w-10 before:-translate-x-1/2 before:rounded-md before:border-2 before:border-solid before:border-gray-600 before:bg-gray-500 before:text-xs before:text-white">
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden rounded border text-[10px] ${
          data.Type !== 'start' && data.MainStory
            ? 'border-4 border-[#ffd166]'
            : 'border-1 border-black'
        } ${
          ['start', 'success', 'death', 'defeat', 'other_quest'].includes(
            data.Type,
          )
            ? 'h-[100px] w-[100px] rounded-full'
            : 'h-[100px] w-[240px]'
        }`}
        style={{
          backgroundColor: (() => {
            switch (data.Type) {
              case 'start':
                return '#5e81ac';
              case 'success':
                return '#fff2cc';
              case 'death':
                return '#000000';
              case 'defeat':
              case 'generic_production':
                return '#ffffff';
              case 'custom_production':
                return '#d5e8d4';
              case 'other_quest':
                return '#9673a6';
              default:
                return '#8b0000';
            }
          })(),
          borderStyle: 'solid',
        }}>
        <Handle position={Position.Bottom} type="target" />
        <Handle position={Position.Top} type="source" />
        <p className="mx-2 line-clamp-2 text-center text-black">
          {data.ProductionName}
        </p>
        <p className="mx-2 line-clamp-2 text-center text-black">
          {data.ProductionArguments}
        </p>
        <Link
          className="z-10 rounded-sm bg-slate-800 p-1"
          href={`${pathname}/${data.OriginalId}`}>
          {'EDYTUJ'}
        </Link>
      </div>
    </div>
  );
};
export default QuestNode;
