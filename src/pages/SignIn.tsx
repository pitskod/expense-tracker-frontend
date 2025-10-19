import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, AuthDesktopBackground, AuthContent } from '../components';
import './auth.css';

const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignIn = () => {
        // TODO: Implement actual sign in logic
        console.log('Sign in with:', { email, password });
        navigate('/');
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

                <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}>
                    <div className="form-group">
                        <Input
                            type="email"
                            placeholder="Email"
                            onChange={setEmail}
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            type="password"
                            placeholder="Password"
                            onChange={setPassword}
                        />
                    </div>

                    <div className="forgot-password-link">
                        <Link to="/forgot-password">Forgot your password ?</Link>
                    </div>

                    <Button onClick={handleSignIn}>
                        Sign In
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