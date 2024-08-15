import {api} from '@/trpc/server';
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

import CopyJsonButton from './CopyJsonButton';
import DownloadJSONButton from './DownloadJSONButton';
import WorldVerification from './WorldVerification';

type WorldJsonProps = {
  Id: string;
};

const WorldJson = async ({Id}: WorldJsonProps) => {
  const world = await api.worldExport.exportJSON({Id});

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{'Wyeksportuj świat'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{'Eksportowanie świata'}</DialogTitle>
          <WorldVerification world={world} />
        </DialogHeader>
        <DialogFooter>
          <DownloadJSONButton world={world} />

          <CopyJsonButton world={world} />
          <DialogClose asChild>
            <Button variant="destructive">{'Zamknij'}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorldJson;
