import { useState, useCallback } from 'react';
import styles from './CollapsibleJSON.module.css';

function CollapsibleJSON({ data, depth = 0, maxExpandDepth = 2 }) {
  const [expanded, setExpanded] = useState(depth < maxExpandDepth);

  const toggle = useCallback((e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  }, []);

  if (data === null) {
    return <span className={styles.null}>null</span>;
  }

  if (data === undefined) {
    return <span className={styles.null}>undefined</span>;
  }

  if (typeof data === 'string') {
    return <span className={styles.string}>&quot;{data}&quot;</span>;
  }

  if (typeof data === 'number') {
    return <span className={styles.number}>{data}</span>;
  }

  if (typeof data === 'boolean') {
    return <span className={styles.boolean}>{String(data)}</span>;
  }

  const isArray = Array.isArray(data);
  const entries = isArray ? data : Object.entries(data);
  const isEmpty = isArray ? data.length === 0 : Object.keys(data).length === 0;
  const bracket = isArray ? ['[', ']'] : ['{', '}'];

  if (isEmpty) {
    return (
      <span className={styles.bracket}>
        {bracket[0]}{bracket[1]}
      </span>
    );
  }

  return (
    <div className={styles.node} style={{ paddingLeft: depth === 0 ? 0 : 16 }}>
      <div className={styles.header} onClick={toggle} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); } }} aria-expanded={expanded}>
        <span className={styles.toggle}>{expanded ? '&#8722;' : '+'}</span>
        <span className={styles.bracket}>{bracket[0]}</span>
        {!expanded && (
          <span className={styles.ellipsis}>
            {isArray ? `${data.length} item${data.length !== 1 ? 's' : ''}` : `${Object.keys(data).length} key${Object.keys(data).length !== 1 ? 's' : ''}`}
          </span>
        )}
        {!expanded && <span className={styles.bracket}>{bracket[1]}</span>}
      </div>

      {expanded && (
        <div className={styles.children}>
          {isArray
            ? data.map((item, index) => (
                <div key={index} className={styles.row}>
                  <span className={styles.key}>{index}</span>
                  <span className={styles.colon}>: </span>
                  <CollapsibleJSON
                    data={item}
                    depth={depth + 1}
                    maxExpandDepth={maxExpandDepth}
                  />
                  {index < data.length - 1 && <span className={styles.comma}>,</span>}
                </div>
              ))
            : Object.entries(data).map(([key, value], index) => (
                <div key={key} className={styles.row}>
                  <span className={styles.key}>&quot;{key}&quot;</span>
                  <span className={styles.colon}>: </span>
                  <CollapsibleJSON
                    data={value}
                    depth={depth + 1}
                    maxExpandDepth={maxExpandDepth}
                  />
                  {index < Object.keys(data).length - 1 && <span className={styles.comma}>,</span>}
                </div>
              ))}
          <div className={styles.closing}>
            <span className={styles.bracket}>{bracket[1]}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollapsibleJSON;
