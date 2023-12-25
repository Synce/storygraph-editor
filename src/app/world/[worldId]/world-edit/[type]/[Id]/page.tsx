import {api} from '@/trpc/server';

import EditForm from './EditForm';

type WorldEditPageProps = {
  params: {
    worldId: string;
    type: string;
    Id: string;
  };
};

const WorldEditPage = async ({params: {Id}}: WorldEditPageProps) => {
  const location = await api.world.getLocation({Id});

  return (
    <div className="flex  h-full w-full flex-col bg-slate-800">
      <EditForm location={location} />
    </div>
  );
};
export default WorldEditPage;
