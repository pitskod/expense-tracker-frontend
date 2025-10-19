import React from 'react';

interface AuthDesktopBackgroundProps {
    useLoginSvg?: boolean; // Use login.svg instead of logo.svg
}

export const AuthDesktopBackground: React.FC<AuthDesktopBackgroundProps> = ({
}) => {
    return (
        <div className="desktop-left-panel">
            <div className="desktop-logo">
                <img
                    src="/logo.svg"
                    alt="YAET - Yet Another Expense Tracker"
                    style={{ maxWidth: '200px', height: 'auto' }}
                />
            </div>

            <div className="desktop-illustration">
                <img
                    src="/login.svg"
                    alt="YAET Logo"
                />
            </div>
        </div>
    );
};

export default AuthDesktopBackground;