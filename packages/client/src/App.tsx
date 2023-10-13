import classes from './App.module.css';
import { useSession } from './hooks/useSession.ts';
import { useNavigate } from 'react-router-dom';

function App() {
    const { user } = useSession();
    const navigate = useNavigate();

    const onLogout = async () => {
        const response = await fetch('/api/auth/logout', {
            method: 'post',
            body: null,
        });
        if (response.ok) {
            navigate('/auth/login');
        }
    };

    return (
        <>
            {user && (
                <div className={classes.userContainer}>
                    <div>Email:&nbsp;{user.email}</div>
                    <div>
                        <button onClick={onLogout}>Logout</button>
                    </div>
                </div>
            )}
            <p className="read-the-docs">Click on the Vite and React logos to learn more. Right?</p>
        </>
    );
}

export default App;
