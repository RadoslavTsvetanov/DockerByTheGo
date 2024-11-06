import { build } from 'bun';

async function buildLambda() {
  const result = await build({
    entrypoints: ['./src/index.ts'],
    outdir: './out',
    target: 'node',
    external: [
      'pg',
      'tls',
      'dns',
      'crypto',
      'net',
    ],
    minify: true,
    sourcemap: 'external',
  });

  if (result.success) {
    console.log('Build successful');
  } else {
    console.error('Build failed', result);
    process.exit(1);
  }
}

buildLambda();