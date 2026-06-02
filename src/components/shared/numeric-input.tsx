'use client';

import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';

/**
 * A clean numeric text field: no spinner, no accidental scroll-to-change, and a
 * decimal keypad on mobile. Values are plain strings (parsed server-side), so it
 * drops straight into React Hook Form via {...register('field')}.
 */
export const NumericInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(function NumericInput(props, ref) {
  return (
    <Input
      autoComplete="off"
      {...props}
      ref={ref}
      type="text"
      inputMode="decimal"
      onWheel={(e) => e.currentTarget.blur()}
    />
  );
});
