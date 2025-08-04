import './style.css';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// シーン
const scene = new THREE.Scene();

// カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.set(0, 3, 5);
scene.add(camera);

// 周囲光
const light = new THREE.AmbientLight(0xffffff, 5);
scene.add(light);

// レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

// コントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* 1. ここから追加 */

let score = 0;

//スコア表示
const scoreDiv = document.createElement('div');
scoreDiv.id = 'score';
scoreDiv.style.position = 'absolute';
scoreDiv.style.top = '10px';
scoreDiv.style.left = '10px';
scoreDiv.style.color = 'white';
scoreDiv.style.fontSize = '20px';
scoreDiv.innerText = 'Score:0';
document.body.appendChild(scoreDiv);

// タイマー表示
const timerDiv = document.createElement('div');
timerDiv.id = 'timer';
timerDiv.style.position = 'absolute';
timerDiv.style.top = '40px';
timerDiv.style.left = '10px';
timerDiv.style.color = 'white';
timerDiv.style.fontSize = '20px';
timerDiv.innerText = 'Time: 00.00';
document.body.appendChild(timerDiv);

// 床
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x808080 })
);
floor.rotation.x = -Math.PI / 2; // 横向きから地面へ
scene.add(floor);

//3Dモデルの読み込み
let player;//update関数内でも使用するため予め宣言しておく
const gltfLoader = new GLTFLoader();
const collectibles = []; // 追加

let startTime; //ゲームスタートした時の時刻を記録するための変数

gltfLoader.load('models/bear.gltf', (gltf) => {
  player = gltf.scene;
  player.scale.set(0.5, 0.5, 0.5);
  player.position.set(0, 1, 0);
  scene.add(player);

  //モデルを読み込み配列に追加
  for (let i = 0; i < 10; i++) {
    const x = (Math.random() - 0.5) * 16;//-8~8
    const z = (Math.random() - 0.5) * 16;

    gltfLoader.load('models/fish.gltf', (gltf => {
      const item = gltf.scene;
      item.scale.set(0.5, 0.5, 0.5);
      const randomHeight = 0.4 + Math.random() * 2;
      item.position.set(x, randomHeight, z);
      item.rotation.y = Math.random() * Math.PI * 2;//ランダムな向き
      scene.add(item);
      collectibles.push(item);
    }));
  }

  startTime = Date.now();

  update();//3Dモデルが読み込まれたら実行する
});

//キーボード入力の状態管理
const keyState = {
  w: false,
  a: false,
  s: false,
  d: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

// 変数追加
let isJumping = false;
let velocityY = 0;
const gravity = -0.01;

//キーを押した時
window.addEventListener('keydown', (event) => {
  if (event.key in keyState) keyState[event.key] = true;

  // ジャンプ処理
  if (event.key === ' ' && !isJumping) {
    isJumping = true;
    velocityY = 0.2; // 初速（上方向）
  }
});

//キーを話した時
window.addEventListener('keyup', (event) => {
  if (event.key in keyState) keyState[event.key] = false;
});

// 更新
const update = () => {
  /* 2. ここから追加 */

  // リアルタイムでタイマーを更新
  if (collectibles.length > 0) { // アイテムが残っている間だけ実行
    const elapsedTime = (new Date() - startTime) / 1000;
    document.getElementById('timer').innerText = `Time: ${elapsedTime.toFixed(2)}`;
  }

  if (player) {
    const speed = 0.1;

    if (keyState.w || keyState.ArrowUp) {
      player.position.z -= speed;
      player.rotation.y = Math.PI;//前向き
    }

    if (keyState.s || keyState.ArrowDown) {
      player.position.z += speed;
      player.rotation.y = 0;//後ろ向き
    }

    if (keyState.a || keyState.ArrowLeft) {
      player.position.x -= speed;
      player.rotation.y = -Math.PI / 2;//左向き
    }

    if (keyState.d || keyState.ArrowRight) {
      player.position.x += speed;
      player.rotation.y = Math.PI / 2;//右向き
    }

    // ジャンプ処理
    if (isJumping) {
      player.position.y += velocityY;
      velocityY += gravity;

      // 着地判定
      if (player.position.y <= 1) {
        player.position.y = 1;
        isJumping = false;
        velocityY = 0;
      }
    }
  }

  //床の外に出ないように制限
  const limit = 9.5; // 20の半分 - プレイヤーの半径（=0.5）
  player.position.x = THREE.MathUtils.clamp(player.position.x, -limit, limit);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -limit, limit);

  //距離を取得する
  collectibles.forEach((item, index) => {
    const distance = player.position.distanceTo(item.position);

    // 距離が近くなったらアイテムを削除する
    if (distance < 1) {
      scene.remove(item);
      collectibles.splice(index, 1);

      //スコアの更新
      score++;
      document.getElementById('score').innerText = `Score:${score}`;

      //全てのアイテムを取得したらクリア
      if (collectibles.length === 0) {
        const win = document.createElement('div');
        win.innerText = `Game Clear!`;
        win.style.position = 'absolute';
        win.style.top = '50%';
        win.style.left = '50%';
        win.style.transform = 'translate(-50%, -50%)';
        win.style.color = 'yellow';
        win.style.fontSize = '32px';
        win.style.fontWeight = 'bold';
        document.body.appendChild(win);

        //経過時間を取得して表示する
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
        const timeDiv = document.createElement('div');
        timeDiv.innerText = `Clear Time:${elapsedTime} Seconds!`;
        timeDiv.style.position = 'absolute';
        timeDiv.style.top = '60%';
        timeDiv.style.left = '50%';
        timeDiv.style.transform = 'translate(-50%, -50%)';
        timeDiv.style.color = 'yellow';
        timeDiv.style.fontSize = '24px';
        timeDiv.style.fontWeight = 'bold';
        document.body.appendChild(timeDiv);
      }
    }
  });

  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(update);
};

// update();

// ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//改造部分はGemini参照