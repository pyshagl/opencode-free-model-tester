import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Generates dependency-free, OS-specific source bundles without including secrets.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const os = (process.argv[2] || process.platform).toLowerCase();
const platform = os.startsWith('win') ? 'windows' : os.startsWith('darwin') || os === 'macos' ? 'macos' : os.startsWith('linux') ? 'linux' : '';
if (!platform) throw Error('Unknown target OS: ' + os);
const target = path.join(root, 'dist', `opencode-free-model-tester-${platform}`);
await rm(target, { recursive:true, force:true });
await mkdir(target, { recursive:true });
for (const file of ['src','config','README.md','README.ru.md','package.json','LICENSE','docs','CHANGELOG.md','CHANGELOG.ru.md']) {
  const { access } = await import('node:fs/promises');
  try { await access(path.join(root,file)); await cp(path.join(root,file),path.join(target,file),{recursive:true}); } catch(e) { if(e.code !== 'ENOENT') throw e; }
}
await cp(path.join(root,'launchers',platform), path.join(target,'launchers',platform), {recursive:true});
console.log(target);
