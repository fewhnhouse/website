import '@tanstack/react-start/client-only'

type LocalMdxEditorProps = {
  markdown: string
  onChange: (markdown: string) => void
  readOnly: boolean
}

export function LocalMdxEditor({ markdown, onChange, readOnly }: LocalMdxEditorProps) {
  return (
    <textarea
      aria-label="Editable MDX source"
      className="felix-mdx-source-editor"
      onChange={(event) => onChange(event.currentTarget.value)}
      readOnly={readOnly}
      spellCheck
      value={markdown}
    />
  )
}
