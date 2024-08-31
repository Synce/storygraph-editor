/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';

import {api} from '@/trpc/react';
import FormInput from '@components/form/FormInput';
import Input from '@components/form/Input';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {type CreateQuestSchema, createQuestSchema} from '@schemas/questSchema';

type CreateQuestFormProps = {
  worldId: string;
};

const CreateQuestForm = ({worldId}: CreateQuestFormProps) => {
  const {toast} = useToast();
  const router = useRouter();

  const methods = useForm<CreateQuestSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(createQuestSchema),
    defaultValues: {
      worldId,
      questName: '',
    },
  });

  const {
    handleSubmit,
    control,
    formState: {isValid},
    watch,
  } = methods;

  const questNameValue = watch('questName');

  const createQuest = api.quests.createQuest.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      router.push(`/world/${worldId}/quests`);
      toast({
        title: 'Sukces',
        description: 'Misja została utworzona.',
      });
    },
  });

  const onSubmit = (data: CreateQuestSchema) => {
    createQuest.mutate({worldId: data.worldId, questName: data.questName});
  };

  return (
    <div className="my-4 flex flex-col items-center gap-5">
      <Button
        onClick={() => {
          router.back();
        }}>
        {'Wróć'}
      </Button>

      <div className="flex w-full flex-row gap-2 px-4">
        <form
          className="flex w-full flex-col rounded bg-slate-600 p-4"
          onSubmit={handleSubmit(onSubmit)}>
          <Input field={{label: 'World Id'}} value={worldId} disabled />

          <FormInput
            field={{label: 'Nazwa misji'}}
            control={control}
            name="questName"
          />

          <Button type="submit" disabled={!isValid || questNameValue === ''}>
            {'Utwórz'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestForm;
