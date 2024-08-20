import {api} from '@/trpc/server';
import CopyWorldIdButton from '@components/CopyWorldIdButton';
import Navigator from '@components/Navigator';

import NodeSearch from './NodeSearch';
import WorldJson from './WorldJson';

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
        <div className="flex flex-row items-center  gap-12">
          <div className="flex flex-col  gap-2">
            <h1 className="text-xl text-white">{`Edycja: ${world.Title}`}</h1>
            <CopyWorldIdButton Id={world.Id} />
          </div>
          <NodeSearch worldId={world.Id} />
          <WorldJson Id={world.Id} />
          <Navigator worldId={world.Id} />
        </div>
      </div>
      <main className="flex flex-1">{children}</main>
    </div>
  );
};
export default WorldEditLayout;
