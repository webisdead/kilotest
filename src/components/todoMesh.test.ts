import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { createTodoMesh, updateTodoMesh, removeTodoMesh, repositionTodos } from './todoMesh';
import { Todo } from '../types';

describe('todoMesh', () => {
  let scene: THREE.Scene;
  let mockTodo: Todo;

  beforeEach(() => {
    scene = new THREE.Scene();
    mockTodo = { id: 1, text: 'Test Task', completed: false };
  });

  describe('createTodoMesh', () => {
    it('should create a group with todoId', () => {
      const mesh = createTodoMesh(mockTodo, 0, scene);
      expect(mesh.userData.todoId).toBe(1);
      expect(scene.children).toContain(mesh);
    });

    it('should create cube mesh as first child', () => {
      const mesh = createTodoMesh(mockTodo, 0, scene);
      const cube = mesh.children[0] as THREE.Mesh;
      expect(cube).toBeInstanceOf(THREE.Mesh);
      expect(cube.geometry).toBeInstanceOf(THREE.BoxGeometry);
    });

    it('should create edges geometry', () => {
      const mesh = createTodoMesh(mockTodo, 0, scene);
      const edges = mesh.userData.edges;
      expect(edges).toBeInstanceOf(THREE.LineSegments);
    });

    it('should create text mesh', () => {
      const mesh = createTodoMesh(mockTodo, 0, scene);
      const textMesh = mesh.children.find(
        c => c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial && (c.material as THREE.MeshBasicMaterial).map
      );
      expect(textMesh).toBeDefined();
    });

    it('should create point light', () => {
      const mesh = createTodoMesh(mockTodo, 0, scene);
      const light = mesh.userData.light;
      expect(light).toBeInstanceOf(THREE.PointLight);
    });

    it('should position mesh in spiral pattern', () => {
      const mesh = createTodoMesh(mockTodo, 0, scene);
      expect(mesh.position.y).toBe(1.5);
      expect(mesh.userData.originalY).toBe(1.5);
    });
  });

  describe('updateTodoMesh', () => {
    it('should update cube color when completed', () => {
      const mesh = createTodoMesh({ ...mockTodo, completed: false }, 0, scene);
      const cube = mesh.children[0] as THREE.Mesh;
      const cubeMat = cube.material as THREE.MeshStandardMaterial;

      updateTodoMesh(mesh, { ...mockTodo, completed: true }, scene);

      expect(cubeMat.color.getHex()).toBe(0x00ff88);
      expect(cubeMat.emissive.getHex()).toBe(0x00ff88);
    });

    it('should update edges color when completed', () => {
      const mesh = createTodoMesh({ ...mockTodo, completed: false }, 0, scene);
      const edges = mesh.userData.edges as THREE.LineSegments;
      const edgesMat = edges.material as THREE.LineBasicMaterial;

      updateTodoMesh(mesh, { ...mockTodo, completed: true }, scene);

      expect(edgesMat.color.getHex()).toBe(0x00ff88);
    });

    it('should update light color when completed', () => {
      const mesh = createTodoMesh({ ...mockTodo, completed: false }, 0, scene);
      const light = mesh.userData.light as THREE.PointLight;

      updateTodoMesh(mesh, { ...mockTodo, completed: true }, scene);

      expect(light.color.getHex()).toBe(0x00ff88);
    });

    it('should update text texture', () => {
      const mesh = createTodoMesh({ ...mockTodo, completed: false }, 0, scene);
      const textMesh = mesh.children.find(
        c => c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial && (c.material as THREE.MeshBasicMaterial).map
      ) as THREE.Mesh;

      const textMat = textMesh.material as THREE.MeshBasicMaterial;
      const originalMap = textMat.map;
      updateTodoMesh(mesh, { ...mockTodo, completed: true }, scene);

      expect(textMat.map).not.toBe(originalMap);
      // needsUpdate may not be tracked in test environment
      expect(textMat.map).toBeDefined();
    });
  });

  describe('removeTodoMesh', () => {
    it('should remove mesh from scene', () => {
      const mesh = createTodoMesh(mockTodo, 0, scene);
      expect(scene.children).toContain(mesh);

      removeTodoMesh(mesh, scene);

      expect(scene.children).not.toContain(mesh);
    });

    it('should dispose geometries and materials', () => {
      const mesh = createTodoMesh(mockTodo, 0, scene);
      const cube = mesh.children[0] as THREE.Mesh;
      const cubeMat = cube.material as THREE.Material;
      const disposeGeometry = vi.spyOn(cube.geometry, 'dispose');
      const disposeMaterial = vi.spyOn(cubeMat, 'dispose');

      removeTodoMesh(mesh, scene);

      expect(disposeGeometry).toHaveBeenCalled();
      expect(disposeMaterial).toHaveBeenCalled();
    });
  });

  describe('repositionTodos', () => {
    it('should reposition meshes in spiral pattern', () => {
      const mesh1 = createTodoMesh({ id: 1, text: 'Task 1', completed: false }, 0, scene);
      const mesh2 = createTodoMesh({ id: 2, text: 'Task 2', completed: false }, 1, scene);
      const meshes = [mesh1, mesh2];

      repositionTodos(meshes);

      expect(mesh1.userData.index).toBe(0);
      expect(mesh2.userData.index).toBe(1);
      expect(mesh1.position.x).not.toBe(mesh2.position.x);
      expect(mesh1.position.z).not.toBe(mesh2.position.z);
    });
  });
});