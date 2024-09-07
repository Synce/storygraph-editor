/* eslint-disable @typescript-eslint/no-unsafe-assignment */

'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {useMemo} from 'react';
import {useForm} from 'react-hook-form';

import {api} from '@/trpc/react';
import {type RouterOutputs} from '@/trpc/shared';
import FormCodeEditor from '@components/form/FormCodeEditor';
import FormInput from '@components/form/FormInput';
import FormSelect from '@components/form/FormSelect';
import Input from '@components/form/Input';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {
  type ProductionEditSchema,
  productionEditSchema,
} from '@schemas/productionSchema';
import {validateJSONSchema} from '@utils/misc';

const SCHEMA_URL =
  'https://raw.githubusercontent.com/iwonagg/StoryGraphPhD/master/json_validation/json_schema/schemas/schema_updated_20220213.json';

type EditNodeFormProps = {
  production?: NonNullable<RouterOutputs['productions']['getProduction']>;
  productionNames: string[];
  worldId: string;
};
const ProductionForm = ({
  production,
  productionNames,
  worldId,
}: EditNodeFormProps) => {
  const creatingNew = !production;
  const methods = useForm<ProductionEditSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(productionEditSchema),

    defaultValues: {
      Id: production?.Id,
      Title: production?.Title ?? '',
      TitleGeneric: production?.TitleGeneric ?? '',
      Description: production?.Description ?? '',
      Comment: production?.Comment ?? '',
      Override: production?.Override ?? 0,
      LSide: production ? JSON.stringify(production.LSide, null, 2) : '',
      Instructions: production
        ? JSON.stringify(production.Instructions, null, 2)
        : '',
    },
  });

  const selectOptions = useMemo(() => {
    return productionNames.map(name => ({value: name, label: name}));
  }, [productionNames]);

  const {
    handleSubmit,
    control,
    formState: {isValid},
  } = methods;

  const {toast} = useToast();
  const router = useRouter();
  const utils = api.useUtils();

  const createProduction = api.productions.createProduction.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      void utils.invalidate();
      router.push(`/world/${worldId}/productions`);
      toast({
        title: 'Sukces',
        description: 'zapisano',
      });
    },
  });

  const editProduction = api.productions.editProduction.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      void utils.invalidate();
      router.refresh();
      toast({
        title: 'Sukces',
        description: 'zapisano',
      });
    },
  });

  const onSubmit = (production: ProductionEditSchema) => {
    try {
      const {Id, ...data} = production;
      const object = {
        ...data,
        Instructions: JSON.parse(data.Instructions),
        LSide: JSON.parse(data.LSide),
        RSide: {},
      };

      validateJSONSchema(SCHEMA_URL, [object])
        .then(({valid, errors}) => {
          if (!valid) {
            toast({
              title: 'Error',
              description: JSON.stringify(errors),
            });
            return;
          }
          if (creatingNew) createProduction.mutate({worldId, production});
          else editProduction.mutate({production});
        })
        .catch(({errors}: {errors: unknown}) => {
          toast({
            title: 'Error',
            description: JSON.stringify(errors),
          });
        });
    } catch (e) {
      toast({
        title: 'Error',
        description: `${e as string}`,
      });
    }
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
        <form className="flex w-1/2 flex-col rounded bg-slate-600 p-4 ">
          {production! && (
            <Input field={{label: 'Id'}} value={production.Id} disabled />
          )}

          <FormInput field={{label: 'Title'}} control={control} name="Title" />
          <FormSelect
            field={{label: 'TitleGeneric'}}
            options={selectOptions}
            control={control}
            name="TitleGeneric"
          />
          <FormInput
            field={{label: 'Comment'}}
            control={control}
            name="Comment"
          />
          <FormInput
            field={{label: 'Description'}}
            control={control}
            name="Description"
          />
          <FormInput
            field={{label: 'Override'}}
            control={control}
            name="Override"
          />
        </form>
        <div className=" flex w-1/2 flex-col gap-4 rounded bg-slate-600 p-4">
          <FormCodeEditor
            field={{label: 'LSide'}}
            control={control}
            name="LSide"
          />
          <FormCodeEditor
            field={{label: 'Instructions'}}
            control={control}
            name="Instructions"
          />
        </div>
      </div>
      <Button disabled={!isValid} onClick={handleSubmit(onSubmit)}>
        {'Zapisz'}
      </Button>
    </div>
  );
};

export default ProductionForm;
