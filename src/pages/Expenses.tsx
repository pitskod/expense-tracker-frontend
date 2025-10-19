import React from 'react';
import { Link } from 'react-router-dom';

const Expenses: React.FC = () => {
    // Sample expense data for the placeholder table
    const sampleExpenses = [
        { id: 1, date: '2024-01-15', description: 'Groceries', amount: 85.50, category: 'Food' },
        { id: 2, date: '2024-01-14', description: 'Gas Station', amount: 45.00, category: 'Transportation' },
        { id: 3, date: '2024-01-13', description: 'Coffee Shop', amount: 12.75, category: 'Food' },
        { id: 4, date: '2024-01-12', description: 'Internet Bill', amount: 65.00, category: 'Utilities' },
        { id: 5, date: '2024-01-11', description: 'Movie Tickets', amount: 28.00, category: 'Entertainment' },
    ];

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

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Expense Tracker</h1>
                <nav style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/sign-in" style={{ textDecoration: 'none', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', borderRadius: '4px' }}>
                        Sign In
                    </Link>
                    <Link to="/sign-up" style={{ textDecoration: 'none', padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', borderRadius: '4px' }}>
                        Sign Up
                    </Link>
                </nav>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <h2>Your Expenses</h2>
                <p>This is a placeholder table showing sample expense data. Future implementation will show user-specific expenses.</p>
            </div>

            <table style={tableStyles}>
                <thead>
                    <tr>
                        <th style={headerStyles}>Date</th>
                        <th style={headerStyles}>Description</th>
                        <th style={headerStyles}>Amount</th>
                        <th style={headerStyles}>Category</th>
                        <th style={headerStyles}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sampleExpenses.map((expense) => (
                        <tr key={expense.id}>
                            <td style={cellStyles}>{expense.date}</td>
                            <td style={cellStyles}>{expense.description}</td>
                            <td style={cellStyles}>${expense.amount.toFixed(2)}</td>
                            <td style={cellStyles}>{expense.category}</td>
                            <td style={cellStyles}>
                                <button style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    Edit
                                </button>
                                <button style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p>Want to manage your expenses? Please <Link to="/sign-in">sign in</Link> or <Link to="/sign-up">create an account</Link>.</p>
            </div>
        </div>
    );
};

export default Expenses;