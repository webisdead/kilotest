import * as THREE from 'three';
import { Todo } from '../types';

export function createTodoMesh(todo: Todo, index: number, scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group();
  group.userData.todoId = todo.id;

  const cubeGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const cubeMat = new THREE.MeshStandardMaterial({
    color: todo.completed ? 0x00ff88 : 0x00ffff,
    metalness: 0.8,
    roughness: 0.2,
    emissive: todo.completed ? 0x00ff88 : 0x00ffff,
    emissiveIntensity: 0.5,
  });
  const cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.castShadow = true;
  cube.receiveShadow = true;
  group.add(cube);

  const edgesGeo = new THREE.EdgesGeometry(cubeGeo);
  const edgesMat = new THREE.LineBasicMaterial({
    color: todo.completed ? 0x00ff88 : 0xff00ff,
    transparent: true,
    opacity: 0.8,
  });
  const edges = new THREE.LineSegments(edgesGeo, edgesMat);
  group.add(edges);
  group.userData.edges = edges;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = todo.completed ? '#00ff88' : '#00ffff';
  ctx.font = 'bold 28px Courier New';
  ctx.textAlign = 'center';
  ctx.shadowColor = todo.completed ? '#00ff88' : '#00ffff';
  ctx.shadowBlur = 20;
  ctx.fillText(todo.text.substring(0, 20), 128, 70);
  const textTexture = new THREE.CanvasTexture(canvas);
  const textGeo = new THREE.PlaneGeometry(3, 1.5);
  const textMat = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: false,
  });
  const textMesh = new THREE.Mesh(textGeo, textMat);
  textMesh.position.y = 1.5;
  textMesh.renderOrder = 1;
  group.add(textMesh);

  const light = new THREE.PointLight(todo.completed ? 0x00ff88 : 0x00ffff, 1, 5, 2);
  light.position.y = 1;
  group.add(light);
  group.userData.light = light;

  const angle = (index * 137.5) * Math.PI / 180;
  const radius = 4 + Math.floor(index / 8) * 3;
  group.position.set(Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius);
  group.userData.originalY = group.position.y;
  group.userData.index = index;
  group.userData.text = todo.text;

  scene.add(group);
  return group;
}

export function updateTodoMesh(
  group: THREE.Group,
  todo: Todo,
  _scene: THREE.Scene
): void {
  const cube = group.children[0] as THREE.Mesh;
  const edges = group.userData.edges as THREE.LineSegments;
  const light = group.userData.light as THREE.PointLight;

  const cubeMat = cube.material as THREE.MeshStandardMaterial;
  const edgesMat = edges.material as THREE.LineBasicMaterial;

  cubeMat.color.setHex(todo.completed ? 0x00ff88 : 0x00ffff);
  cubeMat.emissive.setHex(todo.completed ? 0x00ff88 : 0x00ffff);
  edgesMat.color.setHex(todo.completed ? 0x00ff88 : 0xff00ff);
  light.color.setHex(todo.completed ? 0x00ff88 : 0x00ffff);

  const textMesh = group.children.find(
    c => c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial && (c.material as THREE.MeshBasicMaterial).map
  ) as THREE.Mesh | undefined;

  if (textMesh) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = todo.completed ? '#00ff88' : '#00ffff';
    ctx.font = 'bold 28px Courier New';
    ctx.textAlign = 'center';
    ctx.shadowColor = todo.completed ? '#00ff88' : '#00ffff';
    ctx.shadowBlur = 20;
    ctx.fillText(todo.text.substring(0, 20), 128, 70);
    const textMat = textMesh.material as THREE.MeshBasicMaterial;
    textMat.map = new THREE.CanvasTexture(canvas);
    textMat.needsUpdate = true;
  }
}

export function removeTodoMesh(group: THREE.Group, scene: THREE.Scene): void {
  scene.remove(group);
  group.traverse(obj => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
    if (obj instanceof THREE.LineSegments) {
      obj.geometry.dispose();
      obj.material.dispose();
    }
    if (obj instanceof THREE.PointLight) {
      // lights don't need disposal
    }
  });
}

export function repositionTodos(meshes: THREE.Group[]): void {
  meshes.forEach((mesh, index) => {
    const angle = (index * 137.5) * Math.PI / 180;
    const radius = 4 + Math.floor(index / 8) * 3;
    mesh.position.x = Math.cos(angle) * radius;
    mesh.position.z = Math.sin(angle) * radius;
    mesh.userData.index = index;
  });
}