import { Menubar as MenubarPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/cn'

// Pixel-mode menubar — same chrome as ContextMenu but anchored to a top
// trigger, used by the desktop's top-bar File / View menus.

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  )
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        'cursor-pointer appearance-none whitespace-nowrap border-0 bg-transparent font-display text-[0.72rem] font-normal uppercase tracking-[0.08em] text-ink outline-none transition-colors hover:text-lagoon-deep data-[state=open]:text-lagoon-deep',
        className,
      )}
      {...props}
    />
  )
}

function MenubarContent({
  align = 'start',
  alignOffset = -2,
  className,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          'z-[2147483647] min-w-56 overflow-hidden border-2 border-ink bg-foam p-1 text-window text-ink shadow-window',
          'data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1',
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
}

function MenubarItem({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item>) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      className={cn(
        'relative flex min-h-8 cursor-default select-none items-center gap-2 px-2.5 py-1.5 font-display text-[0.72rem] font-normal uppercase tracking-[0.06em] text-ink outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-lagoon data-[highlighted]:text-ink',
        className,
      )}
      {...props}
    />
  )
}

function MenubarShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        'ml-auto font-mono text-[0.62rem] font-bold tracking-normal text-ink-soft group-data-[highlighted]:text-ink',
        className,
      )}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn('-mx-1 my-1 h-px bg-ink/20', className)}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
}
