import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, AuthDesktopBackground, AuthContent } from '../components';
import './auth.css';

const VerificationCode: React.FC = () => {
    const [code, setCode] = useState('');
    const navigate = useNavigate();

    const handleVerify = () => {
        if (code.length >= 4) {
            console.log('Verification code:', code);
            navigate('/restore-password');
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
                        <span className="verification-email">email@gmail.com</span>
                    </p>
                    <p style={{ color: '#718096', fontSize: '0.9rem', textAlign: 'center' }}>
                        This code expires in 60 minutes
                    </p>
                </div>

                <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
                    <div className="form-group">
                        <Input
                            type="text"
                            placeholder="Verification Code"
                            onChange={setCode}
                        />
                    </div>

                    <Button onClick={handleVerify}>
                        Verify Code
                    </Button>
                </form>

                <div className="auth-footer">
                    <p className="resend-text">
                        Change your phone number? <Link to="/forgot-password" className="auth-link">Change</Link>
                    </p>
                </div>
            </AuthContent>
        </div>
    );
};

export default VerificationCode;