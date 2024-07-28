import {notFound} from 'next/navigation';

import {api} from '@/trpc/server';
import {convertToPlainObject} from '@utils/misc';

import EditNodeForm from './EditNodeForm';
import WorldBreadCrumbs from './WorldBreadCrumbs';

type WorldEditPageProps = {
  params: {
    worldId: string;
    Id: string;
  };
};

const WorldEditPage = async ({params: {Id}}: WorldEditPageProps) => {
  const node = await api.world.getNode({Id});
  const path = await api.world.getAncestors({Id});

  if (!node) notFound();

  return (
    <div className="flex w-full flex-col items-center bg-slate-700 px-8">
      <WorldBreadCrumbs
        path={path}
        currentItemId={Id}
        currentItemName={node.Name}
      />
      <EditNodeForm node={convertToPlainObject(node)} />
    </div>
  );
};
export default WorldEditPage;
