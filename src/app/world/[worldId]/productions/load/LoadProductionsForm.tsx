'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

import {api} from '@/trpc/react';
import Checkbox from '@components/form/Checkbox';
import Input from '@components/form/Input';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {type ProductionSchema} from '@schemas/productionSchema';

type LoadProductionsFormProps = {
  worldId: string;
};

const LoadProductionsForm = ({worldId}: LoadProductionsFormProps) => {
  const {toast} = useToast();

  const router = useRouter();
  const utils = api.useUtils();

  const loadProductions = api.productions.loadProductions.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      void utils.invalidate();
      router.push(`/world/${worldId}/productions`);
    },
  });

  const [file, setFile] = useState<File>();

  const [isGeneric, setIsGeneric] = useState<boolean>(false);

  const onSubmit = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const productions = JSON.parse(
        (event.target?.result ?? '') as string,
      ) as ProductionSchema[];

      loadProductions.mutate({worldId, productions, generic: isGeneric});
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex  flex-col gap-8  rounded-lg border border-slate-200 bg-slate-700 p-10 ">
      <h1 className="text-center text-xl font-bold">{'Załaduj produkcje'}</h1>

      <div className="flex flex-col gap-4">
        <h2 className="font-bold">{'Prześlij plik'}</h2>
        <Input
          type="file"
          onChange={e => setFile(e.target.files?.[0])}
          accept="application/JSON"
        />

        <Checkbox
          field={{
            label: 'Produkcje generyczne',
          }}
          onCheckedChange={value => {
            setIsGeneric(value === 'indeterminate' ? false : value);
          }}
          checked={isGeneric}
        />
        <Button
          loading={loadProductions.isPending}
          disabled={!file}
          onClick={onSubmit}>
          {'Wyślij'}
        </Button>
      </div>

      <Button
        variant="secondary"
        onClick={() => {
          router.push(`/world/${worldId}/productions`);
        }}>
        {'Wróć'}
      </Button>
    </div>
  );
};

export default LoadProductionsForm;
