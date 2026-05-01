import { useState, useEffect, useCallback, useRef } from 'react';
import { getSkills } from '../lib/api';
import styles from './Skills.module.css';

const CATEGORY_COLORS = {
  frontend: '#6366f1',
  backend: '#10b981',
  devops: '#f59e0b',
};

function Skills() {
  const [skills, setSkills] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const containerRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    const data = await getSkills();
    if (data === null) {
      setError(true);
      setLoading(false);
      return;
    }
    setSkills(Array.isArray(data) ? data : data.skills || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(300, rect.width),
          height: Math.max(350, Math.min(600, rect.width * 0.7)),
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const skillList = skills || [];
  const { width, height } = dimensions;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;
  const nodeRadius = 22;

  const nodes = skillList.map((skill, i) => {
    const angle = (2 * Math.PI * i) / skillList.length - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return { ...skill, x, y, index: i };
  });

  const groupedByCategory = {};
  for (const node of nodes) {
    const cat = node.category || 'other';
    if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
    groupedByCategory[cat].push(node);
  }

  const connections = [];
  for (const categoryNodes of Object.values(groupedByCategory)) {
    if (categoryNodes.length < 2) continue;
    const sorted = [...categoryNodes].sort((a, b) => a.index - b.index);
    for (let i = 0; i < sorted.length; i++) {
      const next = sorted[(i + 1) % sorted.length];
      connections.push({ from: sorted[i], to: next });
    }
  }

  const handleMouseEnter = useCallback((e, node) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setTooltip({
      name: node.name,
      proficiency: node.proficiency || 1,
      years: node.years || 0,
      x: rect.left - containerRect.left + nodeRadius,
      y: rect.top - containerRect.top - 10,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>Skills</h2>
        <div className={styles.skeleton}>
          <div className={styles.skeletonCircle} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>Skills</h2>
        <p className={styles.errorText}>Unable to load skills</p>
        <button className={styles.retryBtn} onClick={fetchData} type="button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Skills</h2>
      <div className={styles.graph} ref={containerRef}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          className={styles.svg}
          aria-label="Skills network graph"
        >
          {connections.map((conn, i) => (
            <line
              key={`conn-${i}`}
              x1={conn.from.x}
              y1={conn.from.y}
              x2={conn.to.x}
              y2={conn.to.y}
              stroke={CATEGORY_COLORS[conn.from.category] || '#6366f1'}
              strokeOpacity="0.3"
              strokeWidth="1.5"
            />
          ))}

          {nodes.map((node) => (
            <g key={node.name || node.index}>
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeRadius}
                fill={CATEGORY_COLORS[node.category] || '#6366f1'}
                fillOpacity="0.15"
                stroke={CATEGORY_COLORS[node.category] || '#6366f1'}
                strokeWidth="2"
                className={styles.nodeCircle}
                onMouseEnter={(e) => handleMouseEnter(e, node)}
                onMouseLeave={handleMouseLeave}
                tabIndex={0}
                role="button"
                aria-label={`${node.name}, proficiency ${node.proficiency || 1}/5`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMouseEnter(e, node);
                  }
                }}
              />
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill={CATEGORY_COLORS[node.category] || '#6366f1'}
                fontSize="12"
                fontWeight="600"
                pointerEvents="none"
              >
                {node.name?.substring(0, 3).toUpperCase() || '?'}
              </text>
            </g>
          ))}
        </svg>

        {tooltip && (
          <div
            className={styles.tooltip}
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
            role="tooltip"
          >
            <div className={styles.tooltipName}>{tooltip.name}</div>
            <div className={styles.tooltipBar}>
              {[1, 2, 3, 4, 5].map((seg) => (
                <span
                  key={seg}
                  className={`${styles.barSeg} ${seg <= tooltip.proficiency ? styles.barFilled : ''}`}
                />
              ))}
            </div>
            {tooltip.years > 0 && (
              <div className={styles.tooltipYears}>
                {tooltip.years} {tooltip.years === 1 ? 'year' : 'years'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Skills;
