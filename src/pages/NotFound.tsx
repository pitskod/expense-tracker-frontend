import React from 'react';
import { Link } from 'react-router-dom';
import { Button, AuthDesktopBackground, AuthContent } from '../components';
import './auth.css';

const NotFound: React.FC = () => {
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
                    <h1 className="auth-title">404 - Page Not Found</h1>
                    <p className="auth-subtitle">The page you're looking for doesn't exist.</p>
                </div>

                <div className="auth-form">
                    <Link to="/">
                        <Button>Go Home</Button>
                    </Link>
                </div>
            </AuthContent>
        </div>
    );
};

export default NotFound;