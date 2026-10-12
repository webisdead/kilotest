import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

let camera, scene, renderer, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, canJump = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

const todos = [];
let todoMeshes = [];
let selectedTodo = null;

// Mobile touch controls
let joystickActive = false;
let joystickStart = { x: 0, y: 0 };
let joystickDelta = { x: 0, y: 0 };
let lookActive = false;
let lookStart = { x: 0, y: 0 };
let lookDelta = { x: 0, y: 0 };
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0f);
  scene.fog = new THREE.FogExp2(0x0a0a0f, 0.008);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  document.getElementById('app').appendChild(renderer.domElement);

  controls = new PointerLockControls(camera, document.body);

  document.addEventListener('click', () => controls.lock());
  controls.addEventListener('lock', () => {});
  controls.addEventListener('unlock', () => {});

  // Mobile touch controls
  if (isMobile) {
    setupMobileControls();
  }

  const onKeyDown = (e) => {
    switch (e.code) {
      case 'ArrowUp': case 'KeyW': moveForward = true; break;
      case 'ArrowLeft': case 'KeyA': moveLeft = true; break;
      case 'ArrowDown': case 'KeyS': moveBackward = true; break;
      case 'ArrowRight': case 'KeyD': moveRight = true; break;
      case 'Space': if (canJump) velocity.y += 220; canJump = false; break;
      case 'ShiftLeft': case 'ShiftRight': camera.position.y = 0.8; break;
    }
  };
  const onKeyUp = (e) => {
    switch (e.code) {
      case 'ArrowUp': case 'KeyW': moveForward = false; break;
      case 'ArrowLeft': case 'KeyA': moveLeft = false; break;
      case 'ArrowDown': case 'KeyS': moveBackward = false; break;
      case 'ArrowRight': case 'KeyD': moveRight = false; break;
      case 'ShiftLeft': case 'ShiftRight': camera.position.y = 1.6; break;
    }
  };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  createEnvironment();
  createTodoObjects();
  setupUI();
  setupRaycaster();
  setupLights();
  window.addEventListener('resize', onWindowResize);
}

function setupMobileControls() {
  const joystickContainer = document.getElementById('joystick-container');
  const joystickBase = document.getElementById('joystick-base');
  const joystickStick = document.getElementById('joystick-stick');
  const lookArea = document.getElementById('look-area');
  const btnJump = document.getElementById('btn-jump');
  const btnCrouch = document.getElementById('btn-crouch');

  const maxDist = 50;

  joystickBase.addEventListener('touchstart', (e) => {
    e.preventDefault();
    joystickActive = true;
    const touch = e.touches[0];
    const rect = joystickBase.getBoundingClientRect();
    joystickStart.x = touch.clientX - rect.left - rect.width / 2;
    joystickStart.y = touch.clientY - rect.top - rect.height / 2;
  }, { passive: false });

  joystickBase.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!joystickActive) return;
    const touch = e.touches[0];
    const rect = joystickBase.getBoundingClientRect();
    const x = touch.clientX - rect.left - rect.width / 2;
    const y = touch.clientY - rect.top - rect.height / 2;
    const dist = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);
    const clampedDist = Math.min(dist, maxDist);
    joystickDelta.x = Math.cos(angle) * clampedDist;
    joystickDelta.y = Math.sin(angle) * clampedDist;
    joystickStick.style.transform = `translate(${joystickDelta.x}px, ${joystickDelta.y}px)`;
  }, { passive: false });

  joystickBase.addEventListener('touchend', () => {
    joystickActive = false;
    joystickDelta = { x: 0, y: 0 };
    joystickStick.style.transform = 'translate(0, 0)';
  });

  lookArea.addEventListener('touchstart', (e) => {
    e.preventDefault();
    lookActive = true;
    const touch = e.touches[0];
    lookStart.x = touch.clientX;
    lookStart.y = touch.clientY;
  }, { passive: false });

  lookArea.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!lookActive) return;
    const touch = e.touches[0];
    lookDelta.x = (touch.clientX - lookStart.x) * 0.005;
    lookDelta.y = (touch.clientY - lookStart.y) * 0.005;
    lookStart.x = touch.clientX;
    lookStart.y = touch.clientY;
  }, { passive: false });

  lookArea.addEventListener('touchend', () => {
    lookActive = false;
    lookDelta = { x: 0, y: 0 };
  });

  let crouchActive = false;
  btnJump.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (canJump) velocity.y += 220;
    canJump = false;
  }, { passive: false });

  btnCrouch.addEventListener('touchstart', (e) => {
    e.preventDefault();
    crouchActive = !crouchActive;
    camera.position.y = crouchActive ? 0.8 : 1.6;
    btnCrouch.style.background = crouchActive 
      ? 'linear-gradient(135deg, #00ffff, #00cccc)' 
      : 'linear-gradient(135deg, #0a0a0f, #1a1a2e)';
    btnCrouch.style.color = crouchActive ? '#0a0a0f' : '#00ffff';
  }, { passive: false });

  // Prevent pointer lock on mobile when touching UI
  document.getElementById('todo-panel').addEventListener('touchstart', (e) => {
    e.stopPropagation();
  }, { passive: true });
}

