import { useLayoutEffect } from 'react';
import { ErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

export default function ErrorBoundary() {
    const error = useRouteError();
    const navigate = useNavigate();

    useLayoutEffect(() => {
        if ((error as ErrorResponse).status === 401) {
            navigate('/auth/login');
        }
    }, [error, navigate]);

    return <></>;
}
