import React from 'react';
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';
import {
    SignIn,
    SignUp,
    ForgotPassword,
    VerificationCode,
    RestorePassword,
    Success,
    Expenses,
    Profile,
    NotFound
} from '../pages';
import { ensureAuth, getAccessToken } from '../utils/api';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Expenses />,
        loader: async () => {
            if (getAccessToken()) {
                return null;
            }
            try {
                await ensureAuth();
                return null;
            } catch {
                throw redirect('/sign-in');
            }
        },
    },
    {
        path: '/sign-in',
        element: <SignIn />,
    },
    {
        path: '/sign-up',
        element: <SignUp />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />,
    },
    {
        path: '/verification-code',
        element: <VerificationCode />,
    },
    {
        path: '/restore-password',
        element: <RestorePassword />,
    },
    {
        path: '/success',
        element: <Success />,
    },
    {
        path: '/profile',
        element: <Profile />,
        loader: async () => {
            try {
                await ensureAuth();
                return null;
            } catch {
                throw redirect('/sign-in');
            }
        },
    },
    {
        path: '*',
        element: <NotFound />,
    },
]);

const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};

export { router };
export default AppRouter;