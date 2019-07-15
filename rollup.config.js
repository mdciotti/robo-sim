import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';

export default {
  input: 'src/robosim.ts',
  output: {
    file: 'dist/robosim.bundle.js',
    format: 'esm'
  },
  plugins: [ typescript(), resolve() ]
};
