import {
  useFieldArray,
  type UseControllerProps,
  useFormState,
} from 'react-hook-form';

import {Button} from '@components/ui/Button';
import {type EditNodeSchema} from '@schemas/worldInputApiSchemas';

import AttributeInput from './AttributeInput';
import FormField from './FormField';

type AttributesInputProps = {
  control: UseControllerProps<EditNodeSchema>['control'];
};

const AttributesInput = ({control}: AttributesInputProps) => {
  const {fields, append, remove} = useFieldArray({
    control,
    name: 'Attributes',
  });

  const {errors} = useFormState({control, name: 'Attributes'});
  const error = errors.Attributes?.message;
  return (
    <FormField
      className=" flex flex-col gap-2 rounded bg-slate-500 p-4"
      error={error}>
      <div className="flex flex-row items-center gap-4">
        <p className="text-lg">{`Attributes`}</p>
        <Button
          onClick={e => {
            e.preventDefault();
            append({type: 'string', key: 'Nowa wartość', value: ''}, {});
          }}>
          {'Dodaj'}
        </Button>
      </div>

      {fields?.map((_, index) => (
        <AttributeInput
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          control={control}
          index={index}
          onRemove={index => {
            remove(index);
          }}
        />
      ))}
    </FormField>
  );
};

export default AttributesInput;
