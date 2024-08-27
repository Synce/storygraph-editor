'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

import {Button} from './ui/Button';

type NavigatorProps = {
  worldId: string;
};

const Navigator = ({worldId}: NavigatorProps) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-row gap-4">
      {!pathname.includes('productions') && (
        <Link href={`/world/${worldId}/productions`}>
          <Button>{'Edytuj produkcje'}</Button>
        </Link>
      )}
      {!pathname.includes('world-edit') && (
        <Link href={`/world/${worldId}/world-edit`}>
          <Button>{'Edytuj świat'}</Button>
        </Link>
      )}
      {!pathname.includes('quests') && (
        <Link href={`/world/${worldId}/quests`}>
          <Button>{'Edytuj misje'}</Button>
        </Link>
      )}
    </div>
  );
};

export default Navigator;
