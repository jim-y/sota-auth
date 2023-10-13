import classes from './login.module.css';
import { NavLink } from 'react-router-dom';

const LoginPage = () => {
    return (
        <main className={classes.loginPage}>
            <form action="/api/auth/login" method="post" className={classes.loginForm}>
                <div className={classes.inputContainer}>
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" required />
                </div>
                <div className={classes.inputContainer}>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" required />
                </div>
                <button type="submit">Sign In</button>
                <footer>
                    <span>Not a member yet?&nbsp;</span>
                    <NavLink to="/auth/register" className={classes.registerLink}>
                        Sign up
                    </NavLink>
                </footer>
            </form>
        </main>
    );
};

export default LoginPage;
