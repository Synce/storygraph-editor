import {notFound} from 'next/navigation';

import {api} from '@/trpc/server';
import {convertToPlainObject} from '@utils/misc';

import EditLocationForm from './EditLocationForm';

type WorldEditPageProps = {
  params: {
    worldId: string;
    Id: string;
  };
};

const WorldEditPage = async ({params: {Id}}: WorldEditPageProps) => {
  const node = await api.world.getNode({Id});
  if (!node) notFound();

  return (
    <div className="flex min-h-full w-full flex-col bg-slate-700">
      <EditLocationForm node={convertToPlainObject(node)} />
    </div>
  );
};
export default WorldEditPage;
