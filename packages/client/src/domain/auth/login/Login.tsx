import classes from './login.module.css';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { startAuthentication } from '@simplewebauthn/browser';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const emailFieldRef = useRef<HTMLInputElement>(null);
    const passwordFieldRef = useRef<HTMLInputElement>(null);
    const [email, setEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(false);

    const [shouldShowLoginForm, setShouldShowLoginForm] = useState(false);
    useEffect(() => {
        if (shouldShowLoginForm) passwordFieldRef.current?.focus();
    }, [shouldShowLoginForm]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [authenticationOptions, setAuthenticationOptions] = useState('');
    const [authenticationOptionsResponse, setAuthenticationOptionsResponse] = useState<any>();
    const [authenticationVerification, setAuthenticationVerification] = useState('');

    useEffect(() => {
        if (emailFieldRef.current) {
            setIsEmailValid(emailFieldRef.current.checkValidity());
        }
    }, [email]);

    const goNext = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isEmailValid) {
            setShouldShowLoginForm(true);
        }
    };

    const doPasswordless = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const params = new URLSearchParams();
        params.append('email', document.forms['loginForm'].email.value);
        const response = await fetch(`/api/auth/webauthn/authentication/options?${params.toString()}`);
        const options = await response.json();
        setAuthenticationOptions(options);
        let asseResp;
        try {
            // Pass the options to the authenticator and wait for a response
            asseResp = await startAuthentication(options);
            setAuthenticationOptionsResponse(asseResp);
        } catch (error: any) {
            // Some basic error handling
            setError(error);
            throw error;
        }

        // POST the response to the endpoint that calls
        // @simplewebauthn/server -> verifyAuthenticationResponse()
        const verificationResp = await fetch(`/api/auth/webauthn/authentication/verify?${params.toString()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(asseResp),
        });

        // Wait for the results of verification
        const verificationJSON = await verificationResp.json();
        setAuthenticationVerification(verificationJSON);

        // Show UI appropriate for the `verified` status
        if (verificationJSON && verificationJSON.verified) {
            setSuccess('Success!');
            navigate('/');
        } else {
            setError(`Oh no, something went wrong! Response: <pre>${JSON.stringify(verificationJSON)}</pre>`);
        }
    };

    return (
        <main className={classes.loginPage}>
            <Card>
                <CardHeader className="mb-4">
                    <CardTitle className="text-center">Welcome</CardTitle>
                    <CardDescription className="text-center">Log in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action="/api/auth/login" method="post" className={classes.loginForm} name="loginForm">
                        {searchParams.get('error') && (
                            <div className="mb-8">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Login Error</AlertTitle>
                                    <AlertDescription>
                                        Your email-address or password were incorrect. Please log in again.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                        {error && <div>{JSON.stringify(error, null, 4)}</div>}
                        {success && <div dangerouslySetInnerHTML={{ __html: success }} />}
                        {authenticationOptions && (
                            <>
                                <h2>Authentication Options</h2>
                                <pre>{JSON.stringify(authenticationOptions, null, 4)}</pre>
                            </>
                        )}
                        {authenticationOptionsResponse && (
                            <>
                                <h2>Authentication Options Response</h2>
                                <pre>{JSON.stringify(authenticationOptionsResponse, null, 4)}</pre>
                            </>
                        )}
                        {authenticationVerification && (
                            <>
                                <h2>Authentication Verification response</h2>
                                <pre>{JSON.stringify(authenticationVerification, null, 4)}</pre>
                            </>
                        )}
                        <Input
                            ref={emailFieldRef}
                            className="mb-4"
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            autoComplete="email webauthn"
                        />
                        {shouldShowLoginForm && (
                            <>
                                <Input
                                    ref={passwordFieldRef}
                                    className="mb-4"
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    required
                                    autoComplete="current-password webauthn"
                                />
                            </>
                        )}
                        {!shouldShowLoginForm && (
                            <div className="flex flex-col">
                                <Button className="mb-2" onClick={doPasswordless} disabled={!isEmailValid}>
                                    Use passkey
                                </Button>
                                <Button onClick={goNext} disabled={!isEmailValid}>
                                    Use password
                                </Button>
                            </div>
                        )}
                        {shouldShowLoginForm && (
                            <div className="flex flex-col">
                                <Button className="mb-2" type="submit">
                                    Sign In
                                </Button>
                                <Button onClick={doPasswordless} disabled={!isEmailValid}>
                                    Use passkey
                                </Button>
                            </div>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="flex items-center justify-center">
                    <span>Don&apos;t have an account?&nbsp;</span>
                    <NavLink to="/auth/register" className={classes.registerLink}>
                        <Button variant="link">Sign up</Button>
                    </NavLink>
                </CardFooter>
            </Card>
        </main>
    );
};

export default LoginPage;
