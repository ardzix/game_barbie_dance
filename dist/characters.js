/* Original toy characters. Face direction is local +Z; all animation pivots begin at zero. */
(function () {
  'use strict';
  const T = window.THREE;
  function mat(color, roughness) { return new T.MeshStandardMaterial({color, roughness: roughness === undefined ? .72 : roughness, metalness: 0}); }
  const skin = mat('#ffd8b7'), hair = mat('#eeb64d'), hairLight = mat('#ffcf63'), eye = mat('#38304b'), white = mat('#fffdf5'), blush = mat('#f3a29d');
  const pink = mat('#f26bac'), palePink = mat('#ffc0da'), deepPink = mat('#d84086'), purple = mat('#ad95e4'), gold = mat('#ffd568', .35), teal = mat('#24a8ac'), navy = mat('#285477');
  function mesh(geo, material, parent, x, y, z) {
    const m = new T.Mesh(geo, material); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; m.receiveShadow = true; if(parent) parent.add(m); return m;
  }
  function ball(parent, material, x, y, z, sx, sy, sz) { const m = mesh(new T.SphereGeometry(1, 20, 14), material, parent, x,y,z); m.scale.set(sx, sy === undefined ? sx : sy, sz === undefined ? sx : sz); return m; }
  function cylinder(parent, material, top, bottom, height, x,y,z, seg) { return mesh(new T.CylinderGeometry(top,bottom,height,seg||24),material,parent,x,y,z); }
  function pivot(parent,x,y,z) { const p=new T.Group(); p.position.set(x,y,z); parent.add(p); return p; }
  function curve(parent, material, points, width) { return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),16,width,6,false),material,parent); }
  function face(head, boy) {
    ball(head,skin,0,0,0,.31,.34,.285);
    [-1,1].forEach(s=>{
      ball(head,skin,s*.299,-.035,0,.065,.085,.055);
      ball(head,eye,s*.112,.035,.265,.032,.048,.017);
      ball(head,white,s*.105,.049,.281,.009,.012,.005);
      ball(head,blush,s*.19,-.068,.242,.055,.029,.011);
      if(!boy) curve(head,eye,[[s*.09,.088,.263],[s*.116,.091,.264],[s*.14,.085,.256]],.008);
    });
    ball(head,skin,0,-.036,.285,.033,.039,.035);
    curve(head,mat('#9e5364'),[[-.059,-.115,.264],[0,-.14,.277],[.059,-.115,.264]],.012);
  }
  function bow(parent, x,y,z, material, size) {
    const b=pivot(parent,x,y,z); size=size||1;
    ball(b,material,-.055*size,0,0,.07*size,.045*size,.033*size).rotation.z=-.35;
    ball(b,material,.055*size,0,0,.07*size,.045*size,.033*size).rotation.z=.35;
    ball(b,gold,0,0,.02*size,.025*size,.025*size,.02*size); return b;
  }
  function arm(root, s, sleeveMat) {
    const g=pivot(root,s*.255,1.1,0);
    ball(g,sleeveMat,s*.023,-.055,0,.09,.115,.09);
    ball(g,skin,s*.028,-.22,0,.058,.17,.06);
    ball(g,skin,s*.028,-.36,.012,.064,.072,.059);
    return g;
  }
  function leg(root,s,shoeMat) {
    const g=pivot(root,s*.125,.62,0);
    ball(g,skin,0,-.235,0,.067,.25,.07);
    ball(g,shoeMat,0,-.53,.055,.089,.064,.139);
    return g;
  }
  function dress(parent, y, scale) {
    const g=pivot(parent,0,y,0); g.scale.setScalar(scale||1);
    cylinder(g,pink,.145,.4,.46,0,0,0,40);
    const hem=mesh(new T.TorusGeometry(.391,.025,8,48),palePink,g,0,-.225,0); hem.rotation.x=Math.PI/2;
    for(let i=0;i<10;i++) {
      const a=i*Math.PI*2/10;
      ball(g,palePink,Math.sin(a)*.354,-.165,Math.cos(a)*.354,.044,.059,.024).rotation.y=a;
    }
    cylinder(g,deepPink,.15,.15,.045,0,.235,0,32);
    bow(g,0,.22,.158,palePink,.7);
    return g;
  }
  function makeDoll() {
    const root=new T.Group(); root.name='Lala the dancing doll';
    const body=pivot(root,0,1.005,0);
    ball(body,purple,0,0,0,.22,.205,.14);
    const formal=pivot(body,0,0,0); formal.visible=false;
    ball(formal,pink,0,.015,.007,.226,.2,.147);
    bow(formal,0,-.15,.16,palePink,.8);
    for(let i=0;i<5;i++) ball(formal,white,(i-2)*.045,.145,.111+(2-Math.abs(i-2))*.012,.013,.013,.012);
    const casual=cylinder(root,purple,.175,.22,.2,0,.745,0,24);
    const skirt=dress(root,.605,1); skirt.visible=false;
    const leftLeg=leg(root,-1,deepPink),rightLeg=leg(root,1,deepPink);
    const leftArm=arm(root,-1,purple),rightArm=arm(root,1,purple);
    const head=pivot(root,0,1.48,0);
    ball(head,hair,0,.045,-.075,.328,.35,.272);
    face(head,false);
    // Swept fringe and a broad ponytail make the silhouette readable from the stage camera.
    [-1,1].forEach(s=>{
      ball(head,hair,s*.239,.098,-.035,.099,.24,.17);
      ball(head,hairLight,s*.11,.257,.153,.15,.102,.12).rotation.z=s*-.25;
    });
    const pony=pivot(head,.28,.12,-.12);
    ball(pony,hairLight,.06,-.1,-.045,.145,.23,.135);
    ball(pony,hair,.07,-.29,-.02,.12,.18,.13);
    ball(pony,hairLight,.045,-.4,.01,.09,.11,.1);
    bow(head,.285,.21,.02,deepPink,1.1);
    const tiara=pivot(head,0,.315,.075); tiara.visible=false;
    cylinder(tiara,gold,.185,.185,.034,0,0,0,32);
    for(let i=-1;i<=1;i++) {
      const cone=mesh(new T.ConeGeometry(.035,i===0?.105:.07,4),gold,tiara,i*.085,.045,.12-Math.abs(i)*.018);
      ball(tiara,palePink,i*.085,i===0?.1:.078,.12-Math.abs(i)*.018,.023);
    }
    root.userData.parts={head,body,leftArm,rightArm,leftLeg,rightLeg,skirt};
    root.userData.setDressed=function(on) {
      formal.visible=!!on; skirt.visible=!!on; tiara.visible=!!on; casual.visible=!on;
      leftArm.children[0].material=on?pink:purple; rightArm.children[0].material=on?pink:purple;
    };
    return root;
  }
  function makePrince() {
    const root=new T.Group(); root.name='Prince Rio';
    const body=pivot(root,0,1.01,0);
    ball(body,teal,0,0,0,.235,.25,.15);
    cylinder(body,gold,.215,.215,.043,0,-.125,0,28);
    for(let i=0;i<3;i++) ball(body,gold,0,.1-i*.075,.151,.019);
    const sash=mesh(new T.BoxGeometry(.055,.37,.027),palePink,body,0,.015,.143); sash.rotation.z=.48;
    const cape=mesh(new T.ConeGeometry(.3,.61,30,1,true,.05,Math.PI),navy,body,0,-.085,-.06); cape.rotation.y=Math.PI/2;
    const leftArm=arm(root,-1,teal),rightArm=arm(root,1,teal);
    const leftLeg=leg(root,-1,navy),rightLeg=leg(root,1,navy);
    [leftLeg,rightLeg].forEach(g=> {g.children[0].material=white;});
    const head=pivot(root,0,1.48,0);
    const brown=mat('#79523d');
    ball(head,brown,0,.065,-.06,.323,.31,.272); face(head,true);
    ball(head,brown,-.085,.253,.12,.213,.105,.15).rotation.z=-.22;
    ball(head,brown,.204,.164,.075,.09,.15,.15);
    cylinder(head,gold,.19,.19,.07,0,.303,-.015,30);
    for(let i=0;i<5;i++) {
      let a=i*Math.PI*2/5;
      mesh(new T.ConeGeometry(.04,.115,4),gold,head,Math.sin(a)*.17,.39,Math.cos(a)*.17-.015);
      ball(head,palePink,Math.sin(a)*.17,.45,Math.cos(a)*.17-.015,.022);
    }
    root.userData.parts={head,body,leftArm,rightArm,leftLeg,rightLeg};
    return root;
  }
  function makeDressStand() {
    const root=new T.Group(); root.name='The party dress';
    cylinder(root,gold,.2,.26,.08,0,.04,0,32);
    cylinder(root,gold,.025,.025,1.55,0,.82,-.05,12);
    ball(root,gold,0,1.61,-.05,.055);
    curve(root,gold,[[-.29,1.34,0],[0,1.53,0],[.29,1.34,0],[-.29,1.34,0]],.022);
    const gown=dress(root,.68,1.08);
    ball(root,pink,0,1.1,0,.21,.245,.135);
    bow(root,0,.94,.14,palePink,.95);
    [-1,1].forEach(s=>ball(root,palePink,s*.2,1.23,0,.085,.08,.1));
    for(let i=0;i<5;i++) ball(root,white,(i-2)*.035,1.27,.095+(2-Math.abs(i-2))*.011,.013);
    root.userData.dress=gown;
    return root;
  }
  window.GameCharacters={makeDoll,makePrince,makeDressStand};
})();
