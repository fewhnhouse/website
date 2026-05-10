import '@tanstack/react-start/client-only'

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  MDXEditor,
  type MDXEditorMethods,
  UndoRedo,
  headingsPlugin,
  imagePlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { useEffect, useMemo, useRef } from 'react'

type LocalMdxEditorProps = {
  markdown: string
  onChange: (markdown: string) => void
  readOnly: boolean
}

export function LocalMdxEditor({ markdown, onChange, readOnly }: LocalMdxEditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null)
  const latestMarkdownRef = useRef(markdown)
  const plugins = useMemo(
    () => {
      const basePlugins = [
        headingsPlugin(),
        imagePlugin({
          imageUploadHandler: async (image) => URL.createObjectURL(image),
        }),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
      ]

      if (readOnly) return basePlugins

      return [
        ...basePlugins,
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
            </>
          ),
        }),
        markdownShortcutPlugin(),
      ]
    },
    [readOnly],
  )

  useEffect(() => {
    if (markdown === latestMarkdownRef.current) return

    latestMarkdownRef.current = markdown
    editorRef.current?.setMarkdown(markdown)
  }, [markdown])

  return (
    <MDXEditor
      ref={editorRef}
      className={`felix-mdx-editor ${
        readOnly ? 'felix-mdx-editor--preview' : 'felix-mdx-editor--edit'
      }`}
      contentEditableClassName="felix-mdx-content"
      markdown={markdown}
      onChange={(nextMarkdown, initialNormalize) => {
        if (initialNormalize) return

        latestMarkdownRef.current = nextMarkdown
        onChange(nextMarkdown)
      }}
      plugins={plugins}
      readOnly={readOnly}
      spellCheck
      trim
    />
  )
}
