'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

import {api} from '@/trpc/react';
import Input from '@components/form/Input';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {type WorldSchema} from '@schemas/worldSchema';

const CreateWorldForm = () => {
  const {toast} = useToast();

  const router = useRouter();

  const loadWorld = api.worldLoader.loadWorld.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: world => {
      router.push(`/world/${world.Id}/world-edit`);
    },
  });

  const createWorld = api.worldLoader.createWorld.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: world => {
      router.push(`/world/${world.Id}/world-edit`);
    },
  });

  const [file, setFile] = useState<File>();
  const [text, setText] = useState<string>();

  const onSubmit = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const [world] = JSON.parse(
        (event.target?.result ?? '') as string,
      ) as WorldSchema[];

      if (!world) return;

      loadWorld.mutate(world);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex  flex-col gap-8  rounded-lg border border-slate-200 bg-slate-700 p-10 ">
      <h1 className="text-center text-xl font-bold">{'Utwórz świat'}</h1>

      <div className="flex flex-col gap-4">
        <h2 className="font-bold">{'Prześlij plik'}</h2>
        <Input
          type="file"
          onChange={e => setFile(e.target.files?.[0])}
          accept="application/JSON"
        />
        <Button loading={loadWorld.isPending} onClick={onSubmit}>
          {'Wyślij'}
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-bold">{'albo'}</h3>
        <Button
          loading={createWorld.isPending}
          onClick={() => {
            createWorld.mutate();
          }}>
          {'Utwórz nowy'}
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-bold">{'Mam już świat'}</h3>
        <Input
          type="text"
          placeholder="ID świata (uuid)"
          onChange={e => setText(e.target.value)}
        />
        <Button
          onClick={() => {
            router.push(`/world/${text}/world-edit`);
          }}>
          {'Przejdź'}
        </Button>
      </div>
    </div>
  );
};

export default CreateWorldForm;
