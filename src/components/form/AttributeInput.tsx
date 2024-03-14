import {
  useWatch,
  type UseControllerProps,
  useFormContext,
} from 'react-hook-form';

import {Button} from '@components/ui/Button';
import {type EditLocationSchema} from '@schemas/EditLocationSchema';

import FormInput from './FormInput';
import FormSelect from './FormSelect';

type AttributeInputProps = {
  control: UseControllerProps<EditLocationSchema>['control'];
  index: number;
  onRemove: (index: number) => void;
};

const AttributeInput = ({control, index, onRemove}: AttributeInputProps) => {
  const type = useWatch({control, name: `Attributes.${index}.type`});

  const {trigger} = useFormContext<EditLocationSchema>();

  return (
    <div className="flex items-center gap-10 border-b border-t">
      <FormInput
        field={{label: 'Klucz'}}
        control={control}
        name={`Attributes.${index}.key`}
        onChange={() => {
          void trigger('Attributes');
        }}
      />

      <FormSelect
        field={{label: 'Typ'}}
        options={[
          {value: 'boolean', label: 'Boolean'},
          {value: 'string', label: 'String'},
          {value: 'number', label: 'Number'},
        ]}
        control={control}
        name={`Attributes.${index}.type`}
      />

      {type === 'boolean' ? (
        <FormSelect
          field={{label: 'Wartość'}}
          options={[
            {value: 'true', label: 'True'},
            {value: 'false', label: 'False'},
          ]}
          control={control}
          name={`Attributes.${index}.value`}
        />
      ) : (
        <FormInput
          field={{label: 'Wartość'}}
          control={control}
          type={type === 'number' ? 'number' : 'text'}
          name={`Attributes.${index}.value`}
        />
      )}
      <Button
        onClick={e => {
          e.preventDefault();
          onRemove(index);
        }}>
        {'Usuń'}
      </Button>
    </div>
  );
};

export default AttributeInput;
