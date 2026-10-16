/* Supplemental deterministic test of the shipped game source.
   Uses the actual vendored THREE geometry/math, a fake GPU/DOM, and real input handlers. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=__dirname+'/../dist/';
let now=0,nextFrame=null,renderCount=0,dressed=false;
class Element {
  constructor(id){this.id=id;this.listeners={};this.attributes={};this.textContent='';this.disabled=false;this.dataset={};this.classes=new Set();this.classList={add:(...c)=>c.forEach(x=>this.classes.add(x)),remove:(...c)=>c.forEach(x=>this.classes.delete(x)),toggle:(c,on)=>{if(on===undefined)on=!this.classes.has(c);if(on)this.classes.add(c);else this.classes.delete(c);return on;},contains:c=>this.classes.has(c)};}
  addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
  setAttribute(k,v){this.attributes[k]=v;}
  setPointerCapture(){}
  getContext(){return {fillText(){},clearRect(){},fillRect(){}};}
}
const els=new Map(),docEvents={},winEvents={};
const get=id=>{if(!els.has(id))els.set(id,new Element(id));return els.get(id);};
const dirs=['up','down','left','right'].map(d=>{const e=new Element('dir-'+d);e.dataset.dir=d;return e;});
const steps=[new Element('step1'),new Element('step2'),new Element('step3')];
const document={getElementById:get,createElement:tag=>new Element(tag),querySelectorAll:s=>s==='.dir'?dirs:s==='.step'?steps:[],addEventListener:(n,f)=>(docEvents[n]??=[]).push(f),hidden:false,fullscreenElement:null,documentElement:{requestFullscreen:async()=>{}},exitFullscreen:async()=>{}};
const audio={playing:false,starts:0,stops:0,effects:[],volume:.22,muted:false,start(){if(!this.playing)this.starts++;this.playing=true;return Promise.resolve(true);},stop(){this.stops++;this.playing=false;},sfx(n){this.effects.push(n);},setMuted(v){this.muted=v;},setVolume(v){this.volume=v;},getDebug(){return {playing:this.playing,starts:this.starts,stops:this.stops};}};
const ctx={console,document,devicePixelRatio:1,innerWidth:1280,innerHeight:800,performance:{now:()=>now},requestAnimationFrame:cb=>nextFrame=cb,GameAudio:audio,HTMLInputElement:class{},addEventListener:(n,f)=>(winEvents[n]??=[]).push(f)};
ctx.window=ctx;ctx.self=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(dir+'vendor/three.min.js','utf8'),ctx,{filename:'three.min.js'});
const THREE=ctx.THREE;
THREE.WebGLRenderer=class {constructor(){this.shadowMap={};}setPixelRatio(){}setSize(){}render(){renderCount++;}getContext(){return {VERSION:1,getParameter:()=> 'TEST GPU STUB'};}};
const characterFile=fs.existsSync(dir+'characters.js')?'characters.js':fs.existsSync(dir+'character.js')?'character.js':null;
if(characterFile)vm.runInContext(fs.readFileSync(dir+characterFile,'utf8'),ctx,{filename:characterFile});
else{
  function actor(){const g=new THREE.Group();g.userData.parts={};for(const n of ['leftArm','rightArm','leftLeg','rightLeg','head']){g.userData.parts[n]=new THREE.Group();g.add(g.userData.parts[n]);}g.userData.setDressed=v=>dressed=v;return g;}
  ctx.GameCharacters={makeDoll:actor,makePrince:actor,makeDressStand:()=>new THREE.Group()};
}
vm.runInContext(fs.readFileSync(dir+'game.js','utf8'),ctx,{filename:'game.js'});
const snap=()=>ctx.GameDebug.snapshot();
function tick(seconds=.02){const frames=Math.ceil(seconds/.02);for(let i=0;i<frames;i++){now+=20;const cb=nextFrame;nextFrame=null;assert.ok(cb,'RAF exists');cb(now);}}
function key(name,down=true){for(const fn of docEvents[down?'keydown':'keyup']||[])fn({key:name,code:name===' '?'Space':name,repeat:false,target:get('body'),preventDefault(){}});}
function move(name,seconds){key(name);tick(seconds);key(name,false);tick();}
function click(id){assert.equal(typeof get(id).onclick,'function',id+' click exists');get(id).onclick();tick();}
function phase(expected){assert.equal(snap().phase,expected,JSON.stringify(snap()));}
function reachDress(){click('slow');move('ArrowUp',3.5);assert.equal(snap().slipCount,0);assert.ok(snap().ready);click('action');phase('dance');}
function reachDance(){const s=snap();move('ArrowUp',Math.max(0,(s.position.z+1.82)/1.42));const x=snap().position.x;move('ArrowRight',(0.05-x)/1.42);move('ArrowDown',.5);assert.ok(snap().ready,'near dance target');}
phase('intro');assert.equal(audio.playing,false);
click('start');phase('dress');assert.equal(audio.playing,true);
move('ArrowUp',1.6);assert.equal(snap().slipCount,1);assert.ok(Math.abs(snap().position.z-3.25)<.01);assert.ok(audio.effects.includes('slip'));
click('slow');move('ArrowUp',3.5);assert.equal(snap().slipCount,1);assert.ok(snap().ready,'slow crossing reaches dress');click('action');phase('dance');assert.ok(audio.effects.includes('dress'));
if(!characterFile)assert.equal(dressed,true);
reachDance();click('action');phase('dancing');tick(6.6);phase('eat');assert.equal(snap().danceWon,true);assert.ok(audio.effects.includes('dance'));
move('ArrowRight',2.12);move('ArrowDown',1.68);assert.ok(snap().ready,'reachable picnic');click('action');phase('eating');tick(3.3);phase('complete');assert.ok(audio.effects.includes('eat'));assert.equal(get('ending').classList.contains('hidden'),false);assert.ok(steps.every(s=>s.classList.contains('done')));
click('retry');phase('dress');assert.equal(snap().slipCount,0);assert.equal(snap().danceWon,false);assert.equal(snap().slow,false);assert.equal(get('ending').classList.contains('hidden'),true);
reachDress();click('retry');phase('dance');assert.ok(Math.abs(snap().position.x+3.7)<.01);reachDance();click('action');tick(1);phase('dancing');click('retry');phase('dance');assert.equal(snap().danceWon,false);reachDance();click('action');tick(6.6);phase('eat');click('retry');phase('eat');assert.ok(Math.abs(snap().position.x-1.65)<.01);
click('reset');phase('intro');assert.equal(audio.playing,false);assert.equal(snap().particles,0);assert.equal(snap().slow,false);assert.equal(snap().danceWon,false);assert.equal(snap().slipCount,0);
// Pointer input and blur cleanup, keyboard slow modifier, audio controls.
click('start');const right=dirs.find(d=>d.dataset.dir==='right');right.listeners.pointerdown[0]({pointerId:1,preventDefault(){}});tick(.2);const xBefore=snap().position.x;for(const fn of winEvents.blur)fn();tick(.2);assert.equal(snap().position.x,xBefore);assert.equal(right.classList.contains('pressed'),false);
click('mute');assert.equal(audio.muted,true);get('volume').oninput({target:{value:'17'}});assert.equal(audio.volume,.17);
click('reset');key(' ');tick();phase('dress');key('Shift');move('ArrowUp',3.5);key('Shift',false);assert.equal(snap().slipCount,0);assert.ok(snap().ready);click('reset');phase('intro');
console.log(JSON.stringify({result:'PASS',frames:renderCount,threeRevision:THREE.REVISION,characters:characterFile||'stub (parts and setDressed)',source:'actual game.js; original code not modified',checks:['start','fast movement slip + safe reset','slow crossing','dress action','dance full 6.5s + prince animation execution','picnic reachable + eating full 3.2s','completion + 3 steps','retry from complete/dance/dancing/eat','full reset','pointer movement + blur cleanup','audio controls','space start + Shift slow']},null,2));
