import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { openableDesktopEntries } from '@/desktop/apps'
import type { OpenableDesktopEntry } from '@/desktop/apps'
import type { AppId, NotesDocumentId } from '@/desktop/types'

type TerminalAppProps = {
  onOpenApp: (app: AppId, document?: NotesDocumentId) => void
}

type TranscriptLine = {
  id: number
  kind: 'command' | 'output' | 'error'
  text: string
}

const initialTranscript: TranscriptLine[] = [
  {
    id: 1,
    kind: 'output',
    text: 'FelixOS terminal. Type `help` for commands.',
  },
]

const terminalShellClass =
  'flex min-h-[17rem] flex-1 flex-col bg-[#071416] text-[#d7fff5] [max-height:calc(min(640px,calc(100svh_-_7.25rem))_-_42px)] [.os-window--maximized_&]:max-h-none'
const terminalBodyClass =
  'min-h-[12rem] flex-1 overflow-y-auto px-4 py-3 font-mono text-[0.84rem] leading-relaxed [scrollbar-color:rgba(141,229,219,0.38)_transparent] max-[720px]:min-h-[10rem] max-[720px]:px-3 max-[720px]:text-[0.78rem]'
const promptClass = 'text-[#8de5db]'
const openCommandPattern = /^open(?:\s+(\S*))?$/i

export function TerminalApp({ onOpenApp }: TerminalAppProps) {
  const [transcript, setTranscript] = useState(initialTranscript)
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const nextLineId = useRef(initialTranscript.length + 1)

  const entriesByName = useMemo(() => {
    const entries = new Map<string, OpenableDesktopEntry>()

    for (const entry of openableDesktopEntries) {
      entries.set(entry.name.toLowerCase(), entry)
      for (const alias of entry.aliases) entries.set(alias.toLowerCase(), entry)
    }

    return entries
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
    })
  }, [transcript])

  const appendLines = (lines: Omit<TranscriptLine, 'id'>[]) => {
    setTranscript((current) => [
      ...current,
      ...lines.map((line) => ({
        ...line,
        id: nextLineId.current++,
      })),
    ])
  }

  const runCommand = (rawCommand: string) => {
    const trimmedCommand = rawCommand.trim()

    if (!trimmedCommand) return

    setHistory((current) => [...current, trimmedCommand])
    setHistoryIndex(null)

    const [commandName = '', ...args] = trimmedCommand.split(/\s+/)
    const normalizedCommand = commandName.toLowerCase()

    if (normalizedCommand === 'clear') {
      setTranscript([])
      return
    }

    const output = executeCommand(normalizedCommand, args)
    appendLines([
      {
        kind: 'command',
        text: trimmedCommand,
      },
      ...output,
    ])
  }

  const executeCommand = (
    commandName: string,
    args: string[],
  ): Omit<TranscriptLine, 'id'>[] => {
    if (commandName === 'help') {
      return [
        {
          kind: 'output',
          text: 'Commands: help, ls, open <name>, pwd, whoami, clear',
        },
        {
          kind: 'output',
          text: `Openable names: ${openableDesktopEntries.map((entry) => entry.name).join(', ')}`,
        },
      ]
    }

    if (commandName === 'ls') {
      if (args.length > 0) {
        return [
          {
            kind: 'error',
            text: 'ls: this shell only lists ~/Desktop',
          },
        ]
      }

      return [
        {
          kind: 'output',
          text: openableDesktopEntries.map((entry) => entry.name).join('  '),
        },
      ]
    }

    if (commandName === 'pwd') {
      return [
        {
          kind: 'output',
          text: '~/Desktop',
        },
      ]
    }

    if (commandName === 'whoami') {
      return [
        {
          kind: 'output',
          text: 'felix',
        },
      ]
    }

    if (commandName === 'open') {
      const targetName = args.join(' ').toLowerCase()

      if (!targetName) {
        return [
          {
            kind: 'error',
            text: 'open: usage: open <name>',
          },
        ]
      }

      const entry = entriesByName.get(targetName)

      if (!entry) {
        return [
          {
            kind: 'error',
            text: `open: ${targetName}: no such desktop item`,
          },
        ]
      }

      onOpenApp(entry.app, entry.document)

      return [
        {
          kind: 'output',
          text: `Opening ${entry.name}...`,
        },
      ]
    }

    return [
      {
        kind: 'error',
        text: `${commandName}: command not found. Type \`help\`.`,
      },
    ]
  }

  const submitCommand = () => {
    runCommand(command)
    setCommand('')
  }

  const autocompleteOpenCommand = (rawCommand: string) => {
    const match = rawCommand.match(openCommandPattern)

    if (!match) return false

    const partialTarget = (match[1] ?? '').toLowerCase()
    const matches = openableDesktopEntries.filter(
      (entry) =>
        entry.name.toLowerCase().startsWith(partialTarget) ||
        entry.aliases.some((alias) => alias.toLowerCase().startsWith(partialTarget)),
    )

    if (matches.length === 1) {
      setCommand(`open ${matches[0]?.name ?? ''}`)
      setHistoryIndex(null)
      return true
    }

    appendLines([
      {
        kind: matches.length > 0 ? 'output' : 'error',
        text:
          matches.length > 0
            ? matches.map((entry) => entry.name).join('  ')
            : `open: no match for ${partialTarget}`,
      },
    ])
    return true
  }

  const showPreviousCommand = () => {
    if (!history.length) return

    const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
    setHistoryIndex(nextIndex)
    setCommand(history[nextIndex] ?? '')
  }

  const showNextCommand = () => {
    if (historyIndex === null) return

    const nextIndex = historyIndex + 1

    if (nextIndex >= history.length) {
      setHistoryIndex(null)
      setCommand('')
      return
    }

    setHistoryIndex(nextIndex)
    setCommand(history[nextIndex] ?? '')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      autocompleteOpenCommand(event.currentTarget.value)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      submitCommand()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      showPreviousCommand()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      showNextCommand()
    }
  }

  return (
    <section className={terminalShellClass} aria-label="FelixOS terminal">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0d2023] px-4 py-2.5 font-mono text-caption font-black text-[#9deee2]">
        <span>~/Desktop</span>
        <span className="text-[#7ca9a3]">restricted shell</span>
      </div>

      <div
        ref={scrollRef}
        className={terminalBodyClass}
        onClick={() => inputRef.current?.focus()}
        role="log"
        aria-live="polite"
      >
        {transcript.map((line) => (
          <p key={line.id} className="m-0 whitespace-pre-wrap break-words">
            {line.kind === 'command' ? <span className={promptClass}>felix@felixos </span> : null}
            {line.kind === 'command' ? <span className="text-[#6ec89a]">$ </span> : null}
            <span
              className={
                line.kind === 'error'
                  ? 'text-[#ffb199]'
                  : line.kind === 'command'
                    ? 'text-[#f4fff9]'
                    : 'text-[#d7fff5]'
              }
            >
              {line.text}
            </span>
          </p>
        ))}

        <label className="mt-1 flex min-w-0 items-center gap-2">
          <span className={`${promptClass} shrink-0`}>felix@felixos</span>
          <span className="shrink-0 text-[#6ec89a]">$</span>
          <input
            ref={inputRef}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[inherit] text-[#f4fff9] caret-[#8de5db] outline-none"
            value={command}
            onChange={(event) => {
              setCommand(event.target.value)
              setHistoryIndex(null)
            }}
            onKeyDown={handleKeyDown}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Terminal command"
          />
        </label>
      </div>
    </section>
  )
}
