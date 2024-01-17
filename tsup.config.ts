import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'secure-vm',
  entry: ['src/index.ts'],
  dts: false,
  target: ['esnext'],
  format: ['iife'],
  outDir: 'dist',
  banner: {
    js: '/// Copyright (c) FurryR 2023. This project is licensed under the MIT license.\n/// Original repository: https://github.com/FurryR/lpp-scratch\n'
  },
  sourcemap: false,
  minify: true,
  clean: true
})
