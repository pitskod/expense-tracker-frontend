import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import {
    SignIn,
    SignUp,
    ForgotPassword,
    VerificationCode,
    RestorePassword,
    Success,
    Expenses,
    NotFound
} from '../pages';

// Define all application routes
const router = createBrowserRouter([
    {
        path: '/',
        element: <Expenses />,
        errorElement: <NotFound />,
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
        path: '*',
        element: <NotFound />,
    },
]);

// Router component that provides routing context
const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};

export { router };
export default AppRouter;