function createEnvironment() {
  const floorGeo = new THREE.PlaneGeometry(200, 200, 50, 50);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0d0d1a,
    metalness: 0.3,
    roughness: 0.8,
    side: THREE.DoubleSide
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.position.y = -0.01;
  scene.add(floor);

  const gridGeo = new THREE.BufferGeometry();
  const gridPositions = [];
  const gridColors = [];
  const gridSize = 100;
  const gridDivisions = 50;
  const step = gridSize / gridDivisions;

  for (let i = -gridSize / 2; i <= gridSize / 2; i += step) {
    gridPositions.push(-gridSize / 2, 0.02, i, gridSize / 2, 0.02, i);
    gridPositions.push(i, 0.02, -gridSize / 2, i, 0.02, gridSize / 2);
    const intensity = i === 0 ? 1 : 0.3;
    for (let c = 0; c < 4; c++) gridColors.push(0, intensity, 1, intensity * 0.5);
  }

  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
  gridGeo.setAttribute('color', new THREE.Float32BufferAttribute(gridColors, 4));
  const gridMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.4 });
  const grid = new THREE.LineSegments(gridGeo, gridMat);
  scene.add(grid);

  for (let i = 0; i < 30; i++) {
    const h = 5 + Math.random() * 30;
    const w = 3 + Math.random() * 5;
    const d = 3 + Math.random() * 5;
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.8, 0.15),
      metalness: 0.7,
      roughness: 0.3,
      emissive: new THREE.Color(0x00ffff),
      emissiveIntensity: 0.1
    });
    const building = new THREE.Mesh(geo, mat);
    building.position.set(
      (Math.random() - 0.5) * 160,
      h / 2 - 0.01,
      (Math.random() - 0.5) * 160
    );
    building.castShadow = true;
    building.receiveShadow = true;
    scene.add(building);

    addBuildingLights(building.position, w, h, d);
    addBuildingWindows(building.position, w, h, d);
  }

  const particleCount = 2000;
  const particlesGeo = new THREE.BufferGeometry();
  const particlesPos = new Float32Array(particleCount * 3);
  const particlesCol = new Float32Array(particleCount * 3);
  const particlesSize = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    particlesPos[i * 3] = (Math.random() - 0.5) * 200;
    particlesPos[i * 3 + 1] = Math.random() * 50;
    particlesPos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    const c = Math.random() > 0.5 ? new THREE.Color(0x00ffff) : new THREE.Color(0xff00ff);
    particlesCol[i * 3] = c.r;
    particlesCol[i * 3 + 1] = c.g;
    particlesCol[i * 3 + 2] = c.b;
    particlesSize[i] = Math.random() * 2 + 0.5;
  }

  particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlesPos, 3));
  particlesGeo.setAttribute('color', new THREE.BufferAttribute(particlesCol, 3));
  particlesGeo.setAttribute('size', new THREE.BufferAttribute(particlesSize, 1));

  const particlesMat = new THREE.PointsMaterial({
    size: 1,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particles);
  scene.userData.particles = particles;
}

