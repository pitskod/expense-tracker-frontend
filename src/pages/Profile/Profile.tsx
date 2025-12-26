import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, logout } from '../../utils/api';
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
      <div className={styles.panel}>
        <div className={styles.topRow}>
          <h1 className={styles.brand}>Expense Tracker</h1>
          <div className={styles.actions}>
            <Link to="/" className={styles.linkButton}>
              Back to expenses
            </Link>
            <button onClick={handleSignOut} className={styles.button}>
              Sign out
            </button>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Your Profile</h2>
        <p className={styles.subtitle}>This page is protected and shows only your user details.</p>

        {loading && <div>Loading...</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && (
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
        )}
      </div>
    </div>
  );
};

export default Profile;


