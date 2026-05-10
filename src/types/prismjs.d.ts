declare module 'prismjs' {
  const Prism: {
    languages: Record<string, unknown>
    tokenize: (code: string, grammar: unknown) => Array<string | unknown>
    Token: new (...args: Array<unknown>) => unknown
  }

  export default Prism
}
