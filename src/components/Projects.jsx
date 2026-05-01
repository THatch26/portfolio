import { useState, useEffect, useCallback } from 'react';
import { getProjects, getProject } from '../lib/api';
import Skeleton from './Skeleton';
import styles from './Projects.module.css';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

function Projects() {
  const [projects, setProjects] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(false);
    const data = await getProjects();
    if (data === null) {
      setError(true);
      setLoading(false);
      return;
    }
    setProjects(Array.isArray(data) ? data : data.projects || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCardClick = useCallback(async (project) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    setSelectedProject(null);
    const slug = project.slug || project.name?.toLowerCase().replace(/\s+/g, '-');
    const detail = await getProject(slug);
    setSelectedProject(detail || project);
    setDrawerLoading(false);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  }, []);

  const handleCardKeyDown = useCallback(
    (e, project) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick(project);
      }
    },
    [handleCardClick]
  );

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>Projects</h2>
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.card}>
              <Skeleton width="70%" height="22px" borderRadius="4px" />
              <Skeleton width="100%" height="14px" borderRadius="4px" />
              <Skeleton width="100%" height="14px" borderRadius="4px" />
              <div className={styles.cardFooter}>
                <Skeleton width="50px" height="20px" borderRadius="10px" />
                <Skeleton width="50px" height="20px" borderRadius="10px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>Projects</h2>
        <div className={styles.errorCard}>
          <p>Unable to load projects</p>
          <button className={styles.retryBtn} onClick={fetchProjects} type="button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const projectList = projects || [];

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Projects</h2>
      <div className={styles.grid}>
        {projectList.slice(0, 4).map((project) => (
          <div
            key={project.slug || project.name}
            className={styles.card}
            onClick={() => handleCardClick(project)}
            onKeyDown={(e) => handleCardKeyDown(e, project)}
            tabIndex={0}
            role="button"
            aria-label={`View details for ${project.name}`}
          >
            <h3 className={styles.cardName}>{project.name}</h3>
            <p className={styles.cardDesc}>
              {(project.description || '').substring(0, 120)}
              {(project.description || '').length > 120 ? '...' : ''}
            </p>
            <div className={styles.techBadges}>
              {(project.topics || project.tech_stack || []).slice(0, 4).map((tech) => (
                <span key={tech} className={styles.badge}>
                  {tech}
                </span>
              ))}
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.stat} title="Stars">
                &#9733; {project.stargazers_count || 0}
              </span>
              <span className={styles.stat} title="Forks">
                &#9741; {project.forks_count || 0}
              </span>
              <span className={styles.relativeTime}>
                {formatRelativeTime(project.last_commit_at || project.updated_at)}
              </span>
            </div>
            {project.html_url && (
              <a
                href={project.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubLink}
                onClick={(e) => e.stopPropagation()}
                aria-label={`View ${project.name} on GitHub`}
              >
                View on GitHub
              </a>
            )}
          </div>
        ))}
      </div>

      {drawerOpen && (
        <>
          <div
            className={`${styles.backdrop} ${drawerOpen ? styles.backdropVisible : ''}`}
            onClick={closeDrawer}
            role="presentation"
          />
          <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
            <button
              className={styles.closeBtn}
              onClick={closeDrawer}
              aria-label="Close project details"
              type="button"
            >
              &times;
            </button>

            {drawerLoading ? (
              <div className={styles.drawerContent}>
                <Skeleton width="60%" height="28px" borderRadius="4px" />
                <Skeleton width="100%" height="14px" borderRadius="4px" />
                <Skeleton width="100%" height="14px" borderRadius="4px" />
                <Skeleton width="100%" height="14px" borderRadius="4px" />
                <Skeleton width="100%" height="200px" borderRadius="8px" />
              </div>
            ) : selectedProject ? (
              <div className={styles.drawerContent}>
                <h3 className={styles.drawerTitle}>{selectedProject.name}</h3>
                <p className={styles.drawerDesc}>
                  {selectedProject.description || 'No description available.'}
                </p>

                <div className={styles.drawerTech}>
                  {(selectedProject.topics || selectedProject.tech_stack || []).map((tech) => (
                    <span key={tech} className={styles.badge}>
                      {tech}
                    </span>
                  ))}
                </div>

                <div className={styles.drawerStats}>
                  <div className={styles.drawerStat}>
                    <span className={styles.drawerStatValue}>
                      {selectedProject.stargazers_count || 0}
                    </span>
                    <span className={styles.drawerStatLabel}>Stars</span>
                  </div>
                  <div className={styles.drawerStat}>
                    <span className={styles.drawerStatValue}>
                      {selectedProject.forks_count || 0}
                    </span>
                    <span className={styles.drawerStatLabel}>Forks</span>
                  </div>
                  <div className={styles.drawerStat}>
                    <span className={styles.drawerStatValue}>
                      {selectedProject.open_issues_count || 0}
                    </span>
                    <span className={styles.drawerStatLabel}>Issues</span>
                  </div>
                </div>

                {selectedProject.html_url && (
                  <a
                    href={selectedProject.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.drawerGitHubLink}
                  >
                    View on GitHub &#8599;
                  </a>
                )}

                {selectedProject.readme_html && (
                  <div
                    className={styles.readme}
                    dangerouslySetInnerHTML={{
                      __html: selectedProject.readme_html
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
                        .replace(/on\w+\s*=\s*'[^']*'/gi, ''),
                    }}
                  />
                )}
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

export default Projects;
