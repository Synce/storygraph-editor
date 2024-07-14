'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {FormProvider, useForm} from 'react-hook-form';

import {api} from '@/trpc/react';
import {type RouterOutputs} from '@/trpc/shared';
import AttributesInput from '@components/form/AttributesInput';
import FormInput from '@components/form/FormInput';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {
  type EditNodeSchema,
  editNodeSchema,
} from '@schemas/worldInputApiSchemas';
import {parseAttributesSchema} from '@utils/misc';

import SubContentList from './SubContentList';

type EditItemFormProps = {
  item: NonNullable<RouterOutputs['world']['getItem']>;
};
const EditItemForm = ({item}: EditItemFormProps) => {
  const methods = useForm<EditNodeSchema>({
    mode: 'onChange',
    resolver: zodResolver(editNodeSchema),

    defaultValues: {
      Type: 'item',
      Name: item.Name,
      //  Comment: item.Comment,
      GivenId: item.GivenId,
      Id: item.Id,
      Attributes: parseAttributesSchema(item.Attributes),
    },
  });

  const {
    handleSubmit,
    control,
    formState: {isValid},
  } = methods;
  const {toast} = useToast();
  const router = useRouter();

  const updateCharacter = api.world.updateNode.useMutation({
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
  const onSubmit = (data: EditNodeSchema) => {
    updateCharacter.mutate(data);
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

        <SubContentList
          Type="item"
          parentItemId={item.Id}
          content={item.SubItems}
        />
        <SubContentList
          Type="narration"
          itemId={item.Id}
          content={item.Narration}
        />

        <FormProvider {...methods}>
          <AttributesInput control={control} />
        </FormProvider>
        <Button disabled={!isValid} type="submit">
          {'Zapisz'}
        </Button>
      </div>
    </form>
  );
};

export default EditItemForm;
