'use client';

import Link from 'next/link';
import {useParams} from 'next/navigation';

import {Button, buttonVariants} from '@components/ui/Button';

type SubContentProps = {
  name?: string | null;
  Id: string;
  onDelete: () => void;
};
const SubContent = ({name, Id, onDelete}: SubContentProps) => {
  const {worldId} = useParams();

  return (
    <div className="flex flex-row items-center justify-between  rounded  bg-gray-700 px-4 py-2">
      <div className="flex flex-col gap-1">
        <p className="text-lg font-bold">{name}</p>
        <p className="text-sm">{Id}</p>
      </div>
      <div className="flex flex-row gap-2">
        <Link
          className={buttonVariants()}
          href={`/world/${worldId as string}/world-edit/${Id}`}>
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
