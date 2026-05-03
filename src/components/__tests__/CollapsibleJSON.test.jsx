import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CollapsibleJSON from '../CollapsibleJSON';

describe('CollapsibleJSON', () => {
  it('renders primitive string values', () => {
    render(<CollapsibleJSON data="hello world" depth={0} />);
    expect(screen.getByText(/hello world/)).toBeInTheDocument();
  });

  it('renders primitive number values', () => {
    render(<CollapsibleJSON data={42} depth={0} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders boolean values', () => {
    render(<CollapsibleJSON data={true} depth={0} />);
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('renders null values', () => {
    render(<CollapsibleJSON data={null} depth={0} />);
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('renders flat objects with keys and values', () => {
    const data = { name: 'Tyler', age: 30 };
    render(<CollapsibleJSON data={data} depth={0} />);
    expect(screen.getByText(/Tyler/)).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders arrays with items', () => {
    const data = ['a', 'b', 'c'];
    render(<CollapsibleJSON data={data} depth={0} />);
    expect(screen.getByText(/a/)).toBeInTheDocument();
    expect(screen.getByText(/b/)).toBeInTheDocument();
    expect(screen.getByText(/c/)).toBeInTheDocument();
  });

  it('renders nested objects with expand/collapse', () => {
    const data = { user: { name: 'Alice', age: 25 } };
    render(<CollapsibleJSON data={data} depth={0} />);

    const allText = document.body.textContent;
    expect(allText).toContain('Alice');
    expect(allText).toContain('25');
  });

  it('collapses nested structures when depth exceeded', () => {
    const data = { a: { b: { c: { d: 'deep' } } } };
    render(<CollapsibleJSON data={data} depth={0} />);
    expect(screen.getByText(/1 key/)).toBeInTheDocument();
  });

  it('shows array brackets', () => {
    render(<CollapsibleJSON data={[1, 2]} depth={0} />);
    const text = document.body.textContent;
    expect(text).toContain('[');
    expect(text).toContain(']');
  });

  it('shows object braces', () => {
    render(<CollapsibleJSON data={{ key: 'val' }} depth={0} />);
    const text = document.body.textContent;
    expect(text).toContain('{');
    expect(text).toContain('}');
  });
});
