import * as THREE from 'three';

// Deterministic, local material maps: no remote textures or extra downloads.
export function architecturalTextures(renderer) {
  let seed=3291;
  const random=()=>((seed=(seed*16807)%2147483647)/2147483647);
  const make=(kind)=>{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
    const c=canvas.getContext('2d');c.fillStyle='#b6afa1';c.fillRect(0,0,1024,1024);
    if(kind==='wood') {
      for(let board=0;board<16;board++){
        const y=board*64,shade=168+Math.floor(random()*32);
        c.fillStyle=`rgb(${shade+15},${shade+9},${shade})`;c.fillRect(0,y,1024,64);
        for(let line=0;line<90;line++){
          const yy=y+random()*64;c.strokeStyle=`rgba(65,53,38,${.025+random()*.12})`;
          c.lineWidth=.35+random()*1.2;c.beginPath();c.moveTo(0,yy);
          for(let x=0;x<=1024;x+=32)c.lineTo(x,yy+Math.sin(x*.013+board)*1.4+Math.sin(x*.039)*.5);
          c.stroke();
        }
        c.fillStyle='#5a5143';c.fillRect(0,y,1024,2);c.fillStyle='#e4ddcd';c.fillRect(0,y+2,1024,1);
      }
      for(let knot=0;knot<20;knot++){
        const x=random()*1024,y=random()*1024;
        for(let ring=1;ring<9;ring++){c.strokeStyle=`rgba(73,57,39,${.15-ring*.012})`;c.lineWidth=1;c.beginPath();c.ellipse(x,y,ring*4,ring*.7,0,0,Math.PI*2);c.stroke();}
      }
    } else {
      c.fillStyle='#9c9d98';c.fillRect(0,0,1024,1024);
      for(let i=0;i<95000;i++){const v=100+Math.floor(random()*95);c.fillStyle=`rgba(${v},${v},${v},.25)`;c.fillRect(random()*1024,random()*1024,1+random()*2,1+random()*2);}
    }
    const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return texture;
  };
  return {timber:make('wood'),concrete:make('concrete')};
}

export function addArchitecturalDetails({scene,box,mat,wood,frame,roof,deck}) {
  const interior=mat('#716354',.95),linen=mat('#c9bda5',1),stone=mat('#8c8b80',.95);
  // Visible interior cues are recessed behind reflective glazing.
  box(8.3,.08,6,0,.28,0,wood);
  box(8.3,.06,6,0,2.82,0,linen);
  box(2,.68,.85,-1.5,.66,1.7,linen);
  box(2,.55,.14,-1.5,.98,1.32,linen);
  box(.85,.08,.6,-1.5,.54,2.52,wood);
  box(.1,.42,.1,-1.5,.32,2.52,frame);
  box(1.1,2.3,.15,2.2,1.42,2.8,interior);
  box(.04,.26,.07,2.64,1.35,2.9,frame);
  // Fascia, ridge cap, soffits and rainwater details.
  box(.18,.14,7.12,0,4.98,0,roof);
  for(const side of [-1,1]) {
    box(.32,.08,6.75,side*4.34,2.88,0,wood);
    const gutter=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,7.14,10),roof);
    gutter.rotation.x=Math.PI/2;gutter.position.set(side*4.58,2.92,0);scene.add(gutter);
    const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,2.73,10),roof);
    pipe.position.set(side*4.52,1.4,-3.36);pipe.castShadow=true;scene.add(pipe);
    for(const y of [.55,1.55,2.55])box(.16,.04,.16,side*4.52,y,-3.36,frame);
  }
  for(const x of [-4.28,4.28])for(const z of [-3.18,3.18])box(.07,2.78,.07,x,1.5,z,wood);
  // Deck substructure and properly supported steps.
  for(const x of [-4.1,0,4.1])box(.16,.27,2.25,x,-.02,4.4,frame,deck);
  box(3.4,.19,.5,0,-.07,5.8,wood,deck);
  box(3.8,.12,.5,0,-.16,6.15,wood,deck);
  // Low grasses and stones establish scale without dense geometry.
  const grasses=new THREE.Group();scene.add(grasses);
  const bladeGeometry=new THREE.ConeGeometry(.035,.32,3);
  const grassMaterial=mat('#697556',1);
  const count=210,blades=new THREE.InstancedMesh(bladeGeometry,grassMaterial,count);
  const dummy=new THREE.Object3D();
  for(let i=0;i<count;i++){
    const side=i%2?-1:1;
    dummy.position.set(side*(5+Math.sin(i*4.7)*.5),-.04+Math.abs(Math.sin(i))*.05,2+Math.sin(i*1.7)*3.6);
    dummy.rotation.set(Math.sin(i)*.2,i*.6,Math.cos(i)*.2);dummy.scale.setScalar(.65+Math.abs(Math.sin(i*2.3))*.8);
    dummy.updateMatrix();blades.setMatrixAt(i,dummy.matrix);
  }
  grasses.add(blades);
  for(let i=0;i<18;i++){
    const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.1+(i%4)*.055,0),stone);
    rock.position.set((i%2?-1:1)*(5.1+Math.sin(i)*.55),-.13,Math.cos(i*2.3)*3.8);
    rock.scale.y=.55;rock.rotation.set(i*.4,i,0);rock.castShadow=true;scene.add(rock);
  }
}
