import { Todo } from '../types';

const STORAGE_KEY = 'cyberpunk-todos';

export class TodoStore {
  private todos: Todo[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.todos = JSON.parse(stored);
      }
    } catch {
      this.todos = [];
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos));
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getAll(): ReadonlyArray<Todo> {
    return this.todos;
  }

  add(text: string): Todo {
    const todo: Todo = {
      id: Date.now() + Math.random(),
      text: text.trim(),
      completed: false,
    };
    this.todos.push(todo);
    this.save();
    return todo;
  }

  remove(id: number): boolean {
    const idx = this.todos.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.todos.splice(idx, 1);
    this.save();
    return true;
  }

  toggle(id: number): Todo | null {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return null;
    todo.completed = !todo.completed;
    this.save();
    return todo;
  }

  clearCompleted(): number {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(t => !t.completed);
    const removed = initialLength - this.todos.length;
    if (removed > 0) this.save();
    return removed;
  }
}

export const todoStore = new TodoStore();