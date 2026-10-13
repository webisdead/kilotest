import { test, expect } from '@playwright/test';
import { setupWebGLMock, NAV_OPTIONS } from './helpers';

test.describe('Interactive todo features', () => {
  test.beforeEach(async ({ page }) => {
    await setupWebGLMock(page);
    await page.goto('/', NAV_OPTIONS);
    await page.waitForFunction(() => document.querySelector('#todo-input') !== null, { timeout: 10000 });
    await page.waitForFunction(() => document.querySelector('#app canvas') !== null, { timeout: 10000 });
    await page.evaluate(() => {
      const app = document.getElementById('app');
      if (app) app.style.pointerEvents = 'none';
    });
  });

  test('should add a todo item via button click', async ({ page }) => {
    await page.fill('#todo-input', 'Test todo item');
    await page.click('#btn-add');
    await page.waitForFunction(() => document.querySelector('.todo-item') !== null, { timeout: 10000 });
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text').first()).toHaveText('Test todo item');
  });

  test('should add a todo via Enter key', async ({ page }) => {
    await page.fill('#todo-input', 'Enter key todo');
    await page.press('#todo-input', 'Enter');
    await page.waitForFunction(() => document.querySelectorAll('.todo-item').length === 1, { timeout: 10000 });
    await expect(page.locator('.todo-text').first()).toHaveText('Enter key todo');
  });

  test('should toggle a todo as completed via checkbox', async ({ page }) => {
    await page.fill('#todo-input', 'Todo to toggle');
    await page.click('#btn-add');
    await page.waitForFunction(() => document.querySelector('.todo-checkbox') !== null, { timeout: 10000 });

    await page.evaluate(() => {
      const cb = document.querySelector('.todo-checkbox') as HTMLInputElement;
      cb.checked = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const checkbox = page.locator('.todo-checkbox').first();
    await expect(checkbox).toBeChecked();
    await expect(page.locator('.todo-item').first()).toHaveClass(/completed/);
  });

  test('should persist todos in localStorage', async ({ page }) => {
    await page.fill('#todo-input', 'Persistent task');
    await page.click('#btn-add');
    await page.waitForFunction(() => document.querySelector('.todo-item') !== null, { timeout: 10000 });

    await page.reload(NAV_OPTIONS);
    await page.waitForFunction(() => document.querySelector('#todo-input') !== null, { timeout: 10000 });
    await expect(page.locator('.todo-item')).toHaveCount(1, { timeout: 10000 });
    await expect(page.locator('.todo-text').first()).toHaveText('Persistent task');
  });

  test('should clear completed todos', async ({ page }) => {
    await page.fill('#todo-input', 'Task 1');
    await page.click('#btn-add');
    await page.waitForFunction(() => document.querySelector('.todo-checkbox') !== null, { timeout: 10000 });

    await page.evaluate(() => {
      const cb = document.querySelector('.todo-checkbox') as HTMLInputElement;
      cb.checked = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await page.evaluate(() => {
      document.querySelector('#btn-clear')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForFunction(() => document.querySelectorAll('.todo-item').length === 0, { timeout: 10000 });
    await expect(page.locator('.todo-item')).toHaveCount(0);
  });

  test('should remove a todo via delete button', async ({ page }) => {
    await page.fill('#todo-input', 'Task to delete');
    await page.click('#btn-add');
    await page.waitForFunction(() => document.querySelector('.todo-delete') !== null, { timeout: 10000 });

    await page.evaluate(() => {
      const btn = document.querySelector('.todo-delete') as HTMLButtonElement;
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await page.waitForFunction(() => document.querySelectorAll('.todo-item').length === 0, { timeout: 10000 });
    await expect(page.locator('.todo-item')).toHaveCount(0);
  });
});
