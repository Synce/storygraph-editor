import {api} from '@/trpc/server';

import CopyWorldIdButton from './CopyWorldIdButton';
import NodeSearch from './NodeSearch';

type WorldEditLayoutProps = {
  children: React.ReactNode;
  params: {
    worldId: string;
  };
};

const WorldEditLayout = async ({children, params}: WorldEditLayoutProps) => {
  const world = await api.world.getWorld({Id: params.worldId});

  return (
    <div className="flex h-full flex-col">
      <div className="bg-slate-800 p-4">
        <div className="flex flex-row gap-12">
          <div className="flex flex-col  gap-2">
            <h1 className="text-xl text-white">{`Edycja: ${world.Title}`}</h1>
            <CopyWorldIdButton Id={world.Id} />
          </div>
          <NodeSearch worldId={world.Id} />
        </div>
      </div>
      <main className="flex flex-1">{children}</main>
    </div>
  );
};
export default WorldEditLayout;
