import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, logout } from '../../utils/api';
import { Logo } from '@/components';
import styles from './Profile.module.css';

type MeResponse = {
  id: number;
  email: string;
  name: string;
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get<MeResponse>('/api/users/me');
        if (!mounted) return;
        setMe(res.data);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : 'Failed to load profile');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    await logout();
    navigate('/sign-in');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoWrap} aria-label="YAET">
          <Logo />
        </div>
        <div className={styles.headerActions}>
          <Link to="/" className={styles.headerTextAction}>
            Back to expenses
          </Link>
          <button type="button" onClick={handleSignOut} className={styles.headerTextAction}>
            Log out
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <h2 className={styles.sectionTitle}>Your Profile</h2>

        {loading && <div className={styles.loading}>Loading...</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && (
          <div className={styles.card}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <th className={styles.th}>Name</th>
                  <td className={styles.td}>{me?.name || '-'}</td>
                </tr>
                <tr>
                  <th className={styles.th}>Email</th>
                  <td className={styles.td}>{me?.email || '-'}</td>
                </tr>
                <tr>
                  <th className={styles.th}>User ID</th>
                  <td className={styles.td}>{me?.id ?? '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;


