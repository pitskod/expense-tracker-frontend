import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, AuthDesktopBackground, AuthContent } from '../components';
import { apiClient } from '../utils/api';
import './auth.css';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSendCode = async () => {
        setSubmitError(null);

        if (!email.trim()) {
            setSubmitError('Please enter your email.');
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.post<{ message: string }>(
                '/api/auth/forgot-password',
                { email }
            );

            navigate('/verification-code', { state: { email } });
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : 'Failed to send reset code.');
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
            </div>

            {/* Auth Content Panel */}
            <AuthContent>
                <div className="auth-header">
                    <h1 className="auth-title">Forgot password</h1>
                    <p className="auth-subtitle">We will text you a code to verify it is you</p>
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

                <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSendCode(); }}>
                    <div className="form-group">
                        <Input
                            type="email"
                            placeholder="Email"
                            onChange={setEmail}
                            disabled={isSubmitting}
                        />
                    </div>


                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send'}
                    </Button>
                </form>

                <div className="auth-footer">
                    <p><Link to="/sign-in" className="auth-link">← Back to Sign In</Link></p>
                </div>
            </AuthContent>
        </div>
    );
};

export default ForgotPassword;