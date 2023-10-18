import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

type User = {
    email: string;
};
export function useSession() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch('/api/auth/session');
                if (!response.ok) {
                    navigate('/auth/login');
                } else {
                    const _user = await response.json();
                    setUser(_user);
                }
            } catch (err) {
                console.error(err);
                navigate('/auth/login');
            } finally {
                setIsLoading(false);
            }
        };
        setIsLoading(true);
        void fetchSession();
    }, [navigate]);

    return {
        user,
        isLoading,
    };
}
