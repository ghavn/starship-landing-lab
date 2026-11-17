import * as THREE from 'three';
import './style.css';
import { defaults, initialState, step, advice } from './physics.js';
const $ = id => document.getElementById(id);
let state = initialState(), params = { ...defaults }, paused = false, speed = 1, view = 0, runs = [], accumulator = 0;
const host = $('viewport');
const scene = new THREE.Scene(); scene.background = new THREE.Color('#102329'); scene.fog = new THREE.FogExp2('#102329', .002);
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch { host.innerHTML = '<p style="padding:80px 30px">3D-vyn kräver WebGL. Aktivera hårdvaruacceleration och ladda om sidan.</p>'; throw new Error('WebGL saknas'); }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace; host.append(renderer.domElement); renderer.domElement.setAttribute('aria-label','Starship över en upplyst landningsplatta i ett bergslandskap');
const camera = new THREE.PerspectiveCamera(40, 1, .1, 2000);
scene.add(new THREE.HemisphereLight('#b8e5d9', '#1c3024', 2.4));
const sun = new THREE.DirectionalLight('#ebfbd3', 3); sun.position.set(-50,150,100); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048); Object.assign(sun.shadow.camera,{left:-150,right:150,top:170,bottom:-100,far:500}); scene.add(sun);
function material(color, extra={}) { return new THREE.MeshStandardMaterial({color, roughness:.75, ...extra}); }
function mesh(geo, mat, parent=scene) { const m = new THREE.Mesh(geo, mat); parent.add(m); m.castShadow=true; m.receiveShadow=true; return m; }
const ground = mesh(new THREE.PlaneGeometry(1600,1600), material('#1f3734')); ground.rotation.x=-Math.PI/2; ground.position.y=-.35;
const grid = new THREE.GridHelper(450,45,'#547364','#304a40'); grid.position.y=-.25; grid.material.transparent=true; grid.material.opacity=.3; scene.add(grid);
let seed=17; function rand(){seed=(seed*16807)%2147483647;return seed/2147483647;}
for(let i=0;i<45;i++){const h=15+rand()*65;const mountain=mesh(new THREE.ConeGeometry(20+rand()*40,h,4),material(i%2?'#203b3b':'#294442'));mountain.position.set((rand()-.5)*700,h/2-3,-100-rand()*230);mountain.rotation.y=rand()*6;}
const stars = new THREE.BufferGeometry(); const points=[];for(let i=0;i<450;i++)points.push((rand()-.5)*1200,100+rand()*450,-500+rand()*160);stars.setAttribute('position',new THREE.Float32BufferAttribute(points,3));scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:'#abcbbb',size:.65,transparent:true,opacity:.65})));
const pad=mesh(new THREE.CylinderGeometry(10,11,.9,64),material('#2b4140',{metalness:.5}));pad.position.y=.1;
const ring=mesh(new THREE.TorusGeometry(8.6,.16,8,64),material('#d2f67e',{emissive:'#b8ef57',emissiveIntensity:1.2}));ring.rotation.x=Math.PI/2;ring.position.y=.58;
for(const x of [-2,2]){const line=mesh(new THREE.BoxGeometry(.45,.05,5),material('#e0e9bf'));line.position.set(x,.6,0);}const cross=mesh(new THREE.BoxGeometry(4,.05,.45),material('#e0e9bf'));cross.position.y=.6;
for(let i=0;i<12;i++){let a=i*Math.PI/6;const light=mesh(new THREE.SphereGeometry(.3,8,8),material('#d5fb86',{emissive:'#c9f66a',emissiveIntensity:3}));light.position.set(Math.cos(a)*10,.7,Math.sin(a)*10);}
// All vehicle geometry is generated locally. The group origin is the landing feet.
const ship = new THREE.Group(); scene.add(ship);
const silver=material('#c2d1c9',{metalness:.72,roughness:.32}), dark=material('#263b3c',{metalness:.55});
const body=mesh(new THREE.CylinderGeometry(2.05,2.05,13,32),silver,ship);body.position.y=9.3;
const nose=mesh(new THREE.ConeGeometry(2.05,5.5,32),silver,ship);nose.position.y=18.55;
for(const y of [3.5,5,13,15.5]){const band=mesh(new THREE.TorusGeometry(2.07,.055,6,32),dark,ship);band.rotation.x=Math.PI/2;band.position.y=y;}
const stripe=mesh(new THREE.CylinderGeometry(2.08,2.08,1,32),dark,ship);stripe.position.y=13.5;
for(const x of [-.65,0,.65]){const window=mesh(new THREE.SphereGeometry(.22,12,8),material('#101f28',{metalness:.5}),ship);window.position.set(x,14.7,1.96);}
for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;const leg=mesh(new THREE.BoxGeometry(.26,4.3,.3),dark,ship);leg.position.set(Math.sin(a)*2.7,2.1,Math.cos(a)*2.7);leg.rotation.z=-Math.sin(a)*.5;leg.rotation.x=Math.cos(a)*.5;const foot=mesh(new THREE.CylinderGeometry(.65,.65,.2,12),dark,ship);foot.position.set(Math.sin(a)*3.7,.1,Math.cos(a)*3.7);const fin=mesh(new THREE.BoxGeometry(.2,3,2.6),silver,ship);fin.position.set(Math.sin(a)*2,5.7,Math.cos(a)*2);fin.rotation.y=a;}
const nozzle=mesh(new THREE.CylinderGeometry(.7,1.15,1.4,24),dark,ship);nozzle.position.y=2;
const flame=mesh(new THREE.ConeGeometry(.9,8,20),new THREE.MeshBasicMaterial({color:'#b5ecfa',transparent:true,opacity:.85}),ship);flame.rotation.z=Math.PI;flame.position.y=-2.5;flame.visible=false;
const engineLight=new THREE.PointLight('#aeeaff',0,35);engineLight.position.y=1;ship.add(engineLight);
const trailGeo=new THREE.BufferGeometry();const trail=new THREE.Line(trailGeo,new THREE.LineBasicMaterial({color:'#bfe888',transparent:true,opacity:.35}));scene.add(trail);
function resize(){const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(host);resize();
for(const key of ['brake','stability','drift']){$(key).addEventListener('input',()=>{params[key]=Number($(key).value);$(key+'-out').textContent=params[key].toFixed(2);});}
$('wind').addEventListener('change',()=>params.wind=Number($('wind').value));
function reset(){state=initialState();paused=false;accumulator=0;$('result').hidden=true;$('launch').innerHTML='Starta flygtest <span>↗</span>';trail.geometry.dispose();trail.geometry=new THREE.BufferGeometry();update();}
$('reset').onclick=reset;
$('launch').onclick=()=>{if(['ready','landed','crashed','aborted'].includes(state.status)){reset();state.status='flying';}else paused=!paused;$('launch').innerHTML=paused?'Fortsätt flygtest <span>↗</span>':'Pausa flygtest <span>Ⅱ</span>';};
function preset(b){params={...defaults,brake:b};for(const k of ['brake','stability','drift']){$(k).value=params[k];$(k+'-out').textContent=params[k].toFixed(2);}$('wind').value='0';reset();}
$('balanced').onclick=()=>preset(1);$('bad').onclick=()=>preset(.05);
$('speed').onclick=()=>{speed=speed===1?4:1;$('speed').textContent=speed+'× Hastighet';};$('camera').onclick=()=>view=(view+1)%2;
$('export').onclick=()=>{if(!state.history.length)return;const csv='time_s,altitude_m,vertical_velocity_m_s,offset_m,tilt_rad\n'+state.history.map(h=>[h.time,h.y,h.vy,h.x,h.angle].map(v=>v.toFixed(3)).join(',')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='starship-flight.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function finish(){const won=state.status==='landed';$('result').hidden=false;$('result-label').textContent=won?'FLYGTEST GODKÄNT':'FLYGTEST AVSLUTAT';$('result-title').textContent=won?'Touchdown.':state.status==='aborted'?'Test avbrutet.':'Vi försöker igen.';$('result-text').textContent=advice(state);$('launch').innerHTML='Flyg igen <span>↗</span>';runs.unshift({status:won?'LANDAD':'MISSLYCKAD',time:state.time,speed:state.impact?.speed,offset:state.x});$('history').replaceChildren(...runs.slice(0,3).map((r,i)=>{const p=document.createElement('p');p.textContent=`TEST ${runs.length-i} · ${r.status} · ${r.time.toFixed(1)} s · Träff: ${r.speed?.toFixed(2)??'–'} m/s · Avstånd: ${r.offset.toFixed(1)} m`;return p;}));}
function chart(){const c=$('chart'),ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.strokeStyle='#334737';ctx.lineWidth=1;for(let y=15;y<h;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}if(state.history.length<2)return;ctx.strokeStyle='#c9f66a';ctx.lineWidth=2;ctx.beginPath();state.history.forEach((s,i)=>{const x=s.time/Math.max(20,state.time)*w,y=10+Math.min(45,Math.abs(s.vy))/45*(h-20);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();}
function update(){const ended=['landed','crashed','aborted'].includes(state.status);$('altitude').textContent=state.y.toFixed(1);$('velocity').textContent=state.vy.toFixed(1);$('offset').innerHTML=state.x.toFixed(1)+' <small>m</small>';$('tilt').innerHTML=(state.angle*180/Math.PI).toFixed(1)+' <small>°</small>';$('throttle').innerHTML=Math.round(state.throttle*100)+' <small>%</small>';$('fuel').innerHTML=Math.round(state.fuel)+' <small>%</small>';$('throttle-bar').style.width=(state.throttle*100)+'%';$('fuel-bar').style.width=state.fuel+'%';$('clock').textContent='T+ '+state.time.toFixed(1)+' s';$('phase').textContent=paused?'FLYGTEST PAUSAT':({ready:'REDO FÖR FLYGTEST',flying:'AUTOPILOT AKTIV',landed:'LANDNING BEKRÄFTAD',crashed:'LANDNING MISSLYCKAD',aborted:'TEST AVBRUTET'}[state.status]);$('test-status').textContent=ended?'Flygtest klart':state.status==='flying'?'Samlar flygdata':'Väntar på första testet';$('feedback').textContent=advice(state);$('export').disabled=!state.history.length;chart();}
let last=performance.now(),ui=0;
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.1);last=now;if(!paused&&state.status==='flying'){accumulator+=dt*speed;while(accumulator>=1/120&&state.status==='flying'){step(state,params);accumulator-=1/120;if(state.status!=='flying'){finish();update();}}}
ship.position.set(state.x,state.y+.6,0);ship.rotation.z=state.angle;if(state.status==='crashed')ship.rotation.z+=Math.sign(state.x||1)*.45;
flame.visible=state.status==='flying'&&state.throttle>0;flame.scale.y=.4+state.throttle*(1+.08*Math.sin(now*.07));engineLight.intensity=flame.visible?state.throttle*22:0;
const target=new THREE.Vector3(8,45,0);if(view===0){camera.position.set(150,110,245);camera.lookAt(target);}else{camera.position.set(state.x+55,state.y+35,90);camera.lookAt(state.x,state.y+7,0);}
if(now-ui>100){ui=now;update();const coords=state.history.flatMap(h=>[h.x,h.y+1,0]);trail.geometry.dispose();trail.geometry=new THREE.BufferGeometry();trail.geometry.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));}
renderer.render(scene,camera);}
update();requestAnimationFrame(animate);
