import '@tanstack/react-start/client-only'

export async function loadLocalMdxEditor() {
  await import('./prism.client')

  const module = await import('./MdxEditor.client')

  return { default: module.LocalMdxEditor }
}
