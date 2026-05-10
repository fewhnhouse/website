import { Slider as SliderPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/cn'

function Slider({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn('relative flex w-full touch-none select-none items-center', className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full border border-os-border bg-white/64">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-lagoon" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-5 rounded-full border border-os-border-strong bg-white shadow-chip outline-none transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-lagoon/35 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
}

export { Slider }