function addBuildingLights(pos, w, h, d) {
  const lightCount = Math.floor(h / 3);
  for (let i = 0; i < lightCount; i++) {
    const y = -h / 2 + 2 + i * 3;
    const colors = [0x00ffff, 0xff00ff, 0xffff00];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const light = new THREE.PointLight(color, 0.5, 10, 2);
    light.position.set(pos.x, pos.y + y, pos.z + d / 2 + 0.5);
    light.castShadow = false;
    scene.add(light);

    const light2 = light.clone();
    light2.position.z = pos.z - d / 2 - 0.5;
    scene.add(light2);

    const light3 = light.clone();
    light3.position.x = pos.x + w / 2 + 0.5;
    light3.position.z = pos.z;
    scene.add(light3);

    const light4 = light.clone();
    light4.position.x = pos.x - w / 2 - 0.5;
    scene.add(light4);
  }
}

function addBuildingWindows(pos, w, h, d) {
  const windowGeo = new THREE.PlaneGeometry(0.8, 1.2);
  const windowMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  for (let side = 0; side < 4; side++) {
    const cols = Math.floor(w / 2);
    const rows = Math.floor(h / 3);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.3) continue;
        const window = new THREE.Mesh(windowGeo, windowMat.clone());
        const x = (c - (cols - 1) / 2) * 2;
        const y = -h / 2 + 1.5 + r * 3;
        let wx = pos.x, wz = pos.z;
        if (side === 0) { wx = pos.x + x; wz = pos.z + d / 2 + 0.01; window.rotation.y = 0; }
        else if (side === 1) { wx = pos.x - w / 2 - 0.01; wz = pos.z - x; window.rotation.y = Math.PI / 2; }
        else if (side === 2) { wx = pos.x - x; wz = pos.z - d / 2 - 0.01; window.rotation.y = Math.PI; }
        else { wx = pos.x + w / 2 + 0.01; wz = pos.z + x; window.rotation.y = -Math.PI / 2; }
        window.position.set(wx, pos.y + y, wz);
        scene.add(window);
      }
    }
  }
}

function createTodoObjects() {
  const stored = localStorage.getItem('cyberpunk-todos');
  if (stored) {
    const parsed = JSON.parse(stored);
    parsed.forEach(t => addTodo(t.text, t.completed, false));
  }
  updateTodoUI();
}

function addTodo(text, completed = false, save = true) {
  const todo = { id: Date.now() + Math.random(), text, completed };
  todos.push(todo);

  const group = new THREE.Group();
  group.userData.todoId = todo.id;

  const cubeGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const cubeMat = new THREE.MeshStandardMaterial({
    color: completed ? 0x00ff88 : 0x00ffff,
    metalness: 0.8,
    roughness: 0.2,
    emissive: completed ? 0x00ff88 : 0x00ffff,
    emissiveIntensity: 0.5
  });
  const cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.castShadow = true;
  cube.receiveShadow = true;
  group.add(cube);

  const edgesGeo = new THREE.EdgesGeometry(cubeGeo);
  const edgesMat = new THREE.LineBasicMaterial({
    color: completed ? 0x00ff88 : 0xff00ff,
    transparent: true,
    opacity: 0.8
  });
  const edges = new THREE.LineSegments(edgesGeo, edgesMat);
  group.add(edges);
  group.userData.edges = edges;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = completed ? '#00ff88' : '#00ffff';
  ctx.font = 'bold 28px Courier New';
  ctx.textAlign = 'center';
  ctx.shadowColor = completed ? '#00ff88' : '#00ffff';
  ctx.shadowBlur = 20;
  ctx.fillText(text.substring(0, 20), 128, 70);
  const textTexture = new THREE.CanvasTexture(canvas);
  const textGeo = new THREE.PlaneGeometry(3, 1.5);
  const textMat = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: false
  });
  const textMesh = new THREE.Mesh(textGeo, textMat);
  textMesh.position.y = 1.5;
  textMesh.renderOrder = 1;
  group.add(textMesh);

  const light = new THREE.PointLight(completed ? 0x00ff88 : 0x00ffff, 1, 5, 2);
  light.position.y = 1;
  group.add(light);
  group.userData.light = light;

  const index = todos.length - 1;
  const angle = (index * 137.5) * Math.PI / 180;
  const radius = 4 + Math.floor(index / 8) * 3;
  group.position.set(
    Math.cos(angle) * radius,
    1.5,
    Math.sin(angle) * radius
  );

  group.userData.originalY = group.position.y;
  group.userData.index = index;
  group.userData.text = text;

  scene.add(group);
  todoMeshes.push(group);

  if (save) {
    saveTodos();
    updateTodoUI();
  }
  return group;
}

