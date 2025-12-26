import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, AuthDesktopBackground, AuthContent } from '../components';
import './auth.css';

interface VerificationFormData {
    code: string;
}

const schema = yup.object({
    code: yup
        .string()
        .required('Reset code is required')
        .min(6, 'Reset code must be at least 6 characters')
        .max(8, 'Reset code must be at most 8 characters'),
});

const VerificationCode: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const state = (location.state || {}) as { email?: string };
    const email = state.email;

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<VerificationFormData>({
        resolver: yupResolver(schema),
        mode: 'onSubmit',
    });

    const onSubmit = async (data: VerificationFormData) => {
        setSubmitError(null);
        setIsSubmitting(true);
        try {
            navigate('/restore-password', {
                state: { email, reset_code: data.code },
            });
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : 'Failed to continue.');
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
            </div>

            {/* Auth Content Panel */}
            <AuthContent>
                <div className="auth-header">
                    <h1 className="auth-title">Forgot password</h1>
                    <p className="auth-subtitle">Type a code</p>
                </div>

                <div className="verification-info">
                    <p style={{ color: '#718096', margin: '1rem 0', textAlign: 'center' }}>
                        We have sent you a code to verify your email <br />
                        <span className="verification-email">{email || 'your email'}</span>
                    </p>
                    <p style={{ color: '#718096', fontSize: '0.9rem', textAlign: 'center' }}>
                        This code expires in 60 minutes
                    </p>
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

                {!email && (
                    <div style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#718096' }}>
                        Please go back and submit your email first.{' '}
                        <Link to="/forgot-password" className="auth-link">Back</Link>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <Controller
                            name="code"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder="Reset code"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    disabled={isSubmitting || !email}
                                    error={!!errors.code}
                                    helperText={errors.code?.message}
                                />
                            )}
                        />
                    </div>

                    <Button type="submit" disabled={isSubmitting || !email}>
                        {isSubmitting ? 'Checking...' : 'Continue'}
                    </Button>
                </form>

                <div className="auth-footer">
                    <p className="resend-text">
                        Change your email? <Link to="/forgot-password" className="auth-link">Change</Link>
                    </p>
                </div>
            </AuthContent>
        </div>
    );
};

export default VerificationCode;