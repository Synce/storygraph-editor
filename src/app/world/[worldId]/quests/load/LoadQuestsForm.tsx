'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

import {api} from '@/trpc/react';
import Input from '@components/form/Input';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {type QuestSchema} from '@schemas/questSchema';
import {mx2json} from '@utils/mx2json';

type LoadQuestsFormProps = {
  worldId: string;
};

const LoadQuestsForm = ({worldId}: LoadQuestsFormProps) => {
  const {toast} = useToast();

  const router = useRouter();

  const loadQuest = api.quests.loadQuestFile.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      router.push(`/world/${worldId}/quests`);
    },
  });

  const [file, setFile] = useState<File>();

  const onSubmit = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      let convertFile = '';

      if (event.target && typeof event.target.result === 'string') {
        convertFile = mx2json(event.target.result) ?? '';
      }

      const quest = JSON.parse(convertFile) as QuestSchema;

      if (!quest) {
        console.error('Invalid quest file');
        return;
      }

      loadQuest.mutate({worldId, quest, fileName: file.name});
    };

    reader.onerror = error => {
      console.error('Error reading file:', error);
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex  flex-col gap-8  rounded-lg border border-slate-200 bg-slate-700 p-10 ">
      <h1 className="text-center text-xl font-bold">{'Załaduj misję'}</h1>

      <div className="flex flex-col gap-4">
        <h2 className="font-bold">{'Prześlij plik'}</h2>
        <Input
          type="file"
          className="cursor-pointer text-black"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
              setFile(selectedFile);
            }
          }}
          accept=".drawio"
        />

        <Button
          loading={loadQuest.isPending}
          disabled={!file}
          onClick={onSubmit}>
          {'Wyślij'}
        </Button>
      </div>

      <Button
        variant="secondary"
        onClick={() => {
          router.push(`/world/${worldId}/quests`);
        }}>
        {'Wróć'}
      </Button>
    </div>
  );
};

export default LoadQuestsForm;
