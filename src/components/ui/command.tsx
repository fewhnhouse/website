import { Command as CommandPrimitive } from 'cmdk'
import * as React from 'react'

import { cn } from '@/lib/cn'

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn('flex h-full w-full flex-col overflow-hidden', className)}
      {...props}
    />
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <CommandPrimitive.Input
      data-slot="command-input"
      className={cn(
        'h-11 min-w-0 flex-1 border-0 bg-transparent p-0 font-[inherit] text-[0.98rem] font-extrabold text-os-ink outline-none placeholder:text-os-ink-soft disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn('max-h-[min(420px,58svh)] overflow-y-auto overflow-x-hidden p-2', className)}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(
        'grid min-h-[8rem] place-items-center px-4 text-center text-window font-extrabold text-os-ink-soft',
        className,
      )}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'space-y-1 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[0.66rem] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-os-ink-soft',
        className,
      )}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'grid cursor-pointer select-none grid-cols-[2.45rem_1fr_auto] items-center gap-3 rounded-card border border-transparent bg-transparent px-2.5 py-2.5 text-left font-[inherit] outline-none transition data-[disabled=true]:pointer-events-none data-[selected=true]:border-os-border-strong data-[selected=true]:bg-white/82 data-[selected=true]:shadow-chip data-[disabled=true]:opacity-50 data-[selected=false]:hover:border-os-border data-[selected=false]:hover:bg-white/58',
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('-mx-1 my-1 h-px bg-os-border', className)}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        'flex items-center gap-1 rounded-[6px] border border-os-border bg-white/72 px-1.5 py-1 text-[0.62rem] font-black text-os-ink-soft opacity-0 transition-opacity group-data-[selected=true]:opacity-100',
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
}
