import {type ReactElement} from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';

import Input, {type InputProps} from './Input';

export type FormInputProps<T extends FieldValues> = UseControllerProps<T> &
  InputProps;

const FormInput = <T extends FieldValues>({
  field,
  ...props
}: FormInputProps<T>): ReactElement => {
  const {
    field: input,
    fieldState: {error},
  } = useController(props);

  return (
    <Input
      field={{
        ...field,
        error: error?.message,
      }}
      {...input}
      value={input.value ?? ''}
      {...props}
      onBlur={e => {
        input.onBlur();
        props?.onBlur?.(e);
      }}
      onChange={e => {
        input.onChange(
          props.type === 'number' ? e.target.valueAsNumber : e.target.value,
        );
        props?.onChange?.(e);
      }}
    />
  );
};

export default FormInput;
