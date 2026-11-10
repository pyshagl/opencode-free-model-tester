#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { MARKER, PROMPT, ID_PATTERN, discoverModels, classifyRun, safeText, toCsv } from './core.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const USAGE = `OpenCode Free Model Tester / Тестер бесплатных моделей OpenCode

Usage: node src/cli.mjs [options]
  (default)          List candidates without API requests
  --run              Send a minimal prompt to each candidate (asks for YES)
  --yes              Skip confirmation (for automated runs; use carefully)
  --only=id,id       Test only these candidate IDs
  --exclude=p,p      Exclude provider IDs, e.g. teamorouter,orcarouter
  --limit=N          Maximum candidates (1..200, default 20)
  --timeout=N        Timeout per request in seconds (10..300, default 90)
  --output=DIR       Directory for CSV and JSON reports
  --help             Display this help

Candidate filtering matches explicitly free-named opencode/openrouter models
plus IDs manually approved in config/approved-models.json. Labels are NOT
price guarantees. No billing API is queried. Never run on unknown paid models.
`;

function parseOptions(argv) {
  const opts = {run:false,yes:false,only:[],exclude:[],limit:20,timeout:90,output:path.join(ROOT,'reports'),help:false};
  for (const arg of argv) {
    if (arg==='--run') opts.run=true;
    else if (arg==='--yes') opts.yes=true;
    else if (arg==='--help' || arg==='-h') opts.help=true;
    else if (arg.startsWith('--only=')) opts.only=arg.slice(7).split(',').map(s=>s.toLowerCase().trim()).filter(Boolean);
    else if (arg.startsWith('--exclude=')) opts.exclude=arg.slice(10).split(',').map(s=>s.toLowerCase().trim()).filter(Boolean);
    else if (arg.startsWith('--limit=')) opts.limit=Number(arg.slice(8));
    else if (arg.startsWith('--timeout=')) opts.timeout=Number(arg.slice(10));
    else if (arg.startsWith('--output=')) opts.output=path.resolve(arg.slice(9));
    else throw new Error('Unknown option / Неизвестный аргумент: '+arg);
  }
  if (!Number.isInteger(opts.limit) || opts.limit<1 || opts.limit>200) throw new Error('--limit must be 1..200');
  if (!Number.isInteger(opts.timeout) || opts.timeout<10 || opts.timeout>300) throw new Error('--timeout must be 10..300');
  if (opts.only.some(id=>!ID_PATTERN.test(id))) throw new Error('Invalid model ID in --only');
  if (opts.exclude.some(s=>!/^[a-z0-9_-]+$/.test(s))) throw new Error('Invalid provider ID in --exclude');
  return opts;
}

// Windows npm may install an opencode.cmd shim. Direct .exe and Unix binaries
// are launched without a shell; .cmd files require the Windows command processor.
function commandFor(args) {
  const binary = process.env.OPENCODE_BIN || 'opencode';
  if (process.platform==='win32' && !/\.exe$/i.test(binary)) {
    const quote = s => '"'+String(s).replace(/"/g,'""')+'"';
    const command = '"'+[binary,...args].map(quote).join(' ')+'"';
    return {file:process.env.ComSpec || 'cmd.exe', args:['/d','/s','/c',command]};
  }
  return {file:binary,args};
}

function execute(args,{cwd,timeoutMs=120000}={}) {
  return new Promise((resolve,reject)=>{
    const started=Date.now();
    const {file,args:callArgs}=commandFor(args);
    const env={...process.env,
      OPENCODE_PURE:'1', OPENCODE_DISABLE_AUTOUPDATE:'1',
      // V2: disable plugins and all tools in the isolated test process only.
      OPENCODE_CONFIG_CONTENT:JSON.stringify({plugins:['-*'],permissions:[{action:'*',resource:'*',effect:'deny'}]})
    };
    const child=spawn(file,callArgs,{cwd,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
    let stdout='',stderr='',timedOut=false,closed=false;
    const cap=(s,chunk,max)=> (s+chunk.toString('utf8')).slice(-max);
    child.stdout.on('data',s=>{stdout=cap(stdout,s,4_000_000);});
    child.stderr.on('data',s=>{stderr=cap(stderr,s,150_000);});
    const timer=setTimeout(()=>{timedOut=true;child.kill('SIGTERM');},timeoutMs);
    child.once('error',e=>{if(!closed){closed=true;clearTimeout(timer);reject(e);}});
    child.once('close',code=>{if(!closed){closed=true;clearTimeout(timer);resolve({code,stdout,stderr,ms:Date.now()-started,timedOut});}});
  });
}

async function loadApproved() {
  const file=path.join(ROOT,'config','approved-models.json');
  const data=JSON.parse(await readFile(file,'utf8'));
  if (!Array.isArray(data.models) || data.models.some(m=>typeof m!=='string'||!ID_PATTERN.test(m))) throw new Error('Invalid config/approved-models.json: models must contain model IDs');
  return data.models.map(m=>m.toLowerCase());
}

async function confirm() {
  if (!process.stdin.isTTY) {console.error('Non-interactive run: pass --yes explicitly / Для автоматического режима явно укажите --yes'); return false;}
  const rl=readline.createInterface({input:process.stdin,output:process.stdout});
  try {return (await rl.question('Type YES to send API requests / Введите YES для тестов: ')).trim()==='YES';}
  finally {rl.close();}
}

async function main() {
  const opts=parseOptions(process.argv.slice(2));
  if(opts.help){console.log(USAGE);return;}
  const approved=await loadApproved();
  let list;
  try {list=await execute(['models'],{cwd:ROOT,timeoutMs:60000});}
  catch(e){throw new Error('OpenCode CLI not found or cannot start. Install the CLI and run `opencode models`. '+e.message);}
  if (list.code!==0 || list.timedOut) throw new Error('Cannot list models: '+safeText(list.stderr || list.stdout));
  const candidates=discoverModels(list.stdout,{approved,only:opts.only,exclude:opts.exclude,limit:opts.limit});
  console.log(`Candidates / Кандидатов: ${candidates.length}`);
  candidates.forEach((m,i)=>console.log(`${String(i+1).padStart(2)}. ${m}${approved.includes(m)?' [MANUALLY APPROVED]':''}`));
  if(!opts.run){console.log('\nPREVIEW ONLY / Только просмотр — API requests: 0'); console.log('Run with --run to test. Free labels do not guarantee zero billing.');return;}
  if(!candidates.length){console.log('Nothing to test / Нет моделей для проверки.');return;}
  console.log('\nWARNING / ВНИМАНИЕ: model requests use provider quota and may incur charges if billing is enabled.');
  console.log('Tests run sequentially in a temporary directory; plugins/tools are disabled on a best-effort basis.');
  if (!opts.yes && !await confirm()) {console.log('Cancelled / Отменено.');return;}
  const workdir=await mkdtemp(path.join(os.tmpdir(),'opencode-free-tester-'));
  const rows=[];
  try {
    for(let i=0;i<candidates.length;i++){
      const id=candidates[i];
      process.stdout.write(`[${i+1}/${candidates.length}] ${id} ... `);
      let row;
      try {
        const result=await execute(['run','--standalone','--archived','--model',id,'--format','json',PROMPT],{cwd:workdir,timeoutMs:opts.timeout*1000});
        row=classifyRun(result,id);
      } catch(e){row={model:id,status:'ERROR',seconds:0,actual_model:'',detail:safeText(e.message)};}
      rows.push(row);
      console.log(`${row.status} (${row.seconds}s)${row.detail?' / '+row.detail.slice(0,100):''}`);
    }
  } finally {await rm(workdir,{recursive:true,force:true});}
  await mkdir(opts.output,{recursive:true});
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const csvPath=path.join(opts.output,`results-${stamp}.csv`);
  const jsonPath=path.join(opts.output,`results-${stamp}.json`);
  await writeFile(csvPath,toCsv(rows),'utf8');
  await writeFile(jsonPath,JSON.stringify({schema_version:1,tool_version:'0.1.0',created_at:new Date().toISOString(),tested:rows.length,verified_ok:rows.filter(r=>r.status==='OK').length,reply_unverified:rows.filter(r=>r.status==='REPLY_UNVERIFIED').length,rows},null,2)+'\n','utf8');
  console.log('\nCSV: '+csvPath+'\nJSON: '+jsonPath);
  console.log(`Verified OK: ${rows.filter(r=>r.status==='OK').length}/${rows.length}; replies without verified model identity: ${rows.filter(r=>r.status==='REPLY_UNVERIFIED').length}`);
  console.log('One short answer does NOT prove sustained availability, price, or coding quality.');
  console.log('Temporary files were removed. OpenCode may retain archived sessions.');
}

main().catch(e=>{console.error('ERROR / ОШИБКА: '+safeText(e.message,600));process.exitCode=1;});
