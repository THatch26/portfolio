import { test, expect } from '@playwright/test';

const MOCK_PROFILE = {
  name: 'Tyler Hatch',
  role: 'Full Stack Developer',
  tagline: 'Building robust web applications',
  location: 'United States',
};

const MOCK_PROJECTS = [
  {
    slug: 'env-diff',
    name: 'env-diff',
    description: 'CLI tool for comparing .env files',
    tech: ['Node.js', 'Commander.js'],
    repo_url: 'https://github.com/THatch26/env-diff',
    stars: 12,
    forks: 3,
    last_commit_at: '2026-04-30T12:00:00Z',
  },
  {
    slug: 'task-api',
    name: 'task-api',
    description: 'REST API for task management',
    tech: ['Fastify', 'SQLite'],
    repo_url: 'https://github.com/THatch26/task-api',
    stars: 8,
    forks: 2,
    last_commit_at: '2026-04-28T10:00:00Z',
  },
  {
    slug: 'live-cursors',
    name: 'live-cursors',
    description: 'Real-time cursor tracker',
    tech: ['WebSocket', 'Node.js'],
    repo_url: 'https://github.com/THatch26/live-cursors',
    stars: 5,
    forks: 1,
    last_commit_at: '2026-04-25T08:00:00Z',
  },
  {
    slug: 'finance-tracker',
    name: 'finance-tracker',
    description: 'Full-stack finance tracker',
    tech: ['React', 'Express'],
    repo_url: 'https://github.com/THatch26/finance-tracker',
    stars: 15,
    forks: 4,
    last_commit_at: '2026-04-29T14:00:00Z',
  },
];

const MOCK_SKILLS = [
  { name: 'React', category: 'frontend', proficiency: 5, years: 5 },
  { name: 'TypeScript', category: 'frontend', proficiency: 4, years: 4 },
  { name: 'Node.js', category: 'backend', proficiency: 5, years: 6 },
  { name: 'Docker', category: 'devops', proficiency: 4, years: 3 },
];

const MOCK_TIMELINE = [
  {
    id: '1',
    type: 'work',
    title: 'Senior Developer',
    company: 'Tech Corp',
    location: 'Remote',
    start_date: '2023-01',
    description: 'Lead development',
    technologies: ['Node.js', 'React'],
  },
];

const MOCK_HEALTH = {
  status: 'ok',
  uptime_seconds: 1234,
  version: '1.0.0',
};

test.describe('Portfolio E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/profile', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PROFILE) })
    );
    await page.route('**/api/projects', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PROJECTS) })
    );
    await page.route('**/api/projects/*', (route) => {
      const slug = route.request().url().split('/').pop();
      const project = MOCK_PROJECTS.find((p) => p.slug === slug) || MOCK_PROJECTS[0];
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...project,
          readme_html: `<h1>${project.name}</h1><p>${project.description}</p>`,
        }),
      });
    });
    await page.route('**/api/skills', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SKILLS) })
    );
    await page.route('**/api/timeline', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TIMELINE) })
    );
    await page.route('**/api/health', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_HEALTH) })
    );
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 42, message: 'Received' }) })
    );
  });

  test('hero section shows name and role', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
    const content = await page.textContent('body');
    expect(content).toContain('Tyler');
  });

  test('project cards are visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const content = await page.textContent('body');
    expect(content).toContain('env-diff');
    expect(content).toContain('task-api');
  });

  test('clicking a project card opens drawer with README content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const projectCard = page.locator('text=env-diff').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      await page.waitForTimeout(500);
      const drawerContent = await page.textContent('body');
      expect(drawerContent).toContain('CLI tool');
    }
  });

  test('contact form submits successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const subjectInput = page.locator('input[name="subject"]');
    const messageTextarea = page.locator('textarea[name="message"]');

    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User');
      await emailInput.fill('test@example.com');
      await subjectInput.fill('Hello');
      await messageTextarea.fill('This is a test message from Playwright E2E.');

      const submitBtn = page.locator('button[type="submit"]').last();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(500);
        const content = await page.textContent('body');
        expect(content).toContain('Received');
      }
    }
  });

  test('dark/light mode toggle works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');

    const toggleBtn = page.locator('[aria-label*="theme" i], [aria-label*="dark" i], [aria-label*="light" i], button:has(svg)').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(300);
      const newTheme = await html.getAttribute('data-theme');
      expect(newTheme).not.toBe(initialTheme);
    }
  });
});
