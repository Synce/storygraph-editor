import {notFound} from 'next/navigation';

import {api} from '@/trpc/server';

import EditCharacterForm from './EditCharacterForm';
import EditItemForm from './EditItemForm';
import EditLocationForm from './EditLocationForm';

type WorldEditPageProps = {
  params: {
    worldId: string;
    type: string;
    Id: string;
  };
};

const WorldEditPage = async ({params: {Id, type}}: WorldEditPageProps) => {
  if (type === 'location') {
    const location = await api.world.getLocation({Id});
    if (!location) notFound();

    return (
      <div className="flex min-h-full w-full flex-col bg-slate-800">
        <EditLocationForm location={location} />
      </div>
    );
  }

  if (type === 'character') {
    const character = await api.world.getCharacter({Id});
    if (!character) notFound();

    return (
      <div className="flex min-h-full w-full flex-col bg-slate-800">
        <EditCharacterForm character={character} />
      </div>
    );
  }

  if (type === 'item') {
    const item = await api.world.getItem({Id});
    if (!item) notFound();

    return (
      <div className="flex min-h-full w-full flex-col bg-slate-800">
        <EditItemForm item={item} />
      </div>
    );
  }

  return notFound();
};
export default WorldEditPage;
