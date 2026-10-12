import * as THREE from 'three';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export interface TodoMeshData {
  todoId: number;
  index: number;
  originalY: number;
  text: string;
  edges: THREE.LineSegments;
  light: THREE.PointLight;
}

export interface MobileControlsState {
  joystickActive: boolean;
  joystickDelta: { x: number; y: number };
  lookActive: boolean;
  lookDelta: { x: number; y: number };
  crouchActive: boolean;
}

declare global {
  interface Window {
    THREE: typeof THREE;
  }
}

export {};