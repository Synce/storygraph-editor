'use client';

import {useRouter} from 'next/navigation';

import {api} from '@/trpc/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/Select';

type QuestSelectProps = {
  worldId: string;
};

const QuestSelect = ({worldId}: QuestSelectProps) => {
  const router = useRouter();
  const getQuestsList = api.quests.getQuests.useQuery({worldId});
  const {data} = getQuestsList;

  return (
    <div className="flex w-64 items-center justify-center bg-slate-900">
      <Select
        onValueChange={value => {
          router.push(`/world/${worldId}/quests/${value}`);
        }}>
        <SelectTrigger className="text-body  box-border rounded-lg bg-white px-4 py-3">
          <SelectValue placeholder="Wybierz misję" />
        </SelectTrigger>
        <SelectContent>
          {data?.map(quest => (
            <SelectItem key={quest.id} value={quest.id}>
              {quest.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default QuestSelect;
