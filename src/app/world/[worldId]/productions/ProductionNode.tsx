import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Handle, Position, type NodeProps} from 'reactflow';

const ProductionNode = ({
  data,
}: NodeProps<{
  Title: string;
  TitleGeneric: string;
  Id: string;
  Generic: boolean;
}>) => {
  const pathname = usePathname();

  return (
    <div className="before:line-h-1 before:absolute before:-top-2 before:left-1/2 before:z-50 before:h-5 before:w-10 before:-translate-x-1/2 before:rounded-md before:border-2 before:border-solid before:border-gray-600 before:bg-gray-500 before:text-xs before:text-white">
      <div
        className="border-3 relative flex h-[80px] w-[130px] flex-col items-center justify-center overflow-hidden rounded border-black text-[10px]"
        style={{
          borderStyle: 'solid',
          backgroundColor: data.Generic ? '#ffd166' : '#06d6a0',
        }}>
        <Handle position={Position.Bottom} type="target" />
        <Handle position={Position.Top} type="source" />
        <p className="mx-2 line-clamp-2 text-center text-black">{data.Title}</p>
        <Link
          className="z-10 rounded-sm bg-slate-800 p-1"
          href={`${pathname}/${data.Id}`}>
          {'EDYTUJ'}
        </Link>
      </div>
    </div>
  );
};
export default ProductionNode;
