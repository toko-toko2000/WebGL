import './style.css';
import * as THREE from "three";
import GUI from 'lil-gui';
import Stats from 'stats-js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

// UIデバッグ
const gui = new GUI();

// FPSデバッグ
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// シーン
const scene = new THREE.Scene();

// カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.z = 5;
scene.add(camera);

// 環境マップの読み込み
const loader = new THREE.CubeTextureLoader();
const environmentMap = loader.load([
  'textures/cube/posx.jpg', // 右面
  'textures/cube/negx.jpg', // 左面
  'textures/cube/posy.jpg', // 上面
  'textures/cube/negy.jpg', // 下面
  'textures/cube/posz.jpg', // 前面
  'textures/cube/negz.jpg', // 背面
]);

//背景に設定
scene.background = environmentMap;

// 周囲光
const light = new THREE.AmbientLight(0xffffff, 5);
scene.add(light);

// 軸ヘルパー
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

// レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

// コントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ドラッグコントロール
const draggableObjects = []; // ドラッグ可能なオブジェクトを配列にまとめる
const dragControls = new DragControls(draggableObjects, camera, renderer.domElement); // ドラッグコントロールの初期化

//数字付きテクスチャ
function createNumberTexture(number) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // 数字
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(number, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const limit = 26;

//箱100個
for (let i = 1; i < 26; i++) {
  const texture = createNumberTexture(i);
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ map: texture })
  );

  box.position.set(
    (Math.random() - 0.5) * 30,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 30
  );
  box.name = i;

  scene.add(box);
  draggableObjects.push(box);
}

//ドラッグコントロールのイベントリスナー
// OrbitControlsとDragControlsを併用する場合、ドラッグ中はOrbitControlsを無効にする必要がある
dragControls.addEventListener('dragstart', () => controls.enabled = false);
dragControls.addEventListener('dragend', () => controls.enabled = true);

/*----------Raycaster----------*/

//初期設定
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//要素を取得
const info = document.getElementById('info');

let currentNumber = 1;

//マウスクリックイベント
window.addEventListener('click', (event) => {

  //マウス座標を正規化
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  //レイキャストを更新
  raycaster.setFromCamera(mouse, camera);

  //オブジェクトとの交差を検出
  const intersects = raycaster.intersectObjects(draggableObjects, true);//変更

  //配列の中身を取り出す
  intersects.forEach((intersect) => {

    //対象がオブジェクトの場合
    if (intersect.object.isMesh) {
      if (currentNumber == intersect.object.name) {
        intersect.object.material.color.set(0xff0000);
        info.textContent = `${intersect.object.name}がクリックされました。`;
        currentNumber++;

        if (currentNumber > limit) {
          info.textContent = `クリア！`;
        }
      }
    }

  });
});

/*----------Raycaster to this point----------*/

// 更新
const update = () => {
  stats.begin();
  renderer.render(scene, camera);
  controls.update();
  stats.end();
  window.requestAnimationFrame(update);
};

update();

// ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});