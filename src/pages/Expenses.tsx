import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, logout } from '../utils/api';

const Expenses: React.FC = () => {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState<Array<{
        id: number;
        name: string;
        amount: number;
        currency: string;
        category: string;
        date: string | null;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await apiClient.get('/api/expenses');
                if (!mounted) return;
                setExpenses(res.data);
            } catch (e) {
                if (!mounted) return;
                setError(e instanceof Error ? e.message : 'Failed to load expenses');
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const tableStyles: React.CSSProperties = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '1rem'
    };

    const cellStyles: React.CSSProperties = {
        border: '1px solid #ddd',
        padding: '12px',
        textAlign: 'left'
    };

    const headerStyles: React.CSSProperties = {
        ...cellStyles,
        backgroundColor: '#f2f2f2',
        fontWeight: 'bold'
    };

    const rows = useMemo(() => expenses, [expenses]);

    const handleSignOut = async () => {
        await logout();
        navigate('/sign-in');
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Expense Tracker</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link
                        to="/profile"
                        title="Profile"
                        aria-label="Profile"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            borderRadius: '999px',
                            border: '1px solid #e5e7eb',
                            background: 'white',
                            color: '#111827',
                            textDecoration: 'none',
                        }}
                    >
                        {/* simple profile icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                                d="M20 21a8 8 0 1 0-16 0"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <path
                                d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Link>

                    <button
                        onClick={handleSignOut}
                        style={{
                            textDecoration: 'none',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Sign out
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <h2>Your Expenses</h2>
                <p style={{ color: '#6b7280' }}>
                    This table is protected and shows only expenses belonging to the signed-in user.
                </p>
            </div>

            {loading && <div>Loading...</div>}
            {error && <div style={{ color: '#991b1b' }}>{error}</div>}

            <table style={tableStyles}>
                <thead>
                    <tr>
                        <th style={headerStyles}>Date</th>
                        <th style={headerStyles}>Name</th>
                        <th style={headerStyles}>Amount</th>
                        <th style={headerStyles}>Currency</th>
                        <th style={headerStyles}>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {!loading && rows.length === 0 ? (
                        <tr>
                            <td style={cellStyles} colSpan={5}>
                                No expenses yet.
                            </td>
                        </tr>
                    ) : (
                        rows.map((expense) => (
                            <tr key={expense.id}>
                                <td style={cellStyles}>{expense.date ? new Date(expense.date).toLocaleDateString() : '-'}</td>
                                <td style={cellStyles}>{expense.name}</td>
                                <td style={cellStyles}>{expense.amount.toFixed(2)}</td>
                                <td style={cellStyles}>{expense.currency}</td>
                                <td style={cellStyles}>{expense.category}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Expenses;