const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const file = fs.readFileSync(__dirname+'/../dist/audio.js','utf8');
let contextCount=0, timers=new Map(), nextTimer=1, deferResume=false, resumeCallbacks=[];
class Param { constructor(){ this.value=0; } setValueAtTime(){} linearRampToValueAtTime(){} exponentialRampToValueAtTime(){} cancelScheduledValues(){} setTargetAtTime(){} }
class Node { constructor(){this.gain=new Param();this.frequency=new Param();} connect(){} disconnect(){} start(){} stop(){} }
class Context { constructor(){contextCount++;this.currentTime=0;this.state='suspended';this.destination={};} createGain(){return new Node();} createOscillator(){return new Node();} resume(){ if(deferResume)return new Promise(resolve=>resumeCallbacks.push(()=>{this.state='running';resolve();}));this.state='running';return Promise.resolve();} }
const window={AudioContext:Context,setInterval(fn){const id=nextTimer++;timers.set(id,fn);return id;},clearInterval(id){timers.delete(id);}};
vm.runInNewContext(file,{window,Set,Math,Number,Boolean,Object});
const a=window.GameAudio;
(async()=>{
  assert.equal(a.getDebug().volume,.22);
  await Promise.all([a.start(),a.start(),a.start()]);
  assert.equal(contextCount,1);assert.equal(a.getDebug().starts,1);assert.equal(timers.size,1);
  assert.ok(a.getDebug().activeVoices>0);
  a.setMuted(true);assert.equal(a.getDebug().muted,true);a.setMuted(false);
  a.setVolume(10);assert.equal(a.getDebug().volume,1);a.setVolume(-1);assert.equal(a.getDebug().volume,0);
  a.setVolume(.22);a.setVolume(NaN);assert.equal(a.getDebug().volume,.22);
  for(const s of ['step','slip','dress','dance','eat','win'])assert.equal(await a.sfx(s),true);
  assert.equal(await a.sfx('unknown'),false);
  a.stop();assert.equal(timers.size,0);assert.equal(a.getDebug().activeVoices,0);assert.equal(a.getDebug().playing,false);
  for(let n=0;n<5;n++){await a.start();await a.start();assert.equal(timers.size,1);a.stop();assert.equal(timers.size,0);}
  // Confirm a stop cancels start even if browser permission/resume resolves later.
  const other={...window,AudioContext:Context};deferResume=true;
  vm.runInNewContext(file,{window:other,Set,Math,Number,Boolean,Object});
  const pending=other.GameAudio.start();other.GameAudio.stop();resumeCallbacks.forEach(f=>f());
  assert.equal(await pending,false);assert.equal(other.GameAudio.getDebug().playing,false);assert.equal(timers.size,0);
  const score=JSON.parse(file.match(/const SCORE = (.*);/)[1]);
  const mid=fs.readFileSync(__dirname+'/../dist/musik-tari.mid');
  assert.equal(mid.toString('ascii',0,4),'MThd');assert.equal(mid.readUInt16BE(8),0);assert.equal(mid.readUInt16BE(10),1);assert.equal(mid.readUInt16BE(12),480);
  assert.equal(mid.readUInt32BE(18),mid.length-22);
  let i=22,tick=0,noteOns=[],active=new Map(),end=0;
  function vlq(){let n=0,b;do{b=mid[i++];n=(n<<7)+(b&127);}while(b&128);return n;}
  while(i<mid.length){tick+=vlq();const status=mid[i++];if(status===255){const type=mid[i++],len=vlq();if(type===47)end=tick;i+=len;}else{const kind=status&240,channel=status&15,pitch=mid[i++];if(kind===192)continue;const velocity=mid[i++],key=channel+':'+pitch;if(kind===144){noteOns.push([tick,pitch,channel]);assert.ok(!active.has(key));active.set(key,tick);}else if(kind===128){assert.ok(active.has(key));active.delete(key);}}}
  assert.equal(active.size,0);assert.equal(end,score.beats*480);assert.equal(noteOns.length,score.notes.length);
  assert.deepEqual(noteOns,score.notes.map(n=>[Math.round(n[0]*480),n[2],n[3]]));
  console.log('PASS: JS syntax, default volume, shared context, concurrent/idempotent start, all 6 SFX, mute/volume bounds, stop cleanup, 5 restarts without music stacking, pending-resume cancellation. MIDI: header/track length, all 91 exact note-on events, balanced note-off, 32-beat ending.');
})().catch(e=>{console.error(e);process.exitCode=1;});
