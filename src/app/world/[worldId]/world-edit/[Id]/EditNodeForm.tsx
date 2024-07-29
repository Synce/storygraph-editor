'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {FormProvider, useForm} from 'react-hook-form';

import {api} from '@/trpc/react';
import {type RouterOutputs} from '@/trpc/shared';
import AttributesInput from '@components/form/AttributesInput';
import FormInput from '@components/form/FormInput';
import Input from '@components/form/Input';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {
  type EditNodeSchema,
  editNodeSchema,
} from '@schemas/worldInputApiSchemas';
import {parseAttributesSchema} from '@utils/misc';

import SubContentList from './SubContentList';

type EditNodeFormProps = {
  node: NonNullable<RouterOutputs['world']['getNode']>;
};
const EditNodeForm = ({node}: EditNodeFormProps) => {
  const methods = useForm<EditNodeSchema>({
    mode: 'onChange',
    resolver: zodResolver(editNodeSchema),

    defaultValues: {
      Name: node.Name,
      Comment: node.Comment,
      Id: node.Id,
      IsObject: node.IsObject,
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
    <div className="flex w-full flex-row gap-2 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-1/2 flex-col rounded bg-slate-600 p-4 ">
        <Input field={{label: 'Id'}} value={node.Id} disabled />
        <FormInput field={{label: 'Name'}} control={control} name="Name" />
        <FormInput
          field={{label: 'Comment'}}
          control={control}
          name="Comment"
        />

        <FormProvider {...methods}>
          <AttributesInput control={control} />
        </FormProvider>
        <Button disabled={!isValid} type="submit">
          {'Zapisz'}
        </Button>
      </form>
      <div className=" flex w-1/2 flex-col gap-4 rounded bg-slate-600 p-4">
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
      </div>
    </div>
  );
};

export default EditNodeForm;
