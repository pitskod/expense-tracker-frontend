import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, PasswordInput, AuthDesktopBackground, AuthContent } from '../components';
import { apiClient } from '../utils/api';
import './auth.css';

interface RestorePasswordFormData {
    new_password: string;
    confirm_password: string;
}

const schema = yup.object({
    new_password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .max(12, 'Password must not exceed 12 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
    confirm_password: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('new_password')], 'Passwords do not match'),
});

const RestorePassword: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const state = (location.state || {}) as { email?: string; reset_code?: string };
    const resetCode = state.reset_code;

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RestorePasswordFormData>({
        resolver: yupResolver(schema),
        mode: 'onSubmit',
    });

    const onSubmit = async (data: RestorePasswordFormData) => {
        setSubmitError(null);

        if (!resetCode) {
            setSubmitError('Reset code is missing. Please restart the password reset flow.');
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.post('/api/auth/restore-password', {
                reset_code: resetCode,
                new_password: data.new_password,
            });

            navigate('/success');
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : 'Failed to reset password.');
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
                    <h1 className="auth-title">Change password</h1>
                    <p className="auth-subtitle">Type your new password</p>
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

                {!resetCode && (
                    <div style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#718096' }}>
                        Missing reset code.{' '}
                        <Link to="/forgot-password" className="auth-link">Start over</Link>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <Controller
                            name="new_password"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    placeholder="New password"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    disabled={isSubmitting || !resetCode}
                                    error={!!errors.new_password}
                                    helperText={errors.new_password?.message}
                                />
                            )}
                        />
                    </div>

                    <div className="form-group">
                        <Controller
                            name="confirm_password"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    placeholder="Confirm password"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    disabled={isSubmitting || !resetCode}
                                    error={!!errors.confirm_password}
                                    helperText={errors.confirm_password?.message}
                                />
                            )}
                        />
                    </div>

                    <Button type="submit" disabled={isSubmitting || !resetCode}>
                        {isSubmitting ? 'Saving...' : 'Change password'}
                    </Button>
                </form>
            </AuthContent>
        </div>
    );
};

export default RestorePassword;