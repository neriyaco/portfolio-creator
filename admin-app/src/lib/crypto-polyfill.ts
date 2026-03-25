// crypto.randomUUID is only available in secure contexts (HTTPS / localhost).
// When developing over plain HTTP, polyfill it with a Math.random()-based UUID v4.
if (typeof crypto.randomUUID !== 'function') {
  ;(crypto as any).randomUUID = (): string =>
    '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
      const n = Number(c)
      return (n ^ ((Math.random() * 16) >> (n / 4))).toString(16)
    })
}