function removeTodo(id) {
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return;
  todos.splice(idx, 1);

  const meshIdx = todoMeshes.findIndex(m => m.userData.todoId === id);
  if (meshIdx !== -1) {
    scene.remove(todoMeshes[meshIdx]);
    todoMeshes.splice(meshIdx, 1);
  }

  reorganizeTodos();
  saveTodos();
  updateTodoUI();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;

  const mesh = todoMeshes.find(m => m.userData.todoId === id);
  if (mesh) {
    const cube = mesh.children[0];
    const edges = mesh.userData.edges;
    const light = mesh.userData.light;
    cube.material.color.setHex(todo.completed ? 0x00ff88 : 0x00ffff);
    cube.material.emissive.setHex(todo.completed ? 0x00ff88 : 0x00ffff);
    edges.material.color.setHex(todo.completed ? 0x00ff88 : 0xff00ff);
    light.color.setHex(todo.completed ? 0x00ff88 : 0x00ffff);

    const textMesh = mesh.children.find(c => c.isMesh && c.material.map);
    if (textMesh) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = todo.completed ? '#00ff88' : '#00ffff';
      ctx.font = 'bold 28px Courier New';
      ctx.textAlign = 'center';
      ctx.shadowColor = todo.completed ? '#00ff88' : '#00ffff';
      ctx.shadowBlur = 20;
      ctx.fillText(todo.text.substring(0, 20), 128, 70);
      textMesh.material.map = new THREE.CanvasTexture(canvas);
      textMesh.material.needsUpdate = true;
    }
  }

  saveTodos();
  updateTodoUI();
}

function reorganizeTodos() {
  todoMeshes.forEach((mesh, index) => {
    const angle = (index * 137.5) * Math.PI / 180;
    const radius = 4 + Math.floor(index / 8) * 3;
    mesh.position.x = Math.cos(angle) * radius;
    mesh.position.z = Math.sin(angle) * radius;
    mesh.userData.index = index;
  });
}

function clearCompleted() {
  const completedIds = todos.filter(t => t.completed).map(t => t.id);
  completedIds.forEach(id => removeTodo(id));
}

function saveTodos() {
  localStorage.setItem('cyberpunk-todos', JSON.stringify(todos.map(t => ({ text: t.text, completed: t.completed }))));
}

function setupUI() {
  const input = document.getElementById('todo-input');
  const addBtn = document.getElementById('btn-add');
  const clearBtn = document.getElementById('btn-clear');
  const list = document.getElementById('todo-list');

  const addTodoFromInput = () => {
    const text = input.value.trim();
    if (text) {
      addTodo(text);
      input.value = '';
    }
  };

  input.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTodoFromInput(); });
  addBtn.addEventListener('click', addTodoFromInput);
  clearBtn.addEventListener('click', clearCompleted);
}

