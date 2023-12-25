'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';

import {api} from '@/trpc/react';
import {type RouterOutputs} from '@/trpc/shared';
import FormInput from '@components/form/FormInput';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';

import {
  type EditLocationSchema,
  editLocationSchema,
} from '../../../../../../schemas/EditLocationSchema';

type EditFormProps = {
  location: NonNullable<RouterOutputs['world']['getLocation']>;
};

const EditForm = ({location}: EditFormProps) => {
  const {
    handleSubmit,
    control,
    formState: {isValid},
  } = useForm<EditLocationSchema>({
    mode: 'onBlur',
    resolver: zodResolver(editLocationSchema),

    defaultValues: {
      Name: location.Name,
      Comment: location.Comment,
      GivenId: location.GivenId,
      Id: location.Id,
    },
  });
  const {toast} = useToast();
  const router = useRouter();

  const updateLocation = api.world.updateLocation.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      router.refresh();
      toast({
        title: 'Sukces',
        description: 'zapisano',
      });
    },
  });
  const onSubmit = (data: EditLocationSchema) => {
    updateLocation.mutate(data);
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-background2 mb-10 mt-6 flex h-full flex-col justify-between rounded p-5">
      <div className="flex flex-col gap-5">
        <FormInput
          field={{label: 'Id'}}
          control={control}
          name="GivenId"
          disabled
        />
        <FormInput field={{label: 'Name'}} control={control} name="Name" />
        <FormInput
          field={{label: 'Comment'}}
          control={control}
          name="Comment"
        />

        <Button disabled={!isValid} type="submit">
          {'Zapisz'}
        </Button>
      </div>
    </form>
  );
};

export default EditForm;
