import {type ReactNode} from 'react';

import FormErrorMessage from './FormErrorMessage';
import Label from './Label';
import {cn} from '@utils/cn';

export type FormFieldProps = {
  error?: string;
  children?: ReactNode | ReactNode[];
  className?: string;
  disableError?: boolean;
  label?: string;
};

const FormField = ({
  error,
  children,
  className,
  disableError = false,
  label,
}: FormFieldProps) => {
  return (
    <div className={cn('my-2', className)}>
      {!!label && <Label>{label}</Label>}
      {children}
      {!disableError && !!error && <FormErrorMessage error={error} />}
    </div>
  );
};

export default FormField;
