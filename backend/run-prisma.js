import { spawnSync } from 'child_process';
import path from 'path';

const prismaPath = path.resolve('node_modules/.bin/prisma.cmd');
const schemaPath = path.resolve('prisma/schema.prisma');

console.log('Running Prisma generate directly via spawnSync...');
const result = spawnSync(prismaPath, ['generate', '--schema=' + schemaPath], {
  stdio: 'inherit',
  shell: false
});

if (result.status === 0) {
  console.log('✅ Prisma generate SUCCESSFUL!');
} else {
  console.error('❌ Prisma generate FAILED with status:', result.status);
}
