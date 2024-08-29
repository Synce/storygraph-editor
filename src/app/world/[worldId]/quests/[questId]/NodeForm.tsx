/* eslint-disable @typescript-eslint/no-unsafe-assignment */

'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {useMemo} from 'react';
import {useForm} from 'react-hook-form';

import {api} from '@/trpc/react';
import {type RouterOutputs} from '@/trpc/shared';
import FormInput from '@components/form/FormInput';
import FormSelect from '@components/form/FormSelect';
import Input from '@components/form/Input';
import {Button} from '@components/ui/Button';
import {useToast} from '@hooks/useToast';
import {type NodeEditSchema, nodeEditSchema} from '@schemas/questSchema';

type EditNodeFormProps = {
  worldId: string;
  questId: string;
  nodeId?: string;
  productionNames: string[];
  node?: NonNullable<RouterOutputs['quests']['getNode']>;
  nodeTypes: string[];
};
const NodeForm = ({
  worldId,
  questId,
  nodeId,
  productionNames,
  node,
  nodeTypes,
}: EditNodeFormProps) => {
  const {toast} = useToast();
  const router = useRouter();

  const creatingNew = !node;

  const methods = useForm<NodeEditSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(nodeEditSchema),

    defaultValues: {
      Id: node?.id,
      OriginalId: node?.originalId,
      Type: node?.type,
      MainStory: node?.isMainStory,
      ProductionName: node?.productionName ?? '',
      ProductionArguments: node?.productionArguments ?? '',
    },
  });

  const selectOptionsProductions = useMemo(() => {
    return productionNames.map(name => ({value: name, label: name}));
  }, [productionNames]);

  const selectOptionsTypes = useMemo(() => {
    return nodeTypes.map(type => ({value: type, label: type}));
  }, [nodeTypes]);

  const {
    handleSubmit,
    control,
    formState: {isValid},
    watch,
  } = methods;

  const productionNameExists = useMemo(() => {
    return selectOptionsProductions.some(
      option => option.value === methods.getValues('ProductionName'),
    );
  }, [selectOptionsProductions, methods]);

  const typeValue = watch('Type');

  const isTypeRestricted = ['death', 'success', 'defeat'].includes(typeValue);
  const isTypeOtherQuest = typeValue === 'other_quest';

  // const createProduction = api.productions.createProduction.useMutation({
  //   onError: err => {
  //     toast({
  //       title: 'Error',
  //       description: err.shape?.message,
  //     });
  //   },
  //   onSuccess: () => {
  //     router.push(`/world/${worldId}/productions`);
  //     toast({
  //       title: 'Sukces',
  //       description: 'zapisano',
  //     });
  //   },
  // });

  // const editProduction = api.productions.editProduction.useMutation({
  //   onError: err => {
  //     toast({
  //       title: 'Error',
  //       description: err.shape?.message,
  //     });
  //   },
  //   onSuccess: () => {
  //     router.refresh();
  //     toast({
  //       title: 'Sukces',
  //       description: 'zapisano',
  //     });
  //   },
  // });

  const onSubmit = (node: NodeEditSchema) => {
    console.log('test');
    // try {
    //   const {Id, ...data} = production;
    //   const object = {
    //     ...data,
    //     Instructions: JSON.parse(data.Instructions),
    //     LSide: JSON.parse(data.LSide),
    //     RSide: {},
    //   };
    //   validateJSONSchema(SCHEMA_URL, [object])
    //     .then(({valid, errors}) => {
    //       if (!valid) {
    //         toast({
    //           title: 'Error',
    //           description: JSON.stringify(errors),
    //         });
    //         return;
    //       }
    //       if (creatingNew) createProduction.mutate({worldId, production});
    //       else editProduction.mutate({production});
    //     })
    //     .catch(({errors}: {errors: unknown}) => {
    //       toast({
    //         title: 'Error',
    //         description: JSON.stringify(errors),
    //       });
    //     });
    // } catch (e) {
    //   toast({
    //     title: 'Error',
    //     description: `${e as string}`,
    //   });
    // }
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
        <form className="flex w-full flex-col rounded bg-slate-600 p-4 ">
          {node && <Input field={{label: 'Id'}} value={node.id} disabled />}

          {node && (
            <Input
              field={{label: 'Original Id'}}
              value={node.originalId}
              disabled
            />
          )}

          <FormSelect
            field={{label: 'Type'}}
            options={selectOptionsTypes}
            control={control}
            name="Type"
          />

          {productionNameExists ? (
            <FormSelect
              field={{label: 'Production Name'}}
              options={selectOptionsProductions}
              control={control}
              name="ProductionName"
              disabled={isTypeRestricted}
            />
          ) : (
            <div className="mb-4">
              <FormInput
                field={{label: 'Production Name'}}
                control={control}
                name="ProductionName"
                className={!productionNameExists ? 'border border-red-500' : ''}
                disabled={isTypeRestricted}
              />
              {!productionNameExists && (
                <span className="text-sm text-red-500">
                  {
                    'W twoim świecie brakuje takiej produkcji. Proszę wprowadzić nazwę ręcznie.'
                  }
                </span>
              )}
            </div>
          )}

          {/* Renderuj tylko, jeśli typ nie jest death, success, defeat */}
          {!isTypeRestricted && !isTypeOtherQuest && (
            <>
              <FormInput
                field={{label: 'Production Arguments'}}
                control={control}
                name="ProductionArguments"
              />

              <FormSelect
                field={{label: 'Main Story'}}
                options={[
                  {value: 'true', label: 'True'},
                  {value: 'false', label: 'False'},
                ]}
                control={control}
                name="MainStory"
              />
            </>
          )}
        </form>
      </div>
      <Button disabled={!isValid} onClick={handleSubmit(onSubmit)}>
        {'Zapisz'}
      </Button>
    </div>
  );
};

export default NodeForm;
