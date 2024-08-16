import Link from 'next/link';

import {api} from '@/trpc/server';
import CopyWorldIdButton from '@components/CopyWorldIdButton';
import Navigator from '@components/Navigator';
import {Button} from '@components/ui/Button';

type ProductionEditLayoutProps = {
  children: React.ReactNode;
  params: {
    worldId: string;
  };
};

const ProductionEditLayout = async ({
  children,
  params,
}: ProductionEditLayoutProps) => {
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
          <Link href={`/world/${world.Id}/productions/load`}>
            <Button>{'Załaduj produkcje'}</Button>
          </Link>
        </div>
      </div>
      <main className="flex flex-1">{children}</main>
    </div>
  );
};
export default ProductionEditLayout;
