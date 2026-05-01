import { useState, useEffect, useCallback, useRef } from 'react';
import { getTimeline } from '../lib/api';
import Skeleton from './Skeleton';
import styles from './Timeline.module.css';

function Timeline() {
  const [entries, setEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const itemRefs = useRef([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    const data = await getTimeline();
    if (data === null) {
      setError(true);
      setLoading(false);
      return;
    }
    const list = Array.isArray(data) ? data : data.timeline || [];
    const sorted = [...list].sort((a, b) => {
      const dateA = a.start_date || a.startDate || '';
      const dateB = b.start_date || b.startDate || '';
      return dateB.localeCompare(dateA);
    });
    setEntries(sorted);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!entries || entries.length === 0) return;

    const observer = new IntersectionObserver(
      (items) => {
        for (const item of items) {
          if (item.isIntersecting) {
            item.target.classList.add(styles.visible);
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    const currentRefs = itemRefs.current;
    for (const ref of currentRefs) {
      if (ref) observer.observe(ref);
    }

    return () => observer.disconnect();
  }, [entries]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>Timeline</h2>
        <div className={styles.timeline}>
          <div className={styles.line} />
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${styles.item} ${i % 2 === 0 ? styles.right : styles.left}`}>
              <div className={styles.card}>
                <Skeleton width="60%" height="20px" borderRadius="4px" />
                <Skeleton width="40%" height="14px" borderRadius="4px" />
                <Skeleton width="80%" height="14px" borderRadius="4px" />
                <Skeleton width="100%" height="14px" borderRadius="4px" />
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
        <h2 className={styles.heading}>Timeline</h2>
        <p className={styles.errorText}>Unable to load timeline</p>
        <button className={styles.retryBtn} onClick={fetchData} type="button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Timeline</h2>
      <div className={styles.timeline}>
        <div className={styles.line} />
        {entries.map((entry, index) => {
          const isRight = index % 2 !== 0;
          const title = entry.title || entry.position || '';
          const company = entry.company || entry.organization || '';
          const start = entry.start_date || entry.startDate || '';
          const end = entry.end_date || entry.endDate || 'Present';
          const desc = entry.description || '';
          const techs = entry.tech_stack || entry.technologies || [];

          return (
            <div
              key={entry.id || index}
              ref={(el) => { itemRefs.current[index] = el; }}
              className={`${styles.item} ${isRight ? styles.right : styles.left}`}
            >
              <div className={styles.card}>
                <div className={styles.dot} aria-hidden="true" />
                <h3 className={styles.title}>{title}</h3>
                {company && <p className={styles.company}>{company}</p>}
                <p className={styles.dateRange}>
                  {start} &mdash; {end}
                </p>
                {desc && <p className={styles.desc}>{desc}</p>}
                {techs.length > 0 && (
                  <div className={styles.techs}>
                    {techs.map((tech) => (
                      <span key={tech} className={styles.tech}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Timeline;
