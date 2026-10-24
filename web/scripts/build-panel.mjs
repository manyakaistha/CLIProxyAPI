import { copyFile, mkdir } from 'node:fs/promises';

const output = new URL('../../static/', import.meta.url);
await mkdir(output, { recursive: true });
await copyFile(new URL('../dist/index.html', import.meta.url), new URL('management.html', output));
console.log('Custom management panel installed at static/management.html');
