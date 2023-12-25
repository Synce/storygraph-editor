import {type ReactElement} from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './../ui/Select';

import FormField, {type FormFieldProps} from './FormField';

type FormSelectOption<T extends string> = {
  value: T;
  label: string;
};

type FormSelectProps<
  T extends FieldValues,
  V extends string,
> = UseControllerProps<T> & {
  field?: Omit<FormFieldProps, 'children'>;
  options: FormSelectOption<V>[];
};

const FormSelect = <T extends FieldValues, V extends string>({
  field,
  options,
  ...props
}: FormSelectProps<T, V>): ReactElement => {
  const {
    field: input,
    fieldState: {error},
  } = useController(props);

  return (
    <FormField {...field} error={error?.message}>
      <Select onValueChange={input.onChange} defaultValue={input.value}>
        <SelectTrigger className="text-body  box-border rounded-lg bg-white px-4 py-3">
          <SelectValue placeholder={'Pusto'} />
        </SelectTrigger>
        <SelectContent>
          {options.map(({value, label}) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
};

export default FormSelect;
