import styles from './Footer.module.css';

const REPOS = [
  { name: 'env-diff', url: 'https://github.com/tyler/env-diff' },
  { name: 'task-api', url: 'https://github.com/tyler/task-api' },
  { name: 'live-cursors', url: 'https://github.com/tyler/live-cursors' },
  { name: 'finance-tracker', url: 'https://github.com/tyler/finance-tracker' },
];

const TECH = ['React', 'Vite', 'Fastify', 'SQLite', 'Docker'];

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Repos</h3>
          <div className={styles.links}>
            {REPOS.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {repo.name}
              </a>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Built with</h3>
          <div className={styles.techList}>
            {TECH.map((tech) => (
              <span key={tech} className={styles.tech}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        <p className={styles.copyright}>&copy; 2026 Tyler Hatch</p>
      </div>
    </footer>
  );
}

export default Footer;
