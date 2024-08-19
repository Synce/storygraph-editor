/* eslint-disable no-console */

'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

import {api} from '@/trpc/react';
import Input from '@components/form/Input';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {type QuestSchema} from '@schemas/questSchema';
import {mx2json} from '@utils/mx2json';

const CreateWorldForm = () => {
  const {toast} = useToast();

  const router = useRouter();

  const loadQuest = api.questLoader.loadWorld.useMutation({
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
    if (!file) {
      console.log('No file selected');
      return;
    }

    const reader = new FileReader();

    reader.onload = event => {
      let convertFile = '';

      if (event.target && typeof event.target.result === 'string') {
        convertFile = mx2json(event.target.result) ?? '';
      }

      const quest = JSON.parse(convertFile) as QuestSchema;

      console.log(quest);

      //if (!quest) return;

      // loadQuest.mutate(quest);
    };

    reader.onerror = error => {
      console.error('Error reading file:', error);
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-700 p-10">
      <h1 className="text-lg font-bold">{'Prześlij plik'}</h1>
      <Input
        type="file"
        className="cursor-pointer text-black"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) {
            console.log('File selected:', selectedFile.name); // Dodane logowanie
            setFile(selectedFile);
          }
        }}
        accept=".drawio"
      />
      <Button className="" onClick={onSubmit}>
        {'Wyślij'}
      </Button>
    </div>
  );
};

export default CreateWorldForm;
