import './style.css';
import * as THREE from "three";
import GUI from 'lil-gui';
import Stats from 'stats-js';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'; //追加
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'; //追加
gsap.registerPlugin(ScrollTrigger);

console.log(gsap);

//UIデバッグ
const gui = new GUI();

//FPSデバッグ
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

//シーン
const scene = new THREE.Scene();

//カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.z = 5;
scene.add(camera);

//軸ヘルパー
// const axesHelper = new THREE.AxesHelper(2);
// scene.add(axesHelper);

//レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

//周囲光
const light = new THREE.AmbientLight(0xffffff, 5);
scene.add(light);


//オブジェクト
const mtlLoader = new MTLLoader();
mtlLoader.load('models/Panda/Panda.mtl', (materials) => {
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load('models/Panda/Panda.obj', (obj) => {
    scene.add(obj);
    obj.scale.set(0.2, 0.2, 0.2);

    gsap.timeline({
      scrollTrigger: {
        trigger: '#tigger01',
        start: 'top center',
        end: 'bottom center',
        toggleActions: 'play none none reverse',
        scrub: true,
        markers: true,
      }
    })
      .to(obj.position, { z: 5 })
      .to(obj.rotation, { z: 3 })
      .to(obj.rotation, { z: 8 })
  });
});

//GUI

//更新
const update = () => {
  stats.begin();
  renderer.render(scene, camera);
  stats.end();
  window.requestAnimationFrame(update);
};

update();

//ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});