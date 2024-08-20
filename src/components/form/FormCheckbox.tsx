'use client';

import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';

import Checkbox, {type CheckboxProps} from './Checkbox';

type FormCheckboxProps<T extends FieldValues> = UseControllerProps<T> &
  CheckboxProps;

const FormCheckbox = <T extends FieldValues>({
  field,
  ...props
}: FormCheckboxProps<T>) => {
  const {
    field: {onChange, value, onBlur},
    fieldState: {error},
  } = useController(props);

  return (
    <Checkbox
      field={{
        ...field,
        error: error?.message,
      }}
      onCheckedChange={value => {
        onChange(value === 'indeterminate' ? false : value);
      }}
      onBlur={onBlur}
      {...props}
      checked={value ?? false}
    />
  );
};

export default FormCheckbox;
