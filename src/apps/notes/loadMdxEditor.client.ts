import '@tanstack/react-start/client-only'

export async function loadLocalMdxEditor() {
  const module = await import('./MdxEditor.client')

  return { default: module.LocalMdxEditor }
}
