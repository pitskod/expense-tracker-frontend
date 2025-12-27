import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, logout } from '../utils/api';
import { Button, DatePicker, Icon, Input, InputLabel, Loader, Logo } from '@/components';
import type { Category } from '@/types';
import styles from './Expenses.module.css';

type Expense = {
    id: number;
    name: string;
    amount: number;
    currency: string;
    category: string;
    date: string | null;
};

type CreateExpensePayload = {
    name: string;
    amount: number;
    currency: string;
    category: string;
    date: string | null;
};

const categoryOptions: Category[] = [
    'mobile',
    'credit',
    'other_payment',
    'hobby',
    'subscription',
    'transport',
    'restaurant',
    'utility',
    'shopping',
    'debt',
];

const currencyOptions = ['USD', 'EUR', 'GBP'] as const;

function formatDate(date: string | null): string {
    if (!date) return '-';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCategory(category: string): string {
    if (!category) return category;
    return category
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function getCurrencySymbol(currency: string): string {
    switch (currency) {
        case 'USD':
            return '$';
        case 'EUR':
            return '€';
        case 'GBP':
            return '£';
        default:
            return currency;
    }
}

function formatAmount(amount: number, currency: string): string {
    const formattedAmount = Number.isFinite(amount) ? amount.toLocaleString() : String(amount);
    const symbol = getCurrencySymbol(currency);
    return `-${symbol}${formattedAmount}`;
}

function getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const Expenses: React.FC = () => {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

    // Create form state
    const [createName, setCreateName] = useState('');
    const [createAmount, setCreateAmount] = useState('');
    const [createCurrency, setCreateCurrency] = useState<(typeof currencyOptions)[number]>('USD');
    const [createCategory, setCreateCategory] = useState<Category>('hobby');
    const [createDate, setCreateDate] = useState(getTodayDateString()); // yyyy-mm-dd (from native date input)
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest(`.${styles.actionMenuContainer}`)) {
                setMenuOpenId(null);
            }
        };

        if (menuOpenId !== null) {
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [menuOpenId]);

    const rows = useMemo(() => expenses, [expenses]);

    const handleSignOut = async () => {
        await logout();
        navigate('/sign-in');
    };

    const resetCreateForm = () => {
        setCreateName('');
        setCreateAmount('');
        setCreateCurrency('USD');
        setCreateCategory('hobby');
        setCreateDate(getTodayDateString());
        setCreateError(null);
        setEditingExpenseId(null);
    };

    const formatDateForInput = (date: string | null): string => {
        if (!date) return getTodayDateString();
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return getTodayDateString();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleEditExpense = (expense: Expense) => {
        setCreateName(expense.name);
        setCreateAmount(String(expense.amount));
        setCreateCurrency(expense.currency as (typeof currencyOptions)[number]);
        setCreateCategory(expense.category as Category);
        setCreateDate(formatDateForInput(expense.date));
        setEditingExpenseId(expense.id);
        setMenuOpenId(null);
        setDrawerOpen(true);
    };

    const handleDeleteExpense = async (id: number) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;
        
        try {
            await apiClient.delete(`/api/expenses/${id}`);
            setExpenses((prev) => prev.filter((exp) => exp.id !== id));
            setMenuOpenId(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete expense');
        }
    };

    const handleCreateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError(null);

        const trimmedName = createName.trim();
        const amountNum = Number(createAmount);

        if (!trimmedName) return setCreateError('Name is required');
        if (!Number.isFinite(amountNum) || amountNum <= 0) return setCreateError('Amount must be greater than 0');
        if (!createCurrency) return setCreateError('Currency is required');
        if (!createCategory) return setCreateError('Category is required');

        const payload: CreateExpensePayload = {
            name: trimmedName,
            amount: amountNum,
            currency: createCurrency,
            category: createCategory,
            date: createDate ? new Date(createDate).toISOString() : null,
        };

        try {
            setCreating(true);
            if (editingExpenseId) {
                // Update existing expense
                const res = await apiClient.patch(`/api/expenses/${editingExpenseId}`, payload);
                setExpenses((prev) => prev.map((exp) => (exp.id === editingExpenseId ? (res.data as Expense) : exp)));
            } else {
                // Create new expense
                const res = await apiClient.post('/api/expenses', payload);
                setExpenses((prev) => [res.data as Expense, ...prev]);
            }
            resetCreateForm();
            // keep open on desktop; close on mobile
            if (!window.matchMedia('(min-width: 1100px)').matches) setDrawerOpen(false);
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : editingExpenseId ? 'Failed to update expense' : 'Failed to create expense');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.logoWrap} aria-label="YAET">
                    <Logo />
                </div>
                <div className={styles.headerActions}>
                    <Link to="/profile" className={styles.headerTextAction}>
                        Profile
                    </Link>
                    <button className={styles.headerTextAction} type="button" onClick={handleSignOut}>
                        Log out
                    </button>
                </div>
            </header>

            <div className={styles.layout}>
                <main className={styles.content}>
                    <div className={styles.tableCard}>
                        {loading ? (
                            <div className={styles.loadingWrapper}>
                                <Loader />
                            </div>
                        ) : error ? (
                            <div className={styles.errorWrapper}>
                                <div className={styles.errorBanner}>{error}</div>
                            </div>
                        ) : rows.length === 0 ? (
                            <div className={styles.emptyWrap}>
                                <div className={styles.emptyTitle}>The list of transactions are empty</div>
                                <p className={styles.emptySubtitle}>
                                    start to add a new one&nbsp; by clicking add button in the left bottom corner of your screen
                                </p>
                                <img
                                    className={styles.emptyImg}
                                    src="/no_transactions.svg"
                                    alt="No transactions"
                                />
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th className={styles.th}>Name</th>
                                            <th className={styles.th}>Category</th>
                                            <th className={styles.th}>Date</th>
                                            <th className={styles.th}>Total</th>
                                            <th className={styles.th}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((expense) => {
                                            const iconCandidate = expense.category as Category;
                                            const canRenderIcon = categoryOptions.includes(iconCandidate);
                                            return (
                                                <tr className={styles.row} key={expense.id}>
                                                    <td className={styles.td}>
                                                        <div className={styles.nameCell}>
                                                            <span className={styles.iconBox} aria-hidden="true">
                                                                {canRenderIcon ? <Icon icon={iconCandidate} size={18} color="white" /> : null}
                                                            </span>
                                                            <span className={styles.expenseName}>{expense.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={styles.muted}>{formatCategory(expense.category)}</span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={styles.muted}>{formatDate(expense.date)}</span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={styles.totalAmount}>
                                                            {formatAmount(expense.amount, expense.currency)}
                                                        </span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <div className={styles.actionMenuContainer}>
                                                            <button
                                                                type="button"
                                                                className={styles.menuButton}
                                                                onClick={() => setMenuOpenId(menuOpenId === expense.id ? null : expense.id)}
                                                                aria-label="More options"
                                                            >
                                                                ⋯
                                                            </button>
                                                            {menuOpenId === expense.id && (
                                                                <div className={styles.menuDropdown}>
                                                                    <button
                                                                        type="button"
                                                                        className={styles.menuItem}
                                                                        onClick={() => handleEditExpense(expense)}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className={styles.menuItem}
                                                                        onClick={() => handleDeleteExpense(expense.id)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {/* Mobile Card View */}
                                <div className={styles.mobileCardList}>
                                    {rows.map((expense) => {
                                        const iconCandidate = expense.category as Category;
                                        const canRenderIcon = categoryOptions.includes(iconCandidate);
                                        return (
                                            <div className={styles.expenseCard} key={expense.id}>
                                                <div className={styles.cardLeft}>
                                                    <span className={styles.cardIcon} aria-hidden="true">
                                                        {canRenderIcon ? <Icon icon={iconCandidate} size={24} color="white" /> : null}
                                                    </span>
                                                    <div className={styles.cardInfo}>
                                                        <div className={styles.cardName}>{expense.name}</div>
                                                        <div className={styles.cardCategory}>{formatCategory(expense.category)}</div>
                                                    </div>
                                                </div>
                                                <div className={styles.cardRight}>
                                                    <div className={styles.cardAmount}>
                                                        {formatAmount(expense.amount, expense.currency)}
                                                    </div>
                                                    <div className={styles.cardDate}>{formatDate(expense.date)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </main>

                            <button
                                type="button"
                                className={styles.fab}
                                aria-label="Add transaction"
                                title="Add"
                                onClick={() => { resetCreateForm(); setDrawerOpen(true); }}
                            >
                                +
                            </button>

                {drawerOpen && <div className={styles.backdrop} onClick={() => { setDrawerOpen(false); resetCreateForm(); }} />}

                {drawerOpen && (
                    <aside className={styles.drawer} aria-label={editingExpenseId ? "Edit expense drawer" : "Create expense drawer"}>
                        <div className={styles.drawerTitle}>{editingExpenseId ? 'Edit expense' : 'Create expense'}</div>
                        <form className={styles.drawerForm} onSubmit={handleCreateExpense}>
                            {createError && <div className={styles.errorBanner}>{createError}</div>}

                            <div className={styles.field}>
                                <InputLabel>Name</InputLabel>
                                <Input placeholder="Text input" value={createName} onChange={setCreateName} />
                            </div>

                            <div className={styles.field}>
                                <InputLabel>Payment amount</InputLabel>
                                <div className={styles.amountRow}>
                                    <Input
                                        placeholder="0"
                                        type="number"
                                        value={createAmount}
                                        onChange={setCreateAmount}
                                    />
                                    <select
                                        className={styles.select}
                                        value={createCurrency}
                                        onChange={(e) => setCreateCurrency(e.target.value as (typeof currencyOptions)[number])}
                                        aria-label="Currency"
                                    >
                                        {currencyOptions.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.field}>
                                <InputLabel>Select category</InputLabel>
                                <div className={styles.categoryGrid}>
                                    {categoryOptions.map((cat) => {
                                        const selected = createCategory === cat;
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                className={`${styles.categoryBtn} ${selected ? styles.categoryBtnSelected : ''}`}
                                                onClick={() => setCreateCategory(cat)}
                                                aria-label={`Category ${cat}`}
                                                title={cat}
                                            >
                                                <Icon icon={cat} size={20} color="grey" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className={styles.field}>
                                <InputLabel>Select date</InputLabel>
                                <DatePicker value={createDate} onChange={setCreateDate} />
                            </div>

                            <div className={styles.drawerFooter}>
                                <button
                                    type="button"
                                    className={styles.closeFab}
                                    onClick={() => { setDrawerOpen(false); resetCreateForm(); }}
                                    aria-label="Close"
                                    title="Close"
                                >
                                    ×
                                </button>
                                <Button type="submit" disabled={creating}>
                                    {creating ? (editingExpenseId ? 'Updating…' : 'Creating…') : (editingExpenseId ? 'Update' : 'Create')}
                                </Button>
                            </div>
                        </form>
                    </aside>
                )}
            </div>
        </div>
    );
};

export default Expenses;