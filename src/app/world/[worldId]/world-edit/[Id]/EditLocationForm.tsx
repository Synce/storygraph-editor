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

type EditFormProps = {
  node: NonNullable<RouterOutputs['world']['getNode']>;
};
const EditForm = ({node}: EditFormProps) => {
  const methods = useForm<EditNodeSchema>({
    mode: 'onChange',
    resolver: zodResolver(editNodeSchema),

    defaultValues: {
      Name: node.Name,
      Comment: node.Comment,
      Id: node.Id,
      Attributes: parseAttributesSchema(node.Attributes),
    },
  });

  const {
    handleSubmit,
    control,
    formState: {isValid},
  } = methods;
  const {toast} = useToast();
  const router = useRouter();

  const updateLocation = api.world.updateNode.useMutation({
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
    updateLocation.mutate(data);
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-background2 mb-10 mt-6 flex h-full flex-col justify-between rounded p-5">
      <div className="flex flex-col gap-5">
        <FormInput field={{label: 'Id'}} control={control} name="Id" disabled />
        <FormInput field={{label: 'Name'}} control={control} name="Name" />
        <FormInput
          field={{label: 'Comment'}}
          control={control}
          name="Comment"
        />

        <SubContentList
          Type="Character"
          parentWorldNodeId={node.worldNodeId}
          content={node.Character}
        />
        <SubContentList
          Type="Item"
          parentWorldNodeId={node.worldNodeId}
          content={node.Item}
        />
        <SubContentList
          Type="Narration"
          parentWorldNodeId={node.worldNodeId}
          content={node.Narration}
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

export default EditForm;
