'use client';

import Link from 'next/link';
import {useParams} from 'next/navigation';

import {Button, buttonVariants} from '@components/ui/Button';
import {type NodeType} from '@schemas/worldInputApiSchemas';

type SubContentProps = {
  name?: string | null;
  GivenId: string;
  Id: string;
  type: NodeType;
  onDelete: () => void;
};
const SubContent = ({name, GivenId, type, Id, onDelete}: SubContentProps) => {
  const {worldId} = useParams();

  return (
    <div className="flex flex-row items-center gap-5 border-b border-t border-white bg-gray-700 py-4">
      <div className="flex flex-col gap-2">
        <p className="text-lg font-bold">{name}</p>
        <p>{GivenId}</p>
        <p>{type}</p>
      </div>
      <div className="flex flex-row gap-2">
        <Link
          className={buttonVariants()}
          href={`/world/${worldId as string}/world-edit/${type}/${Id}`}>
          {'EDYTUJ'}
        </Link>
        <Button variant="destructive" onClick={onDelete}>
          {'USUŃ'}
        </Button>
      </div>
    </div>
  );
};

export default SubContent;
