import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApiExplorer from '../ApiExplorer';

describe('ApiExplorer', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ status: 'ok' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with endpoint dropdown', () => {
    render(<ApiExplorer />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('has selectable endpoints', () => {
    render(<ApiExplorer />);
    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');
    expect(options.length).toBeGreaterThanOrEqual(3);
  });

  it('shows endpoint description when selected', () => {
    render(<ApiExplorer />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '/api/health' } });
    const text = document.body.textContent.toLowerCase();
    expect(text).toContain('health');
  });

  it('shows send request button', () => {
    render(<ApiExplorer />);
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('calls API when send is clicked', async () => {
    render(<ApiExplorer />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '/api/health' } });
    
    const sendBtn = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('shows response time after request', async () => {
    render(<ApiExplorer />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '/api/health' } });
    
    const sendBtn = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      const text = document.body.textContent;
      expect(text).toMatch(/ms/);
    }, { timeout: 3000 });
  });

  it('shows HTTP status code with color', async () => {
    render(<ApiExplorer />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '/api/health' } });
    
    const sendBtn = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      const text = document.body.textContent;
      expect(text).toContain('200');
    }, { timeout: 3000 });
  });
});
