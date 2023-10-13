import classes from './register.module.css';

const RegisterPage = () => {
    return (
        <main className={classes.registerPage}>
            <form action="/api/auth/register" method="post" className={classes.registerForm} name="registerForm">
                <fieldset>
                    <legend>Register</legend>

                    <div className={classes.inputContainer}>
                        <label htmlFor="email" className={classes.requiredLabel}>
                            Email
                        </label>
                        <input type="email" name="email" required autoFocus />
                    </div>
                    <div className={classes.inputContainer}>
                        <label htmlFor="password" className={classes.requiredLabel}>
                            Password
                        </label>
                        <input type="password" name="password" required minLength={12} />
                    </div>
                    <div className={classes.inputContainer}>
                        <label htmlFor="password-confirm" className={classes.requiredLabel}>
                            Confirm password
                        </label>
                        <input type="password" name="password-confirm" required />
                    </div>
                    <div className={classes.inputContainer}>
                        <label htmlFor="firstName">First name</label>
                        <input type="text" name="firstName" />
                    </div>
                    <div className={classes.inputContainer}>
                        <label htmlFor="lastName">Last name</label>
                        <input type="text" name="lastName" />
                    </div>
                    <button type="submit">Sign Up</button>
                </fieldset>
            </form>
        </main>
    );
};

export default RegisterPage;
