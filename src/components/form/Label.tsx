'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import {cva, type VariantProps} from 'class-variance-authority';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ElementRef,
} from 'react';

import {cn} from '@utils/cn';

const labelVariants = cva('block', {
  variants: {
    variant: {
      checkbox: 'text-c1 font-medium',
      default: 'mb-3 text-body text-gray-dark',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type LabelProps = ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>;

const Label = forwardRef<ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({className, variant, ...props}, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants({variant}), className)}
      {...props}
    />
  ),
);

export default Label;
