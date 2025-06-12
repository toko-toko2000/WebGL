import 'the-new-css-reset/css/reset.css';
import './style.css';
import * as THREE from "three";
import GUI from 'lil-gui';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import Stats from 'stats-js';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

//GSAP
gsap.registerPlugin(ScrollTrigger);

//UIデバッグ
// const gui = new GUI();

//FPSデバッグ
// const stats = new Stats();
// stats.showPanel(0);
// document.body.appendChild(stats.dom);

//シーン
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);

//カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.z = 5;
scene.add(camera);

//周囲光
const light = new THREE.AmbientLight(0xffffff, 5);
scene.add(light);

const hemisphereLight = new THREE.HemisphereLight(0x000000, 0x000000, 5);
scene.add(hemisphereLight);

// const guiHemisphere = gui.addFolder('半球光');
// guiHemisphere.addColor(hemisphereLight, 'color').name('空の色');
// guiHemisphere.addColor(hemisphereLight, 'groundColor').name('地面の色');
// guiHemisphere.add(hemisphereLight, 'intensity', 0, 5).name('強度');


//軸ヘルパー
// const axesHelper = new THREE.AxesHelper(2);
// scene.add(axesHelper);

// //インスタンス（実体）を変数に代入
// const fontLoader = new FontLoader();

// //ファイルが読み込まれたら実行する
// fontLoader.load('./font/helvetiker_bold.typeface (1).json', (font) => {

//   //テキストジオメトリの追加
//   const material = new THREE.MeshBasicMaterial({ color: 0xCC2F65 });
//   const textGeometry = new TextGeometry("TRIDENT WEBDESIGN CONFERENCE 2025", {
//     font: font,
//     size: 0.3,
//     depth: 0.05,
//     bevelEnabled: true,
//     bevelThickness: 0.03,
//     bevelSize: 0.01,
//     bevelOffset: 0,
//     bevelSegments: 3,
//   });

//   textGeometry.center();

//   const text = new THREE.Mesh(textGeometry, material);
//   scene.add(text);

//   textAnimation(text);

//   console.log(font);
// });

// function textAnimation(text) {
//   function animation() {
//     requestAnimationFrame(animation);
//     text.rotation.x += 0.005;
//     text.rotation.y += 0.005;
//     text.rotation.z += 0.005;
//   }
//   animation();
// }

//レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

//グループ化
const group = new THREE.Group();
scene.add(group);

const leftFillNum = (num) => {
  return num.toString().padStart(2, '0');
};

//オブジェクト

for (let i = 0; i < 100; i++) {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial({ color: 0xb8b8b8 }),
  );

  box.position.x = (Math.random() - 0.5) * 10;
  box.position.y = (Math.random() - 0.5) * 10;
  box.position.z = (Math.random() - 0.5) * 10;
  box.rotation.x = Math.random() * Math.PI;
  box.rotation.y = Math.random() * Math.PI;
  const scale = Math.random();
  box.scale.set(scale, scale, scale);
  group.add(box);
}

const sphere = new THREE.Points(
  new THREE.SphereGeometry(1.5, 16, 32),
  new THREE.PointsMaterial({
    size: 0.05,
    color: 0xb8b8b8,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }
  )
);
scene.add(sphere);

gsap
  .timeline({
    scrollTrigger: {
      trigger: '.sphere',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 'true',
      // markers: 'true',
    }
  })
  .to(sphere.position, {
    z: 10,
    duration: 1,
  })
  .to(sphere.position, {
    z: 10,
    duration: 1,
  })
  .to(sphere.position, {
    y: -2,
    z: -1,
    duration: 1,
  });


//更新
const update = () => {
  // stats.begin();

  group.rotation.x += 0.002;
  group.rotation.y += 0.002;
  group.rotation.z += 0.002;


  renderer.render(scene, camera);
  // stats.end();
  window.requestAnimationFrame(update);
};

update();

//ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});