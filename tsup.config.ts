import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'lpp',
  target: ['esnext'],
  format: ['iife'],
  outDir: 'dist',
  banner: {
    js: `// Name: lpp Beta
// ID: lpp
// Description: A high-level programming language based on Scratch.
// By: FurryR <https://scratch.mit.edu/users/FurryR/>
// License: LGPL-3.0`
  },
  platform: 'browser',
  clean: true,
  loader: {
    '.svg': 'text'
  }
})
