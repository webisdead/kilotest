import { test, expect } from '@playwright/test';
import { setupWebGLMock, NAV_OPTIONS } from './helpers';

test.describe('App structure and UI', () => {
  test.beforeEach(async ({ page }) => {
    await setupWebGLMock(page);
    await page.goto('/', NAV_OPTIONS);
    await page.waitForFunction(() => document.querySelector('#ui h1') !== null, { timeout: 10000 });
  });

  test('should display the app title', async ({ page }) => {
    const text = await page.evaluate(() => document.querySelector('#ui h1')?.textContent);
    expect(text).toBe('CYBERPUNK TODO');
  });

  test('should render a Three.js canvas in #app', async ({ page }) => {
    await page.waitForFunction(() => document.querySelector('#app canvas') !== null, { timeout: 10000 });
    await expect(page.locator('#app canvas')).toBeVisible();
  });

  test('should display the subtitle', async ({ page }) => {
    const text = await page.evaluate(() => document.querySelector('#ui .subtitle')?.textContent);
    expect(text).toContain('NEURAL INTERFACE');
  });

  test('should have functional control buttons', async ({ page }) => {
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    expect(html).toContain('id="btn-add"');
    expect(html).toContain('+ ADD TASK');
    expect(html).toContain('id="btn-clear"');
    expect(html).toContain('CLEAR DONE');
  });

  test('should have a todo input field', async ({ page }) => {
    const placeholder = await page.evaluate(() => document.querySelector('#todo-input')?.getAttribute('placeholder'));
    expect(placeholder).toBe('ENTER NEW DIRECTIVE...');
  });

  test('should have a todo list container', async ({ page }) => {
    const exists = await page.evaluate(() => document.getElementById('todo-list') !== null);
    expect(exists).toBeTruthy();
  });
});
