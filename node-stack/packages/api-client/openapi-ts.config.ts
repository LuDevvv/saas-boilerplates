import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../../apps/api/openapi-spec.json',
  output: {
    path: 'src/generated',
    format: 'prettier',
    lint: 'eslint',
  },
  client: 'fetch',
  types: {
    dates: true,
  },
  services: {
    asClass: true,
    name: '{{name}}Service',
  },
});