function updateTodoUI() {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  todos.forEach(todo => {
    const item = document.createElement('div');
    item.className = 'todo-item' + (todo.completed ? ' completed' : '');
    item.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
      <span class="todo-text">${todo.text}</span>
      <button class="todo-delete">DEL</button>
    `;
    item.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodo(todo.id));
    item.querySelector('.todo-delete').addEventListener('click', () => removeTodo(todo.id));
    list.appendChild(item);
  });
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredMesh = null;

function setupRaycaster() {
  const handlePointerMove = (clientX, clientY) => {
    if (controls.isLocked) return;
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  };

  const handlePointerDown = (clientX, clientY) => {
    if (controls.isLocked) return;
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(todoMeshes.map(m => m.children[0]), true);
    if (intersects.length > 0) {
      const group = intersects[0].object.parent;
      toggleTodo(group.userData.todoId);
    }
  };

  renderer.domElement.addEventListener('mousemove', (e) => handlePointerMove(e.clientX, e.clientY));
  renderer.domElement.addEventListener('click', (e) => handlePointerDown(e.clientX, e.clientY));
  renderer.domElement.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
}

function setupLights() {
  const ambient = new THREE.AmbientLight(0x111122, 0.5);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0x00ffff, 0.3);
  sun.position.set(50, 100, 50);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 200;
  sun.shadow.camera.left = -100;
  sun.shadow.camera.right = 100;
  sun.shadow.camera.top = 100;
  sun.shadow.camera.bottom = -100;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  const neon1 = new THREE.PointLight(0xff00ff, 2, 30, 2);
  neon1.position.set(-20, 10, -20);
  scene.add(neon1);

  const neon2 = new THREE.PointLight(0x00ffff, 2, 30, 2);
  neon2.position.set(20, 10, 20);
  scene.add(neon2);

  const neon3 = new THREE.PointLight(0xffff00, 1.5, 25, 2);
  neon3.position.set(-20, 8, 20);
  scene.add(neon3);

  scene.userData.neonLights = [neon1, neon2, neon3];
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();
  const delta = (time - prevTime) / 1000;

  if (controls.isLocked) {
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta;

    if (isMobile) {
      const deadZone = 15;
      if (Math.abs(joystickDelta.y) > deadZone) {
        moveForward = joystickDelta.y < 0;
        moveBackward = joystickDelta.y > 0;
      } else {
        moveForward = moveBackward = false;
      }
      if (Math.abs(joystickDelta.x) > deadZone) {
        moveRight = joystickDelta.x > 0;
        moveLeft = joystickDelta.x < 0;
      } else {
        moveLeft = moveRight = false;
      }

      if (lookDelta.x !== 0 || lookDelta.y !== 0) {
        const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -lookDelta.x);
        const pitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -lookDelta.y);
        controls.getObject().quaternion.multiply(yaw);
        const euler = new THREE.Euler().setFromQuaternion(controls.getObject().quaternion, 'YXZ');
        euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x + pitch._x));
        controls.getObject().quaternion.setFromEuler(euler);
        lookDelta.x = lookDelta.y = 0;
      }
    }

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    const speed = 200.0;
    if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    controls.getObject().position.y += velocity.y * delta;

    if (controls.getObject().position.y < 1.6) {
      velocity.y = 0;
      controls.getObject().position.y = 1.6;
      canJump = true;
    }
  }

  const t = time * 0.001;
  todoMeshes.forEach((mesh, i) => {
    mesh.rotation.y += 0.003;
    mesh.position.y = mesh.userData.originalY + Math.sin(t * 2 + i) * 0.15;

    const edges = mesh.userData.edges;
    if (edges) edges.rotation.y = -mesh.rotation.y * 0.5;
  });

  if (scene.userData.particles) {
    scene.userData.particles.rotation.y += 0.0001;
    const positions = scene.userData.particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(t + i) * 0.002;
      if (positions[i + 1] > 50) positions[i + 1] = 0;
    }
    scene.userData.particles.geometry.attributes.position.needsUpdate = true;
  }

  scene.userData.neonLights?.forEach((light, i) => {
    light.intensity = 1.5 + Math.sin(t * 2 + i) * 0.5;
  });

  const sun = scene.children.find(c => c.isDirectionalLight);
  if (sun) sun.position.x = Math.sin(t * 0.1) * 50;

  renderer.render(scene, camera);
  prevTime = time;
}