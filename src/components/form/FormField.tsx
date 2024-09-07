import {type ReactNode} from 'react';

import {cn} from '@utils/cn';

import Label from './Label';

export type FormFieldProps = {
  error?: string;
  children?: ReactNode | ReactNode[];
  className?: string;
  label?: string;
};

const FormField = ({error, children, className, label}: FormFieldProps) => {
  return (
    <div className={cn('my-2', className)}>
      {!!label && <Label>{label}</Label>}
      {children}
      {!!error && (
        <p className="text-c2 text-error mt-1 border border-black/5 bg-red-500 p-2.5 font-semibold">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
