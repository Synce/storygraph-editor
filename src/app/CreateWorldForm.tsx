'use client';

import {useState} from 'react';

import {api} from '@/trpc/react';
import {Button} from '@components/ui/Button';
import {Input} from '@components/ui/Input';
import {useToast} from '@hooks/useToast';
import {type WorldSchema} from '@schemas/worldSchema';

const CreateWorldForm = () => {
  const {toast} = useToast();

  const loadWorld = api.world.loadWorld.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
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
    <div>
      <Input
        type="file"
        onChange={e => setFile(e.target.files?.[0])}
        accept="application/JSON"
      />
      <Button loading={loadWorld.isPending} onClick={onSubmit}>
        {'Wyślij'}
      </Button>
    </div>
  );
};

export default CreateWorldForm;
