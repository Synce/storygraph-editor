import {type InputHTMLAttributes, type ReactNode, forwardRef} from 'react';

import {cn} from '@utils/cn';

import FormField, {type FormFieldProps} from './FormField';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  containerClassName?: string;
  rightElement?: ReactNode;
  leftElement?: ReactNode;
  field?: Omit<FormFieldProps, 'children'>;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      containerClassName,
      rightElement,
      leftElement,
      field,
      ...props
    },
    ref,
  ) => {
    return (
      <FormField {...field}>
        <div className={cn('relative w-full', containerClassName)}>
          {leftElement}
          <input
            type={type}
            className={cn(
              'text-body box-border flex w-full  rounded-lg bg-white px-4  py-3 text-black caret-primary focus-visible:outline-none focus-visible:ring-1  focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-50',
              rightElement ? 'pr-10' : '',
              className,
            )}
            ref={ref}
            {...props}
          />
          {rightElement}
        </div>
      </FormField>
    );
  },
);

export default Input;
