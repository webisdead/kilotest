import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoStore } from './todoStore';

const STORAGE_KEY = 'cyberpunk-todos';

describe('TodoStore', () => {
  let store: TodoStore;

  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    store = new TodoStore();
  });

  describe('add', () => {
    it('should add a new todo', () => {
      const todo = store.add('Test task');
      expect(todo.text).toBe('Test task');
      expect(todo.completed).toBe(false);
      expect(todo.id).toBeDefined();
    });

    it('should trim whitespace', () => {
      const todo = store.add('  Test task  ');
      expect(todo.text).toBe('Test task');
    });

    it('should persist to localStorage', () => {
      store.add('Test task');
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toContain('Test task');
    });
  });

  describe('getAll', () => {
    it('should return all todos', () => {
      store.add('Task 1');
      store.add('Task 2');
      const todos = store.getAll();
      expect(todos).toHaveLength(2);
    });

    it('should return empty array initially', () => {
      const todos = store.getAll();
      expect(todos).toHaveLength(0);
    });
  });

  describe('remove', () => {
    it('should remove todo by id', () => {
      const todo = store.add('Test task');
      const result = store.remove(todo.id);
      expect(result).toBe(true);
      expect(store.getAll()).toHaveLength(0);
    });

    it('should return false for non-existent id', () => {
      const result = store.remove(999);
      expect(result).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should toggle completed status', () => {
      const todo = store.add('Test task');
      expect(todo.completed).toBe(false);

      const toggled = store.toggle(todo.id);
      expect(toggled?.completed).toBe(true);

      const toggledAgain = store.toggle(todo.id);
      expect(toggledAgain?.completed).toBe(false);
    });

    it('should return null for non-existent id', () => {
      const result = store.toggle(999);
      expect(result).toBeNull();
    });
  });

  describe('clearCompleted', () => {
    it('should remove completed todos', () => {
      const todo1 = store.add('Task 1');
      const todo2 = store.add('Task 2');
      store.toggle(todo1.id);

      const removed = store.clearCompleted();
      expect(removed).toBe(1);
      expect(store.getAll()).toHaveLength(1);
      expect(store.getAll()[0].id).toBe(todo2.id);
    });

    it('should return 0 when no completed todos', () => {
      store.add('Task 1');
      store.add('Task 2');
      const removed = store.clearCompleted();
      expect(removed).toBe(0);
      expect(store.getAll()).toHaveLength(2);
    });
  });

  describe('subscribe', () => {
    it('should notify subscribers on changes', () => {
      const fn = vi.fn();
      const unsubscribe = store.subscribe(fn);

      store.add('Test task');
      expect(fn).toHaveBeenCalledTimes(1);

      unsubscribe();
      store.add('Another task');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});