/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {useMemo, useEffect} from 'react';
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
  productionNames: string[];
  node?: NonNullable<RouterOutputs['quests']['getNode']>;
  nodeTypes: string[];
};
const NodeForm = ({
  worldId,
  questId,
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
      Id: node?.id ?? undefined,
      OriginalId: node?.originalId ?? '',
      Type: node?.type ?? '',
      MainStory: node?.isMainStory ?? false,
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
    reset,
    setValue,
  } = methods;

  const typeValue = watch('Type');
  const mainStoryValue = watch('MainStory');

  useEffect(() => {
    if (typeof mainStoryValue === 'string') {
      setValue('MainStory', mainStoryValue === 'true', {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [mainStoryValue, setValue]);

  useEffect(() => {
    if (['death', 'success', 'defeat'].includes(typeValue)) {
      reset({
        Id: node?.id,
        OriginalId: node?.originalId,
        Type: typeValue,
        MainStory: false,
        ProductionName: '',
        ProductionArguments: '',
      });
    }
  }, [typeValue, reset, node]);

  const productionNameExists = productionNames.includes(
    methods.getValues('ProductionName') ?? '',
  );

  const renderProductionNameField = () => {
    if (
      creatingNew &&
      ['generic_production', 'custom_production'].includes(typeValue)
    ) {
      return (
        <FormSelect
          field={{label: 'Production Name'}}
          options={selectOptionsProductions}
          control={control}
          name="ProductionName"
        />
      );
    }
    if (!creatingNew && productionNameExists) {
      return (
        <FormSelect
          field={{label: 'Production Name'}}
          options={selectOptionsProductions}
          control={control}
          name="ProductionName"
        />
      );
    }

    return (
      <>
        <FormInput
          field={{label: 'Production Name'}}
          control={control}
          name="ProductionName"
          className={!productionNameExists ? 'border border-red-500' : ''}
        />
        {!productionNameExists && (
          <span className="text-sm text-red-500">
            {
              'W twoim świecie brakuje takiej produkcji. Proszę wprowadzić nazwę ręcznie.'
            }
          </span>
        )}
      </>
    );
  };

  const renderFormFields = () => {
    switch (typeValue) {
      case 'death':
      case 'success':
      case 'defeat':
        return null;
      case 'other_quest':
        return (
          <FormInput
            field={{label: 'Production Name'}}
            control={control}
            name="ProductionName"
          />
        );
      default:
        return (
          <>
            {renderProductionNameField()}
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
        );
    }
  };

  const createNode = api.quests.createNode.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      router.back();
      toast({
        title: 'Sukces',
        description: 'zapisano',
      });
    },
  });

  const editNode = api.quests.editNode.useMutation({
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

  const deleteNode = api.quests.deleteNode.useMutation({
    onError: err => {
      toast({
        title: 'Error',
        description: err.shape?.message,
      });
    },
    onSuccess: () => {
      router.back();
      toast({
        title: 'Sukces',
        description: 'Usunięto węzeł',
      });
    },
  });

  const onSubmit = (node: NodeEditSchema) => {
    if (creatingNew) {
      createNode.mutate({node, worldId, questId});
    } else {
      editNode.mutate({node, worldId, questId});
    }
  };

  const handleDelete = () => {
    if (node) {
      deleteNode.mutate({nodeId: node.id, questId, worldId});
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
        <form className="flex w-full flex-col rounded bg-slate-600 p-4 ">
          {!creatingNew && node && (
            <>
              <Input field={{label: 'Id'}} value={node.id} disabled />
              <Input
                field={{label: 'Original Id'}}
                value={node.originalId}
                disabled
              />
            </>
          )}

          <FormSelect
            field={{label: 'Type'}}
            options={selectOptionsTypes}
            control={control}
            name="Type"
          />

          {renderFormFields()}
        </form>
      </div>
      <Button disabled={!isValid} onClick={handleSubmit(onSubmit)}>
        {'Zapisz'}
      </Button>
      {!creatingNew && (
        <Button type="button" variant="destructive" onClick={handleDelete}>
          {'Usuń'}
        </Button>
      )}
    </div>
  );
};

export default NodeForm;
