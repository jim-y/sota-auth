import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './Root.tsx';
import HomePage from './domain/home/HomePage.tsx';
import LoginPage from './domain/auth/login/Login.tsx';
import TwoFactorLoginPage from './domain/auth/login/two-factor/TwoFactorLoginPage.tsx';
import RegisterPage from './domain/auth/register/RegisterPage.tsx';
import ProfilePage from './domain/profile/ProfilePage.tsx';
import AuthenticationPage from './domain/profile/authentication/AuthenticationPage.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        loader: Root.loader,
        errorElement: <ErrorBoundary />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: 'profile',
                element: <ProfilePage />,
                children: [
                    {
                        index: true,
                        loader: AuthenticationPage.loader,
                        element: <AuthenticationPage />,
                    },
                ],
            },
        ],
    },
    {
        path: '/auth/login',
        element: <LoginPage />,
    },
    {
        path: '/auth/login/2fa',
        element: <TwoFactorLoginPage />,
    },
    {
        path: '/auth/register',
        element: <RegisterPage />,
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
