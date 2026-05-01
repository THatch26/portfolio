import styles from './Skeleton.module.css';

function Skeleton({ width = '100%', height = '16px', borderRadius = '4px', variant = 'rect' }) {
  const variantClass = styles[variant] || styles.rect;

  return (
    <div
      className={`${styles.skeleton} ${variantClass}`}
      style={{ width, height, borderRadius: variant === 'circle' ? '50%' : borderRadius }}
      aria-hidden="true"
    />
  );
}

export default Skeleton;
