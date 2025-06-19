import './style.css';
import * as THREE from "three";
import GUI from 'lil-gui';
import Stats from 'stats-js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es'; //追加

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
camera.position.x = 0;
camera.position.y = 10;
camera.position.z = 15;
scene.add(camera);

//周囲光;
const light = new THREE.AmbientLight(0xffffff, 10);
scene.add(light);

//軸ヘルパー
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

//レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

//コントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/*cannon-es　ここから*/

//物理空間の設定
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);//重力を設定(-9.82:地球上の重力定数)

//材質の設定（変数名、括弧内の値、共に任意の名前）
const concrete = new CANNON.Material('concrete');
const rubber = new CANNON.Material('rubber');

//材質同士が衝突した際の値を設定
const rubberConcrete = new CANNON.ContactMaterial(rubber, concrete, {
  friction: 0.6, //摩擦力の強さ（1に近いほど滑りにくい）
  restitution: 0.6, //跳ね返りの強さ（1に近いほどよく跳ねる）
});
world.addContactMaterial(rubberConcrete); //設定を物理空間に登録

//材質同士が衝突した際の値を設定
const rubberRubber = new CANNON.ContactMaterial(rubber, rubber, {
  friction: 0.6, //摩擦力の強さ（1に近いほど滑りにくい）
  restitution: 1.5, //跳ね返りの強さ（1に近いほどよく跳ねる）
});
world.addContactMaterial(rubberRubber); //設定を物理空間に登録

const spheres = [];//空の配列を宣言（球体）

//関数にまとめる（球体）
const createSphere = (x = 0, y = 10, z = 0, size = 0.5) => {
  //球体
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32), //変更
    new THREE.MeshBasicMaterial({
      color: 0xffff00,
    })
  );
  scene.add(sphere);

  //物理演算用の球体（画面上には表示されない）
  const sphereBody = new CANNON.Body({
    mass: 1,//質量
    material: rubber, //追加
    position: new CANNON.Vec3(x, y, z), //変更
    shape: new CANNON.Sphere(size), //変更
  });
  world.addBody(sphereBody);//物理空間に追加

  //オブジェクトの形で値をプッシュ（追加）する
  spheres.push({
    mesh: sphere,
    body: sphereBody,
  });
}

//for文で繰り返す（球体）
for (let i = 0; i < 100; i++) {
  //変更
  createSphere(
    Math.random() * 10 - 5,
    Math.random() * 10 + 5,
    Math.random() * 10 - 5,
    Math.random() * 0.5 + 0.1
  );
}

const boxes = [];//空の変数を宣言（箱）

//関数にまとめる（箱）
const createBox = (x = 0, y = 5, z = 0, size = 1) => {
  //箱
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size),
    new THREE.MeshBasicMaterial({
      color: 0xff00ff,
    })
  );
  scene.add(box);

  //物理演算用の箱
  const boxBody = new CANNON.Body({
    mass: 1,
    material: rubber, //追加
    position: new CANNON.Vec3(x, y, z), //変更
    shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)), //halfExtents（半分の範囲）
  });
  world.addBody(boxBody);

  //オブジェクトの形で値をプッシュ（追加）する
  boxes.push({
    mesh: box,
    body: boxBody,
  });
}

//ウィンドウにクリックイベントを登録
window.addEventListener('click', () => {
  createBox(
    Math.random() * 10 - 5,
    Math.random() * 10 + 5,
    Math.random() * 10 - 5,
    Math.random() * 0.5 + 0.1
  );
});

//床（箱に変更）
const floor = new THREE.Mesh(
  new THREE.BoxGeometry(10, 1, 10), //変更
  new THREE.MeshBasicMaterial({
    color: 0x777777,
  })
);
//回転させない floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const floorBody = new CANNON.Body({
  mass: 0,
  material: concrete, //追加
  shape: new CANNON.Box(new CANNON.Vec3(5, 0.5, 5)), //変更
});
world.addBody(floorBody);

floorBody.position.copy(floor.position);
floorBody.quaternion.copy(floor.quaternion);

/*cannon-es　ここまで*/

//更新
const update = () => {
  stats.begin();

  //物理空間の更新（1秒間に60回）
  world.fixedStep();

  // //紐づける
  // sphere.position.copy(sphereBody.position);//位置
  // sphere.quaternion.copy(sphereBody.quaternion);//回転

  //変更
  spheres.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });

  // //追加
  // box.position.copy(boxBody.position);
  // box.quaternion.copy(boxBody.quaternion);

  //変更
  boxes.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });

  renderer.render(scene, camera);
  controls.update();
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