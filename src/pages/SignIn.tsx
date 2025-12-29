import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, AuthDesktopBackground, AuthContent } from '../components';
import { apiClient, setAccessToken } from '../utils/api';
import './auth.css';

const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSignIn = async () => {
        setSubmitError(null);

        if (!email.trim() || !password.trim()) {
            setSubmitError('Please fill in email and password.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await apiClient.post<{ access_token: string; token_type: string }>(
                '/api/auth/sign-in',
                { email, password }
            );

            // Store access token ONLY in closure (no storage)
            setAccessToken(res.data.access_token);

            // Navigate using replace to avoid back button issues
            navigate('/', { replace: true });
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : 'Sign in failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Desktop Left Panel with YAET Branding */}
            <AuthDesktopBackground />

            {/* Mobile Decorations (hidden on desktop) */}
            <div className="auth-decorations">
                <div className="decoration-circle circle-1"></div>
                <div className="decoration-circle circle-2"></div>
                <div className="decoration-circle circle-3"></div>
                <div className="decoration-square"></div>
                <div className="decoration-lock"></div>
            </div>

            {/* Auth Content Panel */}
            <AuthContent>
                <div className="auth-header">
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Hello there, sign in to continue</p>
                </div>

                {submitError && (
                    <div
                        style={{
                            padding: '12px',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                        }}
                    >
                        {submitError}
                    </div>
                )}

                <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}>
                    <div className="form-group">
                        <Input
                            type="email"
                            placeholder="Email"
                            onChange={setEmail}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            type="password"
                            placeholder="Password"
                            onChange={setPassword}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="forgot-password-link">
                        <Link to="/forgot-password">Forgot your password ?</Link>
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/sign-up" className="auth-link">Sign Up</Link></p>
                </div>
            </AuthContent>
        </div>
    );
};

export default SignIn;