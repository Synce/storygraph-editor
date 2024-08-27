'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

import {api} from '@/trpc/react';
import {Button} from '@components/ui/Button';

type QuestSelectProps = {
  worldId: string;
};

const QuestSelect = ({worldId}: QuestSelectProps) => {
  const router = useRouter();
  const getQuestsList = api.quests.getQuests.useQuery({worldId});
  const {data} = getQuestsList;

  const [selectedQuest, setSelectedQuest] = useState<string>(data?.[0]?.id); // tu jest zjebane

  const onSubmit = () => {
    router.push(`/world/${worldId}/quests/${selectedQuest}`);
  };

  return (
    <main className="flex w-full flex-grow items-center justify-center bg-slate-900">
      <select
        defaultValue={data && data.length > 0 ? undefined : 'no-quests'}
        className="w-full max-w-md text-black"
        onChange={e => setSelectedQuest(e.target.value)}>
        {data && data.length > 0 ? (
          data.map(quest => (
            <option key={quest.id} value={quest.id}>
              {quest.name}
            </option>
          ))
        ) : (
          <option value="no-quests">{`Brak dostępnych misji`}</option>
        )}
      </select>
      <Button onClick={onSubmit}>{'Edytuj misje'}</Button>
    </main>
  );
};

export default QuestSelect;
