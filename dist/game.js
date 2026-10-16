/* Pesta Putar — original, offline classroom diorama. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 let renderer;
 try { renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true,alpha:true}); }
 catch(error){$('fatal').classList.remove('hidden');$('fatalText').textContent='WebGL belum tersedia. Coba buka index.html di Chrome atau Edge dengan akselerasi grafis aktif.';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
 const scene=new THREE.Scene();scene.fog=new THREE.Fog('#f8eee8',35,65);
 const camera=new THREE.OrthographicCamera(-10,10,7,-7,.1,100);camera.position.set(8,15,20);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xfff5ed,0xa4a5bb,2.2));const sun=new THREE.DirectionalLight(0xfff1df,3);sun.position.set(-7,15,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.5,far:40});sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;scene.add(sun);
 const mats={};function mat(color,roughness=.7){const key=color+':'+roughness;return mats[key]||(mats[key]=new THREE.MeshStandardMaterial({color,roughness}));}
 function mesh(geo,color,x=0,y=0,z=0,parent=scene){const m=new THREE.Mesh(geo,typeof color==='object'?color:mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(w,h,d,color,x,y,z,p){return mesh(new THREE.BoxGeometry(w,h,d),color,x,y,z,p);}
 function ball(r,color,x,y,z,p){return mesh(new THREE.SphereGeometry(r,16,12),color,x,y,z,p);}
 function cyl(rt,rb,h,color,x,y,z,p,n=40){return mesh(new THREE.CylinderGeometry(rt,rb,h,n),color,x,y,z,p);}
 function torus(r,t,color,x,y,z,p){const m=mesh(new THREE.TorusGeometry(r,t,8,40),color,x,y,z,p);m.rotation.x=Math.PI/2;return m;}
 function textSprite(text,color='#9c6f7b',size=48){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');c.font='bold '+size+'px Trebuchet MS, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(text,256,64);const tx=new THREE.CanvasTexture(canvas);tx.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));sp.scale.set(3.2,.8,1);return sp;}
 // Floating toy room and softly lit ground.
 const ground=mesh(new THREE.PlaneGeometry(200,200), '#f8eee8',0,-1.05,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 box(12.6,.75,9.5,'#d596a7',0,-.48,0);box(12.7,.18,9.6,'#f9ddd2',0,-.03,0);box(12.3,.1,9.2,'#fff0dc',0,.08,0);
 for(let x=-5.5;x<6;x+=1)for(let z=-4;z<4.5;z+=1){const tile=box(.985,.015,.985,((Math.round(x*2)+Math.round(z*2))%4===1)?'#f4e4d9':'#fff0dc',x,.14,z);tile.castShadow=false;}
 box(12.4,2.9,.24,'#e8b4c3',0,1.53,-4.45);box(.24,2.3,9,'#eec7cf',-6.12,1.23,0);box(12.5,.17,.35,'#f9dfdf',0,3.03,-4.45);box(.35,.17,9.15,'#f9dfdf',-6.12,2.43,0);
 // Back-wall decorative windows, drawn entirely from geometry.
 for(const x of [-3.8,.1,4.05]){box(2.2,1.65,.13,'#fff5e9',x,1.95,-4.26);box(1.9,1.36,.14,'#c5e3e1',x,1.96,-4.16);box(.06,1.4,.15,'#fff5e9',x,1.96,-4.06);box(1.95,.06,.16,'#fff5e9',x,1.96,-4.06);box(2.5,.13,.4,'#f6d0c2',x,1.13,-4.1);}
 // Wardrobe, open rail and a very visible original dress.
 const wardrobe=new THREE.Group();wardrobe.position.set(-4.25,.15,-2.85);scene.add(wardrobe);
 box(2.45,.18,1.1,'#be718d',0,.12,0,wardrobe);box(2.35,2.8,.25,'#e5a2bb',0,1.53,-.45,wardrobe);box(.17,2.7,1,'#d78ca7',-1.13,1.47,0,wardrobe);box(.17,2.7,1,'#d78ca7',1.13,1.47,0,wardrobe);box(2.65,.18,1.18,'#bd6a88',0,2.91,0,wardrobe);box(2.1,.055,.055,'#f9dc99',0,2.54,0,wardrobe);
 const dress=GameCharacters.makeDressStand();dress.position.set(0,.2,.05);dress.scale.setScalar(.82);wardrobe.add(dress);
 const wardrobeLabel=textSprite('BAJU BAGUS','#a15070',38);wardrobeLabel.position.set(-4.25,3.6,-2.8);scene.add(wardrobeLabel);
 // Blue slippery lane. A low flower divider makes the intended route legible.
 const ice=box(3.18,.026,2.36,new THREE.MeshStandardMaterial({color:'#acd9e8',roughness:.16,metalness:.05,transparent:true,opacity:.86}),-4.14,.17,.2);
 const glints=[];for(let i=0;i<8;i++){const t=torus(.11+(i%3)*.04,.013,'#e9fcff',-5.25+(i%3)*.9,.191,-.55+Math.floor(i/3)*.65);t.scale.z=.52;glints.push(t);}
 for(let i=0;i<5;i++){box(.28,.55,.25,'#f4d3d1',-2.26,.43,-.4+i*.95);ball(.18,'#fff6e9',-2.26,.78,-.4+i*.95);}
 box(.13,.11,4.2,'#f0c8c6',-2.26,.65,1.5);box(.13,.1,4.2,'#f0c8c6',-2.26,.32,1.5);
 function plant(x,z,s=1){const g=new THREE.Group();g.position.set(x,.17,z);g.scale.setScalar(s);scene.add(g);cyl(.25,.18,.4,'#c98e79',0,.2,0,g);for(let i=0;i<5;i++){const a=i*2.4;const leaf=ball(.26,i%2?'#83a982':'#5c947e',Math.sin(a)*.2,.58+i*.07,Math.cos(a)*.14,g);leaf.scale.set(.65,1.45,.65);leaf.rotation.z=Math.sin(a)*.6;}return g;}
 plant(-5.5,3.8,1.1);plant(-2.3,-1.2,.85);plant(5.3,-3.7,1.5);plant(5.5,3.9,.9);
 // Round dance stage, stars and a warm overhead bunting.
 const dancePos=new THREE.Vector3(.5,.16,-.8);cyl(2,2.08,.14,'#bca4cc',.6,.22,-.8);cyl(1.85,1.85,.018,'#d9c8e5',.6,.3,-.8);torus(1.7,.025,'#fff0d6',.6,.32,-.8);
 for(let i=0;i<9;i++){const a=i*Math.PI*2/9;cyl(.055,.055,.02,'#fff0d6',.6+Math.sin(a)*1.5,.335,-.8+Math.cos(a)*1.5,scene,5);}
 const danceLabel=textSprite('PUTAR BERSAMA','#89708e',32);danceLabel.position.set(.65,3.6,-2.8);scene.add(danceLabel);
 for(let i=0;i<9;i++){const x=-1.5+i*.75;const flag=mesh(new THREE.ConeGeometry(.19,.34,3),['#c37696','#efd595','#8dbbae'][i%3],x,3.37-Math.sin(i/8*Math.PI)*.32,-4.02);flag.rotation.z=Math.PI;}
 // Picnic station with table, plate, fruit and a tiny friendly stool.
 const foodPos=new THREE.Vector3(3.65,.16,1.8);cyl(1.5,1.5,.025,'#d1dfba',4,.17,2.35);cyl(.85,.85,.16,'#f7d295',4.25,1.03,2.35);cyl(.13,.28,.9,'#bd9478',4.25,.55,2.35);cyl(.62,.62,.08,'#c1977b',4.25,.2,2.35);cyl(.38,.38,.035,'#fff8e8',4.25,1.135,2.35);torus(.32,.017,'#dcad91',4.25,1.16,2.35);
 for(const [x,z,c] of [[4.1,2.27,'#df777e'],[4.39,2.38,'#f1ba56'],[4.14,2.56,'#9db860']]){ball(.115,c,x,1.26,z);box(.028,.08,.028,'#786343',x,1.38,z);}
 cyl(.32,.35,.16,'#d8a899',3.05,.5,2.4);for(const x of [2.87,3.23])for(const z of [2.22,2.58])cyl(.035,.045,.4,'#b58a73',x,.26,z);
 const foodLabel=textSprite('ISI TENAGA','#7b916c',34);foodLabel.position.set(4.2,2.55,2.35);scene.add(foodLabel);
 // Characters and target marker.
 const doll=GameCharacters.makeDoll();scene.add(doll);const prince=GameCharacters.makePrince();prince.position.set(1.7,.34,-1.1);prince.rotation.y=-.6;scene.add(prince);
 const marker=new THREE.Group();const markerRing=torus(.43,.045,'#f2c768',0,0,0,marker);const markerArrow=mesh(new THREE.ConeGeometry(.18,.32,4),'#e8ba55',0,.55,0,marker);markerArrow.rotation.z=Math.PI;scene.add(marker);
 const keys=new Set(),touch=new Set();let phase='intro',slow=false,muted=false,moving=false,clock=0,animTime=0,slipTime=0,slipCount=0,toastTime=0,danceWon=false,frameCount=0;const particles=[];
 const spawn=new THREE.Vector3(-4.22,.17,3.25),outfitSpot=new THREE.Vector3(-4.22,.17,-1.75),danceSpot=new THREE.Vector3(.05,.34,-.55),mealSpot=new THREE.Vector3(3.12,.17,1.85);const basePrince=new THREE.Vector3(1.7,.34,-1.1);
 const hints={dress:['♧','LANGKAH 1 · BAJU BAGUS','Jalan pelan ke lemari','Lantai biru licin. Tekan tombol kura-kura!','Ambil baju'],dance:['✧','LANGKAH 2 · MENARI BERSAMA','Dekati pangeran, lalu menari','Lewat ujung pagar, menuju panggung bulat.','Menari'],dancing:['✧','PUTAR, PUTAR, PUTAR!','Menari bersama pangeran','Berputar seperti gasing. Hore, berhasil!','Menari'],eat:['◒','LANGKAH 3 · ISI TENAGA','Capek menari? Ayo makan','Dekati meja buah, lalu tekan Makan.','Makan'],eating:['◒','NYAM, NYAM!','Istirahat sambil makan','Makan setelah menari. Enak!','Makan'],complete:['✧','HEBAT, BERHASIL!','Semua sudah selesai','Kalian membuat aturan permainan ini.','Selesai']};
 function target(){return phase==='dress'?outfitSpot:phase==='dance'?danceSpot:mealSpot;}
 function setPhase(next){phase=next;const h=hints[next];if(h){$('hintIcon').textContent=h[0];$('eyebrow').textContent=h[1];$('hint').textContent=h[2];$('subhint').textContent=h[3];$('actionText').textContent=h[4];$('actionIcon').textContent=h[0];}let idx=next==='dress'?0:next==='dance'||next==='dancing'?1:2;document.querySelectorAll('.step').forEach((e,i)=>{e.classList.toggle('current',i===idx&&next!=='complete');e.classList.toggle('done',i<idx||next==='complete');});}
 function say(text,seconds=3.1){$('toast').textContent=text;$('toast').classList.add('show');toastTime=seconds;}
 function setSlow(v){slow=v;$('slow').setAttribute('aria-pressed',String(v));$('slowState').textContent=v?'AKTIF · PELAN':'MATI · SHIFT';}
 function clearInput(){keys.clear();touch.clear();document.querySelectorAll('.dir').forEach(b=>b.classList.remove('pressed'));}
 function clearParticles(){for(const p of particles){scene.remove(p.mesh);p.mesh.geometry.dispose();}particles.length=0;}
 function spark(x,y,z,n=25){for(let i=0;i<n;i++){const m=box(.065,.065,.035,['#d981a2','#f2ce78','#8ec4ae','#b8a0d1'][i%4],x,y,z);m.castShadow=false;particles.push({mesh:m,v:new THREE.Vector3((Math.random()-.5)*3,1+Math.random()*2,(Math.random()-.5)*3),life:1.5+Math.random()*.6});}}
 function poseReset(){for(const actor of [doll,prince]){actor.rotation.x=0;actor.rotation.z=0;const p=actor.userData.parts||{};for(const n of ['leftArm','rightArm','leftLeg','rightLeg'])if(p[n])p[n].rotation.set(0,0,0);}prince.position.copy(basePrince);prince.rotation.y=-.6;}
 function reset(showIntro=true){GameAudio.stop();clearInput();clearParticles();poseReset();setSlow(false);doll.position.copy(spawn);doll.rotation.set(0,Math.PI,0);doll.userData.setDressed(false);dress.visible=true;slipTime=0;slipCount=0;animTime=0;danceWon=false;$('toast').classList.remove('show');toastTime=0;$('ending').classList.add('hidden');$('intro').classList.toggle('hidden',!showIntro);setPhase('dress');if(showIntro)phase='intro';else GameAudio.start();}
 function begin(){reset(false);say('Ayo cari baju! Lantai biru licin.',3);}
 function retry(){if(phase==='intro')return;if(phase==='complete'){begin();return;}clearInput();clearParticles();poseReset();slipTime=0;animTime=0;if(phase==='dress')doll.position.copy(spawn);else if(phase==='dance'||phase==='dancing'){setPhase('dance');doll.position.set(-3.7,.17,-1.85);}else{setPhase('eat');doll.position.set(1.65,.17,.5);}doll.rotation.set(0,0,0);GameAudio.start();GameAudio.sfx('step');say('Boleh coba lagi. Pelan-pelan, ya!');}
 function ready(){return ['dress','dance','eat'].includes(phase)&&slipTime<=0&&doll.position.distanceTo(target())<1.22;}
 function act(){if(!ready())return;GameAudio.start();if(phase==='dress'){doll.userData.setDressed(true);dress.visible=false;GameAudio.sfx('dress');spark(doll.position.x,1.5,doll.position.z);setPhase('dance');say('Bajunya siap! Ayo temui pangeran.');}else if(phase==='dance'){clearInput();doll.position.copy(danceSpot);setPhase('dancing');animTime=0;GameAudio.sfx('dance');say('Putar bersama pangeran!',3);}else if(phase==='eat'){clearInput();doll.position.copy(mealSpot);doll.rotation.y=Math.PI/2;setPhase('eating');animTime=0;GameAudio.sfx('eat');}}
 $('start').onclick=begin;$('again').onclick=begin;$('reset').onclick=()=>reset(true);$('retry').onclick=retry;$('action').onclick=act;$('slow').onclick=()=>{setSlow(!slow);if(phase!=='intro')GameAudio.start();};$('mute').onclick=()=>{muted=!muted;GameAudio.setMuted(muted);$('mute').textContent=muted?'♪̸':'♫';$('mute').setAttribute('aria-label',muted?'Nyalakan suara':'Matikan suara');$('mute').setAttribute('aria-pressed',String(muted));};$('volume').oninput=e=>GameAudio.setVolume(Number(e.target.value)/100);$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{say('Gunakan tombol layar penuh di browser.');}};
 const mapped={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
 document.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;const k=mapped[e.key]||mapped[e.key.toLowerCase()];if(k){keys.add(k);e.preventDefault();}if(e.key==='Shift')keys.add('slow');if(e.code==='Space'){e.preventDefault();if(!e.repeat){if(phase==='intro'||phase==='complete')begin();else act();}}});document.addEventListener('keyup',e=>{const k=mapped[e.key]||mapped[e.key.toLowerCase()];if(k)keys.delete(k);if(e.key==='Shift')keys.delete('slow');});
 document.querySelectorAll('.dir').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);touch.add(b.dataset.dir);b.classList.add('pressed');if(phase!=='intro')GameAudio.start();});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{touch.delete(b.dataset.dir);b.classList.remove('pressed');});});window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{clearInput();if(document.hidden)GameAudio.stop();else if(phase!=='intro')GameAudio.start();});
 function collision(x,z){if(x< -5.65||x>5.65||z< -3.7||z>4.05)return true;if(x> -2.65&&x< -1.88&&z> -1.13)return true;if(x< -2.85&&z< -2.12)return true;if(Math.hypot(x-4.25,z-2.35)<.87)return true;return false;}
 function update(dt){clock+=dt;frameCount++;animTime+=dt;moving=false;if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('toast').classList.remove('show');}
  const active=['dress','dance','eat'].includes(phase);const isSlow=slow||keys.has('slow');
  if(active&&slipTime<=0){let dx=(keys.has('right')||touch.has('right')?1:0)-(keys.has('left')||touch.has('left')?1:0);let dz=(keys.has('down')||touch.has('down')?1:0)-(keys.has('up')||touch.has('up')?1:0);if(dx||dz){moving=true;const len=Math.hypot(dx,dz);dx/=len;dz/=len;const speed=isSlow?1.42:3.35;const nx=doll.position.x+dx*speed*dt,nz=doll.position.z+dz*speed*dt;if(!collision(nx,doll.position.z))doll.position.x=nx;if(!collision(doll.position.x,nz))doll.position.z=nz;doll.rotation.y=Math.atan2(dx,dz);const onIce=doll.position.x> -5.75&&doll.position.x< -2.55&&doll.position.z> -1.02&&doll.position.z<1.47;if(onIce&&!isSlow){slipTime=.95;slipCount++;GameAudio.sfx('slip');say('Wup! Lantainya licin. Coba jalan pelan 🐢',3.5);}}
   doll.position.y=Math.hypot(doll.position.x-.6,doll.position.z+.8)<1.85?.34:.17;
  }
  const parts=doll.userData.parts||{};if(active&&slipTime<=0){for(const [n,s] of [['leftLeg',1],['rightLeg',-1],['leftArm',-1],['rightArm',1]])if(parts[n])parts[n].rotation.x=moving?Math.sin(clock*(isSlow?7:12))*.32*s:Math.sin(clock*2)*.025;doll.rotation.z=0;doll.rotation.x=0;}
  if(slipTime>0){slipTime-=dt;doll.rotation.z=Math.sin(slipTime*18)*.25;doll.rotation.x=-.18;doll.position.y=.19+Math.abs(Math.sin(slipTime*8))*.09;if(parts.leftArm)parts.leftArm.rotation.z=-.7;if(parts.rightArm)parts.rightArm.rotation.z=.7;if(slipTime<=0){doll.position.copy(spawn);doll.rotation.set(0,Math.PI,0);poseReset();clearInput();}}
  if(phase==='dancing'){doll.rotation.y+=dt*9;prince.rotation.y-=dt*7.5;doll.position.y=.34+Math.abs(Math.sin(animTime*5))*.09;prince.position.y=.34+Math.abs(Math.sin(animTime*5+.6))*.09;if(parts.leftArm)parts.leftArm.rotation.z=-.75;if(parts.rightArm)parts.rightArm.rotation.z=.75;const pp=prince.userData.parts||{};if(pp.leftArm)pp.leftArm.rotation.z=-.65;if(pp.rightArm)pp.rightArm.rotation.z=.65;if(Math.floor((animTime-dt)*3)!==Math.floor(animTime*3))spark(.8,.6,-.7,4);if(animTime>6.5){danceWon=true;poseReset();doll.position.set(.05,.34,-.55);setPhase('eat');GameAudio.sfx('win');say('Hore, berhasil! Capek menari, ayo makan.',4);spark(.7,1.7,-.6,45);}}
  if(phase==='eating'){doll.rotation.z=Math.sin(animTime*5)*.045;if(parts.rightArm)parts.rightArm.rotation.x=-1.1+Math.sin(animTime*6)*.25;if(animTime>3.2){setPhase('complete');GameAudio.sfx('win');spark(doll.position.x,1.6,doll.position.z,40);$('ending').classList.remove('hidden');poseReset();}}
  if(phase!=='dancing'){const pp=prince.userData.parts||{};if(pp.head)pp.head.rotation.z=Math.sin(clock*1.3)*.055;}
  marker.visible=active;if(active){marker.position.copy(target());marker.position.y+=.04;markerArrow.position.y=.65+Math.sin(clock*3)*.12;markerRing.scale.setScalar(1+Math.sin(clock*3)*.08);}
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.v.y-=dt*2.2;p.mesh.position.addScaledVector(p.v,dt);p.mesh.rotation.x+=dt*2;p.mesh.rotation.z+=dt*3;if(p.life<=0){scene.remove(p.mesh);p.mesh.geometry.dispose();particles.splice(i,1);}}
  glints.forEach((g,i)=>g.scale.set(1+Math.sin(clock*1.2+i)*.1,1,.52));$('action').disabled=!ready();
 }
 function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);const aspect=w/h;const vertical=Math.max(aspect<1.3?9.3:7.1,8.2/aspect);camera.left=-vertical*aspect;camera.right=vertical*aspect;camera.top=vertical;camera.bottom=-vertical;camera.updateProjectionMatrix();}
 window.addEventListener('resize',resize);resize();reset(true);let last=performance.now();function frame(now){const dt=Math.min((now-last)/1000,.04);last=now;update(dt);renderer.render(scene,camera);requestAnimationFrame(frame);}requestAnimationFrame(frame);
 // Read-only diagnostics for reporting tested states; contains no personal data.
 window.GameDebug={snapshot:()=>({phase,slow,slipCount,danceWon,position:{x:doll.position.x,y:doll.position.y,z:doll.position.z},ready:ready(),frames:frameCount,particles:particles.length,audio:GameAudio.getDebug(),webgl:renderer.getContext().getParameter(renderer.getContext().VERSION)})};
})();
