import Link from 'next/link';

import {api} from '@/trpc/server';
import CopyWorldIdButton from '@components/CopyWorldIdButton';
import Navigator from '@components/Navigator';
import {Button} from '@components/ui/Button';

import QuestSelect from './QuestSelect';

type QuestEditLayoutProps = {
  children: React.ReactNode;
  params: {
    worldId: string;
  };
};

const QuestEditLayout = async ({children, params}: QuestEditLayoutProps) => {
  const world = await api.world.getWorld({Id: params.worldId});

  return (
    <div className="flex h-full flex-col">
      <div className="bg-slate-800 p-4">
        <div className="flex flex-row items-center  gap-12">
          <div className="flex flex-col  gap-2">
            <h1 className="text-xl text-white">{`Edycja: ${world.Title}`}</h1>
            <CopyWorldIdButton Id={world.Id} />
          </div>
          <Navigator worldId={world.Id} />
          <QuestSelect worldId={world.Id} />
          <Link href={`/world/${world.Id}/quests/load`}>
            <Button>{'Załaduj misję'}</Button>
          </Link>
          <Link href={`/world/${world.Id}/quests/create`}>
            <Button>{'Utwórz nową misję'}</Button>
          </Link>
        </div>
      </div>
      <main className="flex flex-1">{children}</main>
    </div>
  );
};
export default QuestEditLayout;
