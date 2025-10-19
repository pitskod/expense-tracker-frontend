import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, AuthDesktopBackground, AuthContent } from '../components';
import './auth.css';

const Success: React.FC = () => {
    const navigate = useNavigate();

    const handleOK = () => {
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
            </div>

            {/* Auth Content Panel */}
            <AuthContent>
                <div className="auth-header">
                    <div className="success-illustration">
                        <span style={{ fontSize: '3rem', color: '#667eea' }}>✓</span>
                    </div>
                    <h1 className="auth-title">Change password successfully!</h1>
                    <p className="auth-subtitle">
                        You have successfully changed password.
                        Please use the new password when logging in.
                    </p>
                </div>

                <div className="auth-form">
                    <Button onClick={handleOK}>
                        OK
                    </Button>
                </div>
            </AuthContent>
        </div>
    );
};

export default Success;