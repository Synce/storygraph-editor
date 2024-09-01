import {api} from '@/trpc/server';
import CopyJsonQuestButton from '@components/CopyJsonQuestButton';
import DownloadJSONButton from '@components/DownloadJSONButton';
import {Button} from '@components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/Dialog';

import QuestVerification from './QuestVerification';

type QuestJsonProps = {
  questId: string;
};

const QuestJson = async ({questId}: QuestJsonProps) => {
  const quest = await api.quests.exportQuest({questId});

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{'Wyeksportuj misję'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{'Eksportowanie misji'}</DialogTitle>
          <QuestVerification quest={quest} />
        </DialogHeader>
        <DialogFooter>
          <DownloadJSONButton json={quest} name={`${quest.Title}_quest.json`} />

          <CopyJsonQuestButton quest={quest} />
          <DialogClose asChild>
            <Button variant="destructive">{'Zamknij'}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestJson;
