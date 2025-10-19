import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, AuthDesktopBackground, AuthContent } from '../components';
import './auth.css';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSendCode = () => {
        // TODO: Implement actual forgot password logic
        console.log('Send reset code to:', email);
        navigate('/verification-code');
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
                    <p className="auth-subtitle">Type your phone number</p>
                </div>

                <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSendCode(); }}>
                    <div className="form-group">
                        <Input
                            type="email"
                            placeholder="Email"
                            onChange={setEmail}
                        />
                    </div>

                    <p style={{ fontSize: '0.9rem', color: '#718096', margin: '1rem 0', textAlign: 'center' }}>
                        We will send you a code to verify it's you
                    </p>

                    <Button onClick={handleSendCode}>
                        Send
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