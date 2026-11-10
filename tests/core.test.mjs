import test from 'node:test';
import assert from 'node:assert/strict';
import { isFreeNamed, discoverModels, parseEvents, classifyRun, safeText, toCsv, MARKER } from '../src/core.mjs';
const result=(stdout,stderr='',code=0)=>({stdout,stderr,code,ms:1500,timedOut:false});
const events=(model,text=MARKER)=> [JSON.stringify({type:'step_start',part:{providerID:'openrouter',modelID:model}}),JSON.stringify({type:'text',part:{text}})].join('\n');

test('safe default free patterns do not accept paid, Google, or Teamorouter without manual approval',()=>{
  assert.equal(isFreeNamed('openrouter/google/gemma:free'),true);
  assert.equal(isFreeNamed('opencode/deepseek-free'),true);
  assert.equal(isFreeNamed('openrouter/openrouter/free'),true);
  assert.equal(isFreeNamed('teamorouter/deepseek-v4-flash-free'),false);
  assert.equal(isFreeNamed('google/gemini-3.5-flash-lite'),false);
  assert.equal(isFreeNamed('openrouter/some-paid-model'),false);
});

test('candidate allowlist, exclusions, exact only, and limit',()=>{
  const src='openrouter/b:free\nopenrouter/a:free\nopenrouter/pay\ngoogle/gemini\nteamorouter/a-free\ninvalid';
  assert.deepEqual(discoverModels(src,{approved:['google/gemini'],exclude:['teamorouter'],limit:3}),['google/gemini','openrouter/a:free','openrouter/b:free']);
  assert.deepEqual(discoverModels(src,{approved:['google/gemini'],only:['openrouter/b:free']}),['openrouter/b:free']);
});

test('verified reply requires exact matching model attribution',()=>{
  assert.equal(classifyRun(result(events('cohere/north-mini-code:free')),'openrouter/cohere/north-mini-code:free').status,'OK');
  assert.equal(classifyRun(result(events('unrelated:free')),'openrouter/cohere/north-mini-code:free').status,'MODEL_MISMATCH');
  assert.equal(classifyRun(result(JSON.stringify({type:'text',part:{text:MARKER}})),'openrouter/free').status,'REPLY_UNVERIFIED');
});

test('error classification (quota, region, auth, billing, unavailable, timeout)',()=>{
  assert.equal(classifyRun(result(JSON.stringify({type:'error',error:{status:429,message:'rate limit'}}),'',1),'openrouter/free').status,'QUOTA');
  assert.equal(classifyRun(result('', 'not available in your region',1),'openrouter/free').status,'REGION');
  assert.equal(classifyRun(result('','invalid api key',1),'openrouter/free').status,'AUTH');
  assert.equal(classifyRun(result('','insufficient balance',1),'openrouter/free').status,'BILLING');
  assert.equal(classifyRun(result('','model no longer available',1),'openrouter/free').status,'MODEL_UNAVAILABLE');
  assert.equal(classifyRun({...result(''),timedOut:true},'openrouter/free').status,'TIMEOUT');
});

test('secrets redacted and CSV spreadsheet formula neutralized',()=>{
  assert.match(safeText('Authorization: Bearer sk-abcdefghijklmno'),/REDACTED/);
  assert.doesNotMatch(safeText('AIza123456789123456789'),/AIza/);
  assert.match(toCsv([{model:'=2+2',status:'OK',seconds:1,actual_model:'',detail:'a"b'}]),/"'=2\+2"/);
  assert.match(toCsv([{model:'safe',status:'OK',seconds:1,actual_model:'',detail:'a"b'}]),/"a""b"/);
});
