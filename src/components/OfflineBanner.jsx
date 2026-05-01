import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../lib/api';
import styles from './OfflineBanner.module.css';

function OfflineBanner() {
  const [visible, setVisible] = useState(false);

  const check = useCallback(async () => {
    if (!navigator.onLine) {
      setVisible(true);
      return;
    }
    const result = await checkHealth();
    if (result === null) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    check();

    const handleOnline = () => check();
    const handleOffline = () => setVisible(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(check, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [check]);

  if (!visible) return null;

  return (
    <div className={styles.banner} role="alert">
      <span className={styles.icon} aria-hidden="true">&#9888;</span>
      <span className={styles.text}>Unable to connect to API</span>
    </div>
  );
}

export default OfflineBanner;
