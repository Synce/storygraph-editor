'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
  type ElementRef,
} from 'react';
import {FaCheck} from 'react-icons/fa';

import {cn} from '@utils/cn';

import FormField, {type FormFieldProps} from './FormField';

export type CheckboxProps = ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> & {
  field?: Omit<FormFieldProps, 'children'>;
  containerClassName?: string;
  rightElement?: ReactNode;
  leftElement?: ReactNode;
};

const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    {className, containerClassName, field, rightElement, leftElement, ...props},
    ref,
  ) => (
    <FormField {...field}>
      <div
        className={cn(
          'relative flex w-full items-center gap-2',
          containerClassName,
        )}>
        {leftElement}

        <CheckboxPrimitive.Root
          ref={ref}
          className={cn(
            'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
            className,
          )}
          {...props}>
          <CheckboxPrimitive.Indicator
            className={cn('flex items-center justify-center text-current')}>
            <FaCheck className="h-2 w-2 text-white" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {rightElement}
      </div>
    </FormField>
  ),
);

export default Checkbox;
