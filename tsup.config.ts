import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'lpp',
  entry: ['src/index.ts'],
  target: ['esnext'],
  format: ['iife'],
  outDir: 'dist',
  banner: {
    js: '/// Copyright (c) FurryR 2023. This project is licensed under the MIT license.\n/// Original repository: https://github.com/FurryR/lpp-scratch\n'
  },
  platform: 'browser',
  clean: true
})
