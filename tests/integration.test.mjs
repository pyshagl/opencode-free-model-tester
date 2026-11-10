import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const fake=path.join(root,'tests','fixtures','fake-opencode.mjs');
const cli=path.join(root,'src','cli.mjs');
const options={cwd:root,encoding:'utf8',env:{...process.env,OPENCODE_BIN:fake}};

test('preview makes no requests and does not create report',()=>{
  const res=spawnSync(process.execPath,[cli,'--limit=4'],options);
  assert.equal(res.status,0,res.stderr);
  assert.match(res.stdout,/PREVIEW ONLY/);
  assert.match(res.stdout,/Candidates \/ Кандидатов: 3/);
  assert.doesNotMatch(res.stdout,/google\/gemini/);
});

test('run writes accurate verified, unverified, and quota statuses',()=>{
  const dir=mkdtempSync(path.join(os.tmpdir(),'tester-reports-'));
  try {
    const res=spawnSync(process.execPath,[cli,'--run','--yes','--limit=10',`--output=${dir}`],options);
    assert.equal(res.status,0,res.stderr);
    const json=readdirSync(dir).find(x=>x.endsWith('.json'));
    const report=JSON.parse(readFileSync(path.join(dir,json),'utf8'));
    assert.equal(report.tested,3);
    const byId=Object.fromEntries(report.rows.map(row=>[row.model,row.status]));
    assert.equal(byId['openrouter/cohere/north-mini-code:free'],'OK');
    assert.equal(byId['openrouter/openrouter/free'],'REPLY_UNVERIFIED');
    assert.equal(byId['opencode/beam-free'],'QUOTA');
    assert.equal(report.verified_ok,1);
  } finally {rmSync(dir,{recursive:true,force:true});}
});

test('invalid options and unconfirmed non-TTY runs are rejected',()=>{
  const res=spawnSync(process.execPath,[cli,'--run','--limit=3'],options);
  assert.equal(res.status,0);
  assert.match(res.stderr,/Non-interactive run/);
  const bad=spawnSync(process.execPath,[cli,'--only=abc;evil'],options);
  assert.equal(bad.status,1);
});
