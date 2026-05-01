import { useState, useEffect, useCallback } from 'react';
import { getProfile, getProjects } from '../lib/api';
import Skeleton from './Skeleton';
import styles from './Hero.module.css';

const TAGLINES = ['Full-Stack Developer', 'Open Source Contributor', 'Problem Solver'];

function Hero() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    const [profileData, projectsData] = await Promise.all([
      getProfile(),
      getProjects(),
    ]);
    if (profileData === null || projectsData === null) {
      setError(true);
      setLoading(false);
      return;
    }
    setProfile(profileData);
    setProjects(projectsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (loading) return;
    const current = TAGLINES[taglineIndex];
    let timeout;

    if (!isDeleting && displayText === current) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    } else {
      timeout = setTimeout(
        () => {
          setDisplayText((prev) =>
            isDeleting
              ? current.substring(0, prev.length - 1)
              : current.substring(0, prev.length + 1)
          );
        },
        isDeleting ? 40 : 80
      );
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, taglineIndex, loading]);

  const totalStars =
    projects && Array.isArray(projects) && !projects.error
      ? projects.reduce((sum, p) => sum + (p.stargazers_count || 0), 0)
      : 0;
  const totalForks =
    projects && Array.isArray(projects) && !projects.error
      ? projects.reduce((sum, p) => sum + (p.forks_count || 0), 0)
      : 0;

  if (loading) {
    return (
      <div className={styles.hero}>
        <div className={styles.content}>
          <Skeleton width="280px" height="48px" borderRadius="8px" />
          <Skeleton width="200px" height="24px" borderRadius="4px" />
          <Skeleton width="150px" height="20px" borderRadius="4px" />
          <div className={styles.statsSkeleton}>
            <Skeleton width="120px" height="60px" borderRadius="12px" />
            <Skeleton width="120px" height="60px" borderRadius="12px" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.hero}>
        <div className={styles.content}>
          <p className={styles.errorText}>Unable to load profile</p>
          <button className={styles.retryBtn} onClick={fetchData} type="button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.name}>{profile?.name || 'Tyler Hatch'}</h1>
        <h2 className={styles.role}>{profile?.role || 'Software Engineer'}</h2>
        {profile?.location && <p className={styles.location}>{profile.location}</p>}
        <p className={styles.tagline}>
          <span className={styles.typewriter}>{displayText}</span>
          <span className={styles.cursor}>|</span>
        </p>
        <div className={styles.stats}>
          <div className={styles.statPill}>
            <span className={styles.statValue}>{totalStars.toLocaleString()}</span>
            <span className={styles.statLabel}>GitHub Stars</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.statValue}>{totalForks.toLocaleString()}</span>
            <span className={styles.statLabel}>Forks</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
