import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import * as Tone from 'tone';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// UPDATE: there is a problem in chrome with starting audio context
//  before a user gesture. This fixes it.
var started = 0;
window.addEventListener('click', () => {  
   started++
  if (started > 2) {
    // handleChord(Math.ceil(Math.random() * 0 - 5));
     return;
  }
  started = true;
  console.log('hay');
  Tone.start();
 
  const  chords = ['A0 C1 E1', 'F0 A0 C1', 'G0 B0 D1', 'D0 F0 A0', 'E0 G0 B0'].map(
      formatChords
    );
  console.log(chords);
  let chordIdx = Math.floor(Math.random() * 5),
    step = 0;

  const synth = new Tone.Synth();
  const gain = new Tone.Gain(0.7);
  synth.oscillator.type = 'sine';
  gain.toDestination();
  synth.connect(gain);

  // function handleChord(valueString) {
  //   chordIdx = parseInt(valueString) - 1;
  // }

  Tone.Transport.scheduleRepeat(onRepeat, '16n');
  Tone.Transport.start();
  Tone.Transport.bpm.value = 90;

  function onRepeat(time) {
    let chord = chords[chordIdx],
      note = chord[step % chord.length];
    synth.triggerAttackRelease(note, '16n', time);
    step++;
  }

  function formatChords(chordString) {
    let chord = chordString.split(' ');
    let arr = [];
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < chord.length; j++) {
        let noteOct = chord[j].split(''),
          note = noteOct[0];
        let oct = noteOct[1] === '0' ? i + 4 : i + 5;
        note += oct;
        arr.push(note);
      }
    }
    return arr;
  }
});

let scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);
let camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
let objects = [];

let renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let orbitControls = new OrbitControls(  
  camera, 
  renderer.domElement
);
orbitControls.target.z = 200;
camera.position.z = 1000;
orbitControls.autoRotate = true;


let startColor;
let resized = false;
window.addEventListener('click', () => {
  console.log();
  Tone.start();
});
// resize event listener
window.addEventListener('resize', function () {
  resize();
  const synth = new Tone.Synth();
  const gain = new Tone.Gain(0.7);
  synth.oscillator.type = 'sine';
  gain.toDestination();
  synth.connect(gain);
});

function resize() {
  resized = false;
  renderer.setSize(window.innerWidth, window.innerHeight);
  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
}

function init() {
  setTimeout(()=>{location.reload()}, 10000)
  scene.add(new THREE.AmbientLight(0x0f0f0f));
  let pointLight, directionalLight;
  let light = new THREE.SpotLight(0xffffff, 1.5);
  light.position.set(0, 500, 2000);
  pointLight = new THREE.PointLight(0xff0000, 2, 0);
  pointLight.position.set(1000, 100, 1);
  scene.add(pointLight);
  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);
  scene.fog = new THREE.Fog(0x040306, 10, 300);
  scene.add(light);

  const shape = new THREE.Shape();
  const x = -2.5;
  const y = -5;
  shape.moveTo(x + 2.5, y + 2.5);
  shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
  shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
  shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
  shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
  shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
  shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

  const extrudeSettings = {
    steps: 2,

    depth: 2,

    bevelEnabled: true,
    bevelThickness: 1,

    bevelSize: 1,

    bevelSegments: 2,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  for (let i = 0; i < 300; i++) {
    let object = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
    );

    object.position.x = Math.random() * 1200 - 500;
    object.position.y = Math.random() * 600 - 300;
    object.position.z = Math.random() * 1000 - 100;
    object.castShadow = true;
    object.receiveShadow = true;

    scene.add(object);

    objects.push(object);
  }

  let controls = new DragControls(objects, camera, renderer.domElement);
  controls.addEventListener('dragstart', dragStartCallback);
  controls.addEventListener('dragend', dragendCallback);
}

function dragStartCallback(event) {
  startColor = event.object.material.color.getHex();
  event.object.material.color.setHex(0x000000);
  event.object.rotation.y += 3
  // event.object.position.z += 4;
}

function dragendCallback(event) {
  event.object.material.color.setHex(startColor);
}

function animate() {
  objects.forEach(
    (object) => (
      (object.rotation.y += Math.random() * 0.01 - 0.02),
      (object.rotation.x -= Math.random() * 0.01 - 0.02),
      (object.position.z += Math.random() * 1),
      // (object.position.z -= Math.random() * 2)
      orbitControls.update()
    )
  );
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

init();
animate();
