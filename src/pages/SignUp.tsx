import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, PasswordInput, AuthDesktopBackground, AuthContent } from '../components';
import { apiClient } from '../utils/api';
import './auth.css';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

const signUpSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(12, 'Password must not exceed 12 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase and lowercase letters, and numbers'
    ),
});

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      await apiClient.post('/api/auth/sign-up', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      
      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.'
      );
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
          <h1 className="auth-title">Welcome to us,</h1>
          <p className="auth-subtitle">Hello there, create new account</p>
        </div>

        {successMessage && (
          <div className="auth-success-message" style={{
            padding: '12px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}

        {submitError && (
          <div className="auth-error-message" style={{
            padding: '12px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {submitError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Name"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </div>

          <div className="form-group">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  type="email"
                  placeholder="Email"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </div>

          <div className="form-group">
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  placeholder="Password"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />
          </div>

          <p style={{ fontSize: '0.8rem', color: '#718096', margin: '0 0 1rem 0' }}>
            By creating an account you agree to our{' '}
            <span style={{ color: '#667eea', cursor: 'pointer' }}>Terms and Conditions</span>
          </p>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/sign-in" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </AuthContent>
    </div>
  );
};

export default SignUp;
