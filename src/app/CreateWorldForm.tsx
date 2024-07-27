'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

import {api} from '@/trpc/react';
import {Button} from '@components/ui/Button';
import {Input} from '@components/ui/Input';
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

  const [file, setFile] = useState<File>();

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
    <div className="flex  flex-col gap-4  rounded-lg border border-slate-200 bg-slate-700 p-10">
      <h1 className=" text-lg font-bold">{'Prześlij plik'}</h1>
      <Input
        type="file"
        className="cursor-pointer text-black"
        onChange={e => setFile(e.target.files?.[0])}
        accept="application/JSON"
      />
      <Button loading={loadWorld.isPending} className="" onClick={onSubmit}>
        {'Wyślij'}
      </Button>
    </div>
  );
};

export default CreateWorldForm;
