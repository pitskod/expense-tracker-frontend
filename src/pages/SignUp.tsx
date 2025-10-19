import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, AuthDesktopBackground, AuthContent } from '../components';
import './auth.css';

const SignUp: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSignUp = () => {
        // TODO: Implement actual sign up logic
        console.log('Sign up with:', { email, password, confirmPassword });
        navigate('/sign-in');
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

                <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                    <div className="form-group">
                        <Input
                            type="email"
                            placeholder="Email"
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            type="password"
                            placeholder="Password"
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            type="password"
                            placeholder="Confirm Password"
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#718096', margin: '0 0 1rem 0' }}>
                        By creating an account you agree to our <span style={{ color: '#667eea' }}>Terms and Conditions</span>
                    </p>

                    <Button onClick={handleSignUp}>
                        Sign Up
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/sign-in" className="auth-link">Sign In</Link></p>
                </div>
            </AuthContent>
        </div>
    );
};

export default SignUp;