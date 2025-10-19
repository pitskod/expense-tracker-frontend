import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, AuthDesktopBackground, AuthContent } from '../components';
import './auth.css';

const RestorePassword: React.FC = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleChangePassword = () => {
        if (newPassword === confirmPassword) {
            console.log('Password changed successfully');
            navigate('/success');
        } else {
            alert('Passwords do not match');
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

                <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
                    <div className="form-group">
                        <Input
                            type="password"
                            placeholder="Password"
                            onChange={setNewPassword}
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            type="password"
                            placeholder="Confirm password"
                            onChange={setConfirmPassword}
                        />
                    </div>

                    <Button onClick={handleChangePassword}>
                        Change password
                    </Button>
                </form>
            </AuthContent>
        </div>
    );
};

export default RestorePassword;