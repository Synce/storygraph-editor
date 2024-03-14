'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {FormProvider, useForm} from 'react-hook-form';

import {api} from '@/trpc/react';
import {type RouterOutputs} from '@/trpc/shared';
import AttributesInput from '@components/form/AttributesInput';
import FormInput from '@components/form/FormInput';
import Label from '@components/form/Label';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {
  type EditLocationSchema,
  editLocationSchema,
  type EditAttributesSchema,
} from '@schemas/EditLocationSchema';

import SubContent from './SubContent';

type EditFormProps = {
  location: NonNullable<RouterOutputs['world']['getLocation']>;
};
const EditForm = ({location}: EditFormProps) => {
  const methods = useForm<EditLocationSchema>({
    mode: 'onChange',
    resolver: zodResolver(editLocationSchema),

    defaultValues: {
      Type: 'location',
      Name: location.Name,
      Comment: location.Comment,
      GivenId: location.GivenId,
      Id: location.Id,
      Attributes: Object.entries(location.Attributes ?? {}).reduce<
        EditAttributesSchema[]
      >((acc, item) => {
        const [key, value] = item;
        const type = typeof value;
        const attribute = {key, value, type} as EditAttributesSchema;
        return [...acc, attribute];
      }, [] as EditAttributesSchema[]),
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
        <div>
          <Label>{'Characters'}</Label>

          <div className="flex flex-col gap-10">
            {location.Characters.map(character => (
              <SubContent
                Id={character.Id}
                name={character?.Name}
                GivenId={character.GivenId}
                type="character"
                key={character.Id}
              />
            ))}
          </div>
        </div>

        <div>
          <Label>{'Items'}</Label>

          <div className="flex flex-col gap-10">
            {location.Items.map(item => (
              <SubContent
                Id={item.Id}
                name={item?.Name}
                GivenId={item.GivenId}
                type="item"
                key={item.Id}
              />
            ))}
          </div>
        </div>

        <div>
          <Label>{'Narrations'}</Label>

          <div className="flex flex-col gap-10">
            {location.Narration.map(narration => (
              <SubContent
                Id={narration.Id}
                name={narration?.Name}
                GivenId={narration.GivenId}
                type="narration"
                key={narration.Id}
              />
            ))}
          </div>
        </div>

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
