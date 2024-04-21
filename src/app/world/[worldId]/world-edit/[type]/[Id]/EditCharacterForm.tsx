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

type EditCharacterFormProps = {
  character: NonNullable<RouterOutputs['world']['getCharacter']>;
};
const EditCharacterForm = ({character}: EditCharacterFormProps) => {
  const methods = useForm<EditNodeSchema>({
    mode: 'onChange',
    resolver: zodResolver(editNodeSchema),

    defaultValues: {
      Type: 'character',
      Name: character.Name,
      Comment: character.Comment,
      GivenId: character.GivenId,
      Id: character.Id,
      Attributes: parseAttributesSchema(character.Attributes),
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
          characterId={character.Id}
          content={character.Items}
        />
        <SubContentList
          Type="narration"
          characterId={character.Id}
          content={character.Narration}
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

export default EditCharacterForm;
