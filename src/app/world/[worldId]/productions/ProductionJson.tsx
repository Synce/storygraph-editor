import {api} from '@/trpc/server';
import CopyJsonButton from '@components/CopyJsonButton';
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

import ProductionVerification from './ProductionVerification';

type ProductionJsonProps = {
  worldId: string;
};

const ProductionJson = async ({worldId}: ProductionJsonProps) => {
  const customProductions = await api.productions.exportProductions({
    Generic: false,
    worldId,
  });
  const genericProductions = await api.productions.exportProductions({
    Generic: true,
    worldId,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{'Wyeksportuj produkcje'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{'Eksportowanie Produkcji'}</DialogTitle>
          <ProductionVerification productions={[...genericProductions]} />
        </DialogHeader>
        <DialogFooter className="flex flex-row items-end gap-4">
          <div className="flex flex-col justify-center gap-2">
            <p className="font-bold text-black">{'Produkcje generyczne'}</p>

            <DownloadJSONButton
              json={genericProductions}
              name="produkcje_generyczne.json"
            />
            <CopyJsonButton world={genericProductions} />
          </div>
          <div className="flex flex-col  justify-center gap-2">
            <p className="font-bold text-black">{'Produkcje custom'}</p>

            <DownloadJSONButton
              json={customProductions}
              name="produkcje_custom.json"
            />
            <CopyJsonButton world={customProductions} />
          </div>
          <DialogClose asChild>
            <Button variant="destructive">{'Zamknij'}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductionJson;
