// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/main.min.js',
    format: 'iife',
    name: 'Vampires13thHour'
  },
  plugins: [
    resolve(),
    terser(),
    copy({
      targets: [
        { src: 'src/index.html', dest: 'dist', transform: (contents) => contents.toString().replace('main.js', 'main.min.js') }
      ]
    })
  ]
};