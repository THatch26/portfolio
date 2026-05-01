import { useState, useEffect, useCallback } from 'react';
import './App.module.css';
import ErrorBoundary from './components/ErrorBoundary';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Projects from './components/Projects';
import ApiExplorer from './components/ApiExplorer';
import Timeline from './components/Timeline';
import Contact from './components/Contact';
import Footer from './components/Footer';
import OfflineBanner from './components/OfflineBanner';

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // localStorage unavailable
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ErrorBoundary>
      <OfflineBanner />
      <Nav theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <section id="hero"><Hero /></section>
        <section id="skills"><Skills /></section>
        <section id="projects"><Projects /></section>
        <section id="explorer"><ApiExplorer /></section>
        <section id="timeline"><Timeline /></section>
        <section id="contact"><Contact /></section>
      </main>
      <Footer />
    </ErrorBoundary>
  );
}

export default App;
