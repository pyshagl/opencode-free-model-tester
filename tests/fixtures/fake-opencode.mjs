#!/usr/bin/env node
const argv = process.argv.slice(2);
if(argv[0] === 'models') {
  console.log(['opencode/beam-free','openrouter/cohere/north-mini-code:free','openrouter/openrouter/free','google/gemini-3.5-flash-lite','openrouter/paid-model','teamorouter/deepseek-free'].join('\n'));
  process.exit(0);
}
if(argv[0] === 'run') {
  const model=argv[argv.indexOf('--model')+1];
  if(model==='openrouter/cohere/north-mini-code:free') {
    console.log(JSON.stringify({type:'step_start',part:{providerID:'openrouter',modelID:'cohere/north-mini-code:free'}}));
    console.log(JSON.stringify({type:'text',part:{text:'MODEL_CHECK_OK_741'}}));
  } else if(model==='opencode/beam-free') {
    console.log(JSON.stringify({type:'error',error:{status:429,message:'Free usage limit reached'}}));
    process.exitCode=1;
  } else if(model==='openrouter/openrouter/free') {
    console.log(JSON.stringify({type:'text',part:{text:'MODEL_CHECK_OK_741'}}));
  } else {
    console.log(JSON.stringify({type:'error',error:{status:403,message:'not available in your region'}}));
    process.exitCode=1;
  }
  process.exit();
}
console.error('Unsupported fake command');process.exit(2);
