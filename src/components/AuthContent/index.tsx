import React from 'react';

interface AuthContentProps {
    children: React.ReactNode;
}

export const AuthContent: React.FC<AuthContentProps> = ({ children }) => {
    return (
        <div className="auth-content-panel">
            {children}
        </div>
    );
};

export default AuthContent